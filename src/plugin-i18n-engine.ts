/**
 * Plugin-based internationalization engine with component and language registration
 */

import { ComponentDefinition } from './component-definition';
import { ComponentRegistration } from './component-registration';
import { ComponentRegistry } from './component-registry';
import { CurrencyCode } from './currency-code';
import { EnumTranslationRegistry } from './enum-registry';
import { LanguageDefinition } from './language-definition';
import { LanguageRegistry } from './language-registry';
import { RegistryConfig } from './registry-config';
import { RegistryContext } from './registry-context';
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
  private readonly languageRegistry: LanguageRegistry<TLanguages>;
  private readonly componentRegistry: ComponentRegistry<TLanguages>;
  private readonly enumRegistry: EnumTranslationRegistry<string, TLanguages>;
  private readonly config: RegistryConfig<TLanguages>;
  private context: RegistryContext<TLanguages>;

  /**
   * Static instances for semi-singleton pattern
   */
  private static _instances = new Map<string, PluginI18nEngine<any>>();
  private static _defaultKey: string | null = null;
  protected static readonly DefaultInstanceKey = 'default';

  constructor(
    initialLanguages: readonly LanguageDefinition[],
    config: Partial<RegistryConfig<TLanguages>> = {},
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

    // Initialize registries
    this.languageRegistry = new LanguageRegistry<TLanguages>();
    this.componentRegistry = new ComponentRegistry<TLanguages>(
      initialLanguages.map((l) => l.id as TLanguages),
      this.config.validation,
    );
    this.enumRegistry = new EnumTranslationRegistry<string, TLanguages>(
      initialLanguages.map((l) => l.id as TLanguages),
      (key: string, vars?: Record<string, any>) =>
        this.safeTranslate('core', key, vars),
    );

    // Register initial languages
    this.languageRegistry.registerLanguages(initialLanguages);

    // Initialize context
    this.context = {
      currentLanguage: this.config.defaultLanguage,
      fallbackLanguage: this.config.fallbackLanguage,
      currencyCode: this.config.defaultCurrencyCode,
      timezone: this.config.timezone,
      adminTimezone: this.config.adminTimezone,
    };
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

    const instance = new PluginI18nEngine<TLangs>(initialLanguages, config);
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
   * Register a new language
   */
  public registerLanguage(language: LanguageDefinition): void {
    this.languageRegistry.registerLanguage(language);

    // Update component registry with new language
    const newLanguages = this.languageRegistry.getLanguageIds();
    this.componentRegistry.updateRegisteredLanguages(
      newLanguages as TLanguages[],
    );
  }

  /**
   * Register multiple languages
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
    return this.componentRegistry.registerComponent(registration);
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
      language: language || this.context.currentLanguage,
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
      language || this.context.currentLanguage,
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
      language: language || this.context.currentLanguage,
      variables,
    };

    return this.componentRegistry.getTranslation(request);
  }

  /**
   * Get current context
   */
  public getContext(): RegistryContext<TLanguages> {
    return { ...this.context };
  }

  /**
   * Update context
   */
  public updateContext(updates: Partial<RegistryContext<TLanguages>>): void {
    this.context = { ...this.context, ...updates };
  }

  /**
   * Set current language
   */
  public setLanguage(language: TLanguages): void {
    if (!this.languageRegistry.hasLanguage(language)) {
      throw RegistryError.createSimple(
        RegistryErrorType.LanguageNotFound,
        `Language '${language}' is not registered`,
        { language },
      );
    }
    this.context.currentLanguage = language;
  }

  /**
   * Get available languages
   */
  public getLanguages(): readonly LanguageDefinition[] {
    return this.languageRegistry.getAllLanguages();
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
   * Check if a language is registered
   */
  public hasLanguage(language: TLanguages): boolean {
    return this.languageRegistry.hasLanguage(language);
  }

  /**
   * Get language by code
   */
  public getLanguageByCode(code: string): LanguageDefinition | undefined {
    return this.languageRegistry.getLanguageByCode(code);
  }

  /**
   * Get language registry for direct access
   */
  public getLanguageRegistry(): LanguageRegistry<TLanguages> {
    return this.languageRegistry;
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
    const languages = this.languageRegistry.getLanguageIds();

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
        const languageStrings = componentStrings[language];

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
}
