/**
 * Core exports
 *
 * Note: Using regular exports for classes and type-only exports for interfaces
 * to minimize runtime circular dependencies while maintaining type availability.
 */

// Export classes (runtime dependencies)
export { ComponentStore } from './component-store';
export { ContextManager } from './context-manager';
export { EnumRegistry } from './enum-registry';
export { I18nEngine } from './i18n-engine';
export { LanguageRegistry } from './language-registry';

// Export types only (no runtime dependency)
export type { Context } from './context-manager';
