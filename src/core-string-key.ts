/**
 * Core system string keys
 *
 * This module provides the branded enum (CoreStringKeys) for runtime-identifiable
 * i18n string keys used by the core library.
 *
 * @module core-string-key
 */

import {
  createI18nStringKeys,
  BrandedStringKeyValue,
} from './branded-string-key';

/**
 * Core system string keys (Branded enum)
 *
 * This branded enum provides runtime identification, allowing you to:
 * - Detect which component a string key belongs to
 * - Find collisions between components
 * - Route translations to the correct handler
 * - Use exhaustive switch checks
 *
 * @example
 * ```typescript
 * import { CoreStringKeys, findStringKeySources, exhaustiveStringKey } from '@digitaldefiance/i18n-lib';
 *
 * // Use keys directly
 * const key = CoreStringKeys.Common_Yes; // 'common_yes'
 *
 * // Find which component owns a key
 * findStringKeySources('common_yes'); // ['i18n:core']
 *
 * // Type-safe exhaustive handling
 * function handleCoreKey(key: CoreStringKeyValue): string {
 *   switch (key) {
 *     case CoreStringKeys.Common_Yes: return 'Yes';
 *     case CoreStringKeys.Common_No: return 'No';
 *     // ... handle all keys
 *     default: return exhaustiveStringKey(CoreStringKeys, key);
 *   }
 * }
 * ```
 */
export const CoreStringKeys = createI18nStringKeys('core', {
  // Common/General
  Common_Yes: 'common_yes',
  Common_No: 'common_no',
  Common_Cancel: 'common_cancel',
  Common_OK: 'common_ok',
  Common_Save: 'common_save',
  Common_Delete: 'common_delete',
  Common_Edit: 'common_edit',
  Common_Create: 'common_create',
  Common_Update: 'common_update',
  Common_Loading: 'common_loading',
  Common_Error: 'common_error',
  Common_Success: 'common_success',
  Common_Warning: 'common_warning',
  Common_Info: 'common_info',
  Common_Disposed: 'common_disposed',
  Common_Test: 'common_test',

  // Error Messages
  Error_InvalidInput: 'error_invalidInput',
  Error_NetworkError: 'error_networkError',
  Error_NotFound: 'error_notFound',
  Error_AccessDenied: 'error_accessDenied',
  Error_InternalServer: 'error_internalServer',
  Error_ValidationFailed: 'error_validationFailed',
  Error_RequiredField: 'error_requiredField',
  Error_InvalidContext: 'error_invalidContext',
  Error_InvalidContextTemplate: 'error_invalidContextTemplate',
  Error_InvalidCurrencyCodeTemplate: 'error_invalidCurrencyCodeTemplate',

  // Registry Errors (templates support variables)
  Error_ComponentNotFoundTemplate: 'error_componentNotFoundTemplate',
  Error_LanguageNotFoundTemplate: 'error_languageNotFoundTemplate',
  Error_StringKeyNotFoundTemplate: 'error_stringKeyNotFoundTemplate',
  Error_IncompleteRegistrationTemplate: 'error_incompleteRegistrationTemplate',
  Error_DuplicateComponentTemplate: 'error_duplicateComponentTemplate',
  Error_DuplicateLanguageTemplate: 'error_duplicateLanguageTemplate',
  Error_ValidationFailedTemplate: 'error_validationFailedTemplate',
  Error_MissingTranslationKeyTemplate: 'error_missingTranslationKeyTemplate',

  // System Messages
  System_Welcome: 'system_welcome',
  System_Goodbye: 'system_goodbye',
  System_PleaseWait: 'system_pleaseWait',
  System_ProcessingRequest: 'system_processingRequest',
  System_OperationComplete: 'system_operationComplete',
  System_NoDataAvailable: 'system_noDataAvailable',

  // DefaultStringKey
  Error_InstanceAlreadyExistsTemplate: 'error_instanceAlreadyExistsTemplate',
  Error_InstanceNotFoundTemplate: 'error_instanceNotFoundTemplate',
  Error_MissingStringCollectionTemplate:
    'error_missingStringCollectionTemplate',
  Error_MissingTranslationTemplate: 'error_missingTranslationTemplate',
  Error_DefaultLanguageNoCollectionTemplate:
    'error_defaultLanguageNoCollectionTemplate',
  Error_MissingTranslationKeyForTypeTemplate:
    'error_missingTranslationKeyForTypeTemplate',
} as const);

/**
 * Type for core string key values from the branded enum
 */
export type CoreStringKeyValue = BrandedStringKeyValue<typeof CoreStringKeys>;

/**
 * @deprecated Use CoreStringKeys instead. This alias exists for backwards compatibility.
 */
export const CoreStringKey = CoreStringKeys;
