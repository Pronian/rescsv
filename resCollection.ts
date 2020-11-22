import { ResFile } from './resFile.ts';

/**
 * A collection of `ResFile` objects, that share similar entry keys
 */
export class ResCollection implements Iterable<[string, ResFile]> {
    /** The title used for the column that contains the resource file keys */
    public static readonly KeyLabel = 'key';

    constructor(
        public readonly name: string,
        private files: Map<string, ResFile> = new Map<string, ResFile>()
    ) { }

    *[Symbol.iterator](): IterableIterator<[string, ResFile]> {
        for (const file of this.files) {
            yield file;
        }
    }

    add(file: ResFile) {
        this.files.set(file.originFile, file);
    }

    get = this.files.get.bind(this.files);

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