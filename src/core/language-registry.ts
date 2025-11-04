/**
 * Static language registry (no generics)
 */

import { I18nError } from '../errors';
import { LanguageDefinition } from '../interfaces';

export class LanguageRegistry {
  private static languages = new Map<string, LanguageDefinition>();
  private static defaultLanguageId: string | null = null;

  static register(language: LanguageDefinition): void {
    if (this.languages.has(language.id)) {
      throw I18nError.duplicateLanguage(language.id);
    }

    const existing = this.getByCode(language.code);
    if (existing) {
      throw I18nError.duplicateLanguage(language.id);
    }

    this.languages.set(language.id, language);

    if (language.isDefault || !this.defaultLanguageId) {
      this.defaultLanguageId = language.id;
    }
  }

  static has(languageId: string): boolean {
    return this.languages.has(languageId);
  }

  static get(languageId: string): LanguageDefinition {
    const lang = this.languages.get(languageId);
    if (!lang) {
      throw I18nError.languageNotFound(languageId);
    }
    return lang;
  }

  static getAll(): readonly LanguageDefinition[] {
    return Array.from(this.languages.values());
  }

  static getIds(): readonly string[] {
    return Array.from(this.languages.keys());
  }

  static getCodes(): readonly string[] {
    return Array.from(this.languages.values()).map((l) => l.code);
  }

  static getDefault(): LanguageDefinition | null {
    if (!this.defaultLanguageId) {
      return null;
    }
    return this.get(this.defaultLanguageId);
  }

  static getByCode(code: string): LanguageDefinition | undefined {
    return Array.from(this.languages.values()).find((l) => l.code === code);
  }

  static getMatchingCode(
    requestedCode?: string,
    userDefaultCode?: string,
  ): string {
    const trimmedRequested = requestedCode?.trim();
    const trimmedUserDefault = userDefaultCode?.trim();
    
    if (trimmedRequested && this.getByCode(trimmedRequested)) {
      return trimmedRequested;
    }
    if (trimmedUserDefault && this.getByCode(trimmedUserDefault)) {
      return trimmedUserDefault;
    }
    const defaultLang = this.getDefault();
    if (!defaultLang) {
      throw I18nError.invalidConfig('No default language configured');
    }
    return defaultLang.code;
  }

  static clear(): void {
    this.languages.clear();
    this.defaultLanguageId = null;
  }

  // V1 compatibility methods
  static hasLanguage(languageId: string): boolean {
    return this.has(languageId);
  }

  static registerLanguage(language: LanguageDefinition): void {
    this.register(language);
  }

  static registerLanguages(languages: readonly LanguageDefinition[]): void {
    languages.forEach(lang => this.register(lang));
  }

  static getLanguageIds(): readonly string[] {
    return this.getIds();
  }

  static getAllLanguages(): readonly LanguageDefinition[] {
    return this.getAll();
  }

  static getLanguageByCode(code: string): LanguageDefinition | undefined {
    return this.getByCode(code);
  }

  static getLanguage(languageId: string): LanguageDefinition | undefined {
    try {
      return this.get(languageId);
    } catch {
      return undefined;
    }
  }

  static hasLanguageCode(code: string): boolean {
    return this.getByCode(code) !== undefined;
  }

  static getDefaultLanguageId(): string | null {
    return this.defaultLanguageId;
  }

  static getLanguageCount(): number {
    return this.languages.size;
  }

  static getDefaultLanguage(): LanguageDefinition | null {
    return this.getDefault();
  }

  static setDefaultLanguage(languageId: string): void {
    if (!this.has(languageId)) {
      throw I18nError.languageNotFound(languageId);
    }
    this.defaultLanguageId = languageId;
  }

  static validateRequiredLanguages(requiredLanguages: readonly string[]): {
    isValid: boolean;
    missingLanguages: readonly string[];
    errors: readonly string[];
  } {
    const missingLanguages: string[] = [];
    const errors: string[] = [];

    for (const languageId of requiredLanguages) {
      if (!this.has(languageId)) {
        missingLanguages.push(languageId);
        errors.push(`Required language '${languageId}' is not registered`);
      }
    }

    return {
      isValid: missingLanguages.length === 0,
      missingLanguages,
      errors,
    };
  }

  static getLanguageDisplayNames(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [languageId, language] of this.languages) {
      result[languageId] = language.name;
    }
    return result;
  }

  static getLanguageCodeMapping(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [languageId, language] of this.languages) {
      result[languageId] = language.code;
    }
    return result;
  }

  static findLanguagesByName(partialName: string): readonly LanguageDefinition[] {
    const searchTerm = partialName.toLowerCase();
    return Array.from(this.languages.values()).filter((language) =>
      language.name.toLowerCase().includes(searchTerm),
    );
  }

  static getLanguageCodes(): readonly string[] {
    return this.getCodes();
  }

  static getMatchingLanguageCode(
    requestedCode?: string,
    userDefaultCode?: string,
  ): string {
    return this.getMatchingCode(requestedCode, userDefaultCode);
  }
}
