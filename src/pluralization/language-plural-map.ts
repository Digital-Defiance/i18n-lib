/**
 * Language to Plural Rule Mapping
 */

import {
  LanguagePluralForms,
  PluralCategory,
  PluralRuleFunction,
} from './plural-categories';
import {
  pluralRuleArabic,
  pluralRuleBreton,
  pluralRuleChinese,
  pluralRuleCzech,
  pluralRuleEnglish,
  pluralRuleFrench,
  pluralRuleGerman,
  pluralRuleIrish,
  pluralRuleJapanese,
  pluralRuleLatvian,
  pluralRuleLithuanian,
  pluralRulePolish,
  pluralRuleRomanian,
  pluralRuleRussian,
  pluralRuleScottishGaelic,
  pluralRuleSlovenian,
  pluralRuleSpanish,
  pluralRuleUkrainian,
  pluralRuleWelsh,
} from './plural-rules';

/**
 * Map of language codes to plural rule functions
 */
export const LANGUAGE_PLURAL_RULES: Record<string, PluralRuleFunction> = {
  en: pluralRuleEnglish,
  'en-US': pluralRuleEnglish,
  'en-GB': pluralRuleEnglish,
  ru: pluralRuleRussian,
  ar: pluralRuleArabic,
  pl: pluralRulePolish,
  fr: pluralRuleFrench,
  es: pluralRuleSpanish,
  ja: pluralRuleJapanese,
  uk: pluralRuleUkrainian,
  zh: pluralRuleChinese,
  'zh-CN': pluralRuleChinese,
  de: pluralRuleGerman,
  gd: pluralRuleScottishGaelic,
  cy: pluralRuleWelsh,
  br: pluralRuleBreton,
  sl: pluralRuleSlovenian,
  cs: pluralRuleCzech,
  lt: pluralRuleLithuanian,
  lv: pluralRuleLatvian,
  ga: pluralRuleIrish,
  ro: pluralRuleRomanian,
  // Common languages reusing existing rules
  it: pluralRuleEnglish,
  pt: pluralRuleEnglish,
  'pt-BR': pluralRuleFrench, // Brazilian Portuguese: 0 and 1 use 'one'
  nl: pluralRuleEnglish,
  sv: pluralRuleEnglish,
  no: pluralRuleEnglish,
  da: pluralRuleEnglish,
  fi: pluralRuleEnglish,
  el: pluralRuleEnglish,
  tr: pluralRuleJapanese,
  ko: pluralRuleJapanese,
  vi: pluralRuleJapanese,
  th: pluralRuleJapanese,
  id: pluralRuleJapanese,
  ms: pluralRuleJapanese,
  he: pluralRuleEnglish, // Simplified - full Hebrew is more complex
  hi: pluralRuleFrench,
};

/**
 * Map of language codes to required/optional plural forms
 */
export const LANGUAGE_PLURAL_FORMS: Record<string, LanguagePluralForms> = {
  en: { required: ['one', 'other'], optional: ['zero'] },
  'en-US': { required: ['one', 'other'], optional: ['zero'] },
  'en-GB': { required: ['one', 'other'], optional: ['zero'] },
  ru: { required: ['one', 'few', 'many'], optional: ['zero'] },
  ar: {
    required: ['zero', 'one', 'two', 'few', 'many', 'other'],
    optional: [],
  },
  pl: { required: ['one', 'few', 'many'], optional: ['zero', 'other'] },
  fr: { required: ['one', 'other'], optional: ['zero'] },
  es: { required: ['one', 'other'], optional: ['zero'] },
  ja: { required: ['other'], optional: [] },
  uk: { required: ['one', 'few', 'many'], optional: ['zero'] },
  zh: { required: ['other'], optional: [] },
  'zh-CN': { required: ['other'], optional: [] },
  de: { required: ['one', 'other'], optional: ['zero'] },
  gd: { required: ['one', 'two', 'few', 'other'], optional: [] },
  cy: {
    required: ['zero', 'one', 'two', 'few', 'many', 'other'],
    optional: [],
  },
  br: { required: ['one', 'two', 'few', 'many', 'other'], optional: [] },
  sl: { required: ['one', 'two', 'few', 'other'], optional: [] },
  cs: { required: ['one', 'few', 'many', 'other'], optional: [] },
  lt: { required: ['one', 'few', 'many', 'other'], optional: [] },
  lv: { required: ['zero', 'one', 'other'], optional: [] },
  ga: { required: ['one', 'two', 'few', 'many', 'other'], optional: [] },
  ro: { required: ['one', 'few', 'other'], optional: [] },
  // Common languages
  it: { required: ['one', 'other'], optional: ['zero'] },
  pt: { required: ['one', 'other'], optional: ['zero'] },
  'pt-BR': { required: ['one', 'other'], optional: ['zero'] },
  nl: { required: ['one', 'other'], optional: ['zero'] },
  sv: { required: ['one', 'other'], optional: ['zero'] },
  no: { required: ['one', 'other'], optional: ['zero'] },
  da: { required: ['one', 'other'], optional: ['zero'] },
  fi: { required: ['one', 'other'], optional: ['zero'] },
  el: { required: ['one', 'other'], optional: ['zero'] },
  tr: { required: ['other'], optional: [] },
  ko: { required: ['other'], optional: [] },
  vi: { required: ['other'], optional: [] },
  th: { required: ['other'], optional: [] },
  id: { required: ['other'], optional: [] },
  ms: { required: ['other'], optional: [] },
  he: { required: ['one', 'other'], optional: ['zero'] },
  hi: { required: ['one', 'other'], optional: ['zero'] },
};

/**
 * Get plural category for a number in a specific language
 */
export function getPluralCategory(
  language: string,
  count: number,
): PluralCategory {
  // Handle invalid inputs
  if (typeof count !== 'number' || !isFinite(count)) {
    return 'other';
  }

  // Get the plural rule for the language
  const rule = LANGUAGE_PLURAL_RULES[language] || LANGUAGE_PLURAL_RULES['en'];

  // Apply the rule
  return rule(Math.abs(count));
}

/**
 * Get required plural forms for a language
 */
export function getRequiredPluralForms(language: string): string[] {
  const forms = LANGUAGE_PLURAL_FORMS[language] || LANGUAGE_PLURAL_FORMS['en'];
  return forms.required;
}

/**
 * Get all plural forms (required + optional) for a language
 */
export function getAllPluralForms(language: string): string[] {
  const forms = LANGUAGE_PLURAL_FORMS[language] || LANGUAGE_PLURAL_FORMS['en'];
  return [...forms.required, ...forms.optional];
}

/**
 * Check if a language has a specific plural form
 */
export function hasPluralForm(language: string, category: string): boolean {
  const forms = LANGUAGE_PLURAL_FORMS[language] || LANGUAGE_PLURAL_FORMS['en'];
  // Type guard to check if category is a valid PluralCategory
  const validCategories: readonly string[] = [
    'zero',
    'one',
    'two',
    'few',
    'many',
    'other',
  ];
  if (!validCategories.includes(category)) {
    return false;
  }
  return (
    forms.required.includes(category as PluralCategory) ||
    forms.optional.includes(category as PluralCategory)
  );
}
