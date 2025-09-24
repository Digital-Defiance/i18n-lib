import { I18nContext, LanguageContext } from './types';

export function createContext<
  TLanguage extends string,
  TContext extends string = LanguageContext,
>(
  defaultLanguage: TLanguage,
  defaultContext: TContext,
): I18nContext<TLanguage, TContext> {
  return {
    language: defaultLanguage,
    adminLanguage: defaultLanguage,
    currentContext: defaultContext,
  };
}

export function setLanguage<
  TLanguage extends string,
  TContext extends string = LanguageContext,
>(context: I18nContext<TLanguage, TContext>, language: TLanguage): void {
  context.language = language;
}

export function setAdminLanguage<
  TLanguage extends string,
  TContext extends string = LanguageContext,
>(context: I18nContext<TLanguage, TContext>, language: TLanguage): void {
  context.adminLanguage = language;
}

export function setContext<
  TLanguage extends string,
  TContext extends string = LanguageContext,
>(context: I18nContext<TLanguage, TContext>, languageContext: TContext): void {
  context.currentContext = languageContext;
}
