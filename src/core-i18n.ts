/**
 * Core I18n component with default languages and system strings
 */

import { ComponentDefinition } from './component-definition';
import { ComponentRegistration } from './component-registration';
import { CoreLanguage } from './core-language';
import { CoreStringKey } from './core-string-key';
import { LanguageDefinition } from './language-definition';
import { createLanguageDefinitions } from './language-registry';
import { PluginI18nEngine } from './plugin-i18n-engine';
import { createCompleteComponentStrings } from './strict-types';

/**
 * Create default language definitions
 */
export function createDefaultLanguages(): LanguageDefinition[] {
  return createLanguageDefinitions([
    {
      id: CoreLanguage.EnglishUS,
      name: 'English (US)',
      code: 'en-US',
      isDefault: true,
    },
    {
      id: CoreLanguage.EnglishUK,
      name: 'English (UK)',
      code: 'en-GB',
    },
    {
      id: CoreLanguage.French,
      name: 'Français',
      code: 'fr',
    },
    {
      id: CoreLanguage.Spanish,
      name: 'Español',
      code: 'es',
    },
    {
      id: CoreLanguage.German,
      name: 'Deutsch',
      code: 'de',
    },
    {
      id: CoreLanguage.MandarinChinese,
      name: '中文 (简体)',
      code: 'zh-CN',
    },
    {
      id: CoreLanguage.Japanese,
      name: '日本語',
      code: 'ja',
    },
    {
      id: CoreLanguage.Ukrainian,
      name: 'Українська',
      code: 'uk',
    },
  ]);
}

/**
 * Core component definition
 */
export const CoreComponentDefinition: ComponentDefinition<CoreStringKey> = {
  id: 'core',
  name: 'Core I18n System',
  stringKeys: Object.values(CoreStringKey),
};

/**
 * Core component strings for all default languages
 */
export function createCoreComponentStrings() {
  return createCompleteComponentStrings<CoreStringKey, CoreLanguage>({
    [CoreLanguage.EnglishUS]: {
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

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: 'Invalid input provided',
      [CoreStringKey.Error_NetworkError]: 'Network connection error',
      [CoreStringKey.Error_NotFound]: 'Resource not found',
      [CoreStringKey.Error_AccessDenied]: 'Access denied',
      [CoreStringKey.Error_InternalServer]: 'Internal server error',
      [CoreStringKey.Error_ValidationFailed]: 'Validation failed',
      [CoreStringKey.Error_RequiredField]: 'This field is required',
      [CoreStringKey.Error_InvalidContextTemplate]: 'Invalid context: {contextKey}',

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
    },

    [CoreLanguage.EnglishUK]: {
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

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: 'Invalid input provided',
      [CoreStringKey.Error_NetworkError]: 'Network connection error',
      [CoreStringKey.Error_NotFound]: 'Resource not found',
      [CoreStringKey.Error_AccessDenied]: 'Access denied',
      [CoreStringKey.Error_InternalServer]: 'Internal server error',
      [CoreStringKey.Error_ValidationFailed]: 'Validation failed',
      [CoreStringKey.Error_RequiredField]: 'This field is required',
      [CoreStringKey.Error_InvalidContextTemplate]: 'Invalid context: {contextKey}',

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
    },

    [CoreLanguage.French]: {
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

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: 'Entrée invalide fournie',
      [CoreStringKey.Error_NetworkError]: 'Erreur de connexion réseau',
      [CoreStringKey.Error_NotFound]: 'Ressource non trouvée',
      [CoreStringKey.Error_AccessDenied]: 'Accès refusé',
      [CoreStringKey.Error_InternalServer]: 'Erreur interne du serveur',
      [CoreStringKey.Error_ValidationFailed]: 'Échec de la validation',
      [CoreStringKey.Error_RequiredField]: 'Ce champ est obligatoire',
      [CoreStringKey.Error_InvalidContextTemplate]: 'Contexte invalide : {contextKey}',

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
    },

    [CoreLanguage.Spanish]: {
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

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: 'Entrada inválida proporcionada',
      [CoreStringKey.Error_NetworkError]: 'Error de conexión de red',
      [CoreStringKey.Error_NotFound]: 'Recurso no encontrado',
      [CoreStringKey.Error_AccessDenied]: 'Acceso denegado',
      [CoreStringKey.Error_InternalServer]: 'Error interno del servidor',
      [CoreStringKey.Error_ValidationFailed]: 'Error de validación',
      [CoreStringKey.Error_RequiredField]: 'Este campo es obligatorio',
      [CoreStringKey.Error_InvalidContextTemplate]: 'Contexte invalide : {contextKey}',

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
    },

    [CoreLanguage.German]: {
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

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: 'Ungültige Eingabe bereitgestellt',
      [CoreStringKey.Error_NetworkError]: 'Netzwerkverbindungsfehler',
      [CoreStringKey.Error_NotFound]: 'Ressource nicht gefunden',
      [CoreStringKey.Error_AccessDenied]: 'Zugriff verweigert',
      [CoreStringKey.Error_InternalServer]: 'Interner Serverfehler',
      [CoreStringKey.Error_ValidationFailed]: 'Validierung fehlgeschlagen',
      [CoreStringKey.Error_RequiredField]: 'Dieses Feld ist erforderlich',
      [CoreStringKey.Error_InvalidContextTemplate]: 'Ungültiger Kontext: {contextKey}',

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
    },

    [CoreLanguage.MandarinChinese]: {
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

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: '提供的输入无效',
      [CoreStringKey.Error_NetworkError]: '网络连接错误',
      [CoreStringKey.Error_NotFound]: '未找到资源',
      [CoreStringKey.Error_AccessDenied]: '访问被拒绝',
      [CoreStringKey.Error_InternalServer]: '内部服务器错误',
      [CoreStringKey.Error_ValidationFailed]: '验证失败',
      [CoreStringKey.Error_RequiredField]: '此字段为必填项',
      [CoreStringKey.Error_InvalidContextTemplate]: '无效的上下文：{contextKey}',

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
    },

    [CoreLanguage.Japanese]: {
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

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: '無効な入力が提供されました',
      [CoreStringKey.Error_NetworkError]: 'ネットワーク接続エラー',
      [CoreStringKey.Error_NotFound]: 'リソースが見つかりません',
      [CoreStringKey.Error_AccessDenied]: 'アクセスが拒否されました',
      [CoreStringKey.Error_InternalServer]: '内部サーバーエラー',
      [CoreStringKey.Error_ValidationFailed]: '検証に失敗しました',
      [CoreStringKey.Error_RequiredField]: 'このフィールドは必須です',
      [CoreStringKey.Error_InvalidContextTemplate]: '無効なコンテキスト：{contextKey}',

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
    },

    [CoreLanguage.Ukrainian]: {
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

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: 'Надано неправильний ввід',
      [CoreStringKey.Error_NetworkError]: "Помилка мережевого з'єднання",
      [CoreStringKey.Error_NotFound]: 'Ресурс не знайдено',
      [CoreStringKey.Error_AccessDenied]: 'Доступ заборонено',
      [CoreStringKey.Error_InternalServer]: 'Внутрішня помилка сервера',
      [CoreStringKey.Error_ValidationFailed]: 'Перевірка не вдалася',
      [CoreStringKey.Error_RequiredField]: "Це поле є обов'язковим",
      [CoreStringKey.Error_InvalidContextTemplate]: 'Неправильний контекст: {contextKey}',

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
    },
  });
}

/**
 * Create core component registration
 */
export function createCoreComponentRegistration(): ComponentRegistration<
  CoreStringKey,
  CoreLanguage
> {
  return {
    component: CoreComponentDefinition,
    strings: createCoreComponentStrings(),
  };
}

/**
 * Create a pre-configured I18n engine with core components
 */
export function createCoreI18nEngine(
  instanceKey: string = 'default',
): PluginI18nEngine<CoreLanguage> {
  const languages = createDefaultLanguages();
  const engine = PluginI18nEngine.createInstance<CoreLanguage>(
    instanceKey,
    languages,
  );
  engine.registerComponent(createCoreComponentRegistration());
  return engine;
}

/**
 * Type alias for easier usage
 */
export type CoreI18nEngine = PluginI18nEngine<CoreLanguage>;

/**
 * Helper function to get core translation
 */
export function getCoreTranslation(
  stringKey: CoreStringKey,
  variables?: Record<string, string | number>,
  language?: CoreLanguage,
  instanceKey?: string,
): string {
  const engine = PluginI18nEngine.getInstance<CoreLanguage>(instanceKey);
  return engine.translate('core', stringKey, variables, language);
}

/**
 * Helper function to safely get core translation with fallback
 */
export function safeCoreTranslation(
  stringKey: CoreStringKey,
  variables?: Record<string, string | number>,
  language?: CoreLanguage,
  instanceKey?: string,
): string {
  try {
    return getCoreTranslation(stringKey, variables, language, instanceKey);
  } catch {
    return `[core.${stringKey}]`;
  }
}
