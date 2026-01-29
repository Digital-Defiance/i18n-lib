import { CoreStringKeys, CoreStringKeyValue } from '../core-string-key';

export const americanEnglishString: Record<CoreStringKeyValue, string> = {
  // Common/General
  [CoreStringKeys.Common_Yes]: 'Yes',
  [CoreStringKeys.Common_No]: 'No',
  [CoreStringKeys.Common_Cancel]: 'Cancel',
  [CoreStringKeys.Common_OK]: 'OK',
  [CoreStringKeys.Common_Save]: 'Save',
  [CoreStringKeys.Common_Delete]: 'Delete',
  [CoreStringKeys.Common_Edit]: 'Edit',
  [CoreStringKeys.Common_Create]: 'Create',
  [CoreStringKeys.Common_Update]: 'Update',
  [CoreStringKeys.Common_Loading]: 'Loading...',
  [CoreStringKeys.Common_Error]: 'Error',
  [CoreStringKeys.Common_Success]: 'Success',
  [CoreStringKeys.Common_Warning]: 'Warning',
  [CoreStringKeys.Common_Info]: 'Information',
  [CoreStringKeys.Common_Disposed]: 'Object has been disposed',
  [CoreStringKeys.Common_Test]: 'Test',

  // Error Messages
  [CoreStringKeys.Error_InvalidInput]: 'Invalid input provided',
  [CoreStringKeys.Error_NetworkError]: 'Network connection error',
  [CoreStringKeys.Error_NotFound]: 'Resource not found',
  [CoreStringKeys.Error_AccessDenied]: 'Access denied',
  [CoreStringKeys.Error_InternalServer]: 'Internal server error',
  [CoreStringKeys.Error_ValidationFailed]: 'Validation failed',
  [CoreStringKeys.Error_RequiredField]: 'This field is required',
  [CoreStringKeys.Error_InvalidContext]: 'Invalid context',
  [CoreStringKeys.Error_InvalidContextTemplate]:
    'Invalid context: {contextKey}',
  [CoreStringKeys.Error_MissingTranslationKeyTemplate]:
    'Missing translation key: {stringKey}',
  [CoreStringKeys.Error_InvalidCurrencyCodeTemplate]:
    'Invalid currency code: {value}',

  // Registry Error Templates
  [CoreStringKeys.Error_ComponentNotFoundTemplate]:
    'Component "{componentId}" not found',
  [CoreStringKeys.Error_LanguageNotFoundTemplate]:
    'Language "{language}" not found',
  [CoreStringKeys.Error_StringKeyNotFoundTemplate]:
    'String key "{stringKey}" not found for component "{componentId}"',
  [CoreStringKeys.Error_IncompleteRegistrationTemplate]:
    'Incomplete registration for component "{componentId}": missing {missingCount} strings',
  [CoreStringKeys.Error_DuplicateComponentTemplate]:
    'Component "{componentId}" is already registered',
  [CoreStringKeys.Error_DuplicateLanguageTemplate]:
    'Language "{languageId}" is already registered',
  [CoreStringKeys.Error_ValidationFailedTemplate]:
    'Validation failed for component "{componentId}": {errorCount} errors',

  // System Messages
  [CoreStringKeys.System_Welcome]: 'Welcome',
  [CoreStringKeys.System_Goodbye]: 'Goodbye',
  [CoreStringKeys.System_PleaseWait]: 'Please wait...',
  [CoreStringKeys.System_ProcessingRequest]: 'Processing your request...',
  [CoreStringKeys.System_OperationComplete]: 'Operation completed successfully',
  [CoreStringKeys.System_NoDataAvailable]: 'No data available',

  [CoreStringKeys.Error_InstanceAlreadyExistsTemplate]:
    "Instance with key '{key}' already exists",
  [CoreStringKeys.Error_InstanceNotFoundTemplate]:
    "Instance with key '{key}' not found",
  [CoreStringKeys.Error_MissingStringCollectionTemplate]:
    'Missing string collection for language: {language}',
  [CoreStringKeys.Error_MissingTranslationTemplate]:
    "Missing translation for key '{key}' in language '{language}'",
  [CoreStringKeys.Error_DefaultLanguageNoCollectionTemplate]:
    "Default language '{language}' has no string collection",
  [CoreStringKeys.Error_MissingTranslationKeyForTypeTemplate]:
    'Missing translation key for type: {type}',
};
