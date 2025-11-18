/**
 * Unified error class for i18n library
 */

/**
 * Error codes used throughout the i18n library.
 */
export const I18nErrorCode = {
  /** Component not found in registry */
  COMPONENT_NOT_FOUND: 'COMPONENT_NOT_FOUND',
  /** String key not found in component */
  STRING_KEY_NOT_FOUND: 'STRING_KEY_NOT_FOUND',
  /** Language not found in registry */
  LANGUAGE_NOT_FOUND: 'LANGUAGE_NOT_FOUND',
  /** Translation missing for specified key and language */
  TRANSLATION_MISSING: 'TRANSLATION_MISSING',
  /** Invalid configuration provided */
  INVALID_CONFIG: 'INVALID_CONFIG',
  /** Attempt to register duplicate component */
  DUPLICATE_COMPONENT: 'DUPLICATE_COMPONENT',
  /** Attempt to register duplicate language */
  DUPLICATE_LANGUAGE: 'DUPLICATE_LANGUAGE',
  /** Validation failed during registration */
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  /** I18n instance not found */
  INSTANCE_NOT_FOUND: 'INSTANCE_NOT_FOUND',
  /** I18n instance already exists */
  INSTANCE_EXISTS: 'INSTANCE_EXISTS',
  /** Invalid context key provided */
  INVALID_CONTEXT: 'INVALID_CONTEXT',
  /** Plural form not found for language and category */
  PLURAL_FORM_NOT_FOUND: 'PLURAL_FORM_NOT_FOUND',
  /** Invalid plural category provided */
  INVALID_PLURAL_CATEGORY: 'INVALID_PLURAL_CATEGORY',
  /** Count variable missing for plural translation */
  MISSING_COUNT_VARIABLE: 'MISSING_COUNT_VARIABLE',
} as const;

/**
 * Type representing all possible i18n error codes.
 */
export type I18nErrorCode = (typeof I18nErrorCode)[keyof typeof I18nErrorCode];

/**
 * Main error class for i18n-related errors.
 * Includes error code and optional metadata for debugging.
 */
export class I18nError extends Error {
  /**
   * Creates a new I18nError instance.
   * @param code - The specific error code
   * @param message - Human-readable error message
   * @param metadata - Optional metadata providing context about the error
   */
  constructor(
    public readonly code: I18nErrorCode,
    message: string,
    public readonly metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = 'I18nError';
    Object.setPrototypeOf(this, I18nError.prototype);
  }

  /**
   * Creates an error for when a component is not found.
   * @param componentId - The ID of the component that was not found
   * @returns An I18nError instance
   */
  static componentNotFound(componentId: string): I18nError {
    return new I18nError(
      I18nErrorCode.COMPONENT_NOT_FOUND,
      `Component '${componentId}' not found`,
      { componentId },
    );
  }

  /**
   * Creates an error for when a string key is not found in a component.
   * @param componentId - The ID of the component
   * @param stringKey - The string key that was not found
   * @returns An I18nError instance
   */
  static stringKeyNotFound(componentId: string, stringKey: string): I18nError {
    return new I18nError(
      I18nErrorCode.STRING_KEY_NOT_FOUND,
      `String key '${stringKey}' not found in component '${componentId}'`,
      { componentId, stringKey },
    );
  }

  /**
   * Creates an error for when a language is not found.
   * @param language - The language code that was not found
   * @returns An I18nError instance
   */
  static languageNotFound(language: string): I18nError {
    return new I18nError(
      I18nErrorCode.LANGUAGE_NOT_FOUND,
      `Language '${language}' not found`,
      { language },
    );
  }

  /**
   * Creates an error for when a translation is missing.
   * @param componentId - The ID of the component
   * @param stringKey - The string key
   * @param language - The language code
   * @returns An I18nError instance
   */
  static translationMissing(
    componentId: string,
    stringKey: string,
    language: string,
  ): I18nError {
    return new I18nError(
      I18nErrorCode.TRANSLATION_MISSING,
      `Translation missing for '${componentId}.${stringKey}' in language '${language}'`,
      { componentId, stringKey, language },
    );
  }

  /**
   * Creates an error for invalid configuration.
   * @param reason - The reason why the configuration is invalid
   * @returns An I18nError instance
   */
  static invalidConfig(reason: string): I18nError {
    return new I18nError(I18nErrorCode.INVALID_CONFIG, reason);
  }

  /**
   * Creates an error for duplicate component registration.
   * @param componentId - The ID of the duplicate component
   * @returns An I18nError instance
   */
  static duplicateComponent(componentId: string): I18nError {
    return new I18nError(
      I18nErrorCode.DUPLICATE_COMPONENT,
      `Component '${componentId}' already registered`,
      { componentId },
    );
  }

  /**
   * Creates an error for duplicate language registration.
   * @param language - The language code that is duplicate
   * @returns An I18nError instance
   */
  static duplicateLanguage(language: string): I18nError {
    return new I18nError(
      I18nErrorCode.DUPLICATE_LANGUAGE,
      `Language '${language}' already registered`,
      { language },
    );
  }

  /**
   * Creates an error for validation failure.
   * @param errors - Array of validation error messages
   * @returns An I18nError instance
   */
  static validationFailed(errors: string[]): I18nError {
    return new I18nError(
      I18nErrorCode.VALIDATION_FAILED,
      `Validation failed: ${errors.join(', ')}`,
      { errors },
    );
  }

  /**
   * Creates an error for when an i18n instance is not found.
   * @param key - The instance key that was not found
   * @returns An I18nError instance
   */
  static instanceNotFound(key: string): I18nError {
    return new I18nError(
      I18nErrorCode.INSTANCE_NOT_FOUND,
      `I18n instance '${key}' not found`,
      { key },
    );
  }

  /**
   * Creates an error for when an i18n instance already exists.
   * @param key - The instance key that already exists
   * @returns An I18nError instance
   */
  static instanceExists(key: string): I18nError {
    return new I18nError(
      I18nErrorCode.INSTANCE_EXISTS,
      `I18n instance '${key}' already exists`,
      { key },
    );
  }

  /**
   * Creates an error for an invalid context key.
   * @param contextKey - The invalid context key
   * @returns An I18nError instance
   */
  static invalidContext(contextKey: string): I18nError {
    return new I18nError(
      I18nErrorCode.INVALID_CONTEXT,
      `Invalid context key '${contextKey}'`,
      { contextKey },
    );
  }

  /**
   * Creates an error for when a plural form is not found.
   * @param category - The plural category that was not found
   * @param language - The language code
   * @param key - The translation key
   * @param availableForms - Array of available plural forms
   * @returns An I18nError instance
   */
  static pluralFormNotFound(
    category: string,
    language: string,
    key: string,
    availableForms: string[],
  ): I18nError {
    return new I18nError(
      I18nErrorCode.PLURAL_FORM_NOT_FOUND,
      `Plural form '${category}' not found for language '${language}' in key '${key}'. Available forms: ${availableForms.join(', ')}`,
      { category, language, key, availableForms },
    );
  }

  /**
   * Creates an error for an invalid plural category.
   * @param category - The invalid category
   * @param validCategories - Array of valid categories
   * @returns An I18nError instance
   */
  static invalidPluralCategory(category: string, validCategories: string[]): I18nError {
    return new I18nError(
      I18nErrorCode.INVALID_PLURAL_CATEGORY,
      `Invalid plural category '${category}'. Valid categories: ${validCategories.join(', ')}`,
      { category, validCategories },
    );
  }

  /**
   * Creates an error for when the count variable is missing for plural forms.
   * @param key - The translation key that requires a count variable
   * @returns An I18nError instance
   */
  static missingCountVariable(key: string): I18nError {
    return new I18nError(
      I18nErrorCode.MISSING_COUNT_VARIABLE,
      `Plural forms used in key '${key}' but no 'count' variable provided`,
      { key },
    );
  }
}
