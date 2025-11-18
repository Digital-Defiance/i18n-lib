import { CoreStringKey } from '../core-string-key';

export const BritishEnglishStrings: Record<CoreStringKey, string> = {
      // Common/General (mostly same as US English)
      [CoreStringKey.Common_Yes]: 'Yes',
      [CoreStringKey.Common_No]: 'No',
      [CoreStringKey.Common_Cancel]: 'Cancel',
      [CoreStringKey.Common_OK]: 'OK',
      [CoreStringKey.Common_Save]: 'Save',
      [CoreStringKey.Common_Delete]: 'Delete',
      [CoreStringKey.Common_Edit]: 'Edit',
      [CoreStringKey.Common_Create]: 'Create',
      [CoreStringKey.Common_Update]: 'Update',
      [CoreStringKey.Common_Loading]: 'Loading...',
      [CoreStringKey.Common_Error]: 'Error',
      [CoreStringKey.Common_Success]: 'Success',
      [CoreStringKey.Common_Warning]: 'Warning',
      [CoreStringKey.Common_Info]: 'Information',
      [CoreStringKey.Common_Disposed]: 'Object has been disposed',
      [CoreStringKey.Common_Test]: 'Test',

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: 'Invalid input provided',
      [CoreStringKey.Error_NetworkError]: 'Network connection error',
      [CoreStringKey.Error_NotFound]: 'Resource not found',
      [CoreStringKey.Error_AccessDenied]: 'Access denied',
      [CoreStringKey.Error_InternalServer]: 'Internal server error',
      [CoreStringKey.Error_ValidationFailed]: 'Validation failed',
      [CoreStringKey.Error_RequiredField]: 'This field is required',
      [CoreStringKey.Error_InvalidContext]: 'Invalid context',
      [CoreStringKey.Error_InvalidContextTemplate]:
        'Invalid context: {contextKey}',
      [CoreStringKey.Error_MissingTranslationKeyTemplate]:
        'Missing translation key: {stringKey}',
      [CoreStringKey.Error_InvalidCurrencyCodeTemplate]: 'Invalid currency code: {value}',

      // Registry Error Templates
      [CoreStringKey.Error_ComponentNotFoundTemplate]:
        'Component "{componentId}" not found',
      [CoreStringKey.Error_LanguageNotFoundTemplate]:
        'Language "{language}" not found',
      [CoreStringKey.Error_StringKeyNotFoundTemplate]:
        'String key "{stringKey}" not found for component "{componentId}"',
      [CoreStringKey.Error_IncompleteRegistrationTemplate]:
        'Incomplete registration for component "{componentId}": missing {missingCount} strings',
      [CoreStringKey.Error_DuplicateComponentTemplate]:
        'Component "{componentId}" is already registered',
      [CoreStringKey.Error_DuplicateLanguageTemplate]:
        'Language "{languageId}" is already registered',
      [CoreStringKey.Error_ValidationFailedTemplate]:
        'Validation failed for component "{componentId}": {errorCount} errors',

      // System Messages
      [CoreStringKey.System_Welcome]: 'Welcome',
      [CoreStringKey.System_Goodbye]: 'Goodbye',
      [CoreStringKey.System_PleaseWait]: 'Please wait...',
      [CoreStringKey.System_ProcessingRequest]: 'Processing your request...',
      [CoreStringKey.System_OperationComplete]:
        'Operation completed successfully',
      [CoreStringKey.System_NoDataAvailable]: 'No data available',

      [CoreStringKey.Error_InstanceAlreadyExistsTemplate]:
        "Instance with key '{key}' already exists",
      [CoreStringKey.Error_InstanceNotFoundTemplate]:
        "Instance with key '{key}' not found",
      [CoreStringKey.Error_MissingStringCollectionTemplate]:
        'Missing string collection for language: {language}',
      [CoreStringKey.Error_MissingTranslationTemplate]:
        "Missing translation for key '{key}' in language '{language}'",
      [CoreStringKey.Error_DefaultLanguageNoCollectionTemplate]:
        "Default language '{language}' has no string collection",
      [CoreStringKey.Error_MissingTranslationKeyForTypeTemplate]:
        'Missing translation key for type: {type}',
    };