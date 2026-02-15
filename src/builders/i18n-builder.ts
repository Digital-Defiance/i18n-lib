/**
 * Fluent builder for I18n Engine
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { AnyBrandedEnum } from '@digitaldefiance/branded-enum';
import { I18nEngine } from '../core/i18n-engine';
import {
  EngineConfig,
  II18nConstants,
  LanguageDefinition,
} from '../interfaces';

export class I18nBuilder {
  private languages: LanguageDefinition[] = [];
  private config: EngineConfig = {};
  private instanceKey = 'default';
  private registerInstance = true;
  private setAsDefault = true;
  private stringKeyEnums: AnyBrandedEnum[] = [];

  private constructor() {}

  static create(): I18nBuilder {
    return new I18nBuilder();
  }

  withLanguages(languages: readonly LanguageDefinition[]): this {
    this.languages = [...languages];
    return this;
  }

  withDefaultLanguage(languageId: string): this {
    this.config.defaultLanguage = languageId;
    return this;
  }

  withFallbackLanguage(languageId: string): this {
    this.config.fallbackLanguage = languageId;
    return this;
  }

  withConstants<T extends II18nConstants>(constants: T): this {
    this.config.constants = constants;
    return this;
  }

  withValidation(validation: EngineConfig['validation']): this {
    this.config.validation = validation;
    return this;
  }

  withInstanceKey(key: string): this {
    this.instanceKey = key;
    return this;
  }

  withRegisterInstance(register: boolean): this {
    this.registerInstance = register;
    return this;
  }

  withSetAsDefault(setDefault: boolean): this {
    this.setAsDefault = setDefault;
    return this;
  }

  /**
   * Register a branded string key enum for direct translation via translateStringKey().
   * Multiple enums can be registered by calling this method multiple times.
   * @param stringKeyEnum - Branded enum created by createI18nStringKeys or createI18nStringKeysFromEnum
   */
  withStringKeyEnum(stringKeyEnum: AnyBrandedEnum): this {
    this.stringKeyEnums.push(stringKeyEnum);
    return this;
  }

  /**
   * Register multiple branded string key enums for direct translation.
   * @param stringKeyEnums - Array of branded enums
   */
  withStringKeyEnums(stringKeyEnums: readonly AnyBrandedEnum[]): this {
    this.stringKeyEnums.push(...stringKeyEnums);
    return this;
  }

  isolated(): this {
    this.registerInstance = false;
    return this;
  }

  asDefault(): this {
    this.setAsDefault = true;
    return this;
  }

  build(): I18nEngine {
    if (this.languages.length === 0) {
      throw new Error('At least one language must be provided');
    }

    const engine = new I18nEngine(this.languages, this.config, {
      instanceKey: this.instanceKey,
      registerInstance: this.registerInstance,
      setAsDefault: this.setAsDefault,
    });

    // Register all string key enums
    for (const enumObj of this.stringKeyEnums) {
      engine.registerStringKeyEnum(enumObj);
    }

    return engine;
  }
}
