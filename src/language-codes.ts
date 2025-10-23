/**
 * Common language codes following BCP 47 standard.
 * These are provided as constants for convenience, but any string can be used as a language code.
 * Site builders can use these or define their own custom language codes.
 */
export const LanguageCodes = {
  EN_US: 'en-US',
  EN_GB: 'en-GB',
  FR: 'fr',
  ES: 'es',
  DE: 'de',
  ZH_CN: 'zh-CN',
  JA: 'ja',
  UK: 'uk',
} as const;

/**
 * Type representing any language code (string)
 */
export type LanguageCode = string;

/**
 * Type representing the common language codes provided by this library
 */
export type CommonLanguageCode = typeof LanguageCodes[keyof typeof LanguageCodes];

/**
 * Helper to get display names for common language codes
 */
export const LanguageDisplayNames: Record<CommonLanguageCode, string> = {
  [LanguageCodes.EN_US]: 'English (US)',
  [LanguageCodes.EN_GB]: 'English (UK)',
  [LanguageCodes.FR]: 'Français',
  [LanguageCodes.ES]: 'Español',
  [LanguageCodes.DE]: 'Deutsch',
  [LanguageCodes.ZH_CN]: '中文',
  [LanguageCodes.JA]: '日本語',
  [LanguageCodes.UK]: 'Українська',
};
