import { ResEntry } from "./resEntry.ts";
import { ResFile } from "./resFile.ts";

/**
 * A collection of `ResFile` objects, that share similar entry keys
 */
export class ResCollection implements Iterable<[string, ResFile]> {
  public static fromLabeled2DArray(
    name: string,
    dataArray: string[][],
  ): ResCollection {
    const collection = new ResCollection(name);

    const headerColumns: string[] = [];
    let rowNumber = 0;
    for (const row of dataArray) {
      let cellNumber = 0;
      let rowKey = "";

      for (const cell of row) {
        if (rowNumber === 0) {
          // Fill file list with the colum names:
          headerColumns.push(cell);
          if (cell !== ResCollection.KeyLabel) {
            collection.add(new ResFile(cell));
          }
        } else if (cellNumber === 0) {
          // The first cell of each row is the key
          rowKey = cell;
        } else if (cellNumber > 0) {
          const headerColumn = headerColumns[cellNumber];
          const resFile = collection.get(headerColumn);
          if (rowKey && resFile && cell) {
            resFile.setEntry(new ResEntry(rowKey, cell));
          }
        }
        cellNumber++;
      }
      rowNumber++;
    }

    return collection;
  }

  /** The title used for the column that contains the resource file keys */
  public static readonly KeyLabel = "key";
  public get: (key: string) => ResFile | undefined;

  constructor(
    public readonly name: string,
    private files: Map<string, ResFile> = new Map<string, ResFile>(),
  ) {
    this.get = this.files.get.bind(this.files);
  }

  *[Symbol.iterator](): IterableIterator<[string, ResFile]> {
    for (const file of this.files) {
      yield file;
    }
  }

  add(file: ResFile) {
    this.files.set(file.originFile, file);
  }

  toLabeled2DArray(): string[][] {
    const headerColumns = [ResCollection.KeyLabel];
    const uniqueKeys = new Set<string>();

    for (const [name, file] of this) {
      headerColumns.push(name);

      for (const key of file.keys) {
        uniqueKeys.add(key);
      }
    }

    const result: string[][] = [headerColumns];

    for (const key of uniqueKeys) {
      const row: string[] = [];

      row.push(key);

      for (const [_, file] of this) {
        row.push(file.getValue(key));
      }

      result.push(row);
    }

    return result;
  }
}
