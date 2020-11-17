import { RES_FILE_EXT } from "./resConfig.ts";
import { ResEntry } from "./resEntry.ts";
import { ResFile } from "./resFile.ts";
import { existsSync } from "https://deno.land/std@0.77.0/fs/mod.ts";
import { readCSV, writeCSV } from "https://deno.land/x/csv/mod.ts";

// The title used for the column that contains the resource file keys
const CSV_KEY_TITLE = 'key';

async function createCsvFromRes(inputFileName: string) {
    const resFiles: string[] = [];
    const reAcceptedFiles = new RegExp(`^${inputFileName}(\\b|_.{1,5})\\.${RES_FILE_EXT}$`);

    for await (const dirEntry of Deno.readDir('./')) {
        if (dirEntry.isDirectory) continue;

        const fileName = dirEntry.name;

        if (reAcceptedFiles.test(fileName)) {
            resFiles.push(fileName);
        }
    }

    if (!resFiles.length) {
        console.log(`No properties files found starting with "${inputFileName}"`);
        return;
    }

    const parsedFiles = [];

    try {
        console.log('Reading input file: ' + inputFileName);
        for (const resFile of resFiles) {
            const fileContent = await Deno.readTextFile(resFile);
            const parsed = ResFile.parseFile(resFile, fileContent, inputFileName);
            parsedFiles.push(parsed);
        }
    } catch (error) {
        console.error('❌ Error while reading input files!');
        console.error(error);
        return;
    }

    const headerColumns = [CSV_KEY_TITLE];
    const allKeys: string[] = [];

    for (const parsedFile of parsedFiles) {
        headerColumns.push(parsedFile.originFile);
        allKeys.push(...parsedFile.keys);
    }

    const uniqueKeys = [...new Set(allKeys)];
    const csvData: string[][] = [headerColumns];

    for (const key of uniqueKeys) {
        let csvRow: string[] = [];

        csvRow.push(key);

        for (const parsedFile of parsedFiles) {
            csvRow.push(parsedFile.getValue(key));
        }

        csvData.push(csvRow);
        csvRow = [];
    }

    try {
        const file = await Deno.open(`${inputFileName}.csv`, { write: true, create: true, truncate: true });
        await writeCSV(file, csvData);
        file.close();
        console.log(`Success! "${inputFileName}.csv" created!`);
    } catch (error) {
        console.error('❌ Error while writing csv file!');
        console.error(error);
        return;
    }
}

async function csvFileToResFileMap(csvFile: Deno.File): Promise<Map<string, ResFile>> {
    const resFileList = new Map<string, ResFile>();
    const headerColumns: string[] = [];

    let rowNumber = 0;
    for await (const row of readCSV(csvFile)) {
        let cellNumber = 0;
        let rowKey: string = '';

        for await (const cell of row) {
            if (rowNumber === 0) {
                // Fill file list with the colum names:
                headerColumns.push(cell);
                if (cell !== CSV_KEY_TITLE) resFileList.set(cell, new ResFile(cell));
            } else if (cellNumber === 0) {
                // The first cell of each row is the key
                rowKey = cell;
            } else if (cellNumber > 0) {
                const headerColumn = headerColumns[cellNumber];
                const resFile = resFileList.get(headerColumn);
                if (rowKey && resFile && cell) {
                    resFile.setEntry(new ResEntry(rowKey, cell))
                }
            }
            cellNumber++;
        }
        rowNumber++;
    }

    csvFile.close();

    return resFileList;
}

async function updateResFromCsv(inputFileName: string, deleteOldEntries?: boolean) {
    let csvFile: Deno.File;

    try {
        csvFile = await Deno.open(`./${inputFileName}.csv`);
    } catch (error) {
        console.error('❌ Error while reading input file!');
        console.error(error);
        return;
    }

    const resFileList = await csvFileToResFileMap(csvFile);

    let countDeleted = 0;
    let countUpdated = 0;
    let countNew = 0;

    for (const resFileEntry of resFileList) {
        const [fileName, csvResFile] = resFileEntry;
        let fileContents: string;
        let currentResFile: ResFile;

        if (existsSync(fileName)) {
            fileContents = await Deno.readTextFile(fileName);
            currentResFile = ResFile.parseFile(fileName, fileContents, inputFileName);
        } else {
            fileContents = '';
            currentResFile = new ResFile(fileName);
        }

        const updated = ResFile.getUpdatedEntries(currentResFile, csvResFile);
        const newEntries = ResFile.getEntriesDiff(currentResFile, csvResFile);

        if (deleteOldEntries) {
            const unused = ResFile.getEntriesDiff(csvResFile, currentResFile);
            for (const unusedEntry of unused.entries) {
                fileContents = fileContents.replace(unusedEntry.keyEntryRE, '');
                updated.remove(unusedEntry.key);
                countDeleted++;
            }
        }

        for (const updatedEntry of updated.entries) {
            fileContents = fileContents.replace(updatedEntry.keyEntryRE, updatedEntry.toString());
            countUpdated++;
        }

        if (newEntries.length) {
            fileContents += '\n' + newEntries.toString();
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
    // TODO: refactor using Deno flags
    const args = Deno.args;
    if (args.length === 2 && args[0] === 'c') {
        await createCsvFromRes(args[1]);
    } else if (args.length === 2 && args[0] === 's') {
        await updateResFromCsv(args[1]);
    } else if (args.length === 2 && args[0] === 'sd') {
        await updateResFromCsv(args[1], true);
    } else {
        console.log('❌ Invalid arguments!');
        console.log(`
Example: "node index.js c account"
to create csv file from resource files
OR
Example: "node index.js s account"
to update resource files based on a csv file
OR
Example: "node index.js sd account"
to update and delete resource files based on a csv file`);
    }
}

console.time('⏱');
execute();
console.timeEnd('⏱');
console.log('✔💯');
