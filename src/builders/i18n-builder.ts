/**
 * Fluent builder for I18n Engine
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { I18nEngine } from '../core/i18n-engine';
import { EngineConfig, LanguageDefinition } from '../interfaces';

export class I18nBuilder {
  private languages: LanguageDefinition[] = [];
  private config: EngineConfig = {};
  private instanceKey = 'default';
  private registerInstance = true;
  private setAsDefault = true;

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withConstants(constants: Record<string, any>): this {
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

    return new I18nEngine(this.languages, this.config, {
      instanceKey: this.instanceKey,
      registerInstance: this.registerInstance,
      setAsDefault: this.setAsDefault,
    });
  }
}
