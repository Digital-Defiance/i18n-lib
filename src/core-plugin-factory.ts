/**
 * Factory for creating core plugin I18n engine instances
 * This file breaks the circular dependency between core-i18n.ts and plugin-i18n-engine.ts
 */

import {
  createCoreComponentRegistration,
  createDefaultLanguages,
} from './core-i18n';
import { PluginI18nEngine } from './plugin-i18n-engine';
import { RegistryConfig } from './registry-config';

const DefaultInstanceKey = 'default';

/**
 * Create a pre-configured I18n engine with core components
 * Returns engine with string type - use registry for language validation
 */
export function createCorePluginI18nEngine(
  instanceKey: string = DefaultInstanceKey,
  config?: Partial<RegistryConfig<string>>,
): PluginI18nEngine<string> {
  const languages = createDefaultLanguages();
  const engine = PluginI18nEngine.createInstance<string>(
    instanceKey,
    languages,
    config,
  );
  engine.registerComponent(createCoreComponentRegistration());
  return engine;
}

// Note: Lazy initialization to avoid circular dependency issues
// Tests should call resetCorePluginI18nEngine() after PluginI18nEngine.resetAll()
let _corePluginI18nEngine: PluginI18nEngine<string> | undefined;

export function getCorePluginI18nEngine(): PluginI18nEngine<string> {
  // Lazy initialization on first access
  if (!_corePluginI18nEngine) {
    _corePluginI18nEngine = createCorePluginI18nEngine();
    return _corePluginI18nEngine;
  }

  // Lazy re-initialization if instance was cleared
  try {
    PluginI18nEngine.getInstance<string>(DefaultInstanceKey);
    return _corePluginI18nEngine;
  } catch {
    _corePluginI18nEngine = createCorePluginI18nEngine();
    return _corePluginI18nEngine;
  }
}

// Getter for direct reference - lazily initialized
export const corePluginI18nEngine = new Proxy({} as PluginI18nEngine<string>, {
  get(_target, prop) {
    const engine = getCorePluginI18nEngine();
    return engine[prop as keyof PluginI18nEngine<string>];
  },
});

// Reset function for tests
export function resetCorePluginI18nEngine(): void {
  _corePluginI18nEngine = undefined;
}

/**
 * Type alias for easier usage
 */
export type CorePluginI18nEngine = PluginI18nEngine<string>;

/**
 * Helper function to get core translation
 * Uses the core engine instance to ensure core strings are available
 */
export function getCorePluginTranslation(
  stringKey: string,
  variables?: Record<string, string | number>,
  language?: string,
  instanceKey?: string,
): string {
  // Use string literal to avoid circular dependency
  const coreComponentId = 'core';

  // Use core engine if no instance key specified, otherwise use specified instance
  const engine = instanceKey
    ? PluginI18nEngine.getInstance<string>(instanceKey)
    : getCorePluginI18nEngine();
  return engine.translate(coreComponentId, stringKey, variables, language);
}

/**
 * Helper function to safely get core translation with fallback
 */
export function safeCorePluginTranslation(
  stringKey: string,
  variables?: Record<string, string | number>,
  language?: string,
  instanceKey?: string,
): string {
  try {
    return getCorePluginTranslation(
      stringKey,
      variables,
      language,
      instanceKey,
    );
  } catch {
    return `[CoreStringKey.${stringKey}]`;
  }
}
