/**
 * Unified error class for i18n library
 */

export const I18nErrorCode = {
  COMPONENT_NOT_FOUND: 'COMPONENT_NOT_FOUND',
  STRING_KEY_NOT_FOUND: 'STRING_KEY_NOT_FOUND',
  LANGUAGE_NOT_FOUND: 'LANGUAGE_NOT_FOUND',
  TRANSLATION_MISSING: 'TRANSLATION_MISSING',
  INVALID_CONFIG: 'INVALID_CONFIG',
  DUPLICATE_COMPONENT: 'DUPLICATE_COMPONENT',
  DUPLICATE_LANGUAGE: 'DUPLICATE_LANGUAGE',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INSTANCE_NOT_FOUND: 'INSTANCE_NOT_FOUND',
  INSTANCE_EXISTS: 'INSTANCE_EXISTS',
  INVALID_CONTEXT: 'INVALID_CONTEXT',
  PLURAL_FORM_NOT_FOUND: 'PLURAL_FORM_NOT_FOUND',
  INVALID_PLURAL_CATEGORY: 'INVALID_PLURAL_CATEGORY',
  MISSING_COUNT_VARIABLE: 'MISSING_COUNT_VARIABLE',
} as const;

export type I18nErrorCode = (typeof I18nErrorCode)[keyof typeof I18nErrorCode];

export class I18nError extends Error {
  constructor(
    public readonly code: I18nErrorCode,
    message: string,
    public readonly metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = 'I18nError';
    Object.setPrototypeOf(this, I18nError.prototype);
  }

  static componentNotFound(componentId: string): I18nError {
    return new I18nError(
      I18nErrorCode.COMPONENT_NOT_FOUND,
      `Component '${componentId}' not found`,
      { componentId },
    );
  }

  static stringKeyNotFound(componentId: string, stringKey: string): I18nError {
    return new I18nError(
      I18nErrorCode.STRING_KEY_NOT_FOUND,
      `String key '${stringKey}' not found in component '${componentId}'`,
      { componentId, stringKey },
    );
  }

  static languageNotFound(language: string): I18nError {
    return new I18nError(
      I18nErrorCode.LANGUAGE_NOT_FOUND,
      `Language '${language}' not found`,
      { language },
    );
  }

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

  static invalidConfig(reason: string): I18nError {
    return new I18nError(I18nErrorCode.INVALID_CONFIG, reason);
  }

  static duplicateComponent(componentId: string): I18nError {
    return new I18nError(
      I18nErrorCode.DUPLICATE_COMPONENT,
      `Component '${componentId}' already registered`,
      { componentId },
    );
  }

  static duplicateLanguage(language: string): I18nError {
    return new I18nError(
      I18nErrorCode.DUPLICATE_LANGUAGE,
      `Language '${language}' already registered`,
      { language },
    );
  }

  static validationFailed(errors: string[]): I18nError {
    return new I18nError(
      I18nErrorCode.VALIDATION_FAILED,
      `Validation failed: ${errors.join(', ')}`,
      { errors },
    );
  }

  static instanceNotFound(key: string): I18nError {
    return new I18nError(
      I18nErrorCode.INSTANCE_NOT_FOUND,
      `I18n instance '${key}' not found`,
      { key },
    );
  }

  static instanceExists(key: string): I18nError {
    return new I18nError(
      I18nErrorCode.INSTANCE_EXISTS,
      `I18n instance '${key}' already exists`,
      { key },
    );
  }

  static invalidContext(contextKey: string): I18nError {
    return new I18nError(
      I18nErrorCode.INVALID_CONTEXT,
      `Invalid context key '${contextKey}'`,
      { contextKey },
    );
  }

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

  static invalidPluralCategory(category: string, validCategories: string[]): I18nError {
    return new I18nError(
      I18nErrorCode.INVALID_PLURAL_CATEGORY,
      `Invalid plural category '${category}'. Valid categories: ${validCategories.join(', ')}`,
      { category, validCategories },
    );
  }

  static missingCountVariable(key: string): I18nError {
    return new I18nError(
      I18nErrorCode.MISSING_COUNT_VARIABLE,
      `Plural forms used in key '${key}' but no 'count' variable provided`,
      { key },
    );
  }
}
