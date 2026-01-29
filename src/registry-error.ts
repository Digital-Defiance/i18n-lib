/* eslint-disable @typescript-eslint/no-explicit-any */
import { CoreI18nComponentId } from './core-component-id';
import { CoreStringKeys } from './core-string-key';
import { RegistryErrorType } from './registry-error-type';

/**
 * Minimal translation engine interface to avoid circular dependencies
 */
export interface RegistryTranslationEngine {
  safeTranslate(
    componentId: string,
    key: string,
    variables?: Record<string, string | number>,
    language?: string,
  ): string;
}

/**
 * Reason map for registry errors
 */
const REGISTRY_ERROR_REASON_MAP = {
  [RegistryErrorType.ComponentNotFound]:
    CoreStringKeys.Error_ComponentNotFoundTemplate,
  [RegistryErrorType.DuplicateComponent]:
    CoreStringKeys.Error_DuplicateComponentTemplate,
  [RegistryErrorType.DuplicateLanguage]:
    CoreStringKeys.Error_DuplicateLanguageTemplate,
  [RegistryErrorType.IncompleteRegistration]:
    CoreStringKeys.Error_IncompleteRegistrationTemplate,
  [RegistryErrorType.LanguageNotFound]:
    CoreStringKeys.Error_LanguageNotFoundTemplate,
  [RegistryErrorType.StringKeyNotFound]:
    CoreStringKeys.Error_StringKeyNotFoundTemplate,
  [RegistryErrorType.ValidationFailed]:
    CoreStringKeys.Error_ValidationFailedTemplate,
} as const;

/**
 * Registry error class that can work with plugin engines
 */
export class RegistryError extends Error {
  constructor(
    public override readonly type: RegistryErrorType,
    message: string,
    public override readonly metadata?: Record<string, any>,
  ) {
    super(message);
    this.name = 'RegistryError';
  }

  /**
   * Create a registry error with translation support
   * Uses lazy initialization to avoid circular dependencies
   */
  static createWithEngine(
    engine: RegistryTranslationEngine,
    type: RegistryErrorType,
    variables?: Record<string, string | number>,
    language?: string,
    metadata?: Record<string, any>,
  ): RegistryError {
    const key = REGISTRY_ERROR_REASON_MAP[type];
    let message: string;

    if (key && engine) {
      try {
        // Try to translate the error message using the engine
        message = engine.safeTranslate(
          CoreI18nComponentId,
          key,
          variables,
          language,
        );
      } catch (_translationError) {
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

    return new RegistryError(type, message, metadata);
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
