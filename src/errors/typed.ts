// New plugin architecture imports
// CoreLanguageCode is deprecated - using string for flexibility
import { I18nEngine } from '../core';
import { CoreI18nComponentId } from '../core-i18n';
import { CoreStringKey } from '../core-string-key';
import { TranslationEngine } from '../translation-engine';
import { TypedError as SimpleTypedError } from './simple-typed-error';

export type { TranslationEngine };

/**
 * Type constraint to ensure reasonMap has entries for all enum values
 */
export type CompleteReasonMap<
  TEnum extends Record<string, string | number>,
  TStringKey extends string,
> = Record<TEnum[keyof TEnum], TStringKey>;

/**
 * Base typed error class with full i18n feature support.
 *
 * **Supported i18n Features** (via translation strings):
 * - ICU MessageFormat: plural, select, selectordinal
 * - Pluralization: 37 languages with CLDR rules
 * - Gender support: male, female, neutral, other
 * - Number formatting: integer, currency, percent
 * - Date/Time formatting: short, medium, long, full
 * - Nested messages: up to 4 levels deep
 *
 * **Translation String Examples:**
 * ```typescript
 * // Register translations with ICU features
 * engine.registerComponent({
 *   component: { id: 'errors', name: 'Errors', stringKeys: ['invalidCount'] },
 *   strings: {
 *     'en-US': {
 *       invalidCount: "{count, plural, one {# item is invalid} other {# items are invalid}}"
 *     }
 *   }
 * });
 *
 * // Use with typed error
 * throw BaseTypedError.createTranslated(
 *   engine, 'errors', ErrorType.InvalidCount, reasonMap,
 *   { count: 5 }, 'en-US'
 * );
 * // Result: "5 items are invalid"
 * ```
 */
export abstract class BaseTypedError<
  TEnum extends Record<string, string>,
> extends Error {
  constructor(
    public override readonly type: TEnum[keyof TEnum],
    message: string,
    public override readonly metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  /**
   * Create a simple typed error without engine dependency
   */
  static createSimple<
    TEnum extends Record<string, string>,
    TError extends BaseTypedError<TEnum>,
  >(
    this: new (
      type: TEnum[keyof TEnum],
      message: string,
      metadata?: Record<string, any>,
    ) => TError,
    type: TEnum[keyof TEnum],
    message: string,
    metadata?: Record<string, any>,
  ): TError {
    return new this(type, message, metadata);
  }

  /**
   * Create a typed error with translation support
   */
  static createTranslated<
    TEnum extends Record<string, string>,
    TStringKey extends string,
    TError extends BaseTypedError<TEnum>,
  >(
    this: new (
      type: TEnum[keyof TEnum],
      message: string,
      metadata?: Record<string, any>,
    ) => TError,
    engine: TranslationEngine,
    componentId: string,
    type: TEnum[keyof TEnum],
    reasonMap: CompleteReasonMap<TEnum, TStringKey>,
    variables?: Record<string, string | number>,
    language?: string,
    metadata?: Record<string, any>,
  ): TError {
    const key = reasonMap[type];
    let message: string;

    if (key && engine) {
      // Try to translate the error message using the engine
      message = engine.safeTranslate(componentId, key, variables, language);
    } else {
      // Fallback to a basic English message
      message = `Error: ${type}${
        metadata ? ` - ${JSON.stringify(metadata)}` : ''
      }`;
    }

    return new this(type, message, metadata);
  }
}

/**
 * AbstractTypedError with complete enum coverage and full i18n feature support.
 * @deprecated Use SimpleTypedError from './simple-typed-error' for new code
 *
 * **Supported i18n Features** (via translation strings):
 * - ICU MessageFormat: plural, select, selectordinal
 * - Pluralization: 37 languages with CLDR rules
 * - Gender support: male, female, neutral, other
 * - Number formatting: integer, currency, percent
 * - Nested messages: up to 4 levels deep
 *
 * **Translation String Examples:**
 * ```typescript
 * // Define error types
 * enum ValidationError {
 *   InvalidCount = 'invalidCount',
 *   ThresholdExceeded = 'thresholdExceeded'
 * }
 *
 * // Register translations with ICU
 * engine.registerComponent({
 *   component: { id: 'validation', stringKeys: ['invalidCount', 'thresholdExceeded'] },
 *   strings: {
 *     'en-US': {
 *       invalidCount: "{count, plural, one {# error found} other {# errors found}}",
 *       thresholdExceeded: "Value {value, number, integer} exceeds limit"
 *     }
 *   }
 * });
 *
 * // Use typed error
 * throw new MyTypedError('validation', ValidationError.InvalidCount, reasonMap, 'en-US', { count: 3 });
 * // Result: "3 errors found"
 * ```
 */
export abstract class AbstractTypedError<
  TEnum extends Record<string, string>,
  TStringKey extends string,
> extends Error {
  constructor(
    public override readonly componentId: string,
    public override readonly type: TEnum[keyof TEnum],
    public override readonly reasonMap: CompleteReasonMap<TEnum, TStringKey>,
    public readonly language?: string,
    public readonly otherVars?: Record<string, string | number>,
  ) {
    const key = reasonMap[type];
    const engine = I18nEngine.getInstance('default');
    if (!key)
      throw new Error(
        engine.safeTranslate(
          CoreI18nComponentId,
          CoreStringKey.Error_MissingTranslationKeyTemplate,
          { type },
          language,
        ),
      );

    // Use translate instead of safeTranslate to get actual translations
    let message: string;
    try {
      message = engine.translate(componentId, key, otherVars, language);
    } catch (error) {
      // Fallback to safeTranslate if translate fails
      message = engine.safeTranslate(componentId, key, otherVars, language);
    }

    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Component-based TypedError that works with the component registration system
 * @deprecated Use TypedError instead - PluginTypedError is an alias for backward compatibility
 */
export abstract class PluginTypedError<
  TEnum extends Record<string, string>,
  TStringKey extends string,
> extends Error {
  constructor(
    public override readonly componentId: string,
    public override readonly type: TEnum[keyof TEnum],
    public override readonly reasonMap: CompleteReasonMap<TEnum, TStringKey>,
    public readonly language?: string,
    public readonly otherVars?: Record<string, string | number>,
  ) {
    const key = reasonMap[type];
    const engine = I18nEngine.getInstance('default');
    // If key is not found in the reason map, use core error message
    if (!key) {
      const errorMsg = engine.safeTranslate(
        CoreI18nComponentId,
        CoreStringKey.Error_StringKeyNotFoundTemplate,
        {
          stringKey: String(type),
          componentId: componentId,
        },
        language,
      );
      throw new Error(errorMsg);
    }

    // Translate the error message using the component and string key
    const translatedMessage = engine.safeTranslate(
      componentId,
      key,
      otherVars,
      language,
    );
    super(translatedMessage);
    this.name = this.constructor.name;
  }
}

/**
 * Component-based TypedError with full i18n feature support.
 *
 * **Supported i18n Features** (via translation strings):
 * - ICU MessageFormat: plural, select, selectordinal
 * - Pluralization: 37 languages with CLDR rules
 * - Gender support: male, female, neutral, other
 * - Number formatting: integer, currency, percent
 * - SelectOrdinal: 1st, 2nd, 3rd formatting
 * - Nested messages: complex multi-level patterns
 *
 * **Translation String Examples:**
 * ```typescript
 * // Define component errors
 * enum UserError {
 *   AccountLocked = 'accountLocked',
 *   TooManyAttempts = 'tooManyAttempts'
 * }
 *
 * // Register with ICU features
 * engine.registerComponent({
 *   component: { id: 'user', stringKeys: ['accountLocked', 'tooManyAttempts'] },
 *   strings: {
 *     'en-US': {
 *       accountLocked: "{gender, select, male {His account} female {Her account} other {Their account}} is locked",
 *       tooManyAttempts: "{count, plural, one {# attempt} other {# attempts}} failed. Try again in {minutes, number, integer} minutes."
 *     }
 *   }
 * });
 *
 * // Use component error
 * throw new MyComponentError('user', UserError.TooManyAttempts, reasonMap, 'en-US', { count: 5, minutes: 10 });
 * // Result: "5 attempts failed. Try again in 10 minutes."
 * ```
 */
export abstract class ComponentTypedError<
  TEnum extends Record<string, string>,
  TStringKey extends string,
> extends Error {
  constructor(
    public override readonly componentId: string,
    public override readonly type: TEnum[keyof TEnum],
    public override readonly reasonMap: CompleteReasonMap<TEnum, TStringKey>,
    public readonly language?: string,
    public readonly otherVars?: Record<string, string | number>,
  ) {
    const key = reasonMap[type];
    const engine = I18nEngine.getInstance('default');
    // If key is not found in the reason map, use core error message
    if (!key) {
      const errorMsg = engine.safeTranslate(
        CoreI18nComponentId,
        CoreStringKey.Error_StringKeyNotFoundTemplate,
        {
          stringKey: String(type),
          componentId: componentId,
        },
        language,
      );
      throw new Error(errorMsg);
    }

    // Translate the error message using the component and string key
    const translatedMessage = engine.safeTranslate(
      componentId,
      key,
      otherVars,
      language,
    );
    super(translatedMessage);
    this.name = this.constructor.name;
  }
}

/**
 * Core system TypedError using core component strings with full i18n support.
 *
 * **Supported i18n Features** (via CoreStringKey translations):
 * - ICU MessageFormat: plural, select, selectordinal
 * - Pluralization: 37 languages with CLDR rules
 * - Gender support: male, female, neutral, other
 * - Number formatting: integer, currency, percent
 * - Nested messages: complex patterns
 *
 * **Usage Example:**
 * ```typescript
 * // Define core error types
 * enum CoreErrorType {
 *   InvalidOperation = 'invalidOperation',
 *   ResourceNotFound = 'resourceNotFound'
 * }
 *
 * // Core strings already registered with ICU features
 * const reasonMap: CompleteReasonMap<typeof CoreErrorType, CoreStringKey> = {
 *   [CoreErrorType.InvalidOperation]: CoreStringKey.Error_InvalidOperation,
 *   [CoreErrorType.ResourceNotFound]: CoreStringKey.Error_ResourceNotFound
 * };
 *
 * // Use core typed error
 * throw new MyCoreError(CoreErrorType.ResourceNotFound, reasonMap, 'en-US', { resource: 'user', id: 123 });
 * ```
 */
export abstract class CoreTypedError<
  TEnum extends Record<string, string>,
> extends Error {
  constructor(
    public override readonly type: TEnum[keyof TEnum],
    public override readonly reasonMap: CompleteReasonMap<TEnum, CoreStringKey>,
    public readonly language?: string,
    public readonly otherVars?: Record<string, string | number>,
  ) {
    const key = reasonMap[type];
    const engine = I18nEngine.getInstance('default');

    // If key is not found in the reason map, use a fallback error
    if (!key) {
      const errorMsg = engine.safeTranslate(
        CoreI18nComponentId,
        CoreStringKey.Error_StringKeyNotFoundTemplate,
        {
          stringKey: String(type),
          componentId: CoreI18nComponentId,
        },
        language,
      );
      throw new Error(errorMsg);
    }

    // Translate the error message using the core component
    const translatedMessage = engine.safeTranslate(
      CoreI18nComponentId,
      key,
      otherVars,
      language,
    );
    super(translatedMessage);
    this.name = this.constructor.name;
  }
}

/**
 * Helper function to create a component-based TypedError with automatic engine detection
 * @deprecated Use createComponentTypedError instead
 */
export function createPluginTypedError<
  TEnum extends Record<string, string>,
  TStringKey extends string,
>(
  componentId: string,
  type: TEnum[keyof TEnum],
  reasonMap: CompleteReasonMap<TEnum, TStringKey>,
  otherVars?: Record<string, string | number>,
  language?: string,
  instanceKey?: string,
): Error {
  return createComponentTypedError(
    componentId,
    type,
    reasonMap,
    otherVars,
    language,
    instanceKey,
  );
}

/**
 * Helper function to create a component-based TypedError with automatic engine detection
 */
export function createComponentTypedError<
  TEnum extends Record<string, string>,
  TStringKey extends string,
>(
  componentId: string,
  type: TEnum[keyof TEnum],
  reasonMap: CompleteReasonMap<TEnum, TStringKey>,
  otherVars?: Record<string, string | number>,
  language?: string,
  instanceKey?: string,
): SimpleTypedError {
  // Get the engine to ensure it exists, but the error class will get it again
  const engine = I18nEngine.getInstance(instanceKey || 'default');
  const key = reasonMap[type];

  if (!key) {
    throw new Error(`Missing key for type ${type} in reason map`);
  }

  const message = engine.safeTranslate(componentId, key, otherVars, language);
  const error = new SimpleTypedError(message, {
    type,
    componentId,
    reasonMap,
  });
  error.name = 'PluginTypedError';

  return error;
}

/**
 * Helper function to create a core system TypedError with automatic engine detection
 */
export function createCoreTypedError<TEnum extends Record<string, string>>(
  type: TEnum[keyof TEnum],
  reasonMap: CompleteReasonMap<TEnum, CoreStringKey>,
  otherVars?: Record<string, string | number>,
  language?: string,
  instanceKey?: string,
): SimpleTypedError {
  const engine = I18nEngine.getInstance(instanceKey || 'default');
  const key = reasonMap[type];

  if (!key) {
    throw new Error(`Missing key for type ${type} in reason map`);
  }

  const message = engine.safeTranslate(
    CoreI18nComponentId,
    key,
    otherVars,
    language,
  );
  const error = new SimpleTypedError(message, {
    type,
    componentId: CoreI18nComponentId,
    reasonMap,
  });
  error.name = 'CoreTypedError';

  return error;
}

/**
 * Create a simple error with translation support (generalized pattern from RegistryError)
 */
export function createTranslatedError<
  TEnum extends Record<string, string>,
  TStringKey extends string,
>(
  engine: TranslationEngine,
  componentId: string,
  type: TEnum[keyof TEnum],
  reasonMap: Record<TEnum[keyof TEnum], TStringKey>,
  variables?: Record<string, string | number>,
  language?: string,
  metadata?: Record<string, any>,
  errorName?: string,
): SimpleTypedError {
  const key = reasonMap[type];
  let message: string;

  if (key && engine) {
    try {
      // Try to translate the error message using the engine
      message = engine.safeTranslate(componentId, key, variables, language);
    } catch (translationError) {
      // Fallback if translation fails
      message = `Error: ${type}${
        metadata ? ` - ${JSON.stringify(metadata)}` : ''
      }`;
    }
  } else {
    // Fallback to a basic English message
    message = `Error: ${type}${
      metadata ? ` - ${JSON.stringify(metadata)}` : ''
    }`;
  }

  const error = new SimpleTypedError(message, {
    type,
    componentId,
    metadata,
  });
  error.name = errorName || 'TranslatedError';

  return error;
}

/**
 * Example usage of the new plugin-based TypedError system
 */

// Example 1: Core system error using CoreStringKey
/*
enum DatabaseErrorType {
  ConnectionFailed = 'connectionFailed',
  QueryTimeout = 'queryTimeout',
  AccessDenied = 'accessDenied'
}

const coreErrorReasonMap: CompleteReasonMap<typeof DatabaseErrorType, CoreStringKey> = {
  [DatabaseErrorType.ConnectionFailed]: CoreStringKey.Error_NetworkError,
  [DatabaseErrorType.QueryTimeout]: CoreStringKey.Error_InternalServer,
  [DatabaseErrorType.AccessDenied]: CoreStringKey.Error_AccessDenied
};

class DatabaseError extends CoreTypedError<typeof DatabaseErrorType> {
  constructor(
    type: DatabaseErrorType,
    otherVars?: Record<string, string | number>,
    language?: string
  ) {
    super(type, coreErrorReasonMap, language, otherVars);
  }
}

// Usage:
// throw new DatabaseError(DatabaseErrorType.ConnectionFailed);
*/

// Example 2: Custom component error with custom strings
/*
enum UserErrorType {
  UserNotFound = 'userNotFound',
  InvalidCredentials = 'invalidCredentials',
  AccountLocked = 'accountLocked'
}

enum UserErrorStringKey {
  UserNotFoundMessage = 'userNotFoundMessage',
  InvalidCredentialsMessage = 'invalidCredentialsMessage', 
  AccountLockedMessage = 'accountLockedMessage'
}

const userErrorReasonMap: CompleteReasonMap<typeof UserErrorType, UserErrorStringKey> = {
  [UserErrorType.UserNotFound]: UserErrorStringKey.UserNotFoundMessage,
  [UserErrorType.InvalidCredentials]: UserErrorStringKey.InvalidCredentialsMessage,
  [UserErrorType.AccountLocked]: UserErrorStringKey.AccountLockedMessage
};

class UserError extends PluginTypedError<typeof UserErrorType, UserErrorStringKey> {
  constructor(
    type: UserErrorType,
    otherVars?: Record<string, string | number>,
    language?: string
  ) {
    super('user-system', type, userErrorReasonMap, language, otherVars);
  }
}

// Usage:
// throw new UserError(UserErrorType.UserNotFound, { username: 'john_doe' });
*/

// Example 3: Using helper functions for simpler error creation
/*
// Define your error types and mappings
enum ApiErrorType {
  Timeout = 'timeout',
  NotFound = 'notFound'
}

const apiErrorMap: CompleteReasonMap<typeof ApiErrorType, CoreStringKey> = {
  [ApiErrorType.Timeout]: CoreStringKey.Error_NetworkError,
  [ApiErrorType.NotFound]: CoreStringKey.Error_NotFound
};

// Create errors using helper functions
function throwApiError(type: ApiErrorType, vars?: Record<string, string | number>) {
  throw createCoreTypedError(type, apiErrorMap, vars);
}

// Usage:
// throwApiError(ApiErrorType.NotFound, { resource: 'user' });
*/

// Export the type for external use (already exported above)
