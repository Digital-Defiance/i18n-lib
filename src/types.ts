export type LanguageContext = 'admin' | 'user';

// Generic context type for extensibility
export type CustomLanguageContext<T extends string = LanguageContext> = T;

export type StringsCollection<TStringKey extends string> = Partial<
  Record<TStringKey, string>
>;
export type MasterStringsCollection<
  TStringKey extends string,
  TLanguage extends string,
> = Partial<Record<TLanguage, StringsCollection<TStringKey>>>;

export type LanguageCodeCollection<TLanguage extends string> = Partial<
  Record<TLanguage, string>
>;

export type EnumTranslationMap<
  TEnum extends string | number,
  TLanguage extends string,
> = Partial<Record<TLanguage, Partial<Record<TEnum, string>>>>;

export interface I18nConfig<
  TStringKey extends string,
  TLanguage extends string,
  TConstants extends Record<string, any> = Record<string, any>,
  TContext extends string = LanguageContext,
> {
  stringNames: TStringKey[];
  strings: MasterStringsCollection<TStringKey, TLanguage>;
  defaultLanguage: TLanguage;
  defaultContext: TContext;
  languageCodes: LanguageCodeCollection<TLanguage>;
  languages: TLanguage[];
  constants?: TConstants;
  enumName?: string;
  enumObj?: Record<string, TStringKey>;
}

export interface I18nContext<
  TLanguage extends string,
  TContext extends string = LanguageContext,
> {
  language: TLanguage;
  adminLanguage: TLanguage;
  currentContext: TContext;
}

/**
 * Generic translation type for any enumeration
 */
export type EnumTranslation<T extends string | number> = {
  [K in T]: string;
};

/**
 * Generic language translation type for any enumeration
 */
export type EnumLanguageTranslation<
  T extends string | number,
  TLanguage extends string = string,
> = Partial<{
  [L in TLanguage]: EnumTranslation<T>;
}>;

/**
 * Helper function to create typed translations for an enumeration
 */
export function createTranslations<
  T extends string | number,
  TLanguage extends string,
>(
  translations: EnumLanguageTranslation<T, TLanguage>,
): EnumLanguageTranslation<T, TLanguage> {
  return translations;
}
