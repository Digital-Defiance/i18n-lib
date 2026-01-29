import { CoreStringKeys, CoreStringKeyValue } from '../core-string-key';

export const mandarinStrings: Record<CoreStringKeyValue, string> = {
  // Common/General
  [CoreStringKeys.Common_Yes]: '是',
  [CoreStringKeys.Common_No]: '否',
  [CoreStringKeys.Common_Cancel]: '取消',
  [CoreStringKeys.Common_OK]: '确定',
  [CoreStringKeys.Common_Save]: '保存',
  [CoreStringKeys.Common_Delete]: '删除',
  [CoreStringKeys.Common_Edit]: '编辑',
  [CoreStringKeys.Common_Create]: '创建',
  [CoreStringKeys.Common_Update]: '更新',
  [CoreStringKeys.Common_Loading]: '加载中...',
  [CoreStringKeys.Common_Error]: '错误',
  [CoreStringKeys.Common_Success]: '成功',
  [CoreStringKeys.Common_Warning]: '警告',
  [CoreStringKeys.Common_Info]: '信息',
  [CoreStringKeys.Common_Disposed]: '对象已被释放',
  [CoreStringKeys.Common_Test]: '测试',

  // Error Messages
  [CoreStringKeys.Error_InvalidInput]: '提供的输入无效',
  [CoreStringKeys.Error_NetworkError]: '网络连接错误',
  [CoreStringKeys.Error_NotFound]: '未找到资源',
  [CoreStringKeys.Error_AccessDenied]: '访问被拒绝',
  [CoreStringKeys.Error_InternalServer]: '内部服务器错误',
  [CoreStringKeys.Error_ValidationFailed]: '验证失败',
  [CoreStringKeys.Error_RequiredField]: '此字段为必填项',
  [CoreStringKeys.Error_InvalidContext]: '无效的上下文',
  [CoreStringKeys.Error_InvalidContextTemplate]: '无效的上下文：{contextKey}',
  [CoreStringKeys.Error_MissingTranslationKeyTemplate]:
    '缺少翻译键：{stringKey}',
  [CoreStringKeys.Error_InvalidCurrencyCodeTemplate]: '无效的货币代码：{value}',

  // Registry Error Templates
  [CoreStringKeys.Error_ComponentNotFoundTemplate]:
    '未找到组件 "{componentId}"',
  [CoreStringKeys.Error_LanguageNotFoundTemplate]: '未找到语言 "{language}"',
  [CoreStringKeys.Error_StringKeyNotFoundTemplate]:
    '组件 "{componentId}" 未找到字符串键 "{stringKey}"',
  [CoreStringKeys.Error_IncompleteRegistrationTemplate]:
    '组件 "{componentId}" 注册不完整：缺少 {missingCount} 个字符串',
  [CoreStringKeys.Error_DuplicateComponentTemplate]:
    '组件 "{componentId}" 已注册',
  [CoreStringKeys.Error_DuplicateLanguageTemplate]:
    '语言 "{languageId}" 已注册',
  [CoreStringKeys.Error_ValidationFailedTemplate]:
    '组件 "{componentId}" 验证失败：{errorCount} 个错误',

  // System Messages
  [CoreStringKeys.System_Welcome]: '欢迎',
  [CoreStringKeys.System_Goodbye]: '再见',
  [CoreStringKeys.System_PleaseWait]: '请稍候...',
  [CoreStringKeys.System_ProcessingRequest]: '正在处理您的请求...',
  [CoreStringKeys.System_OperationComplete]: '操作成功完成',
  [CoreStringKeys.System_NoDataAvailable]: '无可用数据',

  [CoreStringKeys.Error_InstanceAlreadyExistsTemplate]:
    "键为'{key}'的实例已存在",
  [CoreStringKeys.Error_InstanceNotFoundTemplate]: "未找到键为'{key}'的实例",
  [CoreStringKeys.Error_MissingStringCollectionTemplate]:
    '缺少语言的字符串集合: {language}',
  [CoreStringKeys.Error_MissingTranslationTemplate]:
    "在语言'{language}'中缺少键'{key}'的翻译",
  [CoreStringKeys.Error_DefaultLanguageNoCollectionTemplate]:
    "默认语言'{language}'没有字符串集合",
  [CoreStringKeys.Error_MissingTranslationKeyForTypeTemplate]:
    '类型缺少翻译键: {type}',
};
