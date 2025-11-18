import { CoreStringKey } from '../core-string-key';

export const spanishStrings: Record<CoreStringKey, string> = {
      // Common/General
      [CoreStringKey.Common_Yes]: 'Sí',
      [CoreStringKey.Common_No]: 'No',
      [CoreStringKey.Common_Cancel]: 'Cancelar',
      [CoreStringKey.Common_OK]: 'OK',
      [CoreStringKey.Common_Save]: 'Guardar',
      [CoreStringKey.Common_Delete]: 'Eliminar',
      [CoreStringKey.Common_Edit]: 'Editar',
      [CoreStringKey.Common_Create]: 'Crear',
      [CoreStringKey.Common_Update]: 'Actualizar',
      [CoreStringKey.Common_Loading]: 'Cargando...',
      [CoreStringKey.Common_Error]: 'Error',
      [CoreStringKey.Common_Success]: 'Éxito',
      [CoreStringKey.Common_Warning]: 'Advertencia',
      [CoreStringKey.Common_Info]: 'Información',
      [CoreStringKey.Common_Disposed]: 'El objeto ha sido eliminado',
      [CoreStringKey.Common_Test]: 'Test',

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: 'Entrada inválida proporcionada',
      [CoreStringKey.Error_NetworkError]: 'Error de conexión de red',
      [CoreStringKey.Error_NotFound]: 'Recurso no encontrado',
      [CoreStringKey.Error_AccessDenied]: 'Acceso denegado',
      [CoreStringKey.Error_InternalServer]: 'Error interno del servidor',
      [CoreStringKey.Error_ValidationFailed]: 'Error de validación',
      [CoreStringKey.Error_RequiredField]: 'Este campo es obligatorio',
      [CoreStringKey.Error_InvalidContext]: 'Contexto inválido',
      [CoreStringKey.Error_InvalidContextTemplate]:
        'Contexte invalide : {contextKey}',
      [CoreStringKey.Error_MissingTranslationKeyTemplate]:
        'Clave de traducción faltante: {stringKey}',
      [CoreStringKey.Error_InvalidCurrencyCodeTemplate]: 'Código de divisa inválido: {value}',

      // Registry Error Templates
      [CoreStringKey.Error_ComponentNotFoundTemplate]:
        'Componente "{componentId}" no encontrado',
      [CoreStringKey.Error_LanguageNotFoundTemplate]:
        'Idioma "{language}" no encontrado',
      [CoreStringKey.Error_StringKeyNotFoundTemplate]:
        'Clave de cadena "{stringKey}" no encontrada para el componente "{componentId}"',
      [CoreStringKey.Error_IncompleteRegistrationTemplate]:
        'Registro incompleto para el componente "{componentId}": faltan {missingCount} cadenas',
      [CoreStringKey.Error_DuplicateComponentTemplate]:
        'El componente "{componentId}" ya está registrado',
      [CoreStringKey.Error_DuplicateLanguageTemplate]:
        'El idioma "{languageId}" ya está registrado',
      [CoreStringKey.Error_ValidationFailedTemplate]:
        'Error de validación para el componente "{componentId}": {errorCount} errores',

      // System Messages
      [CoreStringKey.System_Welcome]: 'Bienvenido',
      [CoreStringKey.System_Goodbye]: 'Adiós',
      [CoreStringKey.System_PleaseWait]: 'Por favor espere...',
      [CoreStringKey.System_ProcessingRequest]: 'Procesando su solicitud...',
      [CoreStringKey.System_OperationComplete]:
        'Operación completada exitosamente',
      [CoreStringKey.System_NoDataAvailable]: 'No hay datos disponibles',

      [CoreStringKey.Error_InstanceAlreadyExistsTemplate]:
        "La instancia con clave '{key}' ya existe",
      [CoreStringKey.Error_InstanceNotFoundTemplate]:
        "Instancia con clave '{key}' no encontrada",
      [CoreStringKey.Error_MissingStringCollectionTemplate]:
        'Falta colección de cadenas para el idioma: {language}',
      [CoreStringKey.Error_MissingTranslationTemplate]:
        "Falta traducción para la clave '{key}' en el idioma '{language}'",
      [CoreStringKey.Error_DefaultLanguageNoCollectionTemplate]:
        "El idioma predeterminado '{language}' no tiene colección de cadenas",
      [CoreStringKey.Error_MissingTranslationKeyForTypeTemplate]:
        'Falta clave de traducción para el tipo: {type}',
    };