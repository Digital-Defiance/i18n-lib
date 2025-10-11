/**
 * Language registry for managing supported languages and their properties
 */

import { LanguageDefinition } from './language-definition';
import { RegistryError } from './registry-error';
import { RegistryErrorType } from './registry-error-type';

/**
 * Registry for managing supported languages
 */
export class LanguageRegistry<TLanguages extends string> {
  private readonly languages = new Map<TLanguages, LanguageDefinition>();
  private readonly languagesByCodes = new Map<string, TLanguages>();
  private defaultLanguageId: TLanguages | null = null;

  constructor() {
    // Empty constructor - languages are registered via registerLanguage method
  }

  /**
   * Register a new language
   */
  public registerLanguage(language: LanguageDefinition): void {
    const languageId = language.id as TLanguages;

    // Check for duplicate language ID
    if (this.languages.has(languageId)) {
      throw RegistryError.createSimple(
        RegistryErrorType.DuplicateLanguage,
        `Language '${languageId}' is already registered`,
        { languageId },
      );
    }

    // Check for duplicate language code
    if (this.languagesByCodes.has(language.code)) {
      const existingLanguageId = this.languagesByCodes.get(language.code)!;
      throw RegistryError.createSimple(
        RegistryErrorType.DuplicateLanguage,
        `Language code '${language.code}' is already used by language '${existingLanguageId}'`,
        { languageId, code: language.code, existingLanguageId },
      );
    }

    // Register the language
    this.languages.set(languageId, language);
    this.languagesByCodes.set(language.code, languageId);

    // Set as default if specified or if it's the first language
    if (language.isDefault || this.defaultLanguageId === null) {
      this.defaultLanguageId = languageId;
    }
  }

  /**
   * Register multiple languages at once
   */
  public registerLanguages(languages: readonly LanguageDefinition[]): void {
    for (const language of languages) {
      this.registerLanguage(language);
    }
  }

  /**
   * Get a language by its ID
   */
  public getLanguage(languageId: TLanguages): LanguageDefinition | undefined {
    return this.languages.get(languageId);
  }

  /**
   * Get a language by its code
   */
  public getLanguageByCode(code: string): LanguageDefinition | undefined {
    const languageId = this.languagesByCodes.get(code);
    return languageId ? this.languages.get(languageId) : undefined;
  }

  /**
   * Get all registered languages
   */
  public getAllLanguages(): ReadonlyArray<LanguageDefinition> {
    return Array.from(this.languages.values());
  }

  /**
   * Get all language IDs
   */
  public getLanguageIds(): readonly TLanguages[] {
    return Array.from(this.languages.keys());
  }

  /**
   * Get all language codes
   */
  public getLanguageCodes(): readonly string[] {
    return Array.from(this.languagesByCodes.keys());
  }

  /**
   * Check if a language is registered
   */
  public hasLanguage(languageId: TLanguages): boolean {
    return this.languages.has(languageId);
  }

  /**
   * Check if a language code is registered
   */
  public hasLanguageCode(code: string): boolean {
    return this.languagesByCodes.has(code);
  }

  /**
   * Get the default language
   */
  public getDefaultLanguage(): LanguageDefinition | null {
    return this.defaultLanguageId
      ? this.languages.get(this.defaultLanguageId) || null
      : null;
  }

  /**
   * Get the default language ID
   */
  public getDefaultLanguageId(): TLanguages | null {
    return this.defaultLanguageId;
  }

  /**
   * Set the default language
   */
  public setDefaultLanguage(languageId: TLanguages): void {
    if (!this.languages.has(languageId)) {
      throw RegistryError.createSimple(
        RegistryErrorType.LanguageNotFound,
        `Language '${languageId}' not found`,
        { languageId },
      );
    }
    this.defaultLanguageId = languageId;
  }

  /**
   * Get the number of registered languages
   */
  public getLanguageCount(): number {
    return this.languages.size;
  }

  /**
   * Validate that all required languages are present
   */
  public validateRequiredLanguages(
    requiredLanguages: readonly TLanguages[],
  ): LanguageValidationResult {
    const missingLanguages: TLanguages[] = [];
    const errors: string[] = [];

    for (const languageId of requiredLanguages) {
      if (!this.languages.has(languageId)) {
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
   * Create a mapping of language IDs to their display names
   */
  public getLanguageDisplayNames(): Record<TLanguages, string> {
    const result = {} as Record<TLanguages, string>;
    for (const [languageId, language] of this.languages) {
      result[languageId] = language.name;
    }
    return result;
  }

  /**
   * Create a mapping of language IDs to their codes
   */
  public getLanguageCodeMapping(): Record<TLanguages, string> {
    const result = {} as Record<TLanguages, string>;
    for (const [languageId, language] of this.languages) {
      result[languageId] = language.code;
    }
    return result;
  }

  /**
   * Find languages by partial name match (case-insensitive)
   */
  public findLanguagesByName(
    partialName: string,
  ): readonly LanguageDefinition[] {
    const searchTerm = partialName.toLowerCase();
    return Array.from(this.languages.values()).filter((language) =>
      language.name.toLowerCase().includes(searchTerm),
    );
  }

  /**
   * Clear all registered languages
   */
  public clear(): void {
    this.languages.clear();
    this.languagesByCodes.clear();
    this.defaultLanguageId = null;
  }
}

/**
 * Validation result for language operations
 */
export interface LanguageValidationResult {
  readonly isValid: boolean;
  readonly missingLanguages: readonly string[];
  readonly errors: readonly string[];
}

/**
 * Helper function to create language definitions with type safety
 */
export function createLanguageDefinition(
  id: string,
  name: string,
  code: string,
  isDefault?: boolean,
): LanguageDefinition {
  return {
    id,
    name,
    code,
    isDefault: isDefault || false,
  };
}

/**
 * Helper function to create multiple language definitions
 */
export function createLanguageDefinitions(
  languages: Array<{
    id: string;
    name: string;
    code: string;
    isDefault?: boolean;
  }>,
): LanguageDefinition[] {
  return languages.map((lang) =>
    createLanguageDefinition(lang.id, lang.name, lang.code, lang.isDefault),
  );
}
