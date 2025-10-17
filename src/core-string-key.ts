/**
 * Core system string keys
 */
export enum CoreStringKey {
  // Common/General
  Common_Yes = 'common_yes',
  Common_No = 'common_no',
  Common_Cancel = 'common_cancel',
  Common_OK = 'common_ok',
  Common_Save = 'common_save',
  Common_Delete = 'common_delete',
  Common_Edit = 'common_edit',
  Common_Create = 'common_create',
  Common_Update = 'common_update',
  Common_Loading = 'common_loading',
  Common_Error = 'common_error',
  Common_Success = 'common_success',
  Common_Warning = 'common_warning',
  Common_Info = 'common_info',

  // Error Messages
  Error_InvalidInput = 'error_invalidInput',
  Error_NetworkError = 'error_networkError',
  Error_NotFound = 'error_notFound',
  Error_AccessDenied = 'error_accessDenied',
  Error_InternalServer = 'error_internalServer',
  Error_ValidationFailed = 'error_validationFailed',
  Error_RequiredField = 'error_requiredField',
  Error_InvalidContextTemplate = 'error_invalidContextTemplate',

  // Registry Errors (templates support variables)
  Error_ComponentNotFoundTemplate = 'error_componentNotFoundTemplate',
  Error_LanguageNotFoundTemplate = 'error_languageNotFoundTemplate',
  Error_StringKeyNotFoundTemplate = 'error_stringKeyNotFoundTemplate',
  Error_IncompleteRegistrationTemplate = 'error_incompleteRegistrationTemplate',
  Error_DuplicateComponentTemplate = 'error_duplicateComponentTemplate',
  Error_DuplicateLanguageTemplate = 'error_duplicateLanguageTemplate',
  Error_ValidationFailedTemplate = 'error_validationFailedTemplate',
  Error_MissingTranslationKeyTemplate = 'error_missingTranslationKeyTemplate',

  // System Messages
  System_Welcome = 'system_welcome',
  System_Goodbye = 'system_goodbye',
  System_PleaseWait = 'system_pleaseWait',
  System_ProcessingRequest = 'system_processingRequest',
  System_OperationComplete = 'system_operationComplete',
  System_NoDataAvailable = 'system_noDataAvailable',
}
