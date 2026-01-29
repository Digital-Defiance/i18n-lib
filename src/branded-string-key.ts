/**
 * Branded String Key utilities for runtime-identifiable i18n string keys
 *
 * This module provides integration between @digitaldefiance/branded-enum
 * and the i18n system, enabling:
 * - Runtime identification of which component a string key belongs to
 * - Collision detection when registering components
 * - Type-safe translation functions with branded enums
 *
 * @module branded-string-key
 */

import {
  createBrandedEnum,
  isFromEnum,
  findEnumSources,
  enumIntersect,
  getEnumValues,
  getEnumById,
  getAllEnumIds,
  mergeEnums,
} from '@digitaldefiance/branded-enum';
import type {
  BrandedEnum,
  BrandedEnumValue,
  AnyBrandedEnum,
} from '@digitaldefiance/branded-enum';

// Re-export branded-enum types for convenience
export type { BrandedEnum, BrandedEnumValue, AnyBrandedEnum };

export {
  isFromEnum,
  findEnumSources,
  enumIntersect,
  getEnumValues,
  getEnumById,
  getAllEnumIds,
  mergeEnums,
};

/**
 * Type alias for a branded string key enum used in i18n
 */
export type BrandedStringKeys<T extends Record<string, string>> =
  BrandedEnum<T>;

/**
 * Type alias for extracting the string key values from a branded enum
 */
export type BrandedStringKeyValue<E extends AnyBrandedEnum> =
  BrandedEnumValue<E>;

/**
 * Options for creating i18n string keys
 */
export interface CreateI18nStringKeysOptions {
  /**
   * Prefix to add to all key values (e.g., 'user.' will make 'Welcome' become 'user.welcome')
   * If not provided, no prefix is added
   */
  valuePrefix?: string;

  /**
   * Whether to lowercase the values (default: true for consistency)
   */
  lowercaseValues?: boolean;
}

/**
 * Creates a branded enum for i18n string keys with a namespace identifier.
 *
 * This is the primary factory function for creating type-safe, runtime-identifiable
 * string key sets for i18n components.
 *
 * @example
 * ```typescript
 * // Create user-related string keys
 * const UserStringKeys = createI18nStringKeys('user-component', {
 *   Welcome: 'user.welcome',
 *   Goodbye: 'user.goodbye',
 *   Profile: 'user.profile',
 * } as const);
 *
 * // Type-safe usage
 * const key = UserStringKeys.Welcome; // 'user.welcome'
 *
 * // Runtime identification
 * findEnumSources('user.welcome'); // ['user-component']
 * isFromEnum('user.welcome', UserStringKeys); // true
 * ```
 *
 * @param componentId Unique identifier for the component (used as the enum ID)
 * @param keys Object mapping key names to their string values
 * @returns A branded enum with runtime identification metadata
 */
export function createI18nStringKeys<T extends Record<string, string>>(
  componentId: string,
  keys: T,
): BrandedStringKeys<T> {
  return createBrandedEnum(`i18n:${componentId}`, keys);
}

/**
 * Creates i18n string keys from an existing TypeScript enum.
 *
 * This function helps migrate from traditional enums to branded enums
 * while maintaining the same key-value structure.
 *
 * @example
 * ```typescript
 * // Existing enum
 * enum UserKeys {
 *   Welcome = 'user.welcome',
 *   Goodbye = 'user.goodbye',
 * }
 *
 * // Convert to branded enum
 * const BrandedUserKeys = createI18nStringKeysFromEnum('user-component', UserKeys);
 *
 * // Now has runtime identification
 * findEnumSources('user.welcome'); // ['i18n:user-component']
 * ```
 *
 * @param componentId Unique identifier for the component
 * @param enumObj The TypeScript enum to convert
 * @returns A branded enum with the same key-value pairs
 */
export function createI18nStringKeysFromEnum<
  TEnum extends Record<string, string>,
>(componentId: string, enumObj: TEnum): BrandedStringKeys<TEnum> {
  // Filter out reverse mappings (numeric enums have value -> key mappings)
  // For a numeric enum like { A: 0, 0: 'A' }, we need to filter out the { 0: 'A' } entry
  // We keep string-valued entries, filtering out numeric keys that are reverse mappings
  const filteredObj = Object.fromEntries(
    Object.entries(enumObj).filter(([key, value]) => {
      // Only keep string values
      if (typeof value !== 'string') {
        return false;
      }
      // Filter out numeric keys (these are reverse mappings from numeric enums)
      // A key like '0' that maps to 'A' is a reverse mapping
      if (!isNaN(Number(key))) {
        return false;
      }
      return true;
    }),
  ) as TEnum;

  return createI18nStringKeys(componentId, filteredObj);
}

/**
 * Result of a collision check between string key enums
 */
export interface StringKeyCollisionResult {
  /** Whether any collisions were found */
  hasCollisions: boolean;
  /** Array of collision details */
  collisions: Array<{
    /** The colliding value */
    value: string;
    /** The component IDs (enum IDs) that contain this value */
    componentIds: readonly string[];
  }>;
}

/**
 * Checks for collisions between multiple branded string key enums.
 *
 * Use this to detect when multiple components have overlapping string keys,
 * which could cause routing issues in translations.
 *
 * @example
 * ```typescript
 * const UserKeys = createI18nStringKeys('user', { Welcome: 'welcome' } as const);
 * const AdminKeys = createI18nStringKeys('admin', { Welcome: 'welcome' } as const);
 *
 * const result = checkStringKeyCollisions(UserKeys, AdminKeys);
 * // result.hasCollisions === true
 * // result.collisions === [{ value: 'welcome', componentIds: ['i18n:user', 'i18n:admin'] }]
 * ```
 *
 * @param enums The branded string key enums to check
 * @returns Collision check result
 */
export function checkStringKeyCollisions(
  ...enums: AnyBrandedEnum[]
): StringKeyCollisionResult {
  const collisions = enumIntersect(...enums);

  return {
    hasCollisions: collisions.length > 0,
    collisions: collisions.map((c) => ({
      value: c.value,
      componentIds: c.enumIds,
    })),
  };
}

/**
 * Finds which i18n component(s) a string key belongs to.
 *
 * @example
 * ```typescript
 * const sources = findStringKeySources('user.welcome');
 * // ['i18n:user-component']
 * ```
 *
 * @param key The string key to look up
 * @returns Array of component IDs that contain this key
 */
export function findStringKeySources(key: string): string[] {
  return findEnumSources(key).filter((id) => id.startsWith('i18n:'));
}

/**
 * Resolves a string key to its owning component ID.
 *
 * Returns the component ID without the 'i18n:' prefix if exactly one
 * component owns the key, or null if zero or multiple components own it.
 *
 * @example
 * ```typescript
 * const componentId = resolveStringKeyComponent('user.welcome');
 * // 'user-component' (or null if ambiguous)
 * ```
 *
 * @param key The string key to resolve
 * @returns The component ID, or null if not found or ambiguous
 */
export function resolveStringKeyComponent(key: string): string | null {
  const sources = findStringKeySources(key);
  if (sources.length === 1) {
    return sources[0].replace(/^i18n:/, '');
  }
  return null;
}

/**
 * Gets all registered i18n component IDs.
 *
 * @returns Array of component IDs (without the 'i18n:' prefix)
 */
export function getRegisteredI18nComponents(): string[] {
  return getAllEnumIds()
    .filter((id) => id.startsWith('i18n:'))
    .map((id) => id.replace(/^i18n:/, ''));
}

/**
 * Gets a branded string key enum by its component ID.
 *
 * @param componentId The component ID to look up
 * @returns The branded enum, or undefined if not found
 */
export function getStringKeysByComponentId(
  componentId: string,
): BrandedEnum<Record<string, string>> | undefined {
  return getEnumById(`i18n:${componentId}`);
}

/**
 * Validates that a value is a valid string key from a specific branded enum.
 *
 * @param value The value to validate
 * @param stringKeys The branded enum to validate against
 * @returns True if the value is a valid key in the enum
 */
export function isValidStringKey<E extends BrandedEnum<Record<string, string>>>(
  value: unknown,
  stringKeys: E,
): value is BrandedEnumValue<E> {
  return isFromEnum(value, stringKeys);
}

/**
 * Merges multiple branded string key enums into a combined enum.
 *
 * Useful for creating a unified key set from multiple components.
 *
 * @example
 * ```typescript
 * const AllKeys = mergeI18nStringKeys('all-keys',
 *   CoreStringKeys,
 *   UserStringKeys,
 *   AdminStringKeys
 * );
 * ```
 *
 * @param newComponentId The ID for the merged enum
 * @param enums The enums to merge
 * @returns A new branded enum containing all keys from input enums
 * @throws Error if there are duplicate keys across enums
 */
export function mergeI18nStringKeys<
  T extends readonly BrandedEnum<Record<string, string>>[],
>(newComponentId: string, ...enums: T): BrandedEnum<Record<string, string>> {
  return mergeEnums(`i18n:${newComponentId}`, ...enums);
}

/**
 * Helper to get all string key values from a branded enum as an array.
 *
 * @param stringKeys The branded enum
 * @returns Array of all string key values
 */
export function getStringKeyValues<
  E extends BrandedEnum<Record<string, string>>,
>(stringKeys: E): BrandedEnumValue<E>[] {
  return (getEnumValues(stringKeys) ?? []) as BrandedEnumValue<E>[];
}
