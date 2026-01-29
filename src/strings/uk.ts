import { CoreStringKeys, CoreStringKeyValue } from '../core-string-key';

export const ukrainianStrings: Record<CoreStringKeyValue, string> = {
  // Common/General
  [CoreStringKeys.Common_Yes]: 'Так',
  [CoreStringKeys.Common_No]: 'Ні',
  [CoreStringKeys.Common_Cancel]: 'Скасувати',
  [CoreStringKeys.Common_OK]: 'OK',
  [CoreStringKeys.Common_Save]: 'Зберегти',
  [CoreStringKeys.Common_Delete]: 'Видалити',
  [CoreStringKeys.Common_Edit]: 'Редагувати',
  [CoreStringKeys.Common_Create]: 'Створити',
  [CoreStringKeys.Common_Update]: 'Оновити',
  [CoreStringKeys.Common_Loading]: 'Завантаження...',
  [CoreStringKeys.Common_Error]: 'Помилка',
  [CoreStringKeys.Common_Success]: 'Успіх',
  [CoreStringKeys.Common_Warning]: 'Попередження',
  [CoreStringKeys.Common_Info]: 'Інформація',
  [CoreStringKeys.Common_Disposed]: "Об'єкт було звільнено",
  [CoreStringKeys.Common_Test]: 'Тест',

  // Error Messages
  [CoreStringKeys.Error_InvalidInput]: 'Надано неправильний ввід',
  [CoreStringKeys.Error_NetworkError]: "Помилка мережевого з'єднання",
  [CoreStringKeys.Error_NotFound]: 'Ресурс не знайдено',
  [CoreStringKeys.Error_AccessDenied]: 'Доступ заборонено',
  [CoreStringKeys.Error_InternalServer]: 'Внутрішня помилка сервера',
  [CoreStringKeys.Error_ValidationFailed]: 'Перевірка не вдалася',
  [CoreStringKeys.Error_RequiredField]: "Це поле є обов'язковим",
  [CoreStringKeys.Error_InvalidContext]: 'Неправильний контекст',
  [CoreStringKeys.Error_InvalidContextTemplate]:
    'Неправильний контекст: {contextKey}',
  [CoreStringKeys.Error_MissingTranslationKeyTemplate]:
    'Відсутній ключ перекладу: {stringKey}',
  [CoreStringKeys.Error_InvalidCurrencyCodeTemplate]:
    'Неправильний код валюти: {value}',

  // Registry Error Templates
  [CoreStringKeys.Error_ComponentNotFoundTemplate]:
    'Компонент "{componentId}" не знайдено',
  [CoreStringKeys.Error_LanguageNotFoundTemplate]:
    'Мову "{language}" не знайдено',
  [CoreStringKeys.Error_StringKeyNotFoundTemplate]:
    'Ключ рядка "{stringKey}" не знайдено для компонента "{componentId}"',
  [CoreStringKeys.Error_IncompleteRegistrationTemplate]:
    'Неповна реєстрація для компонента "{componentId}": не вистачає {missingCount} рядків',
  [CoreStringKeys.Error_DuplicateComponentTemplate]:
    'Компонент "{componentId}" вже зареєстровано',
  [CoreStringKeys.Error_DuplicateLanguageTemplate]:
    'Мову "{languageId}" вже зареєстровано',
  [CoreStringKeys.Error_ValidationFailedTemplate]:
    'Перевірка не вдалася для компонента "{componentId}": {errorCount} помилок',

  // System Messages
  [CoreStringKeys.System_Welcome]: 'Ласкаво просимо',
  [CoreStringKeys.System_Goodbye]: 'До побачення',
  [CoreStringKeys.System_PleaseWait]: 'Будь ласка, зачекайте...',
  [CoreStringKeys.System_ProcessingRequest]: 'Обробка вашого запиту...',
  [CoreStringKeys.System_OperationComplete]: 'Операція успішно завершена',
  [CoreStringKeys.System_NoDataAvailable]: 'Дані недоступні',

  [CoreStringKeys.Error_InstanceAlreadyExistsTemplate]:
    "Екземпляр з ключем '{key}' вже існує",
  [CoreStringKeys.Error_InstanceNotFoundTemplate]:
    "Екземпляр з ключем '{key}' не знайдено",
  [CoreStringKeys.Error_MissingStringCollectionTemplate]:
    'Відсутня колекція рядків для мови: {language}',
  [CoreStringKeys.Error_MissingTranslationTemplate]:
    "Відсутній переклад для ключа '{key}' в мові '{language}'",
  [CoreStringKeys.Error_DefaultLanguageNoCollectionTemplate]:
    "Мова за замовчуванням '{language}' не має колекції рядків",
  [CoreStringKeys.Error_MissingTranslationKeyForTypeTemplate]:
    'Відсутній ключ перекладу для типу: {type}',
};
