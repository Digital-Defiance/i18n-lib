/**
 * Plugin-based internationalization engine with component and language registration
 */

import { ComponentDefinition } from './component-definition';
import { ComponentRegistration } from './component-registration';
import { ComponentRegistry } from './component-registry';
import { CurrencyCode } from './currency-code';
import { EnumTranslationRegistry } from './enum-registry';
import { GlobalActiveContext } from './global-active-context';
import { IActiveContext } from './active-context';
import { LanguageDefinition } from './language-definition';
import { LanguageRegistry } from './language-registry';
import { RegistryConfig } from './registry-config';
import { RegistryError } from './registry-error';
import { RegistryErrorType } from './registry-error-type';
import { Timezone } from './timezone';
import { TranslationRequest } from './translation-request';
import { TranslationResponse } from './translation-response';
import { EnumLanguageTranslation } from './types';

/**
 * Plugin-based I18n Engine with registration capabilities
 */
export class PluginI18nEngine<TLanguages extends string> {
  private readonly componentRegistry: ComponentRegistry<TLanguages>;
  private readonly enumRegistry: EnumTranslationRegistry<string, TLanguages>;
  private readonly config: RegistryConfig<TLanguages>;
  private contextKey: string;
  private readonly aliasToComponent = new Map<string, string>();
  private readonly componentKeyLookup = new Map<string, Map<string, string>>();

  /**
   * Default template processor instance
   */
  public readonly t: (
    str: string,
    language?: TLanguages,
    ...otherVars: Record<string, string | number>[]
  ) => string;



  /**
   * Static instances for semi-singleton pattern
   */
  private static _instances = new Map<string, PluginI18nEngine<any>>();
  private static _defaultKey: string | null = null;
  protected static readonly DefaultInstanceKey = 'default';

  constructor(
    initialLanguages: readonly LanguageDefinition[],
    config: Partial<RegistryConfig<TLanguages>> = {},
    options?: {
      instanceKey?: string;
      registerInstance?: boolean;
      setAsDefault?: boolean;
    },
  ) {
    // Find default language from initialLanguages or use the first one
    const defaultLang =
      initialLanguages.find((l) => l.isDefault) || initialLanguages[0];
    if (!defaultLang) {
      throw new Error('At least one language must be provided');
    }

    // Set up configuration with defaults
    this.config = {
      defaultLanguage: defaultLang.id as TLanguages,
      fallbackLanguage: defaultLang.id as TLanguages,
      defaultCurrencyCode: new CurrencyCode('USD'),
      timezone: new Timezone('UTC'),
      adminTimezone: new Timezone('UTC'),
      validation: {
        requireCompleteStrings: false,
        allowPartialRegistration: true,
        fallbackLanguageId: defaultLang.id,
      },
      ...config,
    };

    // Register initial languages in static registry (skip if already registered)
    for (const lang of initialLanguages) {
      if (!LanguageRegistry.hasLanguage(lang.id)) {
        LanguageRegistry.registerLanguage(lang);
      }
    }

    // Initialize component registry (per-instance)
    this.componentRegistry = new ComponentRegistry<TLanguages>(
      initialLanguages.map((l) => l.id as TLanguages),
      this.config.validation,
      this.config.constants,
    );
    this.enumRegistry = new EnumTranslationRegistry<string, TLanguages>(
      initialLanguages.map((l) => l.id as TLanguages),
      (key: string, vars?: Record<string, any>) =>
        this.safeTranslate('core', key, vars),
    );

    // Initialize context key for this engine instance
    this.contextKey = options?.instanceKey ?? PluginI18nEngine.DefaultInstanceKey;

    // Create or get the global context for this engine
    const globalContext = GlobalActiveContext.getInstance<TLanguages, IActiveContext<TLanguages>>();

    // Always create/update the context for this engine
    globalContext.createContext(
      this.config.defaultLanguage,
      this.config.defaultLanguage,
      this.contextKey,
    );
    globalContext.setCurrencyCode(this.config.defaultCurrencyCode, this.contextKey);
    globalContext.setUserTimezone(this.config.timezone, this.contextKey);
    globalContext.setAdminTimezone(this.config.adminTimezone, this.contextKey);

    // Initialize the default template processor for component-based patterns
    this.t = (str: string, language?: TLanguages, ...otherVars: Record<string, string | number>[]) => {
      // Step 1: Replace component-based patterns like {{componentId.stringKey}}
      let result = str.replace(/\{\{([^}]+)\}\}/g, (match, pattern) => {
        const parts = pattern.split('.');
        if (parts.length === 2) {
          const [rawPrefix, rawKey] = parts;
          const prefix = rawPrefix.trim();
          const key = rawKey.trim();
          // For template strings, use the first variable object if available
          const isTemplate = key.toLowerCase().endsWith('template');
          const vars = isTemplate && otherVars.length > 0 ? otherVars[0] : {};
          const { componentId, stringKey } = this.resolveComponentAndKey(prefix, key);
          return this.safeTranslate(componentId, stringKey, vars, language);
        }
        return match; // Return original if pattern doesn't match expected format
      });
      
      // Step 2: Replace remaining variable patterns like {varName} with merged variables
      const allVars = otherVars.reduce((acc, vars) => ({ ...acc, ...vars }), {});
      result = result.replace(/\{(\w+)\}/g, (match, varName) => {
        return allVars[varName] !== undefined ? String(allVars[varName]) : match;
      });
      
      return result;
    };

    // Auto-register as default instance if none exists
    const shouldRegisterInstance = options?.registerInstance ?? true;
    if (shouldRegisterInstance) {
      if (!PluginI18nEngine._instances.has(this.contextKey)) {
        PluginI18nEngine._instances.set(this.contextKey, this);
      }

      const shouldSetDefault = options?.setAsDefault ??
        (!PluginI18nEngine._defaultKey || this.contextKey === PluginI18nEngine.DefaultInstanceKey);

      if (shouldSetDefault) {
        PluginI18nEngine._defaultKey = this.contextKey;
      }
    }
  }

  private resolveComponentAndKey(
    prefix: string,
    rawKey: string,
  ): { componentId: string; stringKey: string } {
    const componentId = this.aliasToComponent.get(prefix) ?? prefix;
    const keyLookup = this.componentKeyLookup.get(componentId);

    if (!keyLookup) {
      return { componentId, stringKey: rawKey };
    }

    const directMatch = keyLookup.get(rawKey);
    if (directMatch) {
      return { componentId, stringKey: directMatch };
    }

    const normalized = this.normalizeLegacyKey(rawKey);
    if (normalized) {
      const normalizedMatch = keyLookup.get(normalized);
      if (normalizedMatch) {
        return { componentId, stringKey: normalizedMatch };
      }
    }

    return { componentId, stringKey: rawKey };
  }

  private registerComponentMetadata<TStringKeys extends string>(
    registration: ComponentRegistration<TStringKeys, TLanguages>,
  ): void {
    const { component, enumName, enumObject, aliases } = registration;
    const componentId = component.id;

    const aliasSet = new Set<string>();
    if (componentId) {
      aliasSet.add(componentId);
    }
    if (enumName) {
      aliasSet.add(enumName);
    }
    aliases?.forEach((alias) => {
      if (alias) aliasSet.add(alias);
    });

    aliasSet.forEach((alias) => {
      const trimmed = alias.trim();
      if (trimmed.length > 0) {
        this.aliasToComponent.set(trimmed, componentId);
      }
    });

    if (!this.componentKeyLookup.has(componentId)) {
      this.componentKeyLookup.set(componentId, new Map<string, string>());
    }
    const keyMap = this.componentKeyLookup.get(componentId)!;

    const addKeyVariant = (aliasKey: string, canonicalKey: string) => {
      if (!aliasKey || !canonicalKey) return;
      keyMap.set(aliasKey, canonicalKey);
      const normalized = this.normalizeLegacyKey(aliasKey);
      if (normalized && normalized !== aliasKey) {
        keyMap.set(normalized, canonicalKey);
      }
    };

    component.stringKeys.forEach((key) => {
      addKeyVariant(key, key);
    });

    if (enumObject) {
      Object.entries(enumObject).forEach(([enumKey, enumValue]) => {
        if (typeof enumValue === 'string') {
          addKeyVariant(enumKey, enumValue);
        }
      });
    }
  }

  private normalizeLegacyKey(rawKey: string): string | null {
    if (!rawKey) return null;
    const normalized = rawKey
      .replace(/[-\s]+/g, '_')
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/__+/g, '_')
      .toLowerCase();
    return normalized.length > 0 ? normalized : null;
  }

  /**
   * Create a new instance with a specific key
   */
  public static createInstance<TLangs extends string>(
    key: string,
    initialLanguages: readonly LanguageDefinition[],
    config?: Partial<RegistryConfig<TLangs>>,
  ): PluginI18nEngine<TLangs> {
    if (PluginI18nEngine._instances.has(key)) {
      throw RegistryError.createSimple(
        RegistryErrorType.DuplicateComponent,
        `I18n instance with key '${key}' already exists`,
        { key },
      );
    }

    const instance = new PluginI18nEngine<TLangs>(initialLanguages, config, {
      instanceKey: key,
      registerInstance: false,
    });
    instance.contextKey = key;

    // Create context for this specific instance (constructor already did this,
    // but we ensure the latest configuration is applied for explicit instances)
    const globalContext = GlobalActiveContext.getInstance();
    globalContext.createContext(
      instance.config.defaultLanguage,
      instance.config.defaultLanguage,
      key,
    );
    globalContext.setCurrencyCode(instance.config.defaultCurrencyCode, key);
    globalContext.setUserTimezone(instance.config.timezone, key);
    globalContext.setAdminTimezone(instance.config.adminTimezone, key);

    PluginI18nEngine._instances.set(key, instance);

    if (!PluginI18nEngine._defaultKey) {
      PluginI18nEngine._defaultKey = key;
    }

    return instance;
  }

  /**
   * Get an existing instance by key
   */
  public static getInstance<TLangs extends string>(
    key?: string,
  ): PluginI18nEngine<TLangs> {
    const instanceKey =
      key ||
      PluginI18nEngine._defaultKey ||
      PluginI18nEngine.DefaultInstanceKey;
    const instance = PluginI18nEngine._instances.get(instanceKey);

    if (!instance) {
      throw RegistryError.createSimple(
        RegistryErrorType.ComponentNotFound,
        `I18n instance with key '${instanceKey}' not found`,
        { key: instanceKey },
      );
    }

    return instance as PluginI18nEngine<TLangs>;
  }

  /**
   * Register a new language (updates static registry)
   */
  public registerLanguage(language: LanguageDefinition): void {
    LanguageRegistry.registerLanguage(language);

    // Update component registry with new language
    const newLanguages = LanguageRegistry.getLanguageIds();
    this.componentRegistry.updateRegisteredLanguages(
      newLanguages as TLanguages[],
    );
  }

  /**
   * Register multiple languages (updates static registry)
   */
  public registerLanguages(languages: readonly LanguageDefinition[]): void {
    for (const language of languages) {
      this.registerLanguage(language);
    }
  }

  /**
   * Register a component with its translations
   */
  public registerComponent<TStringKeys extends string>(
    registration: ComponentRegistration<TStringKeys, TLanguages>,
  ) {
    const validationResult = this.componentRegistry.registerComponent(registration);
    this.registerComponentMetadata(registration);
    return validationResult;
  }

  /**
   * Update strings for an existing component
   */
  public updateComponentStrings<TStringKeys extends string>(
    componentId: string,
    strings: Parameters<
      ComponentRegistry<TLanguages>['updateComponentStrings']
    >[1],
  ) {
    return this.componentRegistry.updateComponentStrings(componentId, strings);
  }

  /**
   * Register an enum with translations
   */
  public registerEnum<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    translations: EnumLanguageTranslation<TEnum, TLanguages>,
    enumName: string,
  ): void {
    this.enumRegistry.register(enumObj, translations, enumName);
  }

  /**
   * Translate a string for a component
   */
  public translate<TStringKeys extends string>(
    componentId: string,
    stringKey: TStringKeys,
    variables?: Record<string, string | number>,
    language?: TLanguages,
  ): string {
    const request: TranslationRequest<TStringKeys, TLanguages> = {
      componentId,
      stringKey,
      language: language || this.getCurrentLanguage(),
      variables,
    };

    const response = this.componentRegistry.getTranslation(request);
    return response.translation;
  }

  /**
   * Safe translate that returns a placeholder if translation fails
   */
  public safeTranslate(
    componentId: string,
    stringKey: string,
    variables?: Record<string, string | number>,
    language?: TLanguages,
  ): string {
    try {
      return this.translate(componentId, stringKey, variables, language);
    } catch (error) {
      // Return a placeholder if translation fails
      return `[${componentId}.${stringKey}]`;
    }
  }

  /**
   * Translate an enum value
   */
  public translateEnum<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    value: TEnum,
    language?: TLanguages,
  ): string {
    return this.enumRegistry.translate(
      enumObj,
      value,
      language || this.getCurrentLanguage(),
    );
  }

  /**
   * Get detailed translation response
   */
  public getTranslationDetails<TStringKeys extends string>(
    componentId: string,
    stringKey: TStringKeys,
    variables?: Record<string, string | number>,
    language?: TLanguages,
  ): TranslationResponse {
    const request: TranslationRequest<TStringKeys, TLanguages> = {
      componentId,
      stringKey,
      language: language || this.getCurrentLanguage(),
      variables,
    };

    return this.componentRegistry.getTranslation(request);
  }

  /**
   * Get current context
   */
  public getContext(): IActiveContext<TLanguages> {
    const globalContext = GlobalActiveContext.getInstance<TLanguages, IActiveContext<TLanguages>>();
    return globalContext.getContext(this.contextKey);
  }

  /**
   * Update context
   */
  public updateContext(updates: Partial<IActiveContext<TLanguages>>): void {
    const globalContext = GlobalActiveContext.getInstance<TLanguages, IActiveContext<TLanguages>>();
    
    if (updates.language) globalContext.setUserLanguage(updates.language, this.contextKey);
    if (updates.adminLanguage) globalContext.setAdminLanguage(updates.adminLanguage, this.contextKey);
    if (updates.currencyCode) globalContext.setCurrencyCode(updates.currencyCode, this.contextKey);
    if (updates.currentContext) globalContext.setLanguageContextSpace(updates.currentContext, this.contextKey);
    if (updates.timezone) globalContext.setUserTimezone(updates.timezone, this.contextKey);
    if (updates.adminTimezone) globalContext.setAdminTimezone(updates.adminTimezone, this.contextKey);
  }

  /**
   * Get current language from global context
   * Respects language context space (admin vs user)
   */
  private getCurrentLanguage(): TLanguages {
    const globalContext = GlobalActiveContext.getInstance<TLanguages, IActiveContext<TLanguages>>();
    const context = globalContext.getContext(this.contextKey);
    return context.currentContext === 'admin' ? context.adminLanguage : context.language;
  }

  /**
   * Set current language
   */
  public setLanguage(language: TLanguages): void {
    if (!LanguageRegistry.hasLanguage(language)) {
      throw RegistryError.createSimple(
        RegistryErrorType.LanguageNotFound,
        `Language '${language}' is not registered`,
        { language },
      );
    }
    const globalContext = GlobalActiveContext.getInstance<TLanguages, IActiveContext<TLanguages>>();
    globalContext.setUserLanguage(language, this.contextKey);
  }

  /**
   * Get available languages from static registry
   */
  public getLanguages(): readonly LanguageDefinition[] {
    return LanguageRegistry.getAllLanguages();
  }

  /**
   * Get registered components
   */
  public getComponents(): ReadonlyArray<ComponentDefinition<any>> {
    return this.componentRegistry.getComponents();
  }

  /**
   * Check if a component is registered
   */
  public hasComponent(componentId: string): boolean {
    return this.componentRegistry.hasComponent(componentId);
  }

  /**
   * Check if a language is registered in static registry
   */
  public hasLanguage(language: TLanguages): boolean {
    return LanguageRegistry.hasLanguage(language);
  }

  /**
   * Get language by code from static registry
   */
  public getLanguageByCode(code: string): LanguageDefinition | undefined {
    return LanguageRegistry.getLanguageByCode(code);
  }

  /**
   * Get component registry for direct access
   */
  public getComponentRegistry(): ComponentRegistry<TLanguages> {
    return this.componentRegistry;
  }

  /**
   * Get enum registry for direct access
   */
  public getEnumRegistry(): EnumTranslationRegistry<string, TLanguages> {
    return this.enumRegistry;
  }

  /**
   * Validate that all components have complete translations
   */
  public validateAllComponents(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isValid = true;

    const components = this.getComponents();
    const languages = LanguageRegistry.getLanguageIds();

    for (const component of components) {
      const componentStrings = this.componentRegistry.getComponentStrings(
        component.id,
      );

      if (!componentStrings) {
        errors.push(`Component '${component.id}' has no registered strings`);
        isValid = false;
        continue;
      }

      for (const language of languages) {
        const languageStrings = componentStrings[language as TLanguages];

        if (!languageStrings) {
          errors.push(
            `Component '${component.id}' missing strings for language '${language}'`,
          );
          isValid = false;
          continue;
        }

        for (const stringKey of component.stringKeys) {
          if (!languageStrings[stringKey]) {
            warnings.push(
              `Component '${component.id}' missing key '${stringKey}' for language '${language}'`,
            );
          }
        }
      }
    }

    return { isValid, errors, warnings };
  }

  /**
   * Clear all component registrations for this instance (useful for testing)
   */
  public clearAllComponents(): void {
    this.componentRegistry.clearAllComponents();
    this.aliasToComponent.clear();
    this.componentKeyLookup.clear();
  }

  /**
   * Remove a specific named instance
   */
  public static removeInstance(key?: string): boolean {
    const instanceKey = key || PluginI18nEngine.DefaultInstanceKey;
    const removed = PluginI18nEngine._instances.delete(instanceKey);

    // If we removed the default instance, clear the default key
    if (removed && PluginI18nEngine._defaultKey === instanceKey) {
      PluginI18nEngine._defaultKey = null;
    }

    return removed;
  }

  /**
   * Check if an instance exists
   */
  public static hasInstance(key?: string): boolean {
    const instanceKey = key || PluginI18nEngine.DefaultInstanceKey;
    return PluginI18nEngine._instances.has(instanceKey);
  }

  /**
   * Reset all plugin engines and clear component registrations
   * Useful for test cleanup
   */
  public static resetAll(): void {
    // Clear component registrations for each engine BEFORE clearing instances
    for (const engine of PluginI18nEngine._instances.values()) {
      engine.clearAllComponents();
    }
    PluginI18nEngine._instances.clear();
    PluginI18nEngine._defaultKey = null;
    LanguageRegistry.clear();
    GlobalActiveContext.clearAll();
  }
}
