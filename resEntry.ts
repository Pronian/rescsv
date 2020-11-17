import { RES_LOCALE_DEFAULT } from './resConfig.ts';

export class ResEntry {
    public value: string;
    private _locale: string;
    private _key: string;

    constructor(key: string, value: string, locale: string = '') {
        this._key = key;
        this.value = value;

        if (!locale.length) {
            this._locale = RES_LOCALE_DEFAULT;
        } else {
            this._locale = locale;
        }
    }

    get locale() {
        return this._locale;
    }

    get key() {
        return this._key;
    }

    public toString() {
        return `${this._key}=${this.value}`;
    }
}