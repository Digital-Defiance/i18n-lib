/**
 * Fluent builder for I18n Engine
 */

import { EngineConfig, LanguageDefinition } from '../interfaces';
import { I18nEngine } from '../core/i18n-engine';

export class I18nBuilder {
  private languages: LanguageDefinition[] = [];
  private config: EngineConfig = {};
  private instanceKey?: string;
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
