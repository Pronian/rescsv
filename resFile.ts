import { parse as parsePath } from '@std/path';
import { RES_LOCALE_DEFAULT } from './resConfig.ts';
import { ResEntry } from './resEntry.ts';

/**
 * Represents a resource file (.properties)
 *
 * Entries in this file match the following text format: `key=value`
 */
export class ResFile {
	public static parseFile(
		fileName: string,
		fileContent: string,
		mainFile: string,
	): ResFile {
		const resFile = new ResFile(fileName);

		let locale: string;

		if (fileName === mainFile) {
			locale = RES_LOCALE_DEFAULT;
		} else {
			const fileNoExt = parsePath(fileName).name;
			const mainFileNoExt = parsePath(mainFile).name;
			locale = fileNoExt.replace(mainFileNoExt + '_', '');
		}

		let entry: ResEntry;

		let matches = this.reRes.exec(fileContent);
		while (matches?.length === 3) {
			entry = new ResEntry(matches[1], matches[2], locale);
			resFile.entries.push(entry);
			matches = this.reRes.exec(fileContent);
		}

		return resFile;
	}

	public static getEntriesDiff(oldRes: ResFile, newRes: ResFile): ResFile {
		const result = new ResFile(newRes.originFile);

		for (const entry of newRes.entries) {
			if (!oldRes.hasKey(entry.key)) {
				result.setEntry(entry);
			}
		}

		return result;
	}

	public static getUpdatedEntries(oldRes: ResFile, newRes: ResFile): ResFile {
		const result = new ResFile(newRes.originFile);

		let newValue: string;
		for (const entry of oldRes.entries) {
			newValue = newRes.getValue(entry.key);

			if (entry.value !== newValue) {
				result.setEntry(new ResEntry(entry.key, newValue));
			}
		}

		return result;
	}

	private static readonly reRes: RegExp = /^([^=\n]+)=(.+)$/gm;

	public entries: ResEntry[];

	constructor(public readonly originFile: string, items?: ResEntry[]) {
		if (items) {
			this.entries = items;
		} else {
			this.entries = [];
		}
	}

	get length() {
		return this.entries.length;
	}

	get keys() {
		const result: string[] = [];

		for (const entry of this.entries) {
			result.push(entry.key);
		}

		return result;
	}

	public getValue(key: string) {
		const filtered = this.entries.filter((en) => en.key === key);

		if (filtered.length === 1) {
			return filtered[0].value;
		} else if (filtered.length > 1) {
			return filtered[filtered.length - 1].value;
		}

		return '';
	}

	public hasKey(key: string): boolean {
		return !!this.entries.find((entry) => entry.key === key);
	}

	public remove(key: string) {
		this.entries = this.entries.filter((value) => value.key !== key);
	}

	public setEntry(entry: ResEntry) {
		const foundEntry = this.entries.find((existingEntry) => existingEntry.key === entry.key);

		if (!foundEntry) {
			this.entries.push(new ResEntry(entry.key, entry.value, entry.locale));
		} else {
			foundEntry.value = entry.value;
		}
	}

	public toString() {
		let result = '';

		for (const entry of this.entries) {
			result += entry.toString() + '\n';
		}

		return result;
	}
}
