import { PluginI18nEngine } from './plugin-i18n-engine';
import { I18nEngine } from './i18n-engine';

interface PluginSource {
  type: 'plugin';
  engine: PluginI18nEngine<any>;
  componentId: string;
}

interface LegacySource {
  type: 'legacy';
  engine: I18nEngine<any, any, any, any>;
}

type TranslationSource = PluginSource | LegacySource;

/**
 * Unified translator with explicit component/engine specification
 */
export class UnifiedTranslator<TLanguage extends string = string> {
  private sources = new Map<string, TranslationSource>();
  private defaultLanguage: TLanguage;
  private defaultSource?: string;

  constructor(defaultLanguage: TLanguage) {
    this.defaultLanguage = defaultLanguage;
  }

  /**
   * Register a plugin component
   */
  registerPlugin(
    id: string,
    engine: PluginI18nEngine<any>,
    componentId: string,
  ): void {
    this.sources.set(id, { type: 'plugin', engine, componentId });
    if (!this.defaultSource) this.defaultSource = id;
  }

  /**
   * Register a legacy engine
   */
  registerLegacy(id: string, engine: I18nEngine<any, any, any, any>): void {
    this.sources.set(id, { type: 'legacy', engine });
    if (!this.defaultSource) this.defaultSource = id;
  }

  /**
   * Set default source for unqualified keys
   */
  setDefaultSource(id: string): void {
    if (!this.sources.has(id)) {
      throw new Error(`Source '${id}' not registered`);
    }
    this.defaultSource = id;
  }

  /**
   * Translate with explicit source: 'source:key' or just 'key' (uses default)
   */
  translate(
    key: string,
    vars?: Record<string, string | number>,
    language?: TLanguage,
  ): string {
    const lang = language || this.defaultLanguage;
    const [sourceName, actualKey] = key.includes(':') 
      ? key.split(':', 2) 
      : [this.defaultSource, key];

    if (!sourceName) return `[${key}]`;
    
    const source = this.sources.get(sourceName);
    if (!source) return `[${key}]`;

    if (source.type === 'plugin') {
      return source.engine.safeTranslate(source.componentId, actualKey, vars, lang);
    } else {
      return source.engine.safeTranslate(actualKey as any, vars, lang);
    }
  }

  setLanguage(language: TLanguage): void {
    this.defaultLanguage = language;
  }

  getLanguage(): TLanguage {
    return this.defaultLanguage;
  }

  clearSources(): void {
    this.sources.clear();
    this.defaultSource = undefined;
  }
}
