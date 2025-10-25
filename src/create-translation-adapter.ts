import { PluginI18nEngine } from './plugin-i18n-engine';
import { TranslationEngine } from './translation-engine';

/**
 * Creates a TranslationEngine adapter from a PluginI18nEngine for a specific component.
 * This allows PluginI18nEngine to be used where TranslationEngine interface is expected.
 * 
 * @param pluginEngine - The PluginI18nEngine instance to wrap
 * @param componentId - The component ID to use for translations
 * @returns A TranslationEngine that delegates to the PluginI18nEngine
 * 
 * @example
 * ```typescript
 * const pluginEngine = getMyPluginI18nEngine();
 * const adapter = createTranslationAdapter(pluginEngine, 'my-component');
 * 
 * // Now can be used where TranslationEngine is expected
 * const error = new MyError(errorType, adapter);
 * ```
 */
export function createTranslationAdapter<TStringKey extends string, TLanguage extends string>(
  pluginEngine: PluginI18nEngine<TLanguage>,
  componentId: string,
): TranslationEngine<TStringKey> {
  return {
    translate: (
      key: TStringKey,
      vars?: Record<string, string | number>,
      lang?: TLanguage,
    ): string => {
      try {
        return pluginEngine.translate(componentId, key, vars, lang);
      } catch (error) {
        // Fallback to key if translation fails
        return String(key);
      }
    },
    
    safeTranslate: (
      key: TStringKey,
      vars?: Record<string, string | number>,
      lang?: TLanguage,
    ): string => {
      return pluginEngine.safeTranslate(componentId, key, vars, lang);
    },
  };
}
