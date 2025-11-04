// New plugin architecture imports
// CoreLanguageCode is deprecated - using string for flexibility
import { CoreStringKey } from '../core-string-key';
import { TranslationEngine } from '../translation-engine';
import { CoreI18nComponentId } from '../core-i18n';
import { PluginI18nEngine } from '../plugin-i18n-engine';

export type { TranslationEngine };

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
 * Legacy TypedError that ensures complete enum coverage (for backward compatibility)
 */
export abstract class TypedError<
  TEnum extends Record<string, string>,
  TStringKey extends string,
> extends Error {
  constructor(
    public readonly componentId: string,
    public readonly type: TEnum[keyof TEnum],
    public readonly reasonMap: CompleteReasonMap<TEnum, TStringKey>,
    public readonly language?: string,
    public readonly otherVars?: Record<string, string | number>,
  ) {
    const key = reasonMap[type];
    const engine = PluginI18nEngine.getInstance('default');
    if (!key)
      throw new Error(
        engine.safeTranslate(
          CoreI18nComponentId,
          CoreStringKey.Error_MissingTranslationKeyTemplate as any,
          { type },
          language,
        ),
      );
    super(engine.safeTranslate(componentId, key, otherVars, language));
    this.name = this.constructor.name;
  }
}

/**
 * Plugin-based TypedError that works with the new component registration system
 */
export abstract class PluginTypedError<
  TEnum extends Record<string, string>,
  TStringKey extends string,
> extends Error {
  constructor(
    public readonly componentId: string,
    public readonly type: TEnum[keyof TEnum],
    public readonly reasonMap: CompleteReasonMap<TEnum, TStringKey>,
    public readonly language?: string,
    public readonly otherVars?: Record<string, string | number>,
  ) {
    const key = reasonMap[type];
    const engine = PluginI18nEngine.getInstance('default');
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
 * Core system TypedError using the core component strings
 */
export abstract class CoreTypedError<
  TEnum extends Record<string, string>,
> extends Error {
  constructor(
    public readonly type: TEnum[keyof TEnum],
    public readonly reasonMap: CompleteReasonMap<TEnum, CoreStringKey>,
    public readonly language?: string,
    public readonly otherVars?: Record<string, string | number>,
  ) {
    const key = reasonMap[type];
    const engine = PluginI18nEngine.getInstance('default');

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
 * Helper function to create a plugin-based TypedError with automatic engine detection
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
  const engine = PluginI18nEngine.getInstance(instanceKey || 'default');

  return new (class extends PluginTypedError<TEnum, TStringKey> {
    constructor() {
      super(componentId, type, reasonMap, language, otherVars);
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
  language?: string,
  instanceKey?: string,
): Error {
  const engine = PluginI18nEngine.getInstance(instanceKey || 'default');

  return new (class extends CoreTypedError<TEnum> {
    constructor() {
      super(type, reasonMap, language, otherVars);
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
// const engine = PluginPluginI18nEngine.getInstance<string>();
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

class UserError extends PluginTypedError<typeof UserErrorType, UserErrorStringKey, string> {
  constructor(
    engine: PluginI18nEngine<string>,
    type: UserErrorType,
    otherVars?: Record<string, string | number>,
    language?: string
  ) {
    super(engine, 'user-system', type, userErrorReasonMap, language, otherVars);
  }
}

// Usage:
// const engine = PluginPluginI18nEngine.getInstance<string>();
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
