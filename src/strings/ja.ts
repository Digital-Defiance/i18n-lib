import { CoreStringKeys, CoreStringKeyValue } from '../core-string-key';

export const japaneseStrings: Record<CoreStringKeyValue, string> = {
  // Common/General
  [CoreStringKeys.Common_Yes]: 'はい',
  [CoreStringKeys.Common_No]: 'いいえ',
  [CoreStringKeys.Common_Cancel]: 'キャンセル',
  [CoreStringKeys.Common_OK]: 'OK',
  [CoreStringKeys.Common_Save]: '保存',
  [CoreStringKeys.Common_Delete]: '削除',
  [CoreStringKeys.Common_Edit]: '編集',
  [CoreStringKeys.Common_Create]: '作成',
  [CoreStringKeys.Common_Update]: '更新',
  [CoreStringKeys.Common_Loading]: '読み込み中...',
  [CoreStringKeys.Common_Error]: 'エラー',
  [CoreStringKeys.Common_Success]: '成功',
  [CoreStringKeys.Common_Warning]: '警告',
  [CoreStringKeys.Common_Info]: '情報',
  [CoreStringKeys.Common_Disposed]: 'オブジェクトは破棄されました',
  [CoreStringKeys.Common_Test]: 'テスト',

  // Error Messages
  [CoreStringKeys.Error_InvalidInput]: '無効な入力が提供されました',
  [CoreStringKeys.Error_NetworkError]: 'ネットワーク接続エラー',
  [CoreStringKeys.Error_NotFound]: 'リソースが見つかりません',
  [CoreStringKeys.Error_AccessDenied]: 'アクセスが拒否されました',
  [CoreStringKeys.Error_InternalServer]: '内部サーバーエラー',
  [CoreStringKeys.Error_ValidationFailed]: '検証に失敗しました',
  [CoreStringKeys.Error_RequiredField]: 'このフィールドは必須です',
  [CoreStringKeys.Error_InvalidContext]: '無効なコンテキスト',
  [CoreStringKeys.Error_InvalidContextTemplate]:
    '無効なコンテキスト：{contextKey}',
  [CoreStringKeys.Error_MissingTranslationKeyTemplate]:
    '翻訳キーが見つかりません：{stringKey}',
  [CoreStringKeys.Error_InvalidCurrencyCodeTemplate]:
    '無効な通貨コード：{value}',

  // Registry Error Templates
  [CoreStringKeys.Error_ComponentNotFoundTemplate]:
    'コンポーネント "{componentId}" が見つかりません',
  [CoreStringKeys.Error_LanguageNotFoundTemplate]:
    '言語 "{language}" が見つかりません',
  [CoreStringKeys.Error_StringKeyNotFoundTemplate]:
    'コンポーネント "{componentId}" の文字列キー "{stringKey}" が見つかりません',
  [CoreStringKeys.Error_IncompleteRegistrationTemplate]:
    'コンポーネント "{componentId}" の登録が不完全です：{missingCount} 個の文字列が不足しています',
  [CoreStringKeys.Error_DuplicateComponentTemplate]:
    'コンポーネント "{componentId}" は既に登録されています',
  [CoreStringKeys.Error_DuplicateLanguageTemplate]:
    '言語 "{languageId}" は既に登録されています',
  [CoreStringKeys.Error_ValidationFailedTemplate]:
    'コンポーネント "{componentId}" の検証に失敗しました：{errorCount} 個のエラー',

  // System Messages
  [CoreStringKeys.System_Welcome]: 'ようこそ',
  [CoreStringKeys.System_Goodbye]: 'さようなら',
  [CoreStringKeys.System_PleaseWait]: 'お待ちください...',
  [CoreStringKeys.System_ProcessingRequest]: 'リクエストを処理中...',
  [CoreStringKeys.System_OperationComplete]: '操作が正常に完了しました',
  [CoreStringKeys.System_NoDataAvailable]: '利用可能なデータがありません',

  [CoreStringKeys.Error_InstanceAlreadyExistsTemplate]:
    "キー'{key}'のインスタンスは既に存在します",
  [CoreStringKeys.Error_InstanceNotFoundTemplate]:
    "キー'{key}'のインスタンスが見つかりません",
  [CoreStringKeys.Error_MissingStringCollectionTemplate]:
    '言語の文字列コレクションがありません: {language}',
  [CoreStringKeys.Error_MissingTranslationTemplate]:
    "言語'{language}'でキー'{key}'の翻訳がありません",
  [CoreStringKeys.Error_DefaultLanguageNoCollectionTemplate]:
    "デフォルト言語'{language}'に文字列コレクションがありません",
  [CoreStringKeys.Error_MissingTranslationKeyForTypeTemplate]:
    'タイプの翻訳キーがありません: {type}',
};
