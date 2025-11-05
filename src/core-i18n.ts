/**
 * Core I18n component with default languages and system strings
 */

import { ComponentDefinition } from './component-definition';
import { ComponentRegistration } from './component-registration';
import { CoreStringKey } from './core-string-key';
import { LanguageCodes } from './language-codes';
import { LanguageDefinition } from './language-definition';
import { PluginI18nEngine } from './plugin-i18n-engine';
import { createCompleteComponentStrings } from './strict-types';
import { ComponentConfig } from './interfaces';
import { I18nEngine } from './core';

/**
 * Helper function to create multiple language definitions
 */
function createLanguageDefinitions(
  languages: Array<{
    id: string;
    name: string;
    code: string;
    isDefault?: boolean;
  }>,
): LanguageDefinition[] {
  return languages.map((lang) => ({
    id: lang.id,
    name: lang.name,
    code: lang.code,
    isDefault: lang.isDefault || false,
  }));
}

/**
 * Core language code type - union of supported language codes
 * Provides compile-time type safety for core languages
 * For custom languages, extend this type or use string
 */
export type CoreLanguageCode =
  (typeof LanguageCodes)[keyof typeof LanguageCodes];

/**
 * Flexible language code type - use when you want runtime-only validation
 * Alias for string to indicate it's a language code
 */
export type FlexibleLanguageCode = string;

const DefaultInstanceKey = 'default';

/**
 * Create default language definitions
 */
export function createDefaultLanguages(): LanguageDefinition[] {
  return createLanguageDefinitions([
    {
      id: LanguageCodes.EN_US,
      name: 'English (US)',
      code: 'en-US',
      isDefault: true,
    },
    {
      id: LanguageCodes.EN_GB,
      name: 'English (UK)',
      code: 'en-GB',
    },
    {
      id: LanguageCodes.FR,
      name: 'Français',
      code: 'fr',
    },
    {
      id: LanguageCodes.ES,
      name: 'Español',
      code: 'es',
    },
    {
      id: LanguageCodes.DE,
      name: 'Deutsch',
      code: 'de',
    },
    {
      id: LanguageCodes.ZH_CN,
      name: '中文 (简体)',
      code: 'zh-CN',
    },
    {
      id: LanguageCodes.JA,
      name: '日本語',
      code: 'ja',
    },
    {
      id: LanguageCodes.UK,
      name: 'Українська',
      code: 'uk',
    },
  ]);
}

export const CoreI18nComponentId = 'core';

/**
 * Core component definition
 */
export const CoreComponentDefinition: ComponentDefinition<CoreStringKey> = {
  id: CoreI18nComponentId,
  name: 'Core I18n System',
  stringKeys: Object.values(CoreStringKey),
};

/**
 * Core component strings for all default languages
 */
export function createCoreComponentStrings() {
  return createCompleteComponentStrings<CoreStringKey, string>({
    [LanguageCodes.EN_US]: {
      // Common/General
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
    },

    [LanguageCodes.EN_GB]: {
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
    },

    [LanguageCodes.FR]: {
      // Common/General
      [CoreStringKey.Common_Yes]: 'Oui',
      [CoreStringKey.Common_No]: 'Non',
      [CoreStringKey.Common_Cancel]: 'Annuler',
      [CoreStringKey.Common_OK]: 'OK',
      [CoreStringKey.Common_Save]: 'Enregistrer',
      [CoreStringKey.Common_Delete]: 'Supprimer',
      [CoreStringKey.Common_Edit]: 'Modifier',
      [CoreStringKey.Common_Create]: 'Créer',
      [CoreStringKey.Common_Update]: 'Mettre à jour',
      [CoreStringKey.Common_Loading]: 'Chargement...',
      [CoreStringKey.Common_Error]: 'Erreur',
      [CoreStringKey.Common_Success]: 'Succès',
      [CoreStringKey.Common_Warning]: 'Avertissement',
      [CoreStringKey.Common_Info]: 'Information',
      [CoreStringKey.Common_Disposed]: "L'objet a été disposé",
      [CoreStringKey.Common_Test]: 'Test',

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: 'Entrée invalide fournie',
      [CoreStringKey.Error_NetworkError]: 'Erreur de connexion réseau',
      [CoreStringKey.Error_NotFound]: 'Ressource non trouvée',
      [CoreStringKey.Error_AccessDenied]: 'Accès refusé',
      [CoreStringKey.Error_InternalServer]: 'Erreur interne du serveur',
      [CoreStringKey.Error_ValidationFailed]: 'Échec de la validation',
      [CoreStringKey.Error_RequiredField]: 'Ce champ est obligatoire',
      [CoreStringKey.Error_InvalidContext]: 'Contexte invalide',
      [CoreStringKey.Error_InvalidContextTemplate]:
        'Contexte invalide : {contextKey}',
      [CoreStringKey.Error_MissingTranslationKeyTemplate]:
        'Clé de traduction manquante : {stringKey}',
      [CoreStringKey.Error_InvalidCurrencyCodeTemplate]: 'Code de devise invalide : {value}',

      // Registry Error Templates
      [CoreStringKey.Error_ComponentNotFoundTemplate]:
        'Composant "{componentId}" non trouvé',
      [CoreStringKey.Error_LanguageNotFoundTemplate]:
        'Langue "{language}" non trouvée',
      [CoreStringKey.Error_StringKeyNotFoundTemplate]:
        'Clé de chaîne "{stringKey}" non trouvée pour le composant "{componentId}"',
      [CoreStringKey.Error_IncompleteRegistrationTemplate]:
        'Enregistrement incomplet pour le composant "{componentId}": {missingCount} chaînes manquantes',
      [CoreStringKey.Error_DuplicateComponentTemplate]:
        'Le composant "{componentId}" est déjà enregistré',
      [CoreStringKey.Error_DuplicateLanguageTemplate]:
        'La langue "{languageId}" est déjà enregistrée',
      [CoreStringKey.Error_ValidationFailedTemplate]:
        'Échec de la validation pour le composant "{componentId}": {errorCount} erreurs',

      // System Messages
      [CoreStringKey.System_Welcome]: 'Bienvenue',
      [CoreStringKey.System_Goodbye]: 'Au revoir',
      [CoreStringKey.System_PleaseWait]: 'Veuillez patienter...',
      [CoreStringKey.System_ProcessingRequest]:
        'Traitement de votre demande...',
      [CoreStringKey.System_OperationComplete]:
        'Opération terminée avec succès',
      [CoreStringKey.System_NoDataAvailable]: 'Aucune donnée disponible',

      [CoreStringKey.Error_InstanceAlreadyExistsTemplate]:
        "Instance avec clé '{key}' existe déjà",
      [CoreStringKey.Error_InstanceNotFoundTemplate]:
        "Instance avec clé '{key}' introuvable",
      [CoreStringKey.Error_MissingStringCollectionTemplate]:
        'Collection de chaînes manquante pour la langue: {language}',
      [CoreStringKey.Error_MissingTranslationTemplate]:
        "Traduction manquante pour la clé '{key}' dans la langue '{language}'",
      [CoreStringKey.Error_DefaultLanguageNoCollectionTemplate]:
        "La langue par défaut '{language}' n'a pas de collection de chaînes",
      [CoreStringKey.Error_MissingTranslationKeyForTypeTemplate]:
        'Clé de traduction manquante pour le type: {type}',
    },

    [LanguageCodes.ES]: {
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
    },

    [LanguageCodes.DE]: {
      // Common/General
      [CoreStringKey.Common_Yes]: 'Ja',
      [CoreStringKey.Common_No]: 'Nein',
      [CoreStringKey.Common_Cancel]: 'Abbrechen',
      [CoreStringKey.Common_OK]: 'OK',
      [CoreStringKey.Common_Save]: 'Speichern',
      [CoreStringKey.Common_Delete]: 'Löschen',
      [CoreStringKey.Common_Edit]: 'Bearbeiten',
      [CoreStringKey.Common_Create]: 'Erstellen',
      [CoreStringKey.Common_Update]: 'Aktualisieren',
      [CoreStringKey.Common_Loading]: 'Lädt...',
      [CoreStringKey.Common_Error]: 'Fehler',
      [CoreStringKey.Common_Success]: 'Erfolg',
      [CoreStringKey.Common_Warning]: 'Warnung',
      [CoreStringKey.Common_Info]: 'Information',
      [CoreStringKey.Common_Disposed]: 'Objekt wurde freigegeben',
      [CoreStringKey.Common_Test]: 'Test',

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: 'Ungültige Eingabe bereitgestellt',
      [CoreStringKey.Error_NetworkError]: 'Netzwerkverbindungsfehler',
      [CoreStringKey.Error_NotFound]: 'Ressource nicht gefunden',
      [CoreStringKey.Error_AccessDenied]: 'Zugriff verweigert',
      [CoreStringKey.Error_InternalServer]: 'Interner Serverfehler',
      [CoreStringKey.Error_ValidationFailed]: 'Validierung fehlgeschlagen',
      [CoreStringKey.Error_RequiredField]: 'Dieses Feld ist erforderlich',
      [CoreStringKey.Error_InvalidContext]: 'Ungültiger Kontext',
      [CoreStringKey.Error_InvalidContextTemplate]:
        'Ungültiger Kontext: {contextKey}',
      [CoreStringKey.Error_MissingTranslationKeyTemplate]:
        'Fehlender Übersetzungsschlüssel: {stringKey}',
      [CoreStringKey.Error_InvalidCurrencyCodeTemplate]: 'Ungültiger Währungscode: {value}',

      // Registry Error Templates
      [CoreStringKey.Error_ComponentNotFoundTemplate]:
        'Komponente "{componentId}" nicht gefunden',
      [CoreStringKey.Error_LanguageNotFoundTemplate]:
        'Sprache "{language}" nicht gefunden',
      [CoreStringKey.Error_StringKeyNotFoundTemplate]:
        'String-Schlüssel "{stringKey}" für Komponente "{componentId}" nicht gefunden',
      [CoreStringKey.Error_IncompleteRegistrationTemplate]:
        'Unvollständige Registrierung für Komponente "{componentId}": {missingCount} Strings fehlen',
      [CoreStringKey.Error_DuplicateComponentTemplate]:
        'Komponente "{componentId}" ist bereits registriert',
      [CoreStringKey.Error_DuplicateLanguageTemplate]:
        'Sprache "{languageId}" ist bereits registriert',
      [CoreStringKey.Error_ValidationFailedTemplate]:
        'Validierung für Komponente "{componentId}" fehlgeschlagen: {errorCount} Fehler',

      // System Messages
      [CoreStringKey.System_Welcome]: 'Willkommen',
      [CoreStringKey.System_Goodbye]: 'Auf Wiedersehen',
      [CoreStringKey.System_PleaseWait]: 'Bitte warten...',
      [CoreStringKey.System_ProcessingRequest]:
        'Ihre Anfrage wird bearbeitet...',
      [CoreStringKey.System_OperationComplete]:
        'Vorgang erfolgreich abgeschlossen',
      [CoreStringKey.System_NoDataAvailable]: 'Keine Daten verfügbar',

      [CoreStringKey.Error_InstanceAlreadyExistsTemplate]:
        "Instanz mit Schlüssel '{key}' existiert bereits",
      [CoreStringKey.Error_InstanceNotFoundTemplate]:
        "Instanz mit Schlüssel '{key}' nicht gefunden",
      [CoreStringKey.Error_MissingStringCollectionTemplate]:
        'Fehlende String-Sammlung für Sprache: {language}',
      [CoreStringKey.Error_MissingTranslationTemplate]:
        "Fehlende Übersetzung für Schlüssel '{key}' in Sprache '{language}'",
      [CoreStringKey.Error_DefaultLanguageNoCollectionTemplate]:
        "Standardsprache '{language}' hat keine String-Sammlung",
      [CoreStringKey.Error_MissingTranslationKeyForTypeTemplate]:
        'Fehlender Übersetzungsschlüssel für Typ: {type}',
    },

    [LanguageCodes.ZH_CN]: {
      // Common/General
      [CoreStringKey.Common_Yes]: '是',
      [CoreStringKey.Common_No]: '否',
      [CoreStringKey.Common_Cancel]: '取消',
      [CoreStringKey.Common_OK]: '确定',
      [CoreStringKey.Common_Save]: '保存',
      [CoreStringKey.Common_Delete]: '删除',
      [CoreStringKey.Common_Edit]: '编辑',
      [CoreStringKey.Common_Create]: '创建',
      [CoreStringKey.Common_Update]: '更新',
      [CoreStringKey.Common_Loading]: '加载中...',
      [CoreStringKey.Common_Error]: '错误',
      [CoreStringKey.Common_Success]: '成功',
      [CoreStringKey.Common_Warning]: '警告',
      [CoreStringKey.Common_Info]: '信息',
      [CoreStringKey.Common_Disposed]: '对象已被释放',
      [CoreStringKey.Common_Test]: '测试',

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: '提供的输入无效',
      [CoreStringKey.Error_NetworkError]: '网络连接错误',
      [CoreStringKey.Error_NotFound]: '未找到资源',
      [CoreStringKey.Error_AccessDenied]: '访问被拒绝',
      [CoreStringKey.Error_InternalServer]: '内部服务器错误',
      [CoreStringKey.Error_ValidationFailed]: '验证失败',
      [CoreStringKey.Error_RequiredField]: '此字段为必填项',
      [CoreStringKey.Error_InvalidContext]: '无效的上下文',
      [CoreStringKey.Error_InvalidContextTemplate]:
        '无效的上下文：{contextKey}',
      [CoreStringKey.Error_MissingTranslationKeyTemplate]:
        '缺少翻译键：{stringKey}',
      [CoreStringKey.Error_InvalidCurrencyCodeTemplate]: '无效的货币代码：{value}',

      // Registry Error Templates
      [CoreStringKey.Error_ComponentNotFoundTemplate]:
        '未找到组件 "{componentId}"',
      [CoreStringKey.Error_LanguageNotFoundTemplate]: '未找到语言 "{language}"',
      [CoreStringKey.Error_StringKeyNotFoundTemplate]:
        '组件 "{componentId}" 未找到字符串键 "{stringKey}"',
      [CoreStringKey.Error_IncompleteRegistrationTemplate]:
        '组件 "{componentId}" 注册不完整：缺少 {missingCount} 个字符串',
      [CoreStringKey.Error_DuplicateComponentTemplate]:
        '组件 "{componentId}" 已注册',
      [CoreStringKey.Error_DuplicateLanguageTemplate]:
        '语言 "{languageId}" 已注册',
      [CoreStringKey.Error_ValidationFailedTemplate]:
        '组件 "{componentId}" 验证失败：{errorCount} 个错误',

      // System Messages
      [CoreStringKey.System_Welcome]: '欢迎',
      [CoreStringKey.System_Goodbye]: '再见',
      [CoreStringKey.System_PleaseWait]: '请稍候...',
      [CoreStringKey.System_ProcessingRequest]: '正在处理您的请求...',
      [CoreStringKey.System_OperationComplete]: '操作成功完成',
      [CoreStringKey.System_NoDataAvailable]: '无可用数据',

      [CoreStringKey.Error_InstanceAlreadyExistsTemplate]:
        "键为'{key}'的实例已存在",
      [CoreStringKey.Error_InstanceNotFoundTemplate]:
        "未找到键为'{key}'的实例",
      [CoreStringKey.Error_MissingStringCollectionTemplate]:
        '缺少语言的字符串集合: {language}',
      [CoreStringKey.Error_MissingTranslationTemplate]:
        "在语言'{language}'中缺少键'{key}'的翻译",
      [CoreStringKey.Error_DefaultLanguageNoCollectionTemplate]:
        "默认语言'{language}'没有字符串集合",
      [CoreStringKey.Error_MissingTranslationKeyForTypeTemplate]:
        '类型缺少翻译键: {type}',
    },

    [LanguageCodes.JA]: {
      // Common/General
      [CoreStringKey.Common_Yes]: 'はい',
      [CoreStringKey.Common_No]: 'いいえ',
      [CoreStringKey.Common_Cancel]: 'キャンセル',
      [CoreStringKey.Common_OK]: 'OK',
      [CoreStringKey.Common_Save]: '保存',
      [CoreStringKey.Common_Delete]: '削除',
      [CoreStringKey.Common_Edit]: '編集',
      [CoreStringKey.Common_Create]: '作成',
      [CoreStringKey.Common_Update]: '更新',
      [CoreStringKey.Common_Loading]: '読み込み中...',
      [CoreStringKey.Common_Error]: 'エラー',
      [CoreStringKey.Common_Success]: '成功',
      [CoreStringKey.Common_Warning]: '警告',
      [CoreStringKey.Common_Info]: '情報',
      [CoreStringKey.Common_Disposed]: 'オブジェクトは破棄されました',
      [CoreStringKey.Common_Test]: 'テスト',

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: '無効な入力が提供されました',
      [CoreStringKey.Error_NetworkError]: 'ネットワーク接続エラー',
      [CoreStringKey.Error_NotFound]: 'リソースが見つかりません',
      [CoreStringKey.Error_AccessDenied]: 'アクセスが拒否されました',
      [CoreStringKey.Error_InternalServer]: '内部サーバーエラー',
      [CoreStringKey.Error_ValidationFailed]: '検証に失敗しました',
      [CoreStringKey.Error_RequiredField]: 'このフィールドは必須です',
      [CoreStringKey.Error_InvalidContext]: '無効なコンテキスト',
      [CoreStringKey.Error_InvalidContextTemplate]:
        '無効なコンテキスト：{contextKey}',
      [CoreStringKey.Error_MissingTranslationKeyTemplate]:
        '翻訳キーが見つかりません：{stringKey}',
      [CoreStringKey.Error_InvalidCurrencyCodeTemplate]: '無効な通貨コード：{value}',

      // Registry Error Templates
      [CoreStringKey.Error_ComponentNotFoundTemplate]:
        'コンポーネント "{componentId}" が見つかりません',
      [CoreStringKey.Error_LanguageNotFoundTemplate]:
        '言語 "{language}" が見つかりません',
      [CoreStringKey.Error_StringKeyNotFoundTemplate]:
        'コンポーネント "{componentId}" の文字列キー "{stringKey}" が見つかりません',
      [CoreStringKey.Error_IncompleteRegistrationTemplate]:
        'コンポーネント "{componentId}" の登録が不完全です：{missingCount} 個の文字列が不足しています',
      [CoreStringKey.Error_DuplicateComponentTemplate]:
        'コンポーネント "{componentId}" は既に登録されています',
      [CoreStringKey.Error_DuplicateLanguageTemplate]:
        '言語 "{languageId}" は既に登録されています',
      [CoreStringKey.Error_ValidationFailedTemplate]:
        'コンポーネント "{componentId}" の検証に失敗しました：{errorCount} 個のエラー',

      // System Messages
      [CoreStringKey.System_Welcome]: 'ようこそ',
      [CoreStringKey.System_Goodbye]: 'さようなら',
      [CoreStringKey.System_PleaseWait]: 'お待ちください...',
      [CoreStringKey.System_ProcessingRequest]: 'リクエストを処理中...',
      [CoreStringKey.System_OperationComplete]: '操作が正常に完了しました',
      [CoreStringKey.System_NoDataAvailable]: '利用可能なデータがありません',

      [CoreStringKey.Error_InstanceAlreadyExistsTemplate]:
        "キー'{key}'のインスタンスは既に存在します",
      [CoreStringKey.Error_InstanceNotFoundTemplate]:
        "キー'{key}'のインスタンスが見つかりません",
      [CoreStringKey.Error_MissingStringCollectionTemplate]:
        '言語の文字列コレクションがありません: {language}',
      [CoreStringKey.Error_MissingTranslationTemplate]:
        "言語'{language}'でキー'{key}'の翻訳がありません",
      [CoreStringKey.Error_DefaultLanguageNoCollectionTemplate]:
        "デフォルト言語'{language}'に文字列コレクションがありません",
      [CoreStringKey.Error_MissingTranslationKeyForTypeTemplate]:
        'タイプの翻訳キーがありません: {type}',
    },

    [LanguageCodes.UK]: {
      // Common/General
      [CoreStringKey.Common_Yes]: 'Так',
      [CoreStringKey.Common_No]: 'Ні',
      [CoreStringKey.Common_Cancel]: 'Скасувати',
      [CoreStringKey.Common_OK]: 'OK',
      [CoreStringKey.Common_Save]: 'Зберегти',
      [CoreStringKey.Common_Delete]: 'Видалити',
      [CoreStringKey.Common_Edit]: 'Редагувати',
      [CoreStringKey.Common_Create]: 'Створити',
      [CoreStringKey.Common_Update]: 'Оновити',
      [CoreStringKey.Common_Loading]: 'Завантаження...',
      [CoreStringKey.Common_Error]: 'Помилка',
      [CoreStringKey.Common_Success]: 'Успіх',
      [CoreStringKey.Common_Warning]: 'Попередження',
      [CoreStringKey.Common_Info]: 'Інформація',
      [CoreStringKey.Common_Disposed]: "Об'єкт було звільнено",
      [CoreStringKey.Common_Test]: 'Тест',

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: 'Надано неправильний ввід',
      [CoreStringKey.Error_NetworkError]: "Помилка мережевого з'єднання",
      [CoreStringKey.Error_NotFound]: 'Ресурс не знайдено',
      [CoreStringKey.Error_AccessDenied]: 'Доступ заборонено',
      [CoreStringKey.Error_InternalServer]: 'Внутрішня помилка сервера',
      [CoreStringKey.Error_ValidationFailed]: 'Перевірка не вдалася',
      [CoreStringKey.Error_RequiredField]: "Це поле є обов'язковим",
      [CoreStringKey.Error_InvalidContext]: 'Неправильний контекст',
      [CoreStringKey.Error_InvalidContextTemplate]:
        'Неправильний контекст: {contextKey}',
      [CoreStringKey.Error_MissingTranslationKeyTemplate]:
        'Відсутній ключ перекладу: {stringKey}',
      [CoreStringKey.Error_InvalidCurrencyCodeTemplate]: 'Неправильний код валюти: {value}',

      // Registry Error Templates
      [CoreStringKey.Error_ComponentNotFoundTemplate]:
        'Компонент "{componentId}" не знайдено',
      [CoreStringKey.Error_LanguageNotFoundTemplate]:
        'Мову "{language}" не знайдено',
      [CoreStringKey.Error_StringKeyNotFoundTemplate]:
        'Ключ рядка "{stringKey}" не знайдено для компонента "{componentId}"',
      [CoreStringKey.Error_IncompleteRegistrationTemplate]:
        'Неповна реєстрація для компонента "{componentId}": не вистачає {missingCount} рядків',
      [CoreStringKey.Error_DuplicateComponentTemplate]:
        'Компонент "{componentId}" вже зареєстровано',
      [CoreStringKey.Error_DuplicateLanguageTemplate]:
        'Мову "{languageId}" вже зареєстровано',
      [CoreStringKey.Error_ValidationFailedTemplate]:
        'Перевірка не вдалася для компонента "{componentId}": {errorCount} помилок',

      // System Messages
      [CoreStringKey.System_Welcome]: 'Ласкаво просимо',
      [CoreStringKey.System_Goodbye]: 'До побачення',
      [CoreStringKey.System_PleaseWait]: 'Будь ласка, зачекайте...',
      [CoreStringKey.System_ProcessingRequest]: 'Обробка вашого запиту...',
      [CoreStringKey.System_OperationComplete]: 'Операція успішно завершена',
      [CoreStringKey.System_NoDataAvailable]: 'Дані недоступні',

      [CoreStringKey.Error_InstanceAlreadyExistsTemplate]:
        "Екземпляр з ключем '{key}' вже існує",
      [CoreStringKey.Error_InstanceNotFoundTemplate]:
        "Екземпляр з ключем '{key}' не знайдено",
      [CoreStringKey.Error_MissingStringCollectionTemplate]:
        'Відсутня колекція рядків для мови: {language}',
      [CoreStringKey.Error_MissingTranslationTemplate]:
        "Відсутній переклад для ключа '{key}' в мові '{language}'",
      [CoreStringKey.Error_DefaultLanguageNoCollectionTemplate]:
        "Мова за замовчуванням '{language}' не має колекції рядків",
      [CoreStringKey.Error_MissingTranslationKeyForTypeTemplate]:
        'Відсутній ключ перекладу для типу: {type}',
    },
  });
}

/**
 * Create core component registration (for PluginI18nEngine)
 */
export function createCoreComponentRegistration(): ComponentRegistration<
  CoreStringKey,
  string
> {
  return {
    component: CoreComponentDefinition,
    strings: createCoreComponentStrings(),
  };
}

/**
 * Create core component config (for I18nEngine)
 */
export function createCoreComponentConfig(): ComponentConfig {
  return {
    id: CoreI18nComponentId,
    strings: createCoreComponentStrings(),
    aliases: ['CoreStringKey', 'core'],
  };
}

/**
 * Get core language codes as array (for Mongoose enums, etc.)
 */
export function getCoreLanguageCodes(): string[] {
  return Object.values(LanguageCodes);
}

/**
 * Get core language definitions
 */
export function getCoreLanguageDefinitions(): LanguageDefinition[] {
  return createDefaultLanguages();
}

// 1.x definitions
//------------------------------------
/**
 * Create a pre-configured I18n engine with core components
 * Returns engine with string type - use registry for language validation
 */
export function createCorePluginI18nEngine(
  instanceKey: string = DefaultInstanceKey,
): PluginI18nEngine<string> {
  const languages = createDefaultLanguages();
  const engine = PluginI18nEngine.createInstance<string>(
    instanceKey,
    languages,
  );
  engine.registerComponent(createCoreComponentRegistration());
  return engine;
}

// Note: Lazy initialization to avoid circular dependency issues
// Tests should call resetCoreI18nEngine() after PluginI18nEngine.resetAll()
let _corePluginI18nEngine: PluginI18nEngine<string> | undefined;

export function getCorePluginI18nEngine(): PluginI18nEngine<string> {
  // Lazy initialization on first access
  if (!_corePluginI18nEngine) {
    _corePluginI18nEngine = createCorePluginI18nEngine();
    return _corePluginI18nEngine;
  }
  
  // Lazy re-initialization if instance was cleared
  try {
    PluginI18nEngine.getInstance<string>(DefaultInstanceKey);
    return _corePluginI18nEngine;
  } catch {
    _corePluginI18nEngine = createCorePluginI18nEngine();
    return _corePluginI18nEngine;
  }
}

// Getter for direct reference - lazily initialized
export const corePluginI18nEngine = new Proxy({} as PluginI18nEngine<string>, {
  get(_target, prop) {
    return (getCorePluginI18nEngine() as any)[prop];
  },
});

// Reset function for tests
export function resetCorePluginI18nEngine(): void {
  _corePluginI18nEngine = undefined;
}

/**
 * Type alias for easier usage
 */
export type CorePluginI18nEngine = PluginI18nEngine<string>;

/**
 * Helper function to get core translation
 * Uses the core engine instance to ensure core strings are available
 */
export function getCorePluginTranslation(
  stringKey: CoreStringKey,
  variables?: Record<string, string | number>,
  language?: string,
  instanceKey?: string,
): string {
  // Use core engine if no instance key specified, otherwise use specified instance
  const engine = instanceKey ? PluginI18nEngine.getInstance<string>(instanceKey) : getCoreI18nEngine();
  return engine.translate(CoreI18nComponentId, stringKey, variables, language);
}

/**
 * Helper function to safely get core translation with fallback
 */
export function safeCorePluginTranslation(
  stringKey: CoreStringKey,
  variables?: Record<string, string | number>,
  language?: string,
  instanceKey?: string,
): string {
  try {
    return getCorePluginTranslation(stringKey, variables, language, instanceKey);
  } catch {
    return `[CoreStringKey.${stringKey}]`;
  }
}

// 2.x definitions
//------------------------------

/**
 * Create Core i18n engine instance
 * Uses i18n 2.0 pattern with runtime validation
 * IMPORTANT: Uses 'default' as instance key so TypedHandleableError can find it
 */
function createInstance(): I18nEngine {
  const engine = I18nEngine.createInstance('default', createDefaultLanguages());
  
  // Register core component first (required for error messages)
  const coreReg = createCoreComponentRegistration();
  engine.register({
    id: coreReg.component.id,
    strings: coreReg.strings as Record<string, Record<string, string>>,
  });
  
  return engine;
}

/**
 * Lazy initialization with Proxy (like core-i18n.ts pattern)
 */
let _coreEngine: I18nEngine | undefined;

export function getCoreI18nEngine(): I18nEngine {
  // Lazy initialization on first access
  if (!_coreEngine) {
    // Check if instance exists before creating
    if (I18nEngine.hasInstance('default')) {
      _coreEngine = I18nEngine.getInstance('default');
    } else {
      _coreEngine = createInstance();
    }
    return _coreEngine;
  }
  
  // Lazy re-initialization if instance was cleared
  if (I18nEngine.hasInstance('default')) {
    return _coreEngine;
  } else {
    _coreEngine = createInstance();
    return _coreEngine;
  }
}

/**
 * Proxy for backward compatibility
 */
export const coreI18nEngine = new Proxy({} as I18nEngine, {
  get(target, prop) {
    return getCoreI18nEngine()[prop as keyof I18nEngine];
  }
});

/**
 * Reset function for tests
 */
export function resetCoreI18nEngine(): void {
  _coreEngine = undefined;
}

/**
 * Helper to translate Core strings
 */
export function getCoreTranslation(
  stringKey: CoreStringKey,
  variables?: Record<string, string | number>,
  language?: string,
): string {
  return getCoreI18nEngine().translate(CoreI18nComponentId, stringKey, variables, language);
}

/**
 * Safe translation with fallback
 */
export function safeCoreTranslation(
  stringKey: CoreStringKey,
  variables?: Record<string, string | number>,
  language?: string,
): string {
  try {
    return getCoreTranslation(stringKey, variables, language);
  } catch {
    return `[${stringKey}]`;
  }
}