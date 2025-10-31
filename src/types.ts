import { ComponentDefinition } from './component-definition';
import { ComponentRegistration } from './component-registration';
import { LanguageDefinition } from './language-definition';

/**
 * Standard language context spaces
 */
export type LanguageContextSpace = 'admin' | 'user';

/**
 * Default currency code
 */
export const DefaultCurrencyCode: string = 'USD';

/**
 * Default timezone
 */
export const DefaultTimezone: string = 'UTC';

/**
 * Currency position type
 */
export type CurrencyPosition = 'prefix' | 'postfix' | 'infix';

/**
 * Collection of localized strings for a specific language
 */
export type StringsCollection<TStringKey extends string> = Partial<
  Record<TStringKey, string>
>;

/**
 * Mapping of languages to their respective string collections
 */
export type MasterStringsCollection<
  TStringKey extends string,
  TLanguage extends string,
> = Partial<Record<TLanguage, StringsCollection<TStringKey>>>;

/**
 * Mapping of language codes to their respective languages
 */
export type LanguageCodeCollection<TLanguage extends string> = Partial<
  Record<TLanguage, string>
>;

/**
 * Mapping of enumeration values to their translations in multiple languages
 */
export type EnumTranslationMap<
  TEnum extends string | number,
  TLanguage extends string,
> = Partial<Record<TLanguage, Partial<Record<TEnum, string>>>>;

/**
 * String collection for a specific language and component
 */
export type ComponentStrings<TStringKeys extends string> = {
  [K in TStringKeys]: string;
};

/**
 * Partial string collection (used during registration before validation)
 */
export type PartialComponentStrings<TStringKeys extends string> = {
  [K in TStringKeys]?: string;
};

/**
 * Language strings for a component across all registered languages
 */
export type ComponentLanguageStrings<
  TStringKeys extends string,
  TLanguages extends string,
> = {
  [L in TLanguages]: ComponentStrings<TStringKeys>;
};

/**
 * Partial language strings (used during registration before validation)
 */
export type PartialComponentLanguageStrings<
  TStringKeys extends string,
  TLanguages extends string,
> = {
  [L in TLanguages]?: PartialComponentStrings<TStringKeys>;
};

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
 * Type utility to extract string keys from a component definition
 */
export type ExtractStringKeys<T> = T extends ComponentDefinition<infer K>
  ? K
  : never;

/**
 * Type utility to extract languages from registry
 */
export type ExtractLanguages<T> = T extends LanguageDefinition
  ? T['id']
  : never;

/**
 * Type utility to create a strongly typed component registration
 */
export type CreateComponentRegistration<
  TComponent extends ComponentDefinition<any>,
  TLanguages extends string,
> = ComponentRegistration<ExtractStringKeys<TComponent>, TLanguages>;

/**
 * Utility type to ensure all string keys are provided for all languages
 */
export type CompleteComponentStrings<
  TStringKeys extends string,
  TLanguages extends string,
> = ComponentLanguageStrings<TStringKeys, TLanguages>;

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
