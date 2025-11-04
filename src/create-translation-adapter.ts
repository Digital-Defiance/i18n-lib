import { PluginI18nEngine } from './plugin-i18n-engine';
import { TranslationEngine } from './translation-engine';

/**
 * Creates a TranslationEngine adapter from a PluginI18nEngine for a specific component.
 * This allows PluginI18nEngine to be used where TranslationEngine interface is expected.
 * 
 * The adapter supports both calling conventions:
 * - Full TranslationEngine interface: `translate(componentId, key, vars, lang)`
 * - Simplified interface: `translate(key, vars, lang)` (componentId is bound)
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
 * // Simplified interface (componentId is bound)
 * const text1 = adapter.translate('key');
 * const text2 = adapter.translate('key', { var: 'value' });
 * const text3 = adapter.translate('key', { var: 'value' }, 'fr');
 *
 * // Full TranslationEngine interface
 * const text4 = adapter.translate('other-component', 'key', { var: 'value' }, 'fr');
 * ```
 */
export function createTranslationAdapter<
  TStringKey extends string,
  TLanguage extends string,
>(
  pluginEngine: PluginI18nEngine<TLanguage>,
  componentId: string,
): TranslationEngine<TStringKey> & {
  translate(key: TStringKey, vars?: Record<string, string | number>, lang?: TLanguage): string;
  safeTranslate(key: TStringKey, vars?: Record<string, string | number>, lang?: TLanguage): string;
} {
  const adapter: any = {
    translate: (
      keyOrComponentId: string | TStringKey,
      varsOrKey?: TStringKey | Record<string, string | number>,
      langOrVars?: TLanguage | Record<string, string | number>,
      maybeLang?: TLanguage,
    ): string => {
      let actualKey: TStringKey;
      let actualVars: Record<string, string | number> | undefined;
      let actualLang: TLanguage | undefined;

      if (arguments.length >= 4 || (typeof varsOrKey === 'string')) {
        actualKey = varsOrKey as TStringKey;
        actualVars = langOrVars as Record<string, string | number> | undefined;
        actualLang = maybeLang;
      } else {
        actualKey = keyOrComponentId as TStringKey;
        actualVars = varsOrKey as Record<string, string | number> | undefined;
        actualLang = langOrVars as TLanguage | undefined;
      }

      try {
        return pluginEngine.translate(componentId, actualKey, actualVars, actualLang);
      } catch (error) {
        return String(actualKey);
      }
    },

    safeTranslate: (
      keyOrComponentId: string | TStringKey,
      varsOrKey?: TStringKey | Record<string, string | number>,
      langOrVars?: TLanguage | Record<string, string | number>,
      maybeLang?: TLanguage,
    ): string => {
      let actualKey: TStringKey;
      let actualVars: Record<string, string | number> | undefined;
      let actualLang: TLanguage | undefined;

      if (arguments.length >= 4 || (typeof varsOrKey === 'string')) {
        actualKey = varsOrKey as TStringKey;
        actualVars = langOrVars as Record<string, string | number> | undefined;
        actualLang = maybeLang;
      } else {
        actualKey = keyOrComponentId as TStringKey;
        actualVars = varsOrKey as Record<string, string | number> | undefined;
        actualLang = langOrVars as TLanguage | undefined;
      }

      return pluginEngine.safeTranslate(componentId, actualKey, actualVars, actualLang);
    },
  };

  return adapter;
}
