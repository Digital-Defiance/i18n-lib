/**
 * Core I18n Engine interface
 */

import { ComponentConfig } from './component-config.interface';
import { LanguageDefinition } from './language-definition.interface';
import { TranslationOptions } from './translation-options.interface';
import { ValidationResult } from './validation-result.interface';

export interface II18nEngine {
  // Component management
  register(config: ComponentConfig): ValidationResult;
  registerIfNotExists(config: ComponentConfig): ValidationResult;
  updateStrings(componentId: string, strings: Record<string, Record<string, string>>): ValidationResult;
  hasComponent(componentId: string): boolean;
  getComponents(): readonly ComponentConfig[];

  // Translation
  translate(componentId: string, key: string, variables?: Record<string, any>, language?: string): string;
  safeTranslate(componentId: string, key: string, variables?: Record<string, any>, language?: string): string;
  t(template: string, variables?: Record<string, any>, language?: string): string;

  // Language management
  registerLanguage(language: LanguageDefinition): void;
  setLanguage(language: string): void;
  setAdminLanguage(language: string): void;
  getLanguages(): readonly LanguageDefinition[];
  hasLanguage(language: string): boolean;

  // Context management
  switchToAdmin(): void;
  switchToUser(): void;
  getCurrentLanguage(): string;

  // Validation
  validate(): ValidationResult;
}
