/**
 * Static language registry (no generics)
 */

import { I18nError } from '../errors/i18n-error';
import { LanguageDefinition } from '../interfaces';

/**
 * Class representing a static registry for language definitions.
 */
export class LanguageRegistry {
  private static languages = new Map<string, LanguageDefinition>();
  private static defaultLanguageId: string | null = null;

  /**
   * Registers a new language definition.
   * @param language - The language definition to register.
   * @throws {I18nError} If the language ID or code is already registered.
   */
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

  /**
   * Checks if a language ID is registered.
   * @param languageId - The language ID to check.
   * @returns True if the language ID is registered, false otherwise.
   */
  static has(languageId: string): boolean {
    return this.languages.has(languageId);
  }

  /**
   * Retrieves a language definition by its ID.
   * @param languageId - The language ID to retrieve.
   * @returns The language definition.
   * @throws {I18nError} If the language ID is not found.
   */
  static get(languageId: string): LanguageDefinition {
    const lang = this.languages.get(languageId);
    if (!lang) {
      throw I18nError.languageNotFound(languageId);
    }
    return lang;
  }

  /**
   * Retrieves all registered language definitions.
   * @returns An array of all language definitions.
   */
  static getAll(): readonly LanguageDefinition[] {
    return Array.from(this.languages.values());
  }

  /**
   * Retrieves all registered language IDs.
   * @returns An array of all language IDs.
   */
  static getIds(): readonly string[] {
    return Array.from(this.languages.keys());
  }

  /**
   * Retrieves all registered language codes.
   * @returns An array of all language codes.
   */
  static getCodes(): readonly string[] {
    return Array.from(this.languages.values()).map((l) => l.code);
  }

  /**
   * Retrieves an array of objects mapping language codes to their labels.
   * @returns An array of objects with code and label properties.
   */
  static getCodeLabelMap(): { code: string; label: string }[] {
    return Array.from(this.languages.values()).map((l) => ({
      code: l.code,
      label: l.name,
    }));
  }

  /**
   * Retrieves the default language definition.
   * @returns The default language definition or null if none is set.
   */
  static getDefault(): LanguageDefinition | null {
    if (!this.defaultLanguageId) {
      return null;
    }
    return this.get(this.defaultLanguageId);
  }

  /**
   * Retrieves a language definition by its code.
   * @param code - The language code to retrieve.
   * @returns The language definition or undefined if not found.
   */
  static getByCode(code: string): LanguageDefinition | undefined {
    return Array.from(this.languages.values()).find((l) => l.code === code);
  }

  /**
   * Determines the best matching language code based on requested and user default codes.
   * @param requestedCode - The requested language code.
   * @param userDefaultCode - The user's default language code.
   * @returns The best matching language code.
   * @throws {I18nError} If no default language is configured.
   */
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

  /**
   * Clears all registered languages and resets the default language.
   */
  static clear(): void {
    this.languages.clear();
    this.defaultLanguageId = null;
  }

  // V1 compatibility methods

  /**
   * Checks if a language ID is registered (V1 compatibility).
   * @param languageId - The language ID to check.
   * @returns True if the language ID is registered, false otherwise.
   */
  static hasLanguage(languageId: string): boolean {
    return this.has(languageId);
  }

  /**
   * Registers a new language definition (V1 compatibility).
   * @param language - The language definition to register.
   */
  static registerLanguage(language: LanguageDefinition): void {
    this.register(language);
  }

  /**
   * Registers multiple language definitions (V1 compatibility).
   * @param languages - An array of language definitions to register.
   */
  static registerLanguages(languages: readonly LanguageDefinition[]): void {
    languages.forEach((lang) => this.register(lang));
  }

  /**
   * Retrieves all registered language IDs (V1 compatibility).
   * @returns An array of all language IDs.
   */
  static getLanguageIds(): readonly string[] {
    return this.getIds();
  }

  /**
   * Retrieves all registered language definitions (V1 compatibility).
   * @returns An array of all language definitions.
   */
  static getAllLanguages(): readonly LanguageDefinition[] {
    return this.getAll();
  }

  /**
   * Retrieves a language definition by its code (V1 compatibility).
   * @param code - The language code to retrieve.
   * @returns The language definition or undefined if not found.
   */
  static getLanguageByCode(code: string): LanguageDefinition | undefined {
    return this.getByCode(code);
  }

  /**
   * Retrieves a language definition by its ID (V1 compatibility).
   * @param languageId - The language ID to retrieve.
   * @returns The language definition or undefined if not found.
   */
  static getLanguage(languageId: string): LanguageDefinition | undefined {
    try {
      return this.get(languageId);
    } catch {
      return undefined;
    }
  }

  /**
   * Checks if a language code is registered.
   * @param code - The language code to check.
   * @returns True if the language code is registered, false otherwise.
   */
  static hasLanguageCode(code: string): boolean {
    return this.getByCode(code) !== undefined;
  }

  /**
   * Retrieves the default language ID.
   * @returns The default language ID or null if none is set.
   */
  static getDefaultLanguageId(): string | null {
    return this.defaultLanguageId;
  }

  /**
   * Retrieves the count of registered languages.
   * @returns The number of registered languages.
   */
  static getLanguageCount(): number {
    return this.languages.size;
  }

  /**
   * Retrieves the default language definition.
   * @returns The default language definition or null if none is set.
   */
  static getDefaultLanguage(): LanguageDefinition | null {
    return this.getDefault();
  }

  /**
   * Sets the default language by its ID.
   * @param languageId - The language ID to set as default.
   * @throws {I18nError} If the language ID is not registered.
   */
  static setDefaultLanguage(languageId: string): void {
    if (!this.has(languageId)) {
      throw I18nError.languageNotFound(languageId);
    }
    this.defaultLanguageId = languageId;
  }

  /**
   * Validates that all required languages are registered.
   * @param requiredLanguages - An array of required language IDs.
   * @returns An object containing validation results, missing languages, and errors.
   */
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

  /**
   * Retrieves a mapping of language IDs to their display names.
   * @returns An object mapping language IDs to display names.
   */
  static getLanguageDisplayNames(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [languageId, language] of this.languages) {
      result[languageId] = language.name;
    }
    return result;
  }

  /**
   * Retrieves a mapping of language IDs to their codes.
   * @returns An object mapping language IDs to language codes.
   */
  static getLanguageCodeMapping(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [languageId, language] of this.languages) {
      result[languageId] = language.code;
    }
    return result;
  }

  /**
   * Finds languages whose names include the given partial name (case-insensitive).
   * @param partialName - The partial name to search for.
   * @returns An array of matching language definitions.
   */
  static findLanguagesByName(
    partialName: string,
  ): readonly LanguageDefinition[] {
    const searchTerm = partialName.toLowerCase();
    return Array.from(this.languages.values()).filter((language) =>
      language.name.toLowerCase().includes(searchTerm),
    );
  }

  /**
   * Retrieves all registered language codes.
   * @returns An array of all language codes.
   */
  static getLanguageCodes(): readonly string[] {
    return this.getCodes();
  }

  /**
   * Determines the best matching language code based on requested and user default codes.
   * @param requestedCode - The requested language code.
   * @param userDefaultCode - The user's default language code.
   * @returns The best matching language code.
   */
  static getMatchingLanguageCode(
    requestedCode?: string,
    userDefaultCode?: string,
  ): string {
    return this.getMatchingCode(requestedCode, userDefaultCode);
  }
}
