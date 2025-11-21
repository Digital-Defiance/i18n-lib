/**
 * Unified error class for i18n library with ICU MessageFormat support
 */

import { formatICUMessage } from '../icu/helpers';

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
  /** Validation threshold exceeded */
  VALIDATION_THRESHOLD_EXCEEDED: 'VALIDATION_THRESHOLD_EXCEEDED',
  /** Operation failed at specific step */
  OPERATION_STEP_FAILED: 'OPERATION_STEP_FAILED',
  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  /** Nested validation error with context */
  NESTED_VALIDATION_ERROR: 'NESTED_VALIDATION_ERROR',
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
   * Creates an error for when a component is not found with nested ICU select formatting.
   * @param componentId - The ID of the component that was not found
   * @param language - Optional language code for message formatting
   * @returns An I18nError instance
   */
  static componentNotFound(componentId: string, language = 'en-US'): I18nError {
    const hasNamespace = componentId.includes('.');
    const message = formatICUMessage(
      "{hasNamespace, select, true {Namespaced component {componentId}} other {Component {componentId}}} not found in registry",
      { componentId, hasNamespace: hasNamespace ? 'true' : 'false' },
      language
    );
    return new I18nError(
      I18nErrorCode.COMPONENT_NOT_FOUND,
      message,
      { componentId },
    );
  }

  /**
   * Creates an error for when a string key is not found in a component with nested ICU formatting.
   * @param componentId - The ID of the component
   * @param stringKey - The string key that was not found
   * @param language - Optional language code for message formatting
   * @returns An I18nError instance
   */
  static stringKeyNotFound(componentId: string, stringKey: string, language = 'en-US'): I18nError {
    const depth = stringKey.split('.').length;
    const isNested = depth > 1;
    const message = formatICUMessage(
      "{isNested, select, true {Nested string key at {depth, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} level {stringKey}} other {String key {stringKey}}} not found in component {componentId}",
      { componentId, stringKey, depth, isNested: isNested ? 'true' : 'false' },
      language
    );
    return new I18nError(
      I18nErrorCode.STRING_KEY_NOT_FOUND,
      message,
      { componentId, stringKey },
    );
  }

  /**
   * Creates an error for when a language is not found with ICU formatting.
   * @param language - The language code that was not found
   * @param messageLanguage - Optional language code for error message formatting
   * @returns An I18nError instance
   */
  static languageNotFound(language: string, messageLanguage = 'en-US'): I18nError {
    const message = formatICUMessage(
      "Language {language} not found",
      { language },
      messageLanguage
    );
    return new I18nError(
      I18nErrorCode.LANGUAGE_NOT_FOUND,
      message,
      { language },
    );
  }

  /**
   * Creates an error for when a translation is missing with nested ICU formatting.
   * @param componentId - The ID of the component
   * @param stringKey - The string key
   * @param language - The language code where translation is missing
   * @param messageLanguage - Optional language code for error message formatting
   * @returns An I18nError instance
   */
  static translationMissing(
    componentId: string,
    stringKey: string,
    language: string,
    messageLanguage = 'en-US',
  ): I18nError {
    const hasNestedKey = stringKey.includes('.');
    const message = formatICUMessage(
      "Translation missing: {hasNested, select, true {nested path} other {key}} {componentId}.{stringKey} not found in language {language}",
      { componentId, stringKey, language, hasNested: hasNestedKey ? 'true' : 'false' },
      messageLanguage
    );
    return new I18nError(
      I18nErrorCode.TRANSLATION_MISSING,
      message,
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
   * Creates an error for duplicate component registration with nested ICU select formatting.
   * @param componentId - The ID of the duplicate component
   * @param language - Optional language code for message formatting
   * @returns An I18nError instance
   */
  static duplicateComponent(componentId: string, language = 'en-US'): I18nError {
    const hasNamespace = componentId.includes('.');
    const message = formatICUMessage(
      "{hasNamespace, select, true {Namespaced component {componentId}} other {Component {componentId}}} is already registered {hasNamespace, select, true {in this namespace} other {in the registry}}",
      { componentId, hasNamespace: hasNamespace ? 'true' : 'false' },
      language
    );
    return new I18nError(
      I18nErrorCode.DUPLICATE_COMPONENT,
      message,
      { componentId },
    );
  }

  /**
   * Creates an error for duplicate language registration with ICU formatting.
   * @param language - The language code that is duplicate
   * @param messageLanguage - Optional language code for error message formatting
   * @returns An I18nError instance
   */
  static duplicateLanguage(language: string, messageLanguage = 'en-US'): I18nError {
    const message = `Language '${language}' already registered`;
    return new I18nError(
      I18nErrorCode.DUPLICATE_LANGUAGE,
      message,
      { language },
    );
  }

  /**
   * Creates an error for validation failure with ICU plural formatting and number formatting.
   * @param errors - Array of validation error messages
   * @param language - Optional language code for message formatting
   * @returns An I18nError instance
   */
  static validationFailed(errors: string[], language = 'en-US'): I18nError {
    const message = formatICUMessage(
      'Validation failed with {count, plural, one {{count, number, integer} error} other {{count, number, integer} errors}}: {details}',
      { count: errors.length, details: errors.join(', ') },
      language
    );
    return new I18nError(
      I18nErrorCode.VALIDATION_FAILED,
      message,
      { errors, count: errors.length },
    );
  }

  /**
   * Creates an error for when an i18n instance is not found with nested ICU select formatting.
   * @param key - The instance key that was not found
   * @param language - Optional language code for message formatting
   * @returns An I18nError instance
   */
  static instanceNotFound(key: string, language = 'en-US'): I18nError {
    const isDefault = key === 'default' || key === '';
    const message = formatICUMessage(
      "{isDefault, select, true {Default i18n instance not found} other {I18n instance {key} not found}} in registry",
      { key, isDefault: isDefault ? 'true' : 'false' },
      language
    );
    return new I18nError(
      I18nErrorCode.INSTANCE_NOT_FOUND,
      message,
      { key },
    );
  }

  /**
   * Creates an error for when an i18n instance already exists with nested ICU select formatting.
   * @param key - The instance key that already exists
   * @param language - Optional language code for message formatting
   * @returns An I18nError instance
   */
  static instanceExists(key: string, language = 'en-US'): I18nError {
    const isDefault = key === 'default' || key === '';
    const message = formatICUMessage(
      "{isDefault, select, true {Default i18n instance 'default' already exists. Use a different key or remove the existing instance first.} other {I18n instance {key} already exists in registry}}",
      { key, isDefault: isDefault ? 'true' : 'false' },
      language
    );
    return new I18nError(
      I18nErrorCode.INSTANCE_EXISTS,
      message,
      { key },
    );
  }

  /**
   * Creates an error for an invalid context key with ICU formatting.
   * @param contextKey - The invalid context key
   * @param language - Optional language code for message formatting
   * @returns An I18nError instance
   */
  static invalidContext(contextKey: string, language = 'en-US'): I18nError {
    const message = formatICUMessage(
      "Invalid context key {contextKey}",
      { contextKey },
      language
    );
    return new I18nError(
      I18nErrorCode.INVALID_CONTEXT,
      message,
      { contextKey },
    );
  }

  /**
   * Creates an error for when a plural form is not found with nested ICU select and plural formatting.
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
    const formCount = availableForms.length;
    const message = formatICUMessage(
      "Plural form {category} not found for language {language}{hasKey, select, true { in key {keyName}} other {}}. {formCount, plural, one {Available form} other {Available forms}} ({formCount, number, integer}): {forms}",
      { 
        category, 
        language, 
        keyName: key,
        hasKey: key ? 'true' : 'false',
        forms: availableForms.join(', '),
        formCount
      },
      language
    );
    return new I18nError(
      I18nErrorCode.PLURAL_FORM_NOT_FOUND,
      message,
      { category, language, key, availableForms, formCount },
    );
  }

  /**
   * Creates an error for an invalid plural category with nested ICU plural and number formatting.
   * @param category - The invalid category
   * @param validCategories - Array of valid categories
   * @param language - Optional language code for message formatting
   * @returns An I18nError instance
   */
  static invalidPluralCategory(category: string, validCategories: string[], language = 'en-US'): I18nError {
    const count = validCategories.length;
    const message = formatICUMessage(
      "Invalid plural category {category}. {count, plural, one {Valid category ({count, number, integer})} other {Valid categories ({count, number, integer})}}: {categories}",
      { 
        category, 
        categories: validCategories.join(', '),
        count
      },
      language
    );
    return new I18nError(
      I18nErrorCode.INVALID_PLURAL_CATEGORY,
      message,
      { category, validCategories, count },
    );
  }

  /**
   * Creates an error for when the count variable is missing for plural forms with ICU formatting.
   * @param key - The translation key that requires a count variable
   * @param language - Optional language code for message formatting
   * @returns An I18nError instance
   */
  static missingCountVariable(key: string, language = 'en-US'): I18nError {
    const message = formatICUMessage(
      "Plural forms used in key {key} but no 'count' variable provided",
      { key },
      language
    );
    return new I18nError(
      I18nErrorCode.MISSING_COUNT_VARIABLE,
      message,
      { key },
    );
  }

  /**
   * Creates an error for validation threshold violations with ICU number formatting.
   * Demonstrates currency, percent, and integer formatting based on threshold type.
   * @param fieldName - The field that exceeded the threshold
   * @param value - The actual value
   * @param threshold - The maximum allowed value
   * @param thresholdType - Type of threshold: 'currency', 'percent', or 'integer'
   * @param language - Optional language code for message formatting
   * @returns An I18nError instance
   */
  static validationThresholdExceeded(
    fieldName: string,
    value: number,
    threshold: number,
    thresholdType: 'currency' | 'percent' | 'integer' = 'integer',
    language = 'en-US',
  ): I18nError {
    const message = formatICUMessage(
      "Validation failed for {fieldName}: value {value, number, " + thresholdType + "} exceeds maximum threshold of {threshold, number, " + thresholdType + "}",
      { fieldName, value, threshold },
      language
    );
    return new I18nError(
      I18nErrorCode.VALIDATION_THRESHOLD_EXCEEDED,
      message,
      { fieldName, value, threshold, thresholdType },
    );
  }

  /**
   * Creates an error for operation failures at specific steps with ICU selectordinal formatting.
   * Demonstrates 1st, 2nd, 3rd, etc. formatting for step numbers.
   * @param stepNumber - The step number where the operation failed (1-based)
   * @param operationName - The name of the operation
   * @param reason - The reason for failure
   * @param language - Optional language code for message formatting
   * @returns An I18nError instance
   */
  static operationStepFailed(
    stepNumber: number,
    operationName: string,
    reason: string,
    language = 'en-US',
  ): I18nError {
    const message = formatICUMessage(
      "Operation {operationName} failed at {stepNumber, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} step: {reason}",
      { stepNumber, operationName, reason },
      language
    );
    return new I18nError(
      I18nErrorCode.OPERATION_STEP_FAILED,
      message,
      { stepNumber, operationName, reason },
    );
  }

  /**
   * Creates an error for rate limit violations with nested ICU messages.
   * Demonstrates nested plural, number formatting, and conditional messages.
   * @param requestCount - Number of requests made
   * @param limit - Maximum allowed requests
   * @param windowSeconds - Time window in seconds
   * @param retryAfterSeconds - Seconds until retry is allowed
   * @param language - Optional language code for message formatting
   * @returns An I18nError instance
   */
  static rateLimitExceeded(
    requestCount: number,
    limit: number,
    windowSeconds: number,
    retryAfterSeconds: number,
    language = 'en-US',
  ): I18nError {
    const message = formatICUMessage(
      "Rate limit exceeded: {requestCount, plural, one {# request} other {# requests}} made, exceeding limit of {limit, number, integer} {limit, plural, one {request} other {requests}} per {windowSeconds, number, integer} {windowSeconds, plural, one {second} other {seconds}}. {hasRetry, select, true {Retry after {retryAfterSeconds, number, integer} {retryAfterSeconds, plural, one {second} other {seconds}}.} other {Retry immediately.}}",
      { requestCount, limit, windowSeconds, retryAfterSeconds, hasRetry: retryAfterSeconds > 0 ? 'true' : 'false' },
      language
    );
    return new I18nError(
      I18nErrorCode.RATE_LIMIT_EXCEEDED,
      message,
      { requestCount, limit, windowSeconds, retryAfterSeconds },
    );
  }

  /**
   * Creates a nested validation error with multiple layers of context.
   * Demonstrates 4-level deep nested ICU messages with plural, select, and number formatting.
   * @param componentId - The component being validated
   * @param fieldPath - Nested field path (e.g., 'user.profile.settings.theme')
   * @param errorCount - Number of errors found
   * @param errorType - Type of validation error
   * @param severity - Error severity level
   * @param language - Optional language code for message formatting
   * @returns An I18nError instance
   */
  static nestedValidationError(
    componentId: string,
    fieldPath: string,
    errorCount: number,
    errorType: 'type' | 'range' | 'format' | 'required',
    severity: 'low' | 'medium' | 'high' | 'critical',
    language = 'en-US',
  ): I18nError {
    const message = formatICUMessage(
      "Validation error in component {componentId}: {severity, select, low {Minor issue} medium {Moderate issue} high {Serious issue} critical {Critical issue} other {Issue}} detected in nested field {fieldPath} - {errorType, select, type {Type mismatch} range {Value out of range} format {Invalid format} required {Required field missing} other {Validation error}} with {errorCount, plural, one {# occurrence} other {# occurrences}}",
      { componentId, fieldPath, errorCount, errorType, severity },
      language
    );
    return new I18nError(
      I18nErrorCode.NESTED_VALIDATION_ERROR,
      message,
      { componentId, fieldPath, errorCount, errorType, severity },
    );
  }
}
