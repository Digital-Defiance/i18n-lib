/**
 * Core I18n Engine interface
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  AnyBrandedEnum,
  BrandedEnumValue,
} from '@digitaldefiance/branded-enum';
import { ComponentConfig } from './component-config.interface';
import { LanguageDefinition } from './language-definition.interface';
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
  updateStrings(
    componentId: string,
    strings: Record<string, Record<string, string>>,
  ): ValidationResult;
  /** Checks if a component is registered */
  hasComponent(componentId: string): boolean;
  /** Gets all registered components */
  getComponents(): readonly ComponentConfig[];

  // Translation
  /** Translates a string key for a component */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  translate(
    componentId: string,
    key: string,
    variables?: Record<string, any>,
    language?: string,
  ): string;
  /** Safely translates a string key, returning a fallback on error */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  safeTranslate(
    componentId: string,
    key: string,
    variables?: Record<string, any>,
    language?: string,
  ): string;
  /** Template processor that handles embedded component.key patterns */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t(
    template: string,
    variables?: Record<string, any>,
    language?: string,
  ): string;

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

  // String Key Enum Registration
  /**
   * Registers a branded string key enum for automatic component ID resolution.
   * @param stringKeyEnum - Branded enum created by createI18nStringKeys
   * @returns The extracted component ID
   */
  registerStringKeyEnum(stringKeyEnum: AnyBrandedEnum): string;

  /**
   * Translates a branded string key value directly.
   * Automatically resolves the component ID from the branded value.
   */
  translateStringKey<E extends AnyBrandedEnum>(
    stringKeyValue: BrandedEnumValue<E>,
    variables?: Record<string, unknown>,
    language?: string,
  ): string;

  /**
   * Safely translates a branded string key value.
   * Returns a placeholder on failure instead of throwing.
   */
  safeTranslateStringKey<E extends AnyBrandedEnum>(
    stringKeyValue: BrandedEnumValue<E>,
    variables?: Record<string, unknown>,
    language?: string,
  ): string;

  /**
   * Checks if a branded string key enum is registered.
   */
  hasStringKeyEnum(stringKeyEnum: AnyBrandedEnum): boolean;

  /**
   * Gets all registered string key enums with their component IDs.
   */
  getStringKeyEnums(): readonly {
    enumObj: AnyBrandedEnum;
    componentId: string;
  }[];
}
