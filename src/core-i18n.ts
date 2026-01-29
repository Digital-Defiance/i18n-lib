/**
 * Core I18n component with default languages and system strings
 */

import { ComponentDefinition } from './component-definition';
import { ComponentRegistration } from './component-registration';
import { CoreI18nComponentId } from './core-component-id';
import { CoreStringKeys, CoreStringKeyValue } from './core-string-key';
// eslint-disable-next-line import/order
import { I18nEngine } from './core/i18n-engine';
import { ComponentConfig, EngineConfig } from './interfaces';
import { LanguageCodes } from './language-codes';
import { LanguageDefinition } from './language-definition';
import { createCompleteComponentStrings } from './strict-types';
import { germanStrings } from './strings/de';
import { BritishEnglishStrings } from './strings/en-GB';
import { americanEnglishString } from './strings/en-US';
import { spanishStrings } from './strings/es';
import { frenchStrings } from './strings/fr';
import { japaneseStrings } from './strings/ja';
import { ukrainianStrings } from './strings/uk';
import { mandarinStrings } from './strings/zh-CN';

// Re-export for backward compatibility
export { CoreI18nComponentId };

/**
 * Helper function to create multiple language definitions
 */
function createLanguageDefinitions(
  languages: Array<{
    id: string;
    name: string;
    code: string;
    isDefault?: boolean;
  }>,
): LanguageDefinition[] {
  return languages.map((lang) => ({
    id: lang.id,
    name: lang.name,
    code: lang.code,
    isDefault: lang.isDefault || false,
  }));
}

/**
 * Core language code type - union of supported language codes
 * Provides compile-time type safety for core languages
 * For custom languages, extend this type or use string
 */
export type CoreLanguageCode =
  (typeof LanguageCodes)[keyof typeof LanguageCodes];

/**
 * Flexible language code type - use when you want runtime-only validation
 * Alias for string to indicate it's a language code
 */
export type FlexibleLanguageCode = string;

/**
 * Create default language definitions
 */
export function createDefaultLanguages(): LanguageDefinition[] {
  return createLanguageDefinitions([
    {
      id: LanguageCodes.EN_US,
      name: 'English (US)',
      code: 'en-US',
      isDefault: true,
    },
    {
      id: LanguageCodes.EN_GB,
      name: 'English (UK)',
      code: 'en-GB',
    },
    {
      id: LanguageCodes.FR,
      name: 'Français',
      code: 'fr',
    },
    {
      id: LanguageCodes.ES,
      name: 'Español',
      code: 'es',
    },
    {
      id: LanguageCodes.DE,
      name: 'Deutsch',
      code: 'de',
    },
    {
      id: LanguageCodes.ZH_CN,
      name: '中文 (简体)',
      code: 'zh-CN',
    },
    {
      id: LanguageCodes.JA,
      name: '日本語',
      code: 'ja',
    },
    {
      id: LanguageCodes.UK,
      name: 'Українська',
      code: 'uk',
    },
  ]);
}

/**
 * Core component definition using branded string keys
 */
export const CoreComponentDefinition: ComponentDefinition<
  typeof CoreStringKeys
> = {
  id: CoreI18nComponentId,
  name: 'Core I18n System',
  stringKeys: CoreStringKeys,
};

/**
 * Core component strings for all default languages
 */
export function createCoreComponentStrings() {
  return createCompleteComponentStrings<CoreStringKeyValue, string>({
    [LanguageCodes.EN_US]: americanEnglishString,
    [LanguageCodes.EN_GB]: BritishEnglishStrings,
    [LanguageCodes.FR]: frenchStrings,
    [LanguageCodes.ES]: spanishStrings,
    [LanguageCodes.DE]: germanStrings,
    [LanguageCodes.ZH_CN]: mandarinStrings,
    [LanguageCodes.JA]: japaneseStrings,
    [LanguageCodes.UK]: ukrainianStrings,
  });
}

/**
 * Create core component registration (for PluginI18nEngine)
 */
export function createCoreComponentRegistration(): ComponentRegistration<
  typeof CoreStringKeys,
  string
> {
  return {
    component: CoreComponentDefinition,
    strings: createCoreComponentStrings(),
  };
}

/**
 * Create core component config (for I18nEngine)
 */
export function createCoreComponentConfig(): ComponentConfig {
  return {
    id: CoreI18nComponentId,
    strings: createCoreComponentStrings(),
    aliases: ['CoreStringKey'],
  };
}

/**
 * Get core language codes as array (for Mongoose enums, etc.)
 */
export function getCoreLanguageCodes(): string[] {
  return Object.values(LanguageCodes);
}

/**
 * Get core language definitions
 */
export function getCoreLanguageDefinitions(): LanguageDefinition[] {
  return createDefaultLanguages();
}

// 1.x definitions moved to core-plugin-factory.ts to break circular dependency
// Import these from './core-plugin-factory' or from the main index

// 2.x definitions
//------------------------------

/**
 * Create Core i18n engine instance
 * Uses i18n 2.0 pattern with runtime validation
 * IMPORTANT: Uses 'default' as instance key so TypedHandleableError can find it
 */
function createInstance(config?: EngineConfig): I18nEngine {
  const engine = I18nEngine.registerIfNotExists(
    'default',
    createDefaultLanguages(),
    config,
  );

  // Register core component if not already registered
  const coreReg = createCoreComponentRegistration();
  engine.registerIfNotExists({
    id: coreReg.component.id,
    strings: coreReg.strings as Record<string, Record<string, string>>,
  });

  return engine;
}

/**
 * Lazy initialization with Proxy (like core-i18n.ts pattern)
 */
let _coreEngine: I18nEngine | undefined;

export function getCoreI18nEngine(): I18nEngine {
  // Lazy initialization on first access
  if (!_coreEngine) {
    // Check if instance exists before creating
    if (I18nEngine.hasInstance('default')) {
      _coreEngine = I18nEngine.getInstance('default');
    } else {
      _coreEngine = createInstance();
    }
    return _coreEngine;
  }

  // Lazy re-initialization if instance was cleared
  if (I18nEngine.hasInstance('default')) {
    return _coreEngine;
  } else {
    _coreEngine = createInstance();
    return _coreEngine;
  }
}

/**
 * Proxy for backward compatibility
 */
export const coreI18nEngine = new Proxy({} as I18nEngine, {
  get(target, prop) {
    return getCoreI18nEngine()[prop as keyof I18nEngine];
  },
});

/**
 * Reset function for tests
 */
export function resetCoreI18nEngine(): void {
  _coreEngine = undefined;
}

/**
 * Helper to translate Core strings
 */
export function getCoreTranslation(
  stringKey: CoreStringKeyValue,
  variables?: Record<string, string | number>,
  language?: string,
): string {
  return getCoreI18nEngine().translate(
    CoreI18nComponentId,
    stringKey,
    variables,
    language,
  );
}

/**
 * Safe translation with fallback
 */
export function safeCoreTranslation(
  stringKey: CoreStringKeyValue,
  variables?: Record<string, string | number>,
  language?: string,
): string {
  try {
    return getCoreTranslation(stringKey, variables, language);
  } catch {
    return `[${stringKey}]`;
  }
}
