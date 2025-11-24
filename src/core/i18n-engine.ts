/**
 * Main I18n Engine (no generics)
 */

import { CoreI18nComponentId } from '../core-component-id';
import { I18nError } from '../errors/i18n-error';
import {
  ComponentConfig,
  EngineConfig,
  II18nEngine,
  LanguageDefinition,
  ValidationResult,
} from '../interfaces';
import { CurrencyCode } from '../utils/currency';
import {
  createSafeObject,
  safeAssign,
  validateObjectKeys,
} from '../utils/safe-object';
import { Timezone } from '../utils/timezone';
import {
  validateComponentId,
  validateTemplateLength,
} from '../utils/validation';
import { ComponentStore } from './component-store';
import { ContextManager } from './context-manager';
import { EnumRegistry } from './enum-registry';
import { LanguageRegistry } from './language-registry';

/**
 * I18nEngine implements the II18nEngine interface, providing translation,
 * component registration, enum translation, and context management.
 */
export class I18nEngine implements II18nEngine {
  private static instances = new Map<string, I18nEngine>();
  private static defaultKey: string | null = null;
  private static readonly DEFAULT_KEY = 'default';
  private static readonly contextManager = new ContextManager();

  private readonly componentStore: ComponentStore;
  private readonly enumRegistry: EnumRegistry;
  private readonly instanceKey: string;
  private readonly config: Required<EngineConfig>;
  private readonly aliasToComponent = new Map<string, string>();
  private readonly componentKeyLookup = new Map<string, Map<string, string>>();

  /**
   * Constructs an I18nEngine instance, registering languages, setting defaults,
   * and optionally registering and setting this instance as default.
   *
   * @param languages - Array of language definitions to register.
   * @param config - Engine configuration options.
   * @param options - Optional creation options.
   * @param options.instanceKey - Key to identify this instance.
   * @param options.registerInstance - Whether to add this instance to the registry.
   * @param options.setAsDefault - Whether to set this instance as the default.
   * @throws {I18nError} If an instance with the same key already exists.
   */
  constructor(
    languages: readonly LanguageDefinition[],
    config: EngineConfig = {},
    options?: {
      instanceKey?: string;
      registerInstance?: boolean;
      setAsDefault?: boolean;
    },
  ) {
    // Register languages
    for (const lang of languages) {
      if (!LanguageRegistry.has(lang.id)) {
        LanguageRegistry.register(lang);
      }
    }

    // Set defaults
    const defaultLang = languages.find((l) => l.isDefault) || languages[0];
    this.config = {
      defaultLanguage: config.defaultLanguage || defaultLang.id,
      fallbackLanguage: config.fallbackLanguage || defaultLang.id,
      constants: config.constants || {},
      validation: {
        requireCompleteStrings: false,
        allowPartialRegistration: true,
        ...config.validation,
      },
    };

    this.componentStore = new ComponentStore(this.config.constants);
    this.enumRegistry = new EnumRegistry((key, vars) =>
      this.safeTranslate(CoreI18nComponentId, key, vars),
    );
    this.instanceKey = options?.instanceKey || I18nEngine.DEFAULT_KEY;

    // Create context
    I18nEngine.contextManager.create(
      this.instanceKey,
      this.config.defaultLanguage,
    );

    // Register instance
    if (options?.registerInstance !== false) {
      if (I18nEngine.instances.has(this.instanceKey)) {
        throw I18nError.instanceExists(this.instanceKey);
      }
      I18nEngine.instances.set(this.instanceKey, this);

      if (options?.setAsDefault !== false || !I18nEngine.defaultKey) {
        I18nEngine.defaultKey = this.instanceKey;
      }
    }
  }

  /**
   * Registers a translation component configuration.
   * @param config - Component configuration object.
   * @returns ValidationResult containing any warnings or errors.
   */
  register(config: ComponentConfig): ValidationResult {
    validateComponentId(config.id);
    this.registerComponentMetadata(config);
    return this.componentStore.register(config);
  }

  /**
   * Registers a component if not already registered.
   * @param config - Component configuration object.
   * @returns ValidationResult containing any warnings or errors.
   */
  registerIfNotExists(config: ComponentConfig): ValidationResult {
    if (this.hasComponent(config.id)) {
      return { isValid: true, errors: [], warnings: [] };
    }
    return this.register(config);
  }

  /**
   * Internal: Builds metadata lookup maps from component config.
   * @param config - Component configuration object.
   */
  private registerComponentMetadata(config: ComponentConfig): void {
    const componentId = config.id;
    const aliases = config.aliases || [];
    // These properties may exist on extended config types
    // Use type-safe property access with index signature
    const configWithOptional = config as ComponentConfig & {
      enumName?: string;
      enumObject?: Record<string, unknown>;
    };
    const enumName = configWithOptional.enumName;
    const enumObject = configWithOptional.enumObject;

    const aliasSet = new Set<string>();
    if (componentId) aliasSet.add(componentId);
    if (enumName) aliasSet.add(enumName);
    aliases.forEach((alias) => {
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

    // Get string keys from the strings object
    const firstLang = Object.keys(config.strings)[0];
    if (firstLang) {
      Object.keys(config.strings[firstLang]).forEach((key: string) => {
        addKeyVariant(key, key);
      });
    }

    if (enumObject) {
      Object.entries(enumObject).forEach(([enumKey, enumValue]) => {
        if (typeof enumValue === 'string') {
          addKeyVariant(enumKey, enumValue);
        }
      });
    }
  }

  /**
   * Internal: Normalizes legacy keys into snake_case lowercased.
   * @param rawKey - The raw key string to normalize.
   * @returns Normalized key or null if empty.
   */
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
   * Internal: Resolves the component prefix and key to actual IDs.
   * @param prefix - Component or enum alias.
   * @param rawKey - Raw translation key.
   * @returns Object containing resolved componentId and stringKey.
   */
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

  /**
   * Updates translation strings for a component.
   * @param componentId - ID of the component to update.
   * @param strings - Language-keyed string records.
   * @returns ValidationResult containing any warnings or errors.
   */
  updateStrings(
    componentId: string,
    strings: Record<string, Record<string, string>>,
  ): ValidationResult {
    return this.componentStore.update(componentId, strings);
  }

  /**
   * Checks if a component is registered.
   * @param componentId - ID of the component.
   * @returns True if the component exists.
   */
  hasComponent(componentId: string): boolean {
    return this.componentStore.has(componentId);
  }

  /**
   * Retrieves all registered component configs.
   * @returns Array of ComponentConfig.
   */
  getComponents(): readonly ComponentConfig[] {
    return this.componentStore.getAll();
  }

  /**
   * Translates a key for a component in a given or current language.
   * @param componentId - ID of the component.
   * @param key - Translation key.
   * @param variables - Optional variables for template.
   * @param language - Language code to translate into.
   * @returns Translated string.
   */
  translate(
    componentId: string,
    key: string,
    variables?: Record<string, any>,
    language?: string,
  ): string {
    const lang =
      language ||
      I18nEngine.contextManager.getCurrentLanguage(this.instanceKey);
    const combinedVars = this.buildCombinedVariables(variables);
    return this.componentStore.translate(componentId, key, combinedVars, lang);
  }

  /**
   * Safely translates a key, returning a placeholder for missing translations.
   * @param componentId - ID of the component.
   * @param key - Translation key.
   * @param variables - Optional variables for template.
   * @param language - Language code to translate into.
   * @returns Safe translated string.
   */
  safeTranslate(
    componentId: string,
    key: string,
    variables?: Record<string, any>,
    language?: string,
  ): string {
    const lang =
      language ||
      I18nEngine.contextManager.getCurrentLanguage(this.instanceKey);
    const combinedVars = this.buildCombinedVariables(variables);
    return this.componentStore.safeTranslate(
      componentId,
      key,
      combinedVars,
      lang,
    );
  }

  /**
   * Processes a translation template, replacing component and variable placeholders.
   * @param template - Template string containing {{component.key}} and {variable}.
   * @param variables - Optional variables for substitution.
   * @param language - Language code to translate into.
   * @returns Processed template string.
   * @throws {I18nError} If template length exceeds limits.
   */
  t(
    template: string,
    variables?: Record<string, any>,
    language?: string,
  ): string {
    validateTemplateLength(template);
    const lang =
      language ||
      I18nEngine.contextManager.getCurrentLanguage(this.instanceKey);

    // Build combined variables: constants + context + provided (provided overrides all)
    const combinedVars = this.buildCombinedVariables(variables);

    // Replace {{component.key}} or {{EnumName.key}} patterns with alias support
    // Limited pattern to prevent ReDoS: max 100 chars between braces
    let result = template.replace(
      /\{\{([^}]{1,100})\}\}/g,
      (match, pattern) => {
        const parts = pattern.split('.');
        if (parts.length === 2) {
          const [rawPrefix, rawKey] = parts;
          const prefix = rawPrefix.trim();
          const key = rawKey.trim();

          // Always pass combined variables to translations
          // The translation will use them if the string has placeholders
          // Resolve aliases and enum names to actual component IDs
          const { componentId, stringKey } = this.resolveComponentAndKey(
            prefix,
            key,
          );
          return this.safeTranslate(componentId, stringKey, combinedVars, lang);
        }
        return match;
      },
    );

    // Replace {variable} patterns with combined variables
    // Limited pattern to prevent ReDoS: max 50 chars for variable names
    result = result.replace(/\{(\w{1,50})\}/g, (match, varName) => {
      return combinedVars[varName] !== undefined
        ? String(combinedVars[varName])
        : match;
    });

    return result;
  }

  /**
   * Internal: Combines constants, context, and provided variables for translation.
   * @param variables - Optional overrides for context and constants.
   * @returns Combined variables record.
   */
  private buildCombinedVariables(
    variables?: Record<string, any>,
  ): Record<string, any> {
    if (variables) {
      validateObjectKeys(variables);
    }
    const combined: Record<string, any> = createSafeObject();

    // 1. Start with constants from config
    if (this.config.constants) {
      // Extract values from any wrapper objects in constants
      for (const [key, value] of Object.entries(this.config.constants)) {
        combined[key] = this.extractValue(value);
      }
    }

    // 2. Add context variables (timezone, currency, language, etc.)
    // GlobalActiveContext is optional and may not be available in all environments
    try {
      // Check if GlobalActiveContext is available in global scope
      const GlobalActiveContext = globalThis.GlobalActiveContext;

      if (
        GlobalActiveContext &&
        typeof GlobalActiveContext.getInstance === 'function'
      ) {
        const context = GlobalActiveContext.getInstance()?.context;
        if (context) {
          // Add context variables
          combined['language'] = context.language;
          combined['adminLanguage'] = context.adminLanguage;
          combined['currentContext'] = context.currentContext;

          if (context.currencyCode) {
            // Extract value from CurrencyCode object
            const currencyValue = this.extractValue(context.currencyCode);
            combined['currencyCode'] = currencyValue;
            combined['currency'] = currencyValue;
          }

          if (context.timezone) {
            // Extract value from Timezone object
            const timezoneValue = this.extractValue(context.timezone);
            combined['timezone'] = timezoneValue;
            combined['userTimezone'] = timezoneValue;
          }

          if (context.adminTimezone) {
            // Extract value from Timezone object
            combined['adminTimezone'] = this.extractValue(
              context.adminTimezone,
            );
          }
        }
      }
    } catch (error) {
      // GlobalActiveContext not available or not initialized - continue without context vars
    }

    // 3. Override with provided variables (highest priority)
    // Also extract values from any CurrencyCode or Timezone objects
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        if (!['__proto__', 'constructor', 'prototype'].includes(key)) {
          combined[key] = this.extractValue(value);
        }
      }
    }

    return combined;
  }

  /**
   * Internal: Extracts primitive or object 'value' fields, handling CurrencyCode and Timezone.
   * @param value - Value or wrapper object.
   * @returns Extracted primitive value.
   */
  private extractValue(value: any): any {
    if (value instanceof CurrencyCode) return value.value;
    if (value instanceof Timezone) return value.value;
    if (
      value &&
      typeof value === 'object' &&
      'value' in value &&
      typeof value.value !== 'function'
    ) {
      return value.value;
    }
    // Return as-is for primitives and other objects
    return value;
  }

  /**
   * Registers a language in the global LanguageRegistry.
   * @param language - LanguageDefinition to register.
   */
  registerLanguage(language: LanguageDefinition): void {
    LanguageRegistry.register(language);
  }

  /**
   * Sets the current translation language for this instance.
   * @param language - Language code to set.
   * @throws {I18nError} If the language is not registered.
   */
  setLanguage(language: string): void {
    if (!LanguageRegistry.has(language)) {
      throw I18nError.languageNotFound(language);
    }
    I18nEngine.contextManager.setLanguage(this.instanceKey, language);
  }

  /**
   * Sets the current admin translation language for this instance.
   * @param language - Language code to set.
   * @throws {I18nError} If the language is not registered.
   */
  setAdminLanguage(language: string): void {
    if (!LanguageRegistry.has(language)) {
      throw I18nError.languageNotFound(language);
    }
    I18nEngine.contextManager.setAdminLanguage(this.instanceKey, language);
  }

  /**
   * Retrieves all registered languages.
   * @returns Array of LanguageDefinition.
   */
  getLanguages(): readonly LanguageDefinition[] {
    return LanguageRegistry.getAll();
  }

  /**
   * Checks if a language is registered in the global registry.
   * @param language - Language code to check.
   * @returns True if the language exists.
   */
  hasLanguage(language: string): boolean {
    return LanguageRegistry.has(language);
  }

  /**
   * Merges new constants into existing config constants.
   * @param constants - Key-value constants to merge.
   */
  mergeConstants(constants: Record<string, any>): void {
    validateObjectKeys(constants);
    safeAssign(this.config.constants, constants);
  }

  /**
   * Updates config constants and componentStore constants to new values.
   * @param constants - New constants record.
   */
  updateConstants(constants: Record<string, any>): void {
    validateObjectKeys(constants);
    this.config.constants = constants;
    this.componentStore.setConstants(constants);
  }

  /**
   * Switches translation context to admin.
   */
  switchToAdmin(): void {
    I18nEngine.contextManager.switchToAdmin(this.instanceKey);
  }

  /**
   * Switches translation context to user.
   */
  switchToUser(): void {
    I18nEngine.contextManager.switchToUser(this.instanceKey);
  }

  /**
   * Retrieves the current language for this instance.
   * @returns Current language code.
   */
  getCurrentLanguage(): string {
    return I18nEngine.contextManager.getCurrentLanguage(this.instanceKey);
  }

  /**
   * Registers an enum for translation.
   * @param enumObj - Enum object to register.
   * @param translations - Language keyed translations for enum values.
   * @param enumName - Name to identify the enum in templates.
   */
  registerEnum<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    translations: Record<string, Record<TEnum, string>>,
    enumName: string,
  ): void {
    this.enumRegistry.register(enumObj, translations, enumName);
  }

  /**
   * Translates an enum value for the current or specified language.
   * @param enumObj - Enum object.
   * @param value - Enum value to translate.
   * @param language - Optional language code.
   * @returns Translated enum string.
   */
  translateEnum<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    value: TEnum,
    language?: string,
  ): string {
    const lang = language || this.getCurrentLanguage();
    return this.enumRegistry.translate(enumObj, value, lang);
  }

  /**
   * Checks if an enum is registered.
   * @param enumObj - Enum object to check.
   * @returns True if the enum is registered.
   */
  hasEnum(enumObj: any): boolean {
    return this.enumRegistry.has(enumObj);
  }

  /**
   * Validates all registered components for missing translations or warnings.
   * @returns ValidationResult containing errors and warnings.
   */
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const component of this.componentStore.getAll()) {
      const result = this.componentStore.register(component);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Creates a new engine instance with the given key, languages, and config.
   * @param key - Unique key for the new instance.
   * @param languages - Array of language definitions to register.
   * @param config - Optional engine configuration.
   * @returns Newly created I18nEngine instance.
   */
  static createInstance(
    key: string,
    languages: readonly LanguageDefinition[],
    config?: EngineConfig,
  ): I18nEngine {
    return new I18nEngine(languages, config, {
      instanceKey: key,
      registerInstance: true,
      setAsDefault: false,
    });
  }

  /**
   * Registers or retrieves an existing engine instance by key.
   * @param key - Unique key for the instance.
   * @param languages - Array of language definitions.
   * @param config - Optional engine configuration.
   * @returns Existing or newly created I18nEngine instance.
   */
  static registerIfNotExists(
    key: string,
    languages: readonly LanguageDefinition[],
    config?: EngineConfig,
  ): I18nEngine {
    if (I18nEngine.hasInstance(key)) {
      return I18nEngine.getInstance(key);
    }
    return I18nEngine.createInstance(key, languages, config);
  }

  /**
   * Retrieves an engine instance by key or default if none provided.
   * @param key - Optional instance key.
   * @returns I18nEngine instance.
   * @throws {I18nError} If instance not found.
   */
  static getInstance(key?: string): I18nEngine {
    const instanceKey = key || I18nEngine.defaultKey || I18nEngine.DEFAULT_KEY;
    const instance = I18nEngine.instances.get(instanceKey);
    if (!instance) {
      throw I18nError.instanceNotFound(instanceKey);
    }
    return instance;
  }

  /**
   * Checks if an engine instance exists.
   * @param key - Optional instance key.
   * @returns True if instance exists.
   */
  static hasInstance(key?: string): boolean {
    const instanceKey = key || I18nEngine.DEFAULT_KEY;
    return I18nEngine.instances.has(instanceKey);
  }

  /**
   * Removes an engine instance by key.
   * @param key - Optional instance key.
   * @returns True if the instance was removed.
   */
  static removeInstance(key?: string): boolean {
    const instanceKey = key || I18nEngine.DEFAULT_KEY;
    const removed = I18nEngine.instances.delete(instanceKey);
    if (removed && I18nEngine.defaultKey === instanceKey) {
      I18nEngine.defaultKey = null;
    }
    return removed;
  }

  /**
   * Resets all engine instances and clears global registries.
   */
  static resetAll(): void {
    I18nEngine.instances.clear();
    I18nEngine.defaultKey = null;
    I18nEngine.contextManager.clear();
    LanguageRegistry.clear();
  }
}
