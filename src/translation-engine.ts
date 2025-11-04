/**
 * Minimal interface for translation engines
 * Allows flexibility in what can be used as a translation engine
 */
export interface TranslationEngine<TStringKey extends string = string> {
  translate: (
    componentId: string,
    key: TStringKey,
    vars?: Record<string, string | number>,
    lang?: any,
  ) => string;
  safeTranslate: (
    componentId: string,
    key: TStringKey,
    vars?: Record<string, string | number>,
    lang?: any,
  ) => string;
}
