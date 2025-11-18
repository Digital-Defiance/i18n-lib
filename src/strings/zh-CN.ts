import { CoreStringKey } from '../core-string-key';

export const mandarinStrings: Record<CoreStringKey, string> = {
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
    };