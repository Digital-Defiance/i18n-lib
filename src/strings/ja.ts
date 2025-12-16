import { CoreStringKey } from '../core-string-key';

export const japaneseStrings: Record<CoreStringKey, string> = {
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
  [CoreStringKey.Error_InvalidCurrencyCodeTemplate]:
    '無効な通貨コード：{value}',

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
};
