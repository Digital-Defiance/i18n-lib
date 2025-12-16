/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * I18n Engine type definitions
 *
 * This file provides type-safe interfaces for i18n engine implementations.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Generic I18n Engine interface with type-safe string key constraints
 *
 * This interface defines the core methods that any i18n engine implementation
 * should provide, with proper generic constraints for string keys.
 *
 * @template TStringKeys - Union type of valid string keys for translation
 */
export interface II18nEngine<TStringKeys extends string = string> {
  /**
   * Translate a string key with optional variables
   * @param key - The translation key
   * @param params - Optional parameters for interpolation
   * @returns The translated string
   */
  translate(key: TStringKeys, params?: Record<string, any>): string;

  /**
   * Translate an enum value to a string
   * @template T - The enum type
   * @param enumObj - The enum object
   * @param value - The enum value to translate
   * @param language - Optional language override
   * @returns The translated enum value
   */
  translateEnum<T extends Record<string, string | number>>(
    enumObj: T,
    value: T[keyof T],
    language?: string,
  ): string;

  /**
   * Set the current language for translations
   * @param language - The language code to set
   */
  setLanguage(language: string): void;

  /**
   * Get the current language
   * @returns The current language code
   */
  getLanguage(): string;
}

/**
 * Re-export the main II18nEngine interface from interfaces
 * This provides a centralized location for engine type imports
 */
export type { II18nEngine as IMainI18nEngine } from '../interfaces/i18n-engine.interface';
