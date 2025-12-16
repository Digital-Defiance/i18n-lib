/**
 * Component storage (no generics)
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */

import { I18nError } from '../errors/i18n-error';
import { ComponentConfig, ValidationResult } from '../interfaces';
import { getPluralCategory } from '../pluralization/language-plural-map';
import { PluralString, resolvePluralString } from '../types/plural-types';
import { replaceVariables } from '../utils';

/**
 * Class representing a storage for component configurations and translations.
 */
export class ComponentStore {
  private components = new Map<string, ComponentConfig>();
  private aliasMap = new Map<string, string>();
  private constants?: Record<string, any>;

  /**
   * Creates a new ComponentStore instance.
   * @param constants - Optional constants to be used in variable replacement.
   */
  constructor(constants?: Record<string, any>) {
    this.constants = constants;
  }

  /**
   * Registers a new component configuration.
   * @param config - The component configuration to register.
   * @returns ValidationResult indicating the result of the registration.
   * @throws {I18nError} If the component ID is already registered.
   */
  register(config: ComponentConfig): ValidationResult {
    if (this.components.has(config.id)) {
      throw I18nError.duplicateComponent(config.id);
    }

    const validation = this.validate(config);
    this.components.set(config.id, config);

    // Register aliases
    if (config.aliases) {
      for (const alias of config.aliases) {
        this.aliasMap.set(alias, config.id);
      }
    }

    return validation;
  }

  /**
   * Updates an existing component's strings.
   * @param componentId - The ID of the component to update.
   * @param strings - The new strings to merge into the component.
   * @returns ValidationResult indicating the result of the update.
   * @throws {I18nError} If the component is not found.
   */
  update(
    componentId: string,
    strings: Record<string, Record<string, string>>,
  ): ValidationResult {
    const existing = this.components.get(componentId);
    if (!existing) {
      throw I18nError.componentNotFound(componentId);
    }

    const updated: ComponentConfig = {
      ...existing,
      strings: { ...existing.strings, ...strings },
    };

    this.components.set(componentId, updated);
    return this.validate(updated);
  }

  /**
   * Checks if a component or alias is registered.
   * @param componentId - The component ID or alias to check.
   * @returns True if the component or alias is registered, false otherwise.
   */
  has(componentId: string): boolean {
    return this.components.has(componentId) || this.aliasMap.has(componentId);
  }

  /**
   * Retrieves a component configuration by ID or alias.
   * @param componentId - The component ID or alias to retrieve.
   * @returns The component configuration.
   * @throws {I18nError} If the component is not found.
   */
  get(componentId: string): ComponentConfig {
    const id = this.aliasMap.get(componentId) || componentId;
    const component = this.components.get(id);
    if (!component) {
      throw I18nError.componentNotFound(componentId);
    }
    return component;
  }

  /**
   * Retrieves all registered component configurations.
   * @returns An array of all component configurations.
   */
  getAll(): readonly ComponentConfig[] {
    return Array.from(this.components.values());
  }

  /**
   * Translates a key for a component in a given language, replacing variables.
   * @param componentId - The component ID.
   * @param key - The translation key.
   * @param variables - Optional variables for replacement.
   * @param language - Optional language code (default is 'en-US').
   * @returns The translated string.
   * @throws {I18nError} If the language or translation key is not found.
   */
  translate(
    componentId: string,
    key: string,
    variables?: Record<string, any>,
    language?: string,
  ): string {
    const component = this.get(componentId);
    const lang = language || 'en-US';
    const langStrings = component.strings[lang];

    if (!langStrings) {
      throw I18nError.languageNotFound(lang);
    }

    const value = langStrings[key];
    if (!value) {
      throw I18nError.translationMissing(componentId, key, lang);
    }

    // Resolve plural form if needed
    const translation = this.resolvePluralForm(value, variables?.count, lang);

    return replaceVariables(translation, variables, this.constants);
  }

  /**
   * Resolve plural form from a PluralString based on count variable.
   * @param value - The string or PluralString to resolve.
   * @param count - The count for pluralization.
   * @param language - The language code.
   * @returns The resolved plural form string.
   */
  private resolvePluralForm(
    value: string | PluralString,
    count: number | undefined,
    language: string,
  ): string {
    // If it's a simple string, return as-is
    if (typeof value === 'string') {
      return value;
    }

    // If no count provided, use 'other' form or first available
    if (count === undefined) {
      return resolvePluralString(value, 'other') || '';
    }

    // Get the appropriate plural category for this count and language
    const category = getPluralCategory(language, count);

    // Resolve the plural form with fallback logic
    return resolvePluralString(value, category) || '';
  }

  /**
   * Safely translates a key for a component, returning a fallback string on error.
   * @param componentId - The component ID.
   * @param key - The translation key.
   * @param variables - Optional variables for replacement.
   * @param language - Optional language code.
   * @returns The translated string or a fallback string if translation fails.
   */
  safeTranslate(
    componentId: string,
    key: string,
    variables?: Record<string, any>,
    language?: string,
  ): string {
    try {
      return this.translate(componentId, key, variables, language);
    } catch {
      return `[${componentId}.${key}]`;
    }
  }

  /**
   * Validates a component configuration for missing keys across languages.
   * @param config - The component configuration to validate.
   * @returns ValidationResult containing errors and warnings.
   */
  private validate(config: ComponentConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if all languages have all keys
    const allKeys = new Set<string>();
    for (const langStrings of Object.values(config.strings)) {
      for (const key of Object.keys(langStrings)) {
        allKeys.add(key);
      }
    }

    for (const [lang, langStrings] of Object.entries(config.strings)) {
      for (const key of allKeys) {
        if (!langStrings[key]) {
          warnings.push(
            `Missing key '${key}' for language '${lang}' in component '${config.id}'`,
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Sets constants for variable replacement.
   * @param constants - The constants to set.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setConstants(constants: Record<string, any>): void {
    this.constants = constants;
  }

  /**
   * Clears all registered components and aliases.
   */
  clear(): void {
    this.components.clear();
    this.aliasMap.clear();
  }
}
