/* eslint-disable import/export */
// V2 Exports (primary)
export * from './builders';
export * from './core';
export * from './errors';
export * from './gender';
export * from './interfaces';
export * from './pluralization';
export * from './types';
export * from './types/plural-types'; // Export plural types
export * from './utils';
export {
  createGenderedString,
  createPluralString,
} from './utils/plural-helpers'; // Export plural helpers (excluding getRequiredPluralForms to avoid conflict)
export * from './validation';
// Note: Most exports are handled by wildcard exports above
// Only add explicit exports here if they need special handling
// Convenience aliases
export { I18nBuilder as Builder } from './builders/i18n-builder';
export { I18nEngine as I18n } from './core/i18n-engine';
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
export * from './validation-config';
// Legacy convenience exports
export {
  createCorePluginI18nEngine as createCoreI18n,
  createCorePluginI18nEngine as createCoreI18nEngine,
  getCorePluginTranslation as getCoreTranslation,
  safeCorePluginTranslation as safeCoreTranslation,
} from './core-plugin-factory';
// Export core plugin factory functions
export * from './core-plugin-factory';
export { PluginI18nEngine as PluginI18n } from './plugin-i18n-engine';
// Legacy testing utilities
import { PluginI18nEngine } from './plugin-i18n-engine';
export function resetAllI18nEngines(): void {
  PluginI18nEngine.resetAll();
}
