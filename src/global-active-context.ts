import { ContextErrorType } from './context-error-type';
import { ContextError } from './errors/context-error';
import type { IActiveContext } from './interfaces/active-context.interface';
import type { IGlobalActiveContext } from './interfaces/global-active-context';
import {
  DefaultCurrencyCode,
  DefaultTimezone,
  LanguageContextSpace,
} from './types';
import { CurrencyCode } from './utils/currency';
import { Timezone } from './utils/timezone';

export class GlobalActiveContext<
  TLanguage extends string,
  TActiveContext extends IActiveContext<TLanguage>,
> implements IGlobalActiveContext<TLanguage, TActiveContext>
{
  protected static _contextMap: Map<string, IActiveContext<any>> = new Map();
  public static readonly defaultContextKey = 'default';
  public static readonly defaultLanguage: string = 'en-US';

  private static _instance: GlobalActiveContext<any, any> | undefined;
  public static get instance(): GlobalActiveContext<any, any> {
    if (!this._instance) {
      this._instance = new GlobalActiveContext<any, any>();
      this._instance.createContext(this.defaultLanguage);
    }
    return this._instance;
  }

  // Register in globalThis for cross-module access
  static {
    if (typeof globalThis !== 'undefined') {
      globalThis.GlobalActiveContext = GlobalActiveContext;
    }
  }
  public static getInstance<
    TLanguage extends string,
    TActiveContext extends IActiveContext<TLanguage>,
  >(): GlobalActiveContext<TLanguage, TActiveContext> {
    if (!this._instance) {
      this._instance = new GlobalActiveContext<TLanguage, TActiveContext>();
      this._instance.createContext(this.defaultLanguage);
    }
    return this._instance as GlobalActiveContext<TLanguage, TActiveContext>;
  }
  public static overrideInstance(
    instance: GlobalActiveContext<any, any>,
  ): void {
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
    const context = GlobalActiveContext._contextMap.get(key) as TActiveContext;
    if (context) {
      return context;
    }
    throw new ContextError(ContextErrorType.InvalidContext, key);
  }

  public get context(): TActiveContext {
    return this.getContext(GlobalActiveContext.defaultContextKey);
  }

  public set context(ctx: TActiveContext) {
    GlobalActiveContext._contextMap.set(
      GlobalActiveContext.defaultContextKey,
      ctx,
    );
  }

  public setUserLanguage(
    language: TLanguage,
    key: string = GlobalActiveContext.defaultContextKey,
  ): void {
    const context = GlobalActiveContext._contextMap.get(
      key,
    ) as IActiveContext<TLanguage>;
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

  public setCurrencyCode(
    code: CurrencyCode,
    key: string = GlobalActiveContext.defaultContextKey,
  ): void {
    const context = GlobalActiveContext._contextMap.get(
      key,
    ) as IActiveContext<TLanguage>;
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
  public setAdminLanguage(
    language: TLanguage,
    key: string = GlobalActiveContext.defaultContextKey,
  ): void {
    const context = GlobalActiveContext._contextMap.get(
      key,
    ) as IActiveContext<TLanguage>;
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
  public setLanguageContextSpace(
    context: LanguageContextSpace,
    key: string = GlobalActiveContext.defaultContextKey,
  ): void {
    const ctx = GlobalActiveContext._contextMap.get(
      key,
    ) as IActiveContext<TLanguage>;
    if (ctx) {
      ctx.currentContext = context;
      return;
    }
    throw new ContextError(ContextErrorType.InvalidContext, key);
  }

  public getLanguageContextSpace(
    key: string = GlobalActiveContext.defaultContextKey,
  ): LanguageContextSpace {
    const ctx = GlobalActiveContext._contextMap.get(
      key,
    ) as IActiveContext<TLanguage>;
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

  public setUserTimezone(
    tz: Timezone,
    key: string = GlobalActiveContext.defaultContextKey,
  ): void {
    const ctx = GlobalActiveContext._contextMap.get(
      key,
    ) as IActiveContext<TLanguage>;
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

  public setAdminTimezone(
    tz: Timezone,
    key: string = GlobalActiveContext.defaultContextKey,
  ): void {
    const ctx = GlobalActiveContext._contextMap.get(
      key,
    ) as IActiveContext<TLanguage>;
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

  /**
   * Clear all contexts (useful for testing)
   */
  public static clearAll(): void {
    GlobalActiveContext._contextMap.clear();
    GlobalActiveContext._instance = undefined;
  }
}
