/**
 * Core I18n Engine interface
 */

import { ComponentConfig } from './component-config.interface';
import { LanguageDefinition } from './language-definition.interface';
import { TranslationOptions } from './translation-options.interface';
import { ValidationResult } from './validation-result.interface';

/**
 * Main interface for the I18n engine, defining all translation and management operations.
 */
export interface II18nEngine {
  // Component management
  /** Registers a new component with its translations */
  register(config: ComponentConfig): ValidationResult;
  /** Registers a component only if it doesn't already exist */
  registerIfNotExists(config: ComponentConfig): ValidationResult;
  /** Updates strings for an existing component */
  updateStrings(componentId: string, strings: Record<string, Record<string, string>>): ValidationResult;
  /** Checks if a component is registered */
  hasComponent(componentId: string): boolean;
  /** Gets all registered components */
  getComponents(): readonly ComponentConfig[];

  // Translation
  /** Translates a string key for a component */
  translate(componentId: string, key: string, variables?: Record<string, any>, language?: string): string;
  /** Safely translates a string key, returning a fallback on error */
  safeTranslate(componentId: string, key: string, variables?: Record<string, any>, language?: string): string;
  /** Template processor that handles embedded component.key patterns */
  t(template: string, variables?: Record<string, any>, language?: string): string;

  // Language management
  /** Registers a new language */
  registerLanguage(language: LanguageDefinition): void;
  /** Sets the current user-facing language */
  setLanguage(language: string): void;
  /** Sets the administrative language */
  setAdminLanguage(language: string): void;
  /** Gets all registered languages */
  getLanguages(): readonly LanguageDefinition[];
  /** Checks if a language is registered */
  hasLanguage(language: string): boolean;

  // Context management
  /** Switches to admin context */
  switchToAdmin(): void;
  /** Switches to user context */
  switchToUser(): void;
  /** Gets the currently active language based on context */
  getCurrentLanguage(): string;

  // Validation
  /** Validates all registered components */
  validate(): ValidationResult;
}
