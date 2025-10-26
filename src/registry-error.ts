// CoreLanguageCode is deprecated - using string
import { CoreStringKey } from './core-string-key';
import { RegistryErrorType } from './registry-error-type';
import { TranslationEngine, createTranslatedError } from './typed-error';

/**
 * Reason map for registry errors
 */
const REGISTRY_ERROR_REASON_MAP = {
  [RegistryErrorType.ComponentNotFound]:
    CoreStringKey.Error_ComponentNotFoundTemplate,
  [RegistryErrorType.DuplicateComponent]:
    CoreStringKey.Error_DuplicateComponentTemplate,
  [RegistryErrorType.DuplicateLanguage]:
    CoreStringKey.Error_DuplicateLanguageTemplate,
  [RegistryErrorType.IncompleteRegistration]:
    CoreStringKey.Error_IncompleteRegistrationTemplate,
  [RegistryErrorType.LanguageNotFound]:
    CoreStringKey.Error_LanguageNotFoundTemplate,
  [RegistryErrorType.StringKeyNotFound]:
    CoreStringKey.Error_StringKeyNotFoundTemplate,
  [RegistryErrorType.ValidationFailed]:
    CoreStringKey.Error_ValidationFailedTemplate,
} as const;

/**
 * Registry error class that can work with plugin engines
 */
export class RegistryError extends Error {
  constructor(
    public readonly type: RegistryErrorType,
    message: string,
    public readonly metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = 'RegistryError';
  }

  /**
   * Create a registry error with translation support
   */
  static createWithEngine(
    engine: TranslationEngine,
    type: RegistryErrorType,
    variables?: Record<string, string | number>,
    language?: string,
    metadata?: Record<string, any>,
  ): RegistryError {
    const error = createTranslatedError(
      engine,
      'core',
      type,
      REGISTRY_ERROR_REASON_MAP,
      variables,
      language,
      metadata,
      'RegistryError',
    );

    // Convert to RegistryError instance
    return new RegistryError(type, error.message, metadata);
  }

  /**
   * Create a simple RegistryError without engine dependency
   */
  static createSimple(
    type: RegistryErrorType,
    message: string,
    metadata?: Record<string, any>,
  ): RegistryError {
    return new RegistryError(type, message, metadata);
  }
}
