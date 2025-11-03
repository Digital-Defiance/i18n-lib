/**
 * Language registry for managing supported languages and their properties
 */

import { LanguageDefinition } from './language-definition';
import { RegistryError } from './registry-error';
import { RegistryErrorType } from './registry-error-type';

/**
 * Static singleton registry for managing supported languages globally
 */
export class LanguageRegistry {
  private static languages = new Map<string, LanguageDefinition>();
  private static languagesByCodes = new Map<string, string>();
  private static defaultLanguageId: string | null = null;

  private constructor() {
    // Private constructor - use static methods
  }

  /**
   * Register a new language
   */
  public static registerLanguage(language: LanguageDefinition): void {
    const languageId = language.id;

    // Check for duplicate language ID
    if (LanguageRegistry.languages.has(languageId)) {
      throw RegistryError.createSimple(
        RegistryErrorType.DuplicateLanguage,
        `Language '${languageId}' is already registered`,
        { languageId },
      );
    }

    // Check for duplicate language code
    if (LanguageRegistry.languagesByCodes.has(language.code)) {
      const existingLanguageId = LanguageRegistry.languagesByCodes.get(
        language.code,
      )!;
      throw RegistryError.createSimple(
        RegistryErrorType.DuplicateLanguage,
        `Language code '${language.code}' is already used by language '${existingLanguageId}'`,
        { languageId, code: language.code, existingLanguageId },
      );
    }

    // Register the language
    LanguageRegistry.languages.set(languageId, language);
    LanguageRegistry.languagesByCodes.set(language.code, languageId);

    // Set as default if specified or if it's the first language
    if (language.isDefault || LanguageRegistry.defaultLanguageId === null) {
      LanguageRegistry.defaultLanguageId = languageId;
    }
  }

  /**
   * Register multiple languages at once
   */
  public static registerLanguages(
    languages: readonly LanguageDefinition[],
  ): void {
    for (const language of languages) {
      LanguageRegistry.registerLanguage(language);
    }
  }

  /**
   * Get a language by its ID
   */
  public static getLanguage(
    languageId: string,
  ): LanguageDefinition | undefined {
    return LanguageRegistry.languages.get(languageId);
  }

  /**
   * Get a language by its code
   */
  public static getLanguageByCode(
    code: string,
  ): LanguageDefinition | undefined {
    const languageId = LanguageRegistry.languagesByCodes.get(code);
    return languageId ? LanguageRegistry.languages.get(languageId) : undefined;
  }

  /**
   * Get all registered languages
   */
  public static getAllLanguages(): ReadonlyArray<LanguageDefinition> {
    return Array.from(LanguageRegistry.languages.values());
  }

  /**
   * Get all language IDs
   */
  public static getLanguageIds(): readonly string[] {
    return Array.from(LanguageRegistry.languages.keys());
  }

  /**
   * Get all language codes
   */
  public static getLanguageCodes(): readonly string[] {
    return Array.from(LanguageRegistry.languagesByCodes.keys());
  }

  /**
   * Check if a language is registered
   */
  public static hasLanguage(languageId: string): boolean {
    return LanguageRegistry.languages.has(languageId);
  }

  /**
   * Check if a language code is registered
   */
  public static hasLanguageCode(code: string): boolean {
    return LanguageRegistry.languagesByCodes.has(code);
  }

  /**
   * Get the default language
   */
  public static getDefaultLanguage(): LanguageDefinition | null {
    return LanguageRegistry.defaultLanguageId
      ? LanguageRegistry.languages.get(LanguageRegistry.defaultLanguageId) ||
          null
      : null;
  }

  /**
   * Get the default language ID
   */
  public static getDefaultLanguageId(): string | null {
    return LanguageRegistry.defaultLanguageId;
  }

  /**
   * Get matching language code with fallback logic:
   * 1. Try requested code
   * 2. Fall back to user default
   * 3. Fall back to site default
   */
  public static getMatchingLanguageCode(
    requestedCode?: string,
    userDefaultCode?: string,
  ): string {
    // Try requested code first
    if (requestedCode && LanguageRegistry.hasLanguageCode(requestedCode)) {
      return requestedCode;
    }

    // Try user default
    if (userDefaultCode && LanguageRegistry.hasLanguageCode(userDefaultCode)) {
      return userDefaultCode;
    }

    // Fall back to site default
    const defaultLanguage = LanguageRegistry.getDefaultLanguage();
    if (!defaultLanguage) {
      throw RegistryError.createSimple(
        RegistryErrorType.LanguageNotFound,
        'No default language configured',
        {},
      );
    }

    return defaultLanguage.code;
  }

  /**
   * Set the default language
   */
  public static setDefaultLanguage(languageId: string): void {
    if (!LanguageRegistry.languages.has(languageId)) {
      throw RegistryError.createSimple(
        RegistryErrorType.LanguageNotFound,
        `Language '${languageId}' not found`,
        { languageId },
      );
    }
    LanguageRegistry.defaultLanguageId = languageId;
  }

  /**
   * Get the number of registered languages
   */
  public static getLanguageCount(): number {
    return LanguageRegistry.languages.size;
  }

  /**
   * Validate that all required languages are present
   */
  public static validateRequiredLanguages(
    requiredLanguages: readonly string[],
  ): LanguageValidationResult {
    const missingLanguages: string[] = [];
    const errors: string[] = [];

    for (const languageId of requiredLanguages) {
      if (!LanguageRegistry.languages.has(languageId)) {
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
  public static getLanguageDisplayNames(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [languageId, language] of LanguageRegistry.languages) {
      result[languageId] = language.name;
    }
    return result;
  }

  /**
   * Create a mapping of language IDs to their codes
   */
  public static getLanguageCodeMapping(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [languageId, language] of LanguageRegistry.languages) {
      result[languageId] = language.code;
    }
    return result;
  }

  /**
   * Find languages by partial name match (case-insensitive)
   */
  public static findLanguagesByName(
    partialName: string,
  ): readonly LanguageDefinition[] {
    const searchTerm = partialName.toLowerCase();
    return Array.from(LanguageRegistry.languages.values()).filter((language) =>
      language.name.toLowerCase().includes(searchTerm),
    );
  }

  /**
   * Clear all registered languages (useful for testing)
   */
  public static clear(): void {
    LanguageRegistry.languages.clear();
    LanguageRegistry.languagesByCodes.clear();
    LanguageRegistry.defaultLanguageId = null;
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
