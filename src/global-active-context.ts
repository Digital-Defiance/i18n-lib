import { IActiveContext } from './active-context';
import { ContextError } from './context-error';
import { ContextErrorType } from './context-error-type';
import { CurrencyCode } from './currency-code';
import { DefaultLanguage } from './default-config';
import { IGlobalActiveContext } from './i-global-active-context';
import { Timezone } from './timezone';
import {
  DefaultCurrencyCode,
  DefaultTimezone,
  LanguageContextSpace,
} from './types';

export class GlobalActiveContext<TLanguage extends string, TActiveContext extends IActiveContext<TLanguage>> implements IGlobalActiveContext<TLanguage, TActiveContext> {
  protected static _contextMap: Map<string, IActiveContext<any>> = new Map();
  public static readonly defaultContextKey = 'default';
  public static readonly defaultLanguage: DefaultLanguage =
    DefaultLanguage.EnglishUS;

  private static _instance: GlobalActiveContext<any, any> | undefined;
  public static get instance(): GlobalActiveContext<any, any> {
    if (!this._instance) {
      this._instance = new GlobalActiveContext<any, any>();
      this._instance.createContext(this.defaultLanguage);
    }
    return this._instance;
  }
  public static getInstance<TLanguage extends string, TActiveContext extends IActiveContext<TLanguage>>(): GlobalActiveContext<TLanguage, TActiveContext> {
    if (!this._instance) {
      this._instance = new GlobalActiveContext<TLanguage, TActiveContext>();
      this._instance.createContext(this.defaultLanguage);
    }
    return this._instance as GlobalActiveContext<TLanguage, TActiveContext>;
  }
  public static overrideInstance(instance: GlobalActiveContext<any, any>): void {
    this._instance = instance;
  }

  public createContext(
    defaultLanguage: TLanguage,
    defaultAdminLanguage: TLanguage = defaultLanguage,
    key: string = GlobalActiveContext.defaultContextKey,
  ): TActiveContext {
    const newContext: IActiveContext<TLanguage> = {
      /**
       * The language to use for translations in the user facing ui
       */
      language: defaultLanguage,
      /**
       * The language to use for console/admin logs
       */
      adminLanguage: defaultAdminLanguage,
      currencyCode: new CurrencyCode(DefaultCurrencyCode),
      /**
       * The current default context for language translations
       */
      currentContext: 'user',
      /**
       * The timezone for the user facing UI
       */
      timezone: new Timezone(DefaultTimezone),
      /**
       * The timezone for the admin console
       */
      adminTimezone: new Timezone('UTC'),
    };

    GlobalActiveContext._contextMap.set(key, newContext);
    return newContext as TActiveContext;
  }

  public getContext(
    key: string = GlobalActiveContext.defaultContextKey,
  ): TActiveContext {
    const context = GlobalActiveContext._contextMap.get(
      key,
    ) as TActiveContext;
    if (context) {
      return context;
    }
    throw new ContextError(ContextErrorType.InvalidContext, key);
  }

  public get context(): TActiveContext {
    return this.getContext(
      GlobalActiveContext.defaultContextKey,
    );
  }

  public set context(ctx: TActiveContext) {
    GlobalActiveContext._contextMap.set(
      GlobalActiveContext.defaultContextKey,
      ctx,
    );
  }

  public setUserLanguage<StringLanguage extends string>(
    language: StringLanguage,
    key: string = GlobalActiveContext.defaultContextKey,
  ): void {
    const context = GlobalActiveContext._contextMap.get(
      key,
    ) as IActiveContext<StringLanguage>;
    if (context) {
      context.language = language;
      return;
    }
    throw new ContextError(ContextErrorType.InvalidContext, key);
  }

  public get userLanguage(): TLanguage {
    return this.context.language;
  }

  public set userLanguage(lang: TLanguage) {
    this.context.language = lang;
  }

  public setCurrencyCode<StringLanguage extends string>(
    code: CurrencyCode,
    key: string = GlobalActiveContext.defaultContextKey,
  ): void {
    const context = GlobalActiveContext._contextMap.get(
      key,
    ) as IActiveContext<StringLanguage>;
    if (context) {
      context.currencyCode = code;
      return;
    }
    throw new ContextError(ContextErrorType.InvalidContext, key);
  }

  public get currencyCode(): CurrencyCode {
    return this.context.currencyCode;
  }

  public set currencyCode(code: CurrencyCode) {
    this.context.currencyCode = code;
  }

  /**
   * Sets the admin language for console operations
   * @param language The language to set for admin operations
   */
  public setAdminLanguage<StringLanguage extends string>(
    language: StringLanguage,
    key: string = GlobalActiveContext.defaultContextKey,
  ): void {
    const context = GlobalActiveContext._contextMap.get(
      key,
    ) as IActiveContext<StringLanguage>;
    if (context) {
      context.adminLanguage = language;
      return;
    }
    throw new ContextError(ContextErrorType.InvalidContext, key);
  }

  public get adminLanguage(): TLanguage {
    return this.context.adminLanguage;
  }

  public set adminLanguage(lang: TLanguage) {
    this.context.adminLanguage = lang;
  }

  /**
   * Sets the language context for the current context
   * @param context The language context to set
   */
  public setLanguageContextSpace<StringLanguage extends string>(
    context: LanguageContextSpace,
    key: string = GlobalActiveContext.defaultContextKey,
  ): void {
    const ctx = GlobalActiveContext._contextMap.get(
      key,
    ) as IActiveContext<StringLanguage>;
    if (ctx) {
      ctx.currentContext = context;
      return;
    }
    throw new ContextError(ContextErrorType.InvalidContext, key);
  }

  public getLanguageContextSpace<StringLanguage extends string>(
    key: string = GlobalActiveContext.defaultContextKey,
  ): LanguageContextSpace {
    const ctx = GlobalActiveContext._contextMap.get(
      key,
    ) as IActiveContext<StringLanguage>;
    if (ctx) {
      return ctx.currentContext;
    }
    throw new ContextError(ContextErrorType.InvalidContext, key);
  }

  public get languageContextSpace(): LanguageContextSpace {
    return this.context.currentContext;
  }

  public set languageContextSpace(context: LanguageContextSpace) {
    this.context.currentContext = context;
  }

  public setUserTimezone<StringLanguage extends string>(
    tz: Timezone,
    key: string = GlobalActiveContext.defaultContextKey,
  ): void {
    const ctx = GlobalActiveContext._contextMap.get(
      key,
    ) as IActiveContext<StringLanguage>;
    if (ctx) {
      ctx.timezone = tz;
      return;
    }
    throw new ContextError(ContextErrorType.InvalidContext, key);
  }

  public get userTimezone(): Timezone {
    return this.context.timezone;
  }

  public set userTimezone(tz: Timezone) {
    this.context.timezone = tz;
  }

  public setAdminTimezone<StringLanguage extends string>(
    tz: Timezone,
    key: string = GlobalActiveContext.defaultContextKey,
  ): void {
    const ctx = GlobalActiveContext._contextMap.get(
      key,
    ) as IActiveContext<StringLanguage>;
    if (ctx) {
      ctx.adminTimezone = tz;
      return;
    }
    throw new ContextError(ContextErrorType.InvalidContext, key);
  }

  public get adminTimezone(): Timezone {
    return this.context.adminTimezone;
  }

  public set adminTimezone(tz: Timezone) {
    this.context.adminTimezone = tz;
  }
}
