// V2 Exports (primary)
export * from './builders';
export * from './core';
export * from './errors';
export * from './interfaces';
export * from './utils';
export * from './types';
export * from './pluralization';
export * from './gender';
export * from './validation';

// Explicit exports for type safety
export { Timezone, isValidTimezone } from './utils/timezone';
export { CurrencyCode } from './utils/currency';

// Convenience aliases
export { I18nEngine as I18n } from './core/i18n-engine';
export { I18nBuilder as Builder } from './builders/i18n-builder';

// Reset utility
import { I18nEngine } from './core/i18n-engine';
export function resetAll(): void {
  I18nEngine.resetAll();
}

// Legacy exports (deprecated - for backwards compatibility)
export * from './active-context';
export * from './component-definition';
export * from './global-active-context';
// export * from './language-registry'; // Removed - conflicts with v2 core/language-registry
export * from './component-registration';
export * from './component-registry';
export * from './context-error-type';
export * from './core-i18n';
export * from './core-string-key';
export * from './create-translation-adapter';
export * from './enum-registry';
export * from './interfaces/handleable';
export * from './interfaces/handleable-error-options';
export * from './language-codes';
export * from './plugin-i18n-engine';
export * from './registry-config';
export * from './registry-error';
export * from './registry-error-type';
export * from './template';
export * from './translation-engine';
export * from './translation-request';
export * from './translation-response';
export * from './types';
export * from './validation-config';

// Legacy convenience exports
export { createCorePluginI18nEngine as createCoreI18n, createCorePluginI18nEngine as createCoreI18nEngine } from './core-i18n';
export { getCorePluginTranslation as getCoreTranslation, safeCorePluginTranslation as safeCoreTranslation } from './core-i18n';
export { PluginI18nEngine as PluginI18n } from './plugin-i18n-engine';

// Legacy testing utilities
import { PluginI18nEngine } from './plugin-i18n-engine';
export function resetAllI18nEngines(): void {
  PluginI18nEngine.resetAll();
}
