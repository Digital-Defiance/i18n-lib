/**
 * Core I18n Engine interface
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  AnyBrandedEnum,
  BrandedEnumValue,
} from '@digitaldefiance/branded-enum';
import type { BrandedInterfaceDefinition } from '@digitaldefiance/branded-interface';
import { ComponentConfig } from './component-config.interface';
import type { II18nConstants } from './i18n-constants.interface';
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
   * @param componentId - Optional explicit component ID (escape hatch for cross-module scenarios)
   * @returns The extracted or provided component ID
   */
  registerStringKeyEnum(
    stringKeyEnum: AnyBrandedEnum,
    componentId?: string,
  ): string;

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

  // Constants Registration

  /**
   * Registers constants for a component.
   * Constants are available as template variables in all translations.
   * Registration is idempotent per component ID.
   * @param componentId - The component registering these constants
   * @param constants - Key-value pairs to register
   * @throws {I18nError} If a key conflict is detected (CONSTANT_CONFLICT)
   */
  registerConstants<T extends II18nConstants>(
    componentId: string,
    constants: T,
    schema?: BrandedInterfaceDefinition<T>,
  ): void;

  /**
   * Registers a deferred schema for a component that doesn't have constants yet.
   * The schema will be applied when constants are later registered via registerConstants().
   * @param componentId - The component to associate the schema with
   * @param schema - The branded interface definition for validation
   */
  registerDeferredSchema(
    componentId: string,
    schema: BrandedInterfaceDefinition,
  ): void;

  /**
   * Updates/overrides constants for a component, merging new values.
   * Use this when the app needs to override library defaults at runtime
   * (e.g., replacing a default Site name with the real one).
   * @param componentId - The component updating these constants
   * @param constants - Key-value pairs to merge (overrides existing keys)
   */
  updateConstants<T extends II18nConstants>(
    componentId: string,
    constants: T,
  ): void;

  /**
   * Checks if constants are registered for a component.
   */
  hasConstants(componentId: string): boolean;

  /**
   * Gets the constants registered for a specific component.
   */
  getConstants(componentId: string): Readonly<II18nConstants> | undefined;

  /**
   * Gets all registered constants entries with their component IDs.
   */
  getAllConstants(): readonly {
    componentId: string;
    constants: Readonly<II18nConstants>;
  }[];

  /**
   * Resolves which component owns a given constant key.
   * Returns null if the key is not registered.
   */
  resolveConstantOwner(key: string): string | null;
}
