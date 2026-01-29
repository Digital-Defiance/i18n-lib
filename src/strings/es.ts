import { CoreStringKeys, CoreStringKeyValue } from '../core-string-key';

export const spanishStrings: Record<CoreStringKeyValue, string> = {
  // Common/General
  [CoreStringKeys.Common_Yes]: 'Sí',
  [CoreStringKeys.Common_No]: 'No',
  [CoreStringKeys.Common_Cancel]: 'Cancelar',
  [CoreStringKeys.Common_OK]: 'OK',
  [CoreStringKeys.Common_Save]: 'Guardar',
  [CoreStringKeys.Common_Delete]: 'Eliminar',
  [CoreStringKeys.Common_Edit]: 'Editar',
  [CoreStringKeys.Common_Create]: 'Crear',
  [CoreStringKeys.Common_Update]: 'Actualizar',
  [CoreStringKeys.Common_Loading]: 'Cargando...',
  [CoreStringKeys.Common_Error]: 'Error',
  [CoreStringKeys.Common_Success]: 'Éxito',
  [CoreStringKeys.Common_Warning]: 'Advertencia',
  [CoreStringKeys.Common_Info]: 'Información',
  [CoreStringKeys.Common_Disposed]: 'El objeto ha sido eliminado',
  [CoreStringKeys.Common_Test]: 'Test',

  // Error Messages
  [CoreStringKeys.Error_InvalidInput]: 'Entrada inválida proporcionada',
  [CoreStringKeys.Error_NetworkError]: 'Error de conexión de red',
  [CoreStringKeys.Error_NotFound]: 'Recurso no encontrado',
  [CoreStringKeys.Error_AccessDenied]: 'Acceso denegado',
  [CoreStringKeys.Error_InternalServer]: 'Error interno del servidor',
  [CoreStringKeys.Error_ValidationFailed]: 'Error de validación',
  [CoreStringKeys.Error_RequiredField]: 'Este campo es obligatorio',
  [CoreStringKeys.Error_InvalidContext]: 'Contexto inválido',
  [CoreStringKeys.Error_InvalidContextTemplate]:
    'Contexte invalide : {contextKey}',
  [CoreStringKeys.Error_MissingTranslationKeyTemplate]:
    'Clave de traducción faltante: {stringKey}',
  [CoreStringKeys.Error_InvalidCurrencyCodeTemplate]:
    'Código de divisa inválido: {value}',

  // Registry Error Templates
  [CoreStringKeys.Error_ComponentNotFoundTemplate]:
    'Componente "{componentId}" no encontrado',
  [CoreStringKeys.Error_LanguageNotFoundTemplate]:
    'Idioma "{language}" no encontrado',
  [CoreStringKeys.Error_StringKeyNotFoundTemplate]:
    'Clave de cadena "{stringKey}" no encontrada para el componente "{componentId}"',
  [CoreStringKeys.Error_IncompleteRegistrationTemplate]:
    'Registro incompleto para el componente "{componentId}": faltan {missingCount} cadenas',
  [CoreStringKeys.Error_DuplicateComponentTemplate]:
    'El componente "{componentId}" ya está registrado',
  [CoreStringKeys.Error_DuplicateLanguageTemplate]:
    'El idioma "{languageId}" ya está registrado',
  [CoreStringKeys.Error_ValidationFailedTemplate]:
    'Error de validación para el componente "{componentId}": {errorCount} errores',

  // System Messages
  [CoreStringKeys.System_Welcome]: 'Bienvenido',
  [CoreStringKeys.System_Goodbye]: 'Adiós',
  [CoreStringKeys.System_PleaseWait]: 'Por favor espere...',
  [CoreStringKeys.System_ProcessingRequest]: 'Procesando su solicitud...',
  [CoreStringKeys.System_OperationComplete]:
    'Operación completada exitosamente',
  [CoreStringKeys.System_NoDataAvailable]: 'No hay datos disponibles',

  [CoreStringKeys.Error_InstanceAlreadyExistsTemplate]:
    "La instancia con clave '{key}' ya existe",
  [CoreStringKeys.Error_InstanceNotFoundTemplate]:
    "Instancia con clave '{key}' no encontrada",
  [CoreStringKeys.Error_MissingStringCollectionTemplate]:
    'Falta colección de cadenas para el idioma: {language}',
  [CoreStringKeys.Error_MissingTranslationTemplate]:
    "Falta traducción para la clave '{key}' en el idioma '{language}'",
  [CoreStringKeys.Error_DefaultLanguageNoCollectionTemplate]:
    "El idioma predeterminado '{language}' no tiene colección de cadenas",
  [CoreStringKeys.Error_MissingTranslationKeyForTypeTemplate]:
    'Falta clave de traducción para el tipo: {type}',
};
