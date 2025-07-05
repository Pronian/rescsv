import { parseResFileName, RES_FILE_EXT } from "./resConfig.ts";
import { ResFile } from "./resFile.ts";
import { ResCollection } from "./resCollection.ts";
import { parse as argsParse } from "std/flags/mod.ts";
import { BufReader } from "std/io/mod.ts";
import {
  readMatrix as readCSVMatrix,
  stringify as stringifyCSV,
} from "std/encoding/csv.ts";

async function createCsvFromRes(inputFileName: string) {
  const resFiles: string[] = [];
  let reAcceptedFiles;
  if (!inputFileName) {
    reAcceptedFiles = new RegExp(`\\.${RES_FILE_EXT}$`);
  } else {
    reAcceptedFiles = new RegExp(
      `^${inputFileName}(\\b|_.{1,5})\\.${RES_FILE_EXT}$`,
    );
  }

  for await (const dirEntry of Deno.readDir("./")) {
    if (dirEntry.isDirectory) continue;

    const fileName = dirEntry.name;

    if (reAcceptedFiles.test(fileName)) {
      resFiles.push(fileName);
    }
  }

  if (!resFiles.length && !inputFileName) {
    console.log("No properties files found.");
    return;
  } else if (!resFiles.length) {
    console.log(`No properties files found starting with "${inputFileName}"`);
    return;
  }

  const parsedFiles = new ResCollection(inputFileName);

  try {
    console.log("Reading input file: " + inputFileName);
    for (const resFile of resFiles) {
      const parsedFileName = parseResFileName(resFile);
      const fileContent = await Deno.readTextFile(resFile);
      const parsed = ResFile.parseFile(resFile, fileContent, parsedFileName.fileId);
      parsedFiles.add(parsed);
    }
  } catch (error) {
    console.error("❌ Error while reading input files!");
    console.error(error);
    return;
  }

  const csvData = parsedFiles.toLabeled2DArray();

  try {
    const file = await Deno.open(`${inputFileName || 'all'}.csv`, {
      write: true,
      create: true,
      truncate: true,
    });
    const rowAccessors = Array.from(csvData[0].keys());
    const csvString = await stringifyCSV(csvData, rowAccessors, {
      headers: false,
    });
    await file.write(new TextEncoder().encode(csvString));
    file.close();

    console.log(`Success! "${inputFileName || 'all'}.csv" created!`);
  } catch (error) {
    console.error("❌ Error while writing csv file!");
    console.error(error);
    return;
  }
}

async function csvFileToResCollection(
  name: string,
  csvFile: Deno.FsFile,
): Promise<ResCollection> {
  const csvData = await readCSVMatrix(new BufReader(csvFile));
  csvFile.close();

  return ResCollection.fromLabeled2DArray(name, csvData);
}

async function updateResFromCsv(
  inputFileName: string,
  deleteOldEntries?: boolean,
) {
  let csvFile: Deno.FsFile;

  try {
    csvFile = await Deno.open(`./${inputFileName}.csv`);
  } catch (error) {
    console.error("❌ Error while reading input file!");
    console.error(error);
    return;
  }

  const resFileList = await csvFileToResCollection(inputFileName, csvFile);

  let countDeleted = 0;
  let countUpdated = 0;
  let countNew = 0;

  for (const resFileEntry of resFileList) {
    const [fileName, csvResFile] = resFileEntry;
    let fileContents: string;
    let currentResFile: ResFile;

    try {
      fileContents = await Deno.readTextFile(fileName);
      currentResFile = ResFile.parseFile(fileName, fileContents, inputFileName);
    } catch (_error) {
      // File does not exist
      fileContents = "";
      currentResFile = new ResFile(fileName);
    }

    const updated = ResFile.getUpdatedEntries(currentResFile, csvResFile);
    const newEntries = ResFile.getEntriesDiff(currentResFile, csvResFile);

    if (deleteOldEntries) {
      const unused = ResFile.getEntriesDiff(csvResFile, currentResFile);
      for (const unusedEntry of unused.entries) {
        fileContents = fileContents.replace(unusedEntry.keyEntryRE, "");
        updated.remove(unusedEntry.key);
        countDeleted++;
      }
    }

    for (const updatedEntry of updated.entries) {
      fileContents = fileContents.replace(
        updatedEntry.keyEntryRE,
        updatedEntry.toString(),
      );
      countUpdated++;
    }

    if (newEntries.length) {
      fileContents += "\n" + newEntries.toString();
      countNew += newEntries.length;
    }

    Deno.writeTextFile(fileName, fileContents);
  }

  if (countDeleted) {
    console.log(`Deleted entries: ${countDeleted}`);
  }

  if (countUpdated) {
    console.log(`Updated entries: ${countUpdated}`);
  }

  if (countNew) {
    console.log(`Added new entries: ${countNew}`);
  }
}

async function execute() {
  const parsedArgs = argsParse(Deno.args);

  if (typeof parsedArgs.c === "string" || parsedArgs.c === true) {
    const inputFileName = typeof parsedArgs.c === "string" ? parsedArgs.c : "";
    await createCsvFromRes(inputFileName);
  } else if (typeof parsedArgs.s === "string") {
    await updateResFromCsv(parsedArgs.s, !!parsedArgs.d);
  } else {
    console.log("❌ Invalid arguments!");
    console.log(`
Use: "rescsv -c"
to create a csv file from all resource files in the current directory (creates "all.csv")
Use: "rescsv -c account"
to create csv file from resource files beginning with "account"
OR
Use: "rescsv -s account"
to update resource files based on a csv file named "account"
OR
Use: "rescsv -d -s account"
to update and delete resource files based on a csv file named "account"`);
  }
}

console.time("⏱");
await execute();
console.timeEnd("⏱");
