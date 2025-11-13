/**
 * CLDR Plural Rules Implementation
 * Based on Unicode CLDR plural rules for cardinal numbers
 */

import { PluralCategory, PluralRuleFunction } from './plural-categories';

/**
 * English plural rule (en-US, en-GB)
 * Forms: one, other
 */
export const pluralRuleEnglish: PluralRuleFunction = (n: number): PluralCategory => {
  if (n === 1) return 'one';
  return 'other';
};

/**
 * Russian plural rule (ru)
 * Forms: one, few, many
 */
export const pluralRuleRussian: PluralRuleFunction = (n: number): PluralCategory => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  
  if (mod10 === 1 && mod100 !== 11) return 'one';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
  return 'many';
};

/**
 * Arabic plural rule (ar)
 * Forms: zero, one, two, few, many, other
 */
export const pluralRuleArabic: PluralRuleFunction = (n: number): PluralCategory => {
  if (n === 0) return 'zero';
  if (n === 1) return 'one';
  if (n === 2) return 'two';
  
  const mod100 = n % 100;
  if (mod100 >= 3 && mod100 <= 10) return 'few';
  if (mod100 >= 11) return 'many';
  return 'other';
};

/**
 * Polish plural rule (pl)
 * Forms: one, few, many, other
 */
export const pluralRulePolish: PluralRuleFunction = (n: number): PluralCategory => {
  // Fractional numbers use "other"
  if (n !== Math.floor(n)) return 'other';
  
  if (n === 1) return 'one';
  
  const mod10 = n % 10;
  const mod100 = n % 100;
  
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
  if (n !== 1 && (mod10 === 0 || mod10 === 1 || (mod10 >= 5 && mod10 <= 9) || (mod100 >= 12 && mod100 <= 14))) return 'many';
  return 'other';
};

/**
 * French plural rule (fr)
 * Forms: one, other
 */
export const pluralRuleFrench: PluralRuleFunction = (n: number): PluralCategory => {
  if (n === 0 || n === 1) return 'one';
  return 'other';
};

/**
 * Spanish plural rule (es)
 * Forms: one, other
 */
export const pluralRuleSpanish: PluralRuleFunction = (n: number): PluralCategory => {
  if (n === 1) return 'one';
  return 'other';
};

/**
 * Japanese plural rule (ja)
 * Forms: other (no plural distinction)
 */
export const pluralRuleJapanese: PluralRuleFunction = (n: number): PluralCategory => {
  return 'other';
};

/**
 * Ukrainian plural rule (uk)
 * Forms: one, few, many (same as Russian)
 */
export const pluralRuleUkrainian: PluralRuleFunction = pluralRuleRussian;

/**
 * Chinese plural rule (zh-CN)
 * Forms: other (no plural distinction)
 */
export const pluralRuleChinese: PluralRuleFunction = (n: number): PluralCategory => {
  return 'other';
};

/**
 * German plural rule (de)
 * Forms: one, other
 */
export const pluralRuleGerman: PluralRuleFunction = (n: number): PluralCategory => {
  if (n === 1) return 'one';
  return 'other';
};

/**
 * Scottish Gaelic plural rule (gd)
 * Forms: one, two, few, other
 * One of the most complex plural systems
 */
export const pluralRuleScottishGaelic: PluralRuleFunction = (n: number): PluralCategory => {
  if (n === 1 || n === 11) return 'one';
  if (n === 2 || n === 12) return 'two';
  if ((n >= 3 && n <= 10) || (n >= 13 && n <= 19)) return 'few';
  return 'other';
};

/**
 * Welsh plural rule (cy)
 * Forms: zero, one, two, few, many, other
 */
export const pluralRuleWelsh: PluralRuleFunction = (n: number): PluralCategory => {
  if (n === 0) return 'zero';
  if (n === 1) return 'one';
  if (n === 2) return 'two';
  if (n === 3) return 'few';
  if (n === 6) return 'many';
  return 'other';
};

/**
 * Breton plural rule (br)
 * Forms: one, two, few, many, other
 */
export const pluralRuleBreton: PluralRuleFunction = (n: number): PluralCategory => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  
  if (mod10 === 1 && mod100 !== 11 && mod100 !== 71 && mod100 !== 91) return 'one';
  if (mod10 === 2 && mod100 !== 12 && mod100 !== 72 && mod100 !== 92) return 'two';
  if ((mod10 === 3 || mod10 === 4 || mod10 === 9) && 
      (mod100 < 10 || mod100 > 19) && 
      (mod100 < 70 || mod100 > 79) && 
      (mod100 < 90 || mod100 > 99)) return 'few';
  if (n !== 0 && n % 1000000 === 0) return 'many';
  return 'other';
};

/**
 * Slovenian plural rule (sl)
 * Forms: one, two, few, other
 */
export const pluralRuleSlovenian: PluralRuleFunction = (n: number): PluralCategory => {
  const mod100 = n % 100;
  
  if (mod100 === 1) return 'one';
  if (mod100 === 2) return 'two';
  if (mod100 === 3 || mod100 === 4) return 'few';
  return 'other';
};

/**
 * Czech plural rule (cs)
 * Forms: one, few, many, other
 */
export const pluralRuleCzech: PluralRuleFunction = (n: number): PluralCategory => {
  if (n === 1) return 'one';
  if (n >= 2 && n <= 4) return 'few';
  if (n !== Math.floor(n)) return 'many';
  return 'other';
};

/**
 * Lithuanian plural rule (lt)
 * Forms: one, few, many, other
 */
export const pluralRuleLithuanian: PluralRuleFunction = (n: number): PluralCategory => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  
  if (mod10 === 1 && (mod100 < 11 || mod100 > 19)) return 'one';
  if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)) return 'few';
  if (n !== Math.floor(n)) return 'many';
  return 'other';
};

/**
 * Latvian plural rule (lv)
 * Forms: zero, one, other
 */
export const pluralRuleLatvian: PluralRuleFunction = (n: number): PluralCategory => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  
  if (n === 0) return 'zero';
  if (mod10 === 1 && mod100 !== 11) return 'one';
  return 'other';
};

/**
 * Irish plural rule (ga)
 * Forms: one, two, few, many, other
 */
export const pluralRuleIrish: PluralRuleFunction = (n: number): PluralCategory => {
  if (n === 1) return 'one';
  if (n === 2) return 'two';
  if (n >= 3 && n <= 6) return 'few';
  if (n >= 7 && n <= 10) return 'many';
  return 'other';
};

/**
 * Romanian plural rule (ro)
 * Forms: one, few, other
 */
export const pluralRuleRomanian: PluralRuleFunction = (n: number): PluralCategory => {
  const mod100 = n % 100;
  
  if (n === 1) return 'one';
  if (n === 0 || (mod100 >= 1 && mod100 <= 19)) return 'few';
  return 'other';
}
