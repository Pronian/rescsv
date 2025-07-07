export const RES_FILE_EXT = "properties";
export const RES_LOCALE_DEFAULT = "default";

/**
 * Regular expression to parse a resource file name.
 * It captures the base ID and locale from the file name.
 * Example matches:
 * - `fileId_en_US.properties` -> `fileId`, `en_US`
 * - `fileId_de.properties` -> `fileId`, `de`
 * - `fileId.properties` -> `fileId`, `default`
 */
const parseResFileRegex = new RegExp(
  `(.+?)_([a-z]{2}_[A-Z]{2}|[a-z]{2})\\.${RES_FILE_EXT}$`,
);

/**
 * Parses a resource file name into its base ID and locale.
 * @param fileName - the file name of the resource file.
 * @returns An object containing the file ID and locale.
 */
export function parseResFileName(fileName: string) {
  const matches = parseResFileRegex.exec(fileName);
  const fileId = matches?.[1] ?? fileName.split(`.${RES_FILE_EXT}`)[0];
  const locale = matches?.[2] ?? RES_LOCALE_DEFAULT;

  return { fileId, locale };
}

/**
 * Generates a resource file name from the given file ID and locale.
 * If the locale is the default, it returns `fileId.properties`.
 * Otherwise, it returns `${fileId}_${locale}.properties`.
 * @param fileId - The base ID of the resource file.
 * @param locale - The locale for the resource file.
 * @returns The formatted resource file name.
 */
export function resFileNameFromIdAndLocale(
  fileId: string,
  locale: string,
): string {
  if (locale === RES_LOCALE_DEFAULT) {
    return `${fileId}.${RES_FILE_EXT}`;
  } else {
    return `${fileId}_${locale}.${RES_FILE_EXT}`;
  }
}
