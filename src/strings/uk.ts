import { CoreStringKey } from '../core-string-key';

export const ukrainianStrings: Record<CoreStringKey, string> = {
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
  [CoreStringKey.Error_InvalidCurrencyCodeTemplate]:
    'Неправильний код валюти: {value}',

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
};
