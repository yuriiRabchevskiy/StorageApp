export class StringExtensions {

    public static cut(source: string, trimText: string) {
        return StringExtensions.cutEnd(StringExtensions.cutStart(source, trimText), trimText);
    }

    public static cutStart(source: string, trimText: string): string {
        if (source != null && source.startsWith(trimText)) {
            return source.substring(trimText.length);
        }
        return source;
    }

    public static cutEnd(source: string, trimText: string): string {
        if (source != null && source.endsWith(trimText)) {
            return source.substring(0, source.length - trimText.length);
        }
        return source;
    }
}
