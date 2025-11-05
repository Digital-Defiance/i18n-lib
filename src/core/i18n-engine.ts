/**
 * Main I18n Engine (no generics)
 */

import { CoreI18nComponentId } from '../core-i18n';
import { I18nError } from '../errors';
import {
  ComponentConfig,
  EngineConfig,
  II18nEngine,
  LanguageDefinition,
  ValidationResult,
} from '../interfaces';
import { ComponentStore } from './component-store';
import { ContextManager } from './context-manager';
import { EnumRegistry } from './enum-registry';
import { LanguageRegistry } from './language-registry';
import { CurrencyCode } from '../utils/currency';
import { Timezone } from '../utils/timezone';

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
    this.enumRegistry = new EnumRegistry((key, vars) => this.safeTranslate(CoreI18nComponentId, key, vars));
    this.instanceKey = options?.instanceKey || I18nEngine.DEFAULT_KEY;

    // Create context
    I18nEngine.contextManager.create(this.instanceKey, this.config.defaultLanguage);

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

  // Component management
  register(config: ComponentConfig): ValidationResult {
    this.registerComponentMetadata(config);
    return this.componentStore.register(config);
  }

  private registerComponentMetadata(config: ComponentConfig): void {
    const componentId = config.id;
    const aliases = config.aliases || [];
    const enumName = (config as any).enumName;
    const enumObject = (config as any).enumObject;

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

  private normalizeLegacyKey(rawKey: string): string | null {
    if (!rawKey) return null;
    const normalized = rawKey
      .replace(/[-\s]+/g, '_')
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/__+/g, '_')
      .toLowerCase();
    return normalized.length > 0 ? normalized : null;
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

  updateStrings(componentId: string, strings: Record<string, Record<string, string>>): ValidationResult {
    return this.componentStore.update(componentId, strings);
  }

  hasComponent(componentId: string): boolean {
    return this.componentStore.has(componentId);
  }

  getComponents(): readonly ComponentConfig[] {
    return this.componentStore.getAll();
  }

  // Translation
  translate(
    componentId: string,
    key: string,
    variables?: Record<string, any>,
    language?: string,
  ): string {
    const lang = language || I18nEngine.contextManager.getCurrentLanguage(this.instanceKey);
    const combinedVars = this.buildCombinedVariables(variables);
    return this.componentStore.translate(componentId, key, combinedVars, lang);
  }

  safeTranslate(
    componentId: string,
    key: string,
    variables?: Record<string, any>,
    language?: string,
  ): string {
    const lang = language || I18nEngine.contextManager.getCurrentLanguage(this.instanceKey);
    const combinedVars = this.buildCombinedVariables(variables);
    return this.componentStore.safeTranslate(componentId, key, combinedVars, lang);
  }

  t(template: string, variables?: Record<string, any>, language?: string): string {
    const lang = language || I18nEngine.contextManager.getCurrentLanguage(this.instanceKey);

    // Build combined variables: constants + context + provided (provided overrides all)
    const combinedVars = this.buildCombinedVariables(variables);

    // Replace {{component.key}} or {{EnumName.key}} patterns with alias support
    let result = template.replace(/\{\{([^}]+)\}\}/g, (match, pattern) => {
      const parts = pattern.split('.');
      if (parts.length === 2) {
        const [rawPrefix, rawKey] = parts;
        const prefix = rawPrefix.trim();
        const key = rawKey.trim();
        
        // Always pass combined variables to translations
        // The translation will use them if the string has placeholders
        // Resolve aliases and enum names to actual component IDs
        const { componentId, stringKey } = this.resolveComponentAndKey(prefix, key);
        return this.safeTranslate(componentId, stringKey, combinedVars, lang);
      }
      return match;
    });

    // Replace {variable} patterns with combined variables
    result = result.replace(/\{(\w+)\}/g, (match, varName) => {
      return combinedVars[varName] !== undefined ? String(combinedVars[varName]) : match;
    });

    return result;
  }

  private buildCombinedVariables(variables?: Record<string, any>): Record<string, any> {
    const combined: Record<string, any> = {};

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
      const GlobalActiveContext = (globalThis as any).GlobalActiveContext;

      if (GlobalActiveContext && typeof GlobalActiveContext.getInstance === 'function') {
        const globalContext = GlobalActiveContext.getInstance();
        const context = globalContext?.context;

        if (context) {
          // Add context variables
          combined.language = context.language;
          combined.adminLanguage = context.adminLanguage;
          combined.currentContext = context.currentContext;
          
          if (context.currencyCode) {
            // Extract value from CurrencyCode object
            const currencyValue = this.extractValue(context.currencyCode);
            combined.currencyCode = currencyValue;
            combined.currency = currencyValue;
          }
          
          if (context.timezone) {
            // Extract value from Timezone object
            const timezoneValue = this.extractValue(context.timezone);
            combined.timezone = timezoneValue;
            combined.userTimezone = timezoneValue;
          }
          
          if (context.adminTimezone) {
            // Extract value from Timezone object
            combined.adminTimezone = this.extractValue(context.adminTimezone);
          }
        }
      }
    } catch (error) {
      // GlobalActiveContext not available or not initialized - continue without context vars
    }

    // 3. Override with provided variables (highest priority)
    // Also extract values from any CurrencyCode or Timezone objects
    if (variables) {
      const processedVars: Record<string, any> = {};
      for (const [key, value] of Object.entries(variables)) {
        processedVars[key] = this.extractValue(value);
      }
      Object.assign(combined, processedVars);
    }

    return combined;
  }

  private extractValue(value: any): any {
    // Handle CurrencyCode objects
    if (value instanceof CurrencyCode) {
      return value.value;
    }
    // Handle Timezone objects
    if (value instanceof Timezone) {
      return value.value;
    }
    // Handle objects with a 'value' property (duck typing for cross-context compatibility)
    if (value && typeof value === 'object' && 'value' in value && typeof value.value !== 'function') {
      return value.value;
    }
    // Return as-is for primitives and other objects
    return value;
  }

  // Language management
  registerLanguage(language: LanguageDefinition): void {
    LanguageRegistry.register(language);
  }

  setLanguage(language: string): void {
    if (!LanguageRegistry.has(language)) {
      throw I18nError.languageNotFound(language);
    }
    I18nEngine.contextManager.setLanguage(this.instanceKey, language);
  }

  setAdminLanguage(language: string): void {
    if (!LanguageRegistry.has(language)) {
      throw I18nError.languageNotFound(language);
    }
    I18nEngine.contextManager.setAdminLanguage(this.instanceKey, language);
  }

  getLanguages(): readonly LanguageDefinition[] {
    return LanguageRegistry.getAll();
  }

  hasLanguage(language: string): boolean {
    return LanguageRegistry.has(language);
  }

  // Constants management
  mergeConstants(constants: Record<string, any>): void {
    Object.assign(this.config.constants, constants);
  }

  updateConstants(constants: Record<string, any>): void {
    this.config.constants = constants;
    this.componentStore.setConstants(constants);
  }

  // Context management
  switchToAdmin(): void {
    I18nEngine.contextManager.switchToAdmin(this.instanceKey);
  }

  switchToUser(): void {
    I18nEngine.contextManager.switchToUser(this.instanceKey);
  }

  getCurrentLanguage(): string {
    return I18nEngine.contextManager.getCurrentLanguage(this.instanceKey);
  }

  // Enum translation
  registerEnum<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    translations: Record<string, Record<TEnum, string>>,
    enumName: string,
  ): void {
    this.enumRegistry.register(enumObj, translations, enumName);
  }

  translateEnum<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    value: TEnum,
    language?: string,
  ): string {
    const lang = language || this.getCurrentLanguage();
    return this.enumRegistry.translate(enumObj, value, lang);
  }

  hasEnum(enumObj: any): boolean {
    return this.enumRegistry.has(enumObj);
  }

  // Validation
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

  // Static methods
  static createInstance(key: string, languages: readonly LanguageDefinition[], config?: EngineConfig): I18nEngine {
    return new I18nEngine(languages, config, {
      instanceKey: key,
      registerInstance: true,
      setAsDefault: false,
    });
  }

  static getInstance(key?: string): I18nEngine {
    const instanceKey = key || I18nEngine.defaultKey || I18nEngine.DEFAULT_KEY;
    const instance = I18nEngine.instances.get(instanceKey);
    if (!instance) {
      throw I18nError.instanceNotFound(instanceKey);
    }
    return instance;
  }

  static hasInstance(key?: string): boolean {
    const instanceKey = key || I18nEngine.DEFAULT_KEY;
    return I18nEngine.instances.has(instanceKey);
  }

  static removeInstance(key?: string): boolean {
    const instanceKey = key || I18nEngine.DEFAULT_KEY;
    const removed = I18nEngine.instances.delete(instanceKey);
    if (removed && I18nEngine.defaultKey === instanceKey) {
      I18nEngine.defaultKey = null;
    }
    return removed;
  }

  static resetAll(): void {
    I18nEngine.instances.clear();
    I18nEngine.defaultKey = null;
    I18nEngine.contextManager.clear();
    LanguageRegistry.clear();
  }
}
