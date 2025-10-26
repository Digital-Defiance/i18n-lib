// Legacy imports (for backward compatibility)
import { DefaultStringKey, Language, StringKey } from './default-config';
import { I18nEngine } from './i18n-engine';

// New plugin architecture imports
import { CoreLanguageCode } from './core-i18n';
import { CoreStringKey } from './core-string-key';
import { PluginI18nEngine } from './plugin-i18n-engine';
import { TranslationEngine } from './translation-engine';

export { TranslationEngine };

/**
 * Type constraint to ensure reasonMap has entries for all enum values
 */
export type CompleteReasonMap<
  TEnum extends Record<string, string | number>,
  TStringKey extends string,
> = Record<TEnum[keyof TEnum], TStringKey>;

/**
 * Base typed error class with common patterns
 */
export abstract class BaseTypedError<
  TEnum extends Record<string, string>,
  TStringKey extends string,
> extends Error {
  constructor(
    public readonly type: TEnum[keyof TEnum],
    message: string,
    public readonly metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  /**
   * Create a simple typed error without engine dependency
   */
  static createSimple<
    TEnum extends Record<string, string>,
    TStringKey extends string,
    TError extends BaseTypedError<TEnum, TStringKey>,
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
    TError extends BaseTypedError<TEnum, TStringKey>,
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
      message = engine.safeTranslate(key, variables, language);
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
 * Legacy TypedError that ensures complete enum coverage (for backward compatibility)
 */
export abstract class TypedError<
  TEnum extends Record<string, string>,
  TStringKey extends string = StringKey,
> extends Error {
  constructor(
    engine: I18nEngine<TStringKey, Language, Record<string, any>, string>,
    public readonly type: TEnum[keyof TEnum],
    public readonly reasonMap: CompleteReasonMap<TEnum, TStringKey>,
    public readonly language?: Language,
    public readonly otherVars?: Record<string, string | number>,
  ) {
    const key = reasonMap[type];
    if (!key)
      throw new Error(
        engine.translate(
          DefaultStringKey.Error_MissingTranslationKeyTemplate as any,
          { type },
          language,
        ),
      );
    super(engine.translate(key, otherVars, language));
    this.name = this.constructor.name;
  }
}

/**
 * Plugin-based TypedError that works with the new component registration system
 */
export abstract class PluginTypedError<
  TEnum extends Record<string, string>,
  TStringKey extends string,
  TLanguages extends string = string,
> extends Error {
  constructor(
    engine: PluginI18nEngine<TLanguages>,
    public readonly componentId: string,
    public readonly type: TEnum[keyof TEnum],
    public readonly reasonMap: CompleteReasonMap<TEnum, TStringKey>,
    public readonly language?: TLanguages,
    public readonly otherVars?: Record<string, string | number>,
  ) {
    const key = reasonMap[type];

    // If key is not found in the reason map, use core error message
    if (!key) {
      const errorMsg = engine.safeTranslate(
        'core',
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
 * Core system TypedError using the core component strings
 */
export abstract class CoreTypedError<
  TEnum extends Record<string, string>,
> extends Error {
  constructor(
    engine: PluginI18nEngine<CoreLanguageCode>,
    public readonly type: TEnum[keyof TEnum],
    public readonly reasonMap: CompleteReasonMap<TEnum, CoreStringKey>,
    public readonly language?: CoreLanguageCode,
    public readonly otherVars?: Record<string, string | number>,
  ) {
    const key = reasonMap[type];

    // If key is not found in the reason map, use a fallback error
    if (!key) {
      const errorMsg = engine.safeTranslate(
        'core',
        CoreStringKey.Error_StringKeyNotFoundTemplate,
        {
          stringKey: String(type),
          componentId: 'core',
        },
        language,
      );
      throw new Error(errorMsg);
    }

    // Translate the error message using the core component
    const translatedMessage = engine.safeTranslate(
      'core',
      key,
      otherVars,
      language,
    );
    super(translatedMessage);
    this.name = this.constructor.name;
  }
}

/**
 * Helper function to create a plugin-based TypedError with automatic engine detection
 */
export function createPluginTypedError<
  TEnum extends Record<string, string>,
  TStringKey extends string,
  TLanguages extends string = string,
>(
  componentId: string,
  type: TEnum[keyof TEnum],
  reasonMap: CompleteReasonMap<TEnum, TStringKey>,
  otherVars?: Record<string, string | number>,
  language?: TLanguages,
  instanceKey?: string,
): Error {
  const engine = PluginI18nEngine.getInstance<TLanguages>(instanceKey);

  return new (class extends PluginTypedError<TEnum, TStringKey, TLanguages> {
    constructor() {
      super(engine, componentId, type, reasonMap, language, otherVars);
    }
  })();
}

/**
 * Helper function to create a core system TypedError with automatic engine detection
 */
export function createCoreTypedError<TEnum extends Record<string, string>>(
  type: TEnum[keyof TEnum],
  reasonMap: CompleteReasonMap<TEnum, CoreStringKey>,
  otherVars?: Record<string, string | number>,
  language?: CoreLanguageCode,
  instanceKey?: string,
): Error {
  const engine = PluginI18nEngine.getInstance<CoreLanguageCode>(instanceKey);

  return new (class extends CoreTypedError<TEnum> {
    constructor() {
      super(engine, type, reasonMap, language, otherVars);
    }
  })();
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
): Error {
  const key = reasonMap[type];
  let message: string;

  if (key && engine) {
    try {
      // Try to translate the error message using the engine
      message = engine.safeTranslate(key, variables, language);
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

  const error = new Error(message);
  error.name = errorName || 'TranslatedError';
  (error as any).type = type;
  (error as any).metadata = metadata;

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
    engine: PluginI18nEngine<CoreLanguageCode>,
    type: DatabaseErrorType,
    otherVars?: Record<string, string | number>,
    language?: CoreLanguage
  ) {
    super(engine, type, coreErrorReasonMap, language, otherVars);
  }
}

// Usage:
// const engine = PluginI18nEngine.getInstance<CoreLanguageCode>();
// throw new DatabaseError(engine, DatabaseErrorType.ConnectionFailed);
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

class UserError extends PluginTypedError<typeof UserErrorType, UserErrorStringKey, CoreLanguageCode> {
  constructor(
    engine: PluginI18nEngine<CoreLanguageCode>,
    type: UserErrorType,
    otherVars?: Record<string, string | number>,
    language?: CoreLanguageCode
  ) {
    super(engine, 'user-system', type, userErrorReasonMap, language, otherVars);
  }
}

// Usage:
// const engine = PluginI18nEngine.getInstance<CoreLanguageCode>();
// throw new UserError(engine, UserErrorType.UserNotFound, { username: 'john_doe' });
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
