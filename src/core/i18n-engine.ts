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

export class I18nEngine implements II18nEngine {
  private static instances = new Map<string, I18nEngine>();
  private static defaultKey: string | null = null;
  private static readonly DEFAULT_KEY = 'default';
  private static readonly contextManager = new ContextManager();

  private readonly componentStore: ComponentStore;
  private readonly enumRegistry: EnumRegistry;
  private readonly instanceKey: string;
  private readonly config: Required<EngineConfig>;

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
    return this.componentStore.register(config);
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
    return this.componentStore.translate(componentId, key, variables, lang);
  }

  safeTranslate(
    componentId: string,
    key: string,
    variables?: Record<string, any>,
    language?: string,
  ): string {
    const lang = language || I18nEngine.contextManager.getCurrentLanguage(this.instanceKey);
    return this.componentStore.safeTranslate(componentId, key, variables, lang);
  }

  t(template: string, variables?: Record<string, any>, language?: string): string {
    const lang = language || I18nEngine.contextManager.getCurrentLanguage(this.instanceKey);

    // Replace {{component.key}} patterns
    let result = template.replace(/\{\{([^}]+)\}\}/g, (match, pattern) => {
      const parts = pattern.split('.');
      if (parts.length === 2) {
        const [componentId, key] = parts.map((p: string) => p.trim());
        return this.safeTranslate(componentId, key, variables, lang);
      }
      return match;
    });

    // Replace {variable} patterns
    if (variables) {
      result = result.replace(/\{(\w+)\}/g, (match, varName) => {
        return variables[varName] !== undefined ? String(variables[varName]) : match;
      });
    }

    return result;
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
