/**
 * CLDR Plural Categories
 * Based on Unicode CLDR plural rules
 * @see https://cldr.unicode.org/index/cldr-spec/plural-rules
 */

/**
 * Standard CLDR plural categories
 */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * Plural rule function type
 * Takes a number and returns the appropriate plural category
 */
export type PluralRuleFunction = (n: number) => PluralCategory;

/**
 * Language-specific plural forms required
 */
export interface LanguagePluralForms {
  required: PluralCategory[];
  optional: PluralCategory[];
}
