/**
 * Error types for registry operations
 */
export enum RegistryErrorType {
  /** Error when a requested component is not found in the registry */
  ComponentNotFound = 'COMPONENT_NOT_FOUND',
  /** Error when a requested language is not found in the registry */
  LanguageNotFound = 'LANGUAGE_NOT_FOUND',
  /** Error when a requested string key is not found in a component */
  StringKeyNotFound = 'STRING_KEY_NOT_FOUND',
  /** Error when component registration is incomplete (missing strings) */
  IncompleteRegistration = 'INCOMPLETE_REGISTRATION',
  /** Error when attempting to register a component that already exists */
  DuplicateComponent = 'DUPLICATE_COMPONENT',
  /** Error when attempting to register a language that already exists */
  DuplicateLanguage = 'DUPLICATE_LANGUAGE',
  /** Error when component validation fails */
  ValidationFailed = 'VALIDATION_FAILED',
}