import { RES_LOCALE_DEFAULT } from "./resConfig.ts";

/**
 * Represents an entry in a resource file (.properties)
 *
 * Matches the following text format: `key=value`
 */
export class ResEntry {
  public value: string;
  private _locale: string;
  private _key: string;

  constructor(key: string, value: string, locale: string = "") {
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

  /**
     * A regular expression that describes this particular key with any possible value in a text format
     */
  get keyEntryRE() {
    return new RegExp(`^${this._key}=.*$`, "gm");
  }

  public toString() {
    return `${this._key}=${this.value}`;
  }
}
