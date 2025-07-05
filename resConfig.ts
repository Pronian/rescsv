export const RES_FILE_EXT = "properties";
export const RES_LOCALE_DEFAULT = "default";

const parseResFileRegex = new RegExp(`(.+?)_([a-z]{2}_[A-Z]{2}|[a-z]{2})\\.${RES_FILE_EXT}$`);

export function parseResFileName(fileName: string) {
    const matches = parseResFileRegex.exec(fileName);
    const fileId = matches?.[1] ?? fileName.split(`.${RES_FILE_EXT}`)[0];
    const locale = matches?.[2] ?? RES_LOCALE_DEFAULT;

    return { fileId, locale };
}
