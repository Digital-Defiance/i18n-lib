// Legacy exports (for backwards compatibility)
export * from './active-context';
export * from './component-definition';
export * from './component-registration';
export * from './component-registry';
export * from './context';
export * from './context-error';
export * from './context-error-type';
export * from './context-manager';
export * from './currency';
export * from './currency-code';
export * from './currency-format';
export * from './default-config';
export * from './enum-registry';
export * from './global-active-context';
export * from './handleable';
export * from './i-handleable';
export * from './i-handleable-error-options';
export * from './i-global-active-context';
export * from './i18n-context';
export * from './i18n-engine';
export * from './language-definition';
export * from './template';
export * from './timezone';
export * from './plugin-translatable-generic-error';
export * from './typed-error';
export * from './typed-handleable';
export * from './types';
export * from './utils';
export * from './validation-config';
export * from './validation-result';
export * from './core-i18n';
export * from './core-string-key';
export * from './language-codes';
export * from './language-registry';
export * from './plugin-i18n-engine';
export * from './plugin-translatable-generic-error';
export * from './plugin-translatable-handleable-generic';
export * from './plugin-typed-handleable';
export * from './registry-config';
export * from './registry-error';
export * from './registry-error-type';
export * from './translation-engine';
export * from './translation-request';
export * from './translation-response';
export * from './translatable';
export * from './create-translation-adapter';

// Re-export for convenience
export { createCoreI18nEngine as createCoreI18n } from './core-i18n';
export { I18nEngine as I18n } from './i18n-engine';
export { PluginI18nEngine as PluginI18n } from './plugin-i18n-engine';

// Testing utilities
import { PluginI18nEngine } from './plugin-i18n-engine';

/**
 * Reset all I18n engines and clear component registrations
 * Useful for test cleanup
 */
export function resetAllI18nEngines(): void {
  PluginI18nEngine.resetAll();
}
