import type { LanguageContextSpace } from '../types';
import type { CurrencyCode } from '../utils/currency';
import type { Timezone } from '../utils/timezone';
import type { IActiveContext } from './active-context.interface';

export interface IGlobalActiveContext<
  TLanguage extends string,
  TActiveContext extends IActiveContext<TLanguage>,
> {
  context: TActiveContext;
  userLanguage: TLanguage;
  currencyCode: CurrencyCode;
  adminLanguage: TLanguage;
  languageContextSpace: LanguageContextSpace;
  userTimezone: Timezone;
  adminTimezone: Timezone;

  createContext(
    defaultLanguage: TLanguage,
    defaultAdminLanguage?: TLanguage,
    key?: string,
  ): TActiveContext;

  getContext(key?: string): TActiveContext;

  setUserLanguage(language: TLanguage, key?: string): void;

  setCurrencyCode(code: CurrencyCode, key?: string): void;

  setAdminLanguage(language: TLanguage, key?: string): void;

  setLanguageContextSpace(context: LanguageContextSpace, key?: string): void;

  getLanguageContextSpace(key?: string): LanguageContextSpace;

  setUserTimezone(tz: Timezone, key?: string): void;

  setAdminTimezone(tz: Timezone, key?: string): void;
}
