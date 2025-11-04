/**
 * Component storage (no generics)
 */

import { I18nError } from '../errors';
import { ComponentConfig, ValidationResult } from '../interfaces';
import { replaceVariables } from '../utils';

export class ComponentStore {
  private components = new Map<string, ComponentConfig>();
  private aliasMap = new Map<string, string>();
  private constants?: Record<string, any>;

  constructor(constants?: Record<string, any>) {
    this.constants = constants;
  }

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

  update(componentId: string, strings: Record<string, Record<string, string>>): ValidationResult {
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

  has(componentId: string): boolean {
    return this.components.has(componentId) || this.aliasMap.has(componentId);
  }

  get(componentId: string): ComponentConfig {
    const id = this.aliasMap.get(componentId) || componentId;
    const component = this.components.get(id);
    if (!component) {
      throw I18nError.componentNotFound(componentId);
    }
    return component;
  }

  getAll(): readonly ComponentConfig[] {
    return Array.from(this.components.values());
  }

  translate(
    componentId: string,
    key: string,
    variables?: Record<string, any>,
    language?: string,
  ): string {
    const component = this.get(componentId);
    const langStrings = component.strings[language || 'en-US'];

    if (!langStrings) {
      throw I18nError.languageNotFound(language || 'en-US');
    }

    const translation = langStrings[key];
    if (!translation) {
      throw I18nError.translationMissing(componentId, key, language || 'en-US');
    }

    return replaceVariables(translation, variables, this.constants);
  }

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
          warnings.push(`Missing key '${key}' for language '${lang}' in component '${config.id}'`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  clear(): void {
    this.components.clear();
    this.aliasMap.clear();
  }
}
