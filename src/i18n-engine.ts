import { EnumTranslationRegistry } from './enum-registry';
import { createTemplateProcessor } from './template';
import { EnumLanguageTranslation, I18nConfig, I18nContext } from './types';
import { isTemplate, replaceVariables } from './utils';

export class I18nEngine<
  TStringKey extends string,
  TLanguage extends string,
  TConstants extends Record<string, any> = Record<string, any>,
  TContext extends string = string,
> {
  /**
   * Registry for enum translations
   */
  protected enumRegistry: EnumTranslationRegistry<TLanguage>;
  /**
   * Configuration for the i18n engine
   */
  public readonly config: I18nConfig<
    TStringKey,
    TLanguage,
    TConstants,
    TContext
  >;

  /**
   * Static instances for semi-singleton pattern
   */
  private static _instances = new Map<string, I18nEngine<any, any, any, any>>();
  /**
   * Default instance key (first created instance)
   */
  private static _defaultKey: string | null = null;
  /**
   * Default instance key if none is provided
   */
  protected static readonly DefaultInstanceKey = 'default';

  /**
   * Global context for translations (used if no context is provided) for this instance
   */
  private _context: I18nContext<TLanguage, TContext>;

  /**
   * Default template processor instance
   */
  public readonly t: (
    key: TStringKey,
    vars?: Record<string, string | number>,
    language?: TLanguage,
  ) => string;

  /**
   * Creates a new I18nEngine instance
   * @param config The i18n configuration
   * @param key Optional instance key for the semi-singleton pattern
   * @throws Error if an instance with the same key already exists
   */
  constructor(
    config: I18nConfig<TStringKey, TLanguage, TConstants, TContext>,
    key?: string,
  ) {
    this.config = config;
    this.enumRegistry = new EnumTranslationRegistry<TLanguage>();
    this._context = {
      language: config.defaultLanguage,
      adminLanguage: config.defaultLanguage,
      currentContext: config.defaultContext,
    };

    const instanceKey = key || I18nEngine.DefaultInstanceKey;
    if (I18nEngine._instances.has(instanceKey)) {
      const existing = I18nEngine._instances.get(instanceKey)!;
      throw new Error(
        existing.translate('Error_InstanceAlreadyExistsTemplate' as any, {
          key: instanceKey,
        }),
      );
    }
    I18nEngine._instances.set(instanceKey, this);
    if (!I18nEngine._defaultKey) {
      I18nEngine._defaultKey = instanceKey;
    }

    // Initialize the default template processor
    this.t = createTemplateProcessor(
      this.config.enumObj || ({} as Record<string, TStringKey>),
      (
        key: TStringKey,
        vars?: Record<string, string | number>,
        language?: TLanguage,
      ) => this.translate(key, vars, language),
      this.config.enumName || 'StringKey',
    ) as any;
  }

  /**
   * Gets an instance of the I18nEngine by key. If no key is provided, the default instance is returned.
   * @param key The key of the instance to retrieve
   * @returns The I18nEngine instance
   * @throws Error if the instance with the provided key does not exist
   */
  public static getInstance<T extends I18nEngine<any, any, any, any>>(
    key?: string,
  ): T {
    const instanceKey =
      key || I18nEngine._defaultKey || I18nEngine.DefaultInstanceKey;
    if (!instanceKey || !I18nEngine._instances.has(instanceKey)) {
      throw new Error(
        I18nEngine.getErrorMessage('Error_InstanceNotFoundTemplate', {
          key: instanceKey,
        }),
      );
    }
    return I18nEngine._instances.get(instanceKey) as T;
  }

  /**
   * Gets a translation for the provided error key using the specified instance (or default instance if none is provided).
   * @param errorKey The error key to translate
   * @param vars Variables to replace in the translation string
   * @param instanceKey The key of the I18nEngine instance to use
   * @param language The language to translate to
   * @param fallbackLanguage The fallback language if the translation is not found
   * @returns The translated error message
   */
  public static getErrorMessage(
    errorKey: string,
    vars?: Record<string, string | number>,
    instanceKey?: string,
    language?: string,
    fallbackLanguage?: string,
  ): string {
    try {
      const instance = I18nEngine.getInstance(instanceKey);
      return instance.translate(
        errorKey as any,
        vars,
        language,
        fallbackLanguage,
      );
    } catch {
      return `${errorKey}: ${JSON.stringify(vars || {})}`;
    }
  }

  /**
   * Throws an error with a translated message using the specified instance (or default instance if none is provided).
   * @param errorKey The error key to translate
   * @param vars Variables to replace in the translation string
   * @param instanceKey The key of the I18nEngine instance to use
   * @throws Error with translated message
   */
  public static throwError(
    errorKey: string,
    vars?: Record<string, string | number>,
    instanceKey?: string,
  ): never {
    throw new Error(I18nEngine.getErrorMessage(errorKey, vars, instanceKey));
  }

  /**
   * Gets the global context for translations
   * @returns The global context object
   */
  get context(): I18nContext<TLanguage, TContext> {
    return this._context;
  }

  /**
   * Sets the global context for translations (used if no context is provided) for this instance
   * @param context The context to set
   */
  set context(context: Partial<I18nContext<TLanguage, TContext>>) {
    this._context = { ...this._context, ...context } as I18nContext<
      TLanguage,
      TContext
    >;
  }

  /**
   * Translates a string key into the specified language, replacing any variables as needed.
   * @param key The string key to translate
   * @param vars Variables to replace in the translation string
   * @param language The language to translate to
   * @param fallbackLanguage The fallback language if the translation is not found
   * @returns The translated string
   */
  translate(
    key: TStringKey,
    vars?: Record<string, string | number>,
    language?: TLanguage,
    fallbackLanguage?: TLanguage,
  ): string {
    const lang =
      language ??
      (this._context.currentContext === 'admin'
        ? this._context.adminLanguage
        : this._context.language);
    const fallback = fallbackLanguage ?? this.config.defaultLanguage;

    try {
      const stringValue = this.getString(lang, key);
      return isTemplate(key)
        ? replaceVariables(stringValue, vars, this.config.constants)
        : stringValue;
    } catch {
      if (lang !== fallback) {
        try {
          const stringValue = this.getString(fallback, key);
          return isTemplate(key)
            ? replaceVariables(stringValue, vars, this.config.constants)
            : stringValue;
        } catch {
          return key;
        }
      }
      return key;
    }
  }

  /**
   * Translates an enumeration value into the specified language.
   * @param enumObj The enumeration object
   * @param value The enumeration value to translate
   * @param language The language to translate to
   * @returns The translated enumeration value
   */
  translateEnum<TEnum extends string | number>(
    enumObj: Record<string, TEnum>,
    value: TEnum,
    language: TLanguage,
  ): string {
    return this.enumRegistry.translate(enumObj, value, language);
  }

  /**
   * Registers an enumeration and its translations with the engine.
   * @param enumObj The enumeration object
   * @param translations The translations for the enumeration
   * @param enumName The name of the enumeration (for error messages)
   */
  registerEnum<TEnum extends string | number>(
    enumObj: Record<string, TEnum> | Record<string | number, string | number>,
    translations: EnumLanguageTranslation<TEnum, TLanguage>,
    enumName: string,
  ): void {
    this.enumRegistry.register(
      enumObj as Record<string, TEnum>,
      translations,
      enumName,
    );
  }

  /**
   * Safe translation that prevents infinite recursion for error messages
   * @param key The string key to translate
   * @param vars Variables to replace in the translation string
   * @param language The language to translate to
   * @returns The translated string or the key if translation fails
   */
  private safeTranslate(
    key: TStringKey,
    vars?: Record<string, string | number>,
    language?: TLanguage,
  ): string {
    try {
      const lang = language ?? this.config.defaultLanguage;
      const strings = this.config.strings[lang];
      if (!strings?.[key]) return key;
      const stringValue = strings[key];
      return isTemplate(key)
        ? replaceVariables(stringValue, vars, this.config.constants)
        : stringValue;
    } catch {
      return key;
    }
  }

  /**
   * Retrieves the string for the given language and key, throwing an error if not found.
   * @param language The language to get the string for
   * @param key The string key to retrieve
   * @returns The string value
   * @throws Error if the language or string key is not found
   */
  private getString(language: TLanguage, key: TStringKey): string {
    const strings = this.config.strings[language];
    if (!strings) {
      throw new Error(
        this.safeTranslate('Error_LanguageNotFound' as any, { language }) ||
          `Language not found: ${language}`,
      );
    }

    const value = strings[key];
    if (!value) {
      throw new Error(
        this.safeTranslate('Error_StringNotFound' as any, { key }) ||
          `String not found: ${key}`,
      );
    }

    return value;
  }

  /**
   * Gets the language code for the specified language.
   * @param language The language to get the code for
   * @returns The language code
   */
  getLanguageCode(language: TLanguage): string {
    return this.config.languageCodes[language] || language;
  }

  /**
   * Gets the language for the specified language code.
   * @param code The language code to look up
   * @returns The language, or undefined if not found
   */
  getLanguageFromCode(code: string): TLanguage | undefined {
    for (const [lang, langCode] of Object.entries(this.config.languageCodes)) {
      if (langCode === code) {
        return lang as TLanguage;
      }
    }
    return undefined;
  }

  /**
   * Gets all language codes.
   * @returns A record of all language codes
   */
  getAllLanguageCodes(): Record<TLanguage, string> {
    return this.config.languageCodes as Record<TLanguage, string>;
  }

  /**
   * Gets all available languages.
   * @returns An array of all available languages
   */
  getAvailableLanguages(): TLanguage[] {
    return Object.keys(this.config.strings) as TLanguage[];
  }

  /**
   * Checks if a language is available.
   * @param language The language to check
   * @returns True if the language is available, false otherwise
   */
  isLanguageAvailable(language: string): language is TLanguage {
    return Object.keys(this.config.strings).includes(language);
  }

  /**
   * Clears all instances (for testing purposes)
   * @internal
   */
  public static clearInstances(): void {
    I18nEngine._instances.clear();
    I18nEngine._defaultKey = null;
  }

  /**
   * Removes a specific instance by key
   * @param key The key of the instance to remove
   * @internal
   */
  public static removeInstance(key?: string): void {
    const instanceKey = key || I18nEngine.DefaultInstanceKey;
    I18nEngine._instances.delete(instanceKey);
    if (I18nEngine._defaultKey === instanceKey) {
      const nextKey = I18nEngine._instances.keys().next().value;
      I18nEngine._defaultKey = I18nEngine._instances.size > 0 && nextKey ? nextKey : null;
    }
  }
}
