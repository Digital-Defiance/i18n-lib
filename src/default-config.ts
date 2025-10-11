import { CurrencyCode } from './currency-code';
import { I18nConfig } from './i18n-config';
import { I18nContext } from './i18n-context';
import { I18nEngine } from './i18n-engine';
import { Timezone } from './timezone';
import {
  DefaultCurrencyCode,
  LanguageCodeCollection,
  LanguageContext,
} from './types';

// Default enum types that can be augmented by consumers
export enum DefaultStringKey {
  Common_Test = 'common_test',
  Error_InstanceAlreadyExistsTemplate = 'error_instanceAlreadyExistsTemplate',
  Error_InstanceNotFoundTemplate = 'error_instanceNotFoundTemplate',
  Error_MissingStringCollectionTemplate = 'error_missingStringCollectionTemplate',
  Error_MissingTranslationTemplate = 'error_missingTranslationTemplate',
  Error_DefaultLanguageNoCollectionTemplate = 'error_defaultLanguageNoCollectionTemplate',
  Error_MissingTranslationKeyTemplate = 'error_missingTranslationKeyTemplate',
}

export enum DefaultLanguage {
  EnglishUS = 'English (US)',
  EnglishUK = 'English (UK)',
  French = 'Français',
  MandarinChinese = '中文',
  Spanish = 'Español',
  Ukrainian = 'Український',
}

export const DefaultLanguageCodes: LanguageCodeCollection<DefaultLanguage> = {
  [DefaultLanguage.EnglishUS]: 'en',
  [DefaultLanguage.EnglishUK]: 'en-GB',
  [DefaultLanguage.French]: 'fr',
  [DefaultLanguage.MandarinChinese]: 'zh-CN',
  [DefaultLanguage.Spanish]: 'es',
  [DefaultLanguage.Ukrainian]: 'uk',
};

// Global interface that can be augmented by consumers
declare global {
  namespace I18n {
    interface Config {
      StringKey: DefaultStringKey;
      Language: DefaultLanguage;
      LanguageCodes: LanguageCodeCollection<DefaultLanguage>;
      engine: I18nEngine<
        I18n.Config['StringKey'],
        I18n.Config['Language'],
        Record<any, any>,
        string
      >;
    }
  }
}

// Convenient type aliases that automatically pick up augmented types
export type StringKey = I18n.Config['StringKey'];
export type Language = I18n.Config['Language'];
export type Engine = I18n.Config['engine'];
export type LanguageCodes = I18n.Config['LanguageCodes'];

// Singleton instance that uses the augmented types
export const getI18nEngine = (): Engine => I18nEngine.getInstance() as Engine;

const getConfig = <
  TConstants extends Record<string, any>,
  TTranslationContext extends string = LanguageContext,
>(
  constants: TConstants,
  timezone?: Timezone,
  adminTimezone?: Timezone,
): I18nConfig<StringKey, Language, TConstants, TTranslationContext> => ({
  strings: {
    [DefaultLanguage.EnglishUS]: {
      [DefaultStringKey.Common_Test]: 'Test',
      [DefaultStringKey.Error_InstanceAlreadyExistsTemplate]:
        "Instance with key '{key}' already exists",
      [DefaultStringKey.Error_InstanceNotFoundTemplate]:
        "Instance with key '{key}' not found",
      [DefaultStringKey.Error_MissingStringCollectionTemplate]:
        'Missing string collection for language: {language}',
      [DefaultStringKey.Error_MissingTranslationTemplate]:
        "Missing translation for key '{key}' in language '{language}'",
      [DefaultStringKey.Error_DefaultLanguageNoCollectionTemplate]:
        "Default language '{language}' has no string collection",
      [DefaultStringKey.Error_MissingTranslationKeyTemplate]:
        'Missing translation key for type: {type}',
    },
    [DefaultLanguage.EnglishUK]: {
      [DefaultStringKey.Common_Test]: 'Test',
      [DefaultStringKey.Error_InstanceAlreadyExistsTemplate]:
        "Instance with key '{key}' already exists",
      [DefaultStringKey.Error_InstanceNotFoundTemplate]:
        "Instance with key '{key}' not found",
      [DefaultStringKey.Error_MissingStringCollectionTemplate]:
        'Missing string collection for language: {language}',
      [DefaultStringKey.Error_MissingTranslationTemplate]:
        "Missing translation for key '{key}' in language '{language}'",
      [DefaultStringKey.Error_DefaultLanguageNoCollectionTemplate]:
        "Default language '{language}' has no string collection",
      [DefaultStringKey.Error_MissingTranslationKeyTemplate]:
        'Missing translation key for type: {type}',
    },
    [DefaultLanguage.French]: {
      [DefaultStringKey.Common_Test]: 'Test',
      [DefaultStringKey.Error_InstanceAlreadyExistsTemplate]:
        "Instance avec clé '{key}' existe déjà",
      [DefaultStringKey.Error_InstanceNotFoundTemplate]:
        "Instance avec clé '{key}' introuvable",
      [DefaultStringKey.Error_MissingStringCollectionTemplate]:
        'Collection de chaînes manquante pour la langue: {language}',
      [DefaultStringKey.Error_MissingTranslationTemplate]:
        "Traduction manquante pour la clé '{key}' dans la langue '{language}'",
      [DefaultStringKey.Error_DefaultLanguageNoCollectionTemplate]:
        "La langue par défaut '{language}' n'a pas de collection de chaînes",
      [DefaultStringKey.Error_MissingTranslationKeyTemplate]:
        'Clé de traduction manquante pour le type: {type}',
    },
    [DefaultLanguage.MandarinChinese]: {
      [DefaultStringKey.Common_Test]: '测试',
      [DefaultStringKey.Error_InstanceAlreadyExistsTemplate]:
        "键为'{key}'的实例已存在",
      [DefaultStringKey.Error_InstanceNotFoundTemplate]:
        "未找到键为'{key}'的实例",
      [DefaultStringKey.Error_MissingStringCollectionTemplate]:
        '缺少语言的字符串集合: {language}',
      [DefaultStringKey.Error_MissingTranslationTemplate]:
        "在语言'{language}'中缺少键'{key}'的翻译",
      [DefaultStringKey.Error_DefaultLanguageNoCollectionTemplate]:
        "默认语言'{language}'没有字符串集合",
      [DefaultStringKey.Error_MissingTranslationKeyTemplate]:
        '类型缺少翻译键: {type}',
    },
    [DefaultLanguage.Spanish]: {
      [DefaultStringKey.Common_Test]: 'Prueba',
      [DefaultStringKey.Error_InstanceAlreadyExistsTemplate]:
        "La instancia con clave '{key}' ya existe",
      [DefaultStringKey.Error_InstanceNotFoundTemplate]:
        "Instancia con clave '{key}' no encontrada",
      [DefaultStringKey.Error_MissingStringCollectionTemplate]:
        'Falta colección de cadenas para el idioma: {language}',
      [DefaultStringKey.Error_MissingTranslationTemplate]:
        "Falta traducción para la clave '{key}' en el idioma '{language}'",
      [DefaultStringKey.Error_DefaultLanguageNoCollectionTemplate]:
        "El idioma predeterminado '{language}' no tiene colección de cadenas",
      [DefaultStringKey.Error_MissingTranslationKeyTemplate]:
        'Falta clave de traducción para el tipo: {type}',
    },
    [DefaultLanguage.Ukrainian]: {
      [DefaultStringKey.Common_Test]: 'Тест',
      [DefaultStringKey.Error_InstanceAlreadyExistsTemplate]:
        "Екземпляр з ключем '{key}' вже існує",
      [DefaultStringKey.Error_InstanceNotFoundTemplate]:
        "Екземпляр з ключем '{key}' не знайдено",
      [DefaultStringKey.Error_MissingStringCollectionTemplate]:
        'Відсутня колекція рядків для мови: {language}',
      [DefaultStringKey.Error_MissingTranslationTemplate]:
        "Відсутній переклад для ключа '{key}' в мові '{language}'",
      [DefaultStringKey.Error_DefaultLanguageNoCollectionTemplate]:
        "Мова за замовчуванням '{language}' не має колекції рядків",
      [DefaultStringKey.Error_MissingTranslationKeyTemplate]:
        'Відсутній ключ перекладу для типу: {type}',
    },
  } as any,
  stringNames: Object.values(DefaultStringKey),
  defaultLanguage: DefaultLanguage.EnglishUS,
  defaultTranslationContext: 'user' as TTranslationContext,
  defaultCurrencyCode: new CurrencyCode(DefaultCurrencyCode),
  languageCodes: DefaultLanguageCodes,
  languages: Object.values(DefaultLanguage),
  constants: constants,
  enumName: 'DefaultStringKey',
  enumObj: DefaultStringKey as Record<string, DefaultStringKey>,
  timezone: timezone ?? new Timezone('UTC'),
  adminTimezone: adminTimezone ?? new Timezone('UTC'),
});

export const getDefaultI18nEngine = <
  TConstants extends Record<string, any>,
  TTranslationContext extends string,
  TContext extends I18nContext<DefaultLanguage, TTranslationContext>,
>(
  constants: TConstants,
  timezone?: Timezone,
  adminTimezone?: Timezone,
) =>
  new I18nEngine<
    DefaultStringKey,
    DefaultLanguage,
    TConstants,
    TTranslationContext,
    TContext
  >(
    getConfig<TConstants, TTranslationContext>(
      constants,
      timezone,
      adminTimezone,
    ),
    'user' as TTranslationContext,
  );
