/**
 * Error types for registry operations
 */
export enum RegistryErrorType {
  ComponentNotFound = 'COMPONENT_NOT_FOUND',
  LanguageNotFound = 'LANGUAGE_NOT_FOUND',
  StringKeyNotFound = 'STRING_KEY_NOT_FOUND',
  IncompleteRegistration = 'INCOMPLETE_REGISTRATION',
  DuplicateComponent = 'DUPLICATE_COMPONENT',
  DuplicateLanguage = 'DUPLICATE_LANGUAGE',
  ValidationFailed = 'VALIDATION_FAILED',
}
