import { parseResFileName, resFileNameFromIdAndLocale } from './resConfig.ts';
import { ResEntry } from './resEntry.ts';
import { ResFile } from './resFile.ts';

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
			let rowKey = '';
			let fileId = ':';

			for (const cell of row) {
				if (rowNumber === 0) {
					// Fill file list with the column names:
					headerColumns.push(cell);
				} else if (cellNumber === 0) {
					// The first cell of each row is the `fileId:key`, example: `account:label.email`
					[fileId, rowKey] = cell.split(':');
				} else if (cellNumber > 0) {
					const headerColumn = headerColumns[cellNumber];
					const fileName = resFileNameFromIdAndLocale(fileId, headerColumn);
					const resFile = collection.getOrCreate(fileName);

					if (rowKey && cell) {
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
	public static readonly KeyLabel = 'key';
	public get: (key: string) => ResFile | undefined;

	public getOrCreate(key: string): ResFile {
		const existing = this.get(key);
		if (existing) {
			return existing;
		}

		const newFile = new ResFile(key);
		this.add(newFile);
		return newFile;
	}

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
		const headerColumns = new Set([ResCollection.KeyLabel]);
		const uniqueKeys = new Set<string>();

		for (const [name, file] of this) {
			const parsedName = parseResFileName(name);
			headerColumns.add(parsedName.locale);

			for (const key of file.keys) {
				uniqueKeys.add(`${parsedName.fileId}:${key}`);
			}
		}

		const result: string[][] = [Array.from(headerColumns)];

		for (const key of uniqueKeys) {
			const row: string[] = [];

			row.push(key);

			for (let c = 1; c < result[0].length; c++) {
				const [rowFile, keyValue] = key.split(':');
				const columnLocale = result[0][c];

				let resFile;
				if (columnLocale === 'default') {
					resFile = this.get(`${rowFile}.properties`);
				} else {
					resFile = this.get(`${rowFile}_${columnLocale}.properties`);
				}
				if (!resFile) {
					row.push('');
					continue;
				}

				row.push(resFile.getValue(keyValue));
			}

			result.push(row);
		}

		return result;
	}
}
