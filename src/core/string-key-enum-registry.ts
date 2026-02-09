/**
 * String Key Enum Registry for managing branded string key enum registrations
 *
 * This module provides the `StringKeyEnumRegistry` class for managing registrations
 * of branded string key enums created with `createI18nStringKeys`. It enables
 * automatic resolution of component IDs from string key values, eliminating the
 * need for per-component wrapper functions.
 *
 * ## Overview
 *
 * The `StringKeyEnumRegistry` is an internal registry that:
 * - Stores references to branded string key enums with their component IDs
 * - Resolves string key values to their owning component IDs
 * - Supports idempotent registration (same enum can be registered multiple times)
 *
 * ## Key Features
 *
 * - **Component ID Extraction**: Automatically extracts component IDs from branded enums
 * - **Key Resolution**: Uses branded-enum's `findEnumSources` for efficient key lookup
 * - **Idempotent Registration**: Re-registering the same enum is a no-op
 * - **Safe Resolution**: Provides both throwing and non-throwing resolution methods
 *
 * @example Basic usage
 * ```typescript
 * import { createI18nStringKeys } from '../branded-string-key';
 *
 * const UserKeys = createI18nStringKeys('user', {
 *   Welcome: 'user.welcome',
 *   Goodbye: 'user.goodbye',
 * } as const);
 *
 * const registry = new StringKeyEnumRegistry();
 * registry.register(UserKeys); // Returns 'user'
 *
 * registry.has(UserKeys); // true
 * registry.resolveComponentId('user.welcome'); // 'user'
 * ```
 *
 * @module core/string-key-enum-registry
 * @see {@link I18nEngine} - Main engine that uses this registry
 * @see {@link createI18nStringKeys} - Factory for creating branded string key enums
 */

import type { AnyBrandedEnum } from '@digitaldefiance/branded-enum';
import { findEnumSources } from '@digitaldefiance/branded-enum';
import {
  isBrandedEnum,
  getBrandedEnumComponentId,
} from '../branded-enum-utils';
import { I18nError } from '../errors/i18n-error';

/**
 * Entry representing a registered string key enum with its component ID.
 */
export interface StringKeyEnumEntry {
  /** Reference to the branded enum object */
  readonly enumObj: AnyBrandedEnum;
  /** The component ID extracted from the enum's brand */
  readonly componentId: string;
}

/**
 * Registry for managing branded string key enum registrations.
 *
 * Provides centralized management of branded string key enums, enabling
 * automatic component ID resolution from string key values. This eliminates
 * the need for per-component wrapper functions when translating string keys.
 *
 * ## Registration
 *
 * Use {@link register} to add a branded string key enum. The component ID
 * is automatically extracted from the enum's brand metadata.
 *
 * ## Resolution
 *
 * Use {@link resolveComponentId} or {@link safeResolveComponentId} to find
 * which component owns a given string key value.
 *
 * ## Idempotence
 *
 * Registering the same enum multiple times is safe and returns the same
 * component ID. The registry maintains exactly one entry per enum object.
 *
 * @example Complete workflow
 * ```typescript
 * const registry = new StringKeyEnumRegistry();
 *
 * // Register enums
 * const userId = registry.register(UserKeys);    // 'user'
 * const adminId = registry.register(AdminKeys);  // 'admin'
 *
 * // Check registration
 * registry.has(UserKeys);  // true
 * registry.has(OtherEnum); // false
 *
 * // Resolve component IDs
 * registry.resolveComponentId('user.welcome');   // 'user'
 * registry.safeResolveComponentId('unknown.key'); // null
 *
 * // Get all registrations
 * registry.getAll(); // [{ enumObj: UserKeys, componentId: 'user' }, ...]
 * ```
 */
export class StringKeyEnumRegistry {
  /**
   * Map of registered branded enums to their component IDs.
   * Uses the enum object reference as the key for object identity comparison.
   */
  private readonly registeredEnums: Map<AnyBrandedEnum, string> = new Map();

  /**
   * Reverse lookup map from component ID to enum object.
   * Used for efficient component ID-based lookups.
   */
  private readonly componentIdToEnum: Map<string, AnyBrandedEnum> = new Map();

  /**
   * Registers a branded string key enum.
   *
   * Extracts the component ID from the branded enum's metadata and stores
   * a reference to the enum for later lookup. If the enum is already
   * registered, returns the existing component ID without re-registering.
   *
   * ## Idempotence
   *
   * Registering the same enum multiple times is safe:
   * - Same enum object: Returns existing component ID (no-op)
   * - Different enum with same component ID: Skips re-registration
   *
   * ## Validation
   *
   * The method validates that the provided object is a branded enum
   * created with `createI18nStringKeys` or `createBrandedEnum`.
   *
   * @param enumObj - The branded enum created by createI18nStringKeys
   * @returns The extracted component ID
   * @throws {I18nError} If not a valid branded enum (INVALID_STRING_KEY_ENUM)
   *
   * @example Basic registration
   * ```typescript
   * const UserKeys = createI18nStringKeys('user', { Welcome: 'user.welcome' });
   * const componentId = registry.register(UserKeys);
   * console.log(componentId); // 'user'
   * ```
   *
   * @example Idempotent registration
   * ```typescript
   * registry.register(UserKeys); // 'user'
   * registry.register(UserKeys); // 'user' (same result, no duplicate entry)
   * ```
   */
  /**
   * Registers a branded string key enum.
   *
   * Extracts the component ID from the branded enum's metadata and stores
   * a reference to the enum for later lookup. If the enum is already
   * registered, returns the existing component ID without re-registering.
   *
   * ## Detection Strategy
   *
   * 1. Check if already registered by reference (idempotent fast path)
   * 2. If explicit `componentId` is provided, use it directly (escape hatch)
   * 3. Try branded enum detection via `isBrandedEnum()` (happy path)
   * 4. Structural fallback: infer component ID from object values
   * 5. If all detection fails, throw `I18nError.invalidStringKeyEnum()`
   *
   * ## Idempotence
   *
   * Registering the same enum multiple times is safe:
   * - Same enum object: Returns existing component ID (no-op)
   * - Different enum with same component ID: Skips re-registration
   *
   * @param enumObj - The branded enum created by createI18nStringKeys
   * @param componentId - Optional explicit component ID (escape hatch for cross-module scenarios)
   * @returns The extracted or provided component ID
   * @throws {I18nError} If not a valid branded enum and no fallback succeeds (INVALID_STRING_KEY_ENUM)
   *
   * @example Basic registration
   * ```typescript
   * const UserKeys = createI18nStringKeys('user', { Welcome: 'user.welcome' });
   * const componentId = registry.register(UserKeys);
   * console.log(componentId); // 'user'
   * ```
   *
   * @example Explicit componentId escape hatch
   * ```typescript
   * const plainObj = { Welcome: 'user.welcome' } as AnyBrandedEnum;
   * const componentId = registry.register(plainObj, 'user');
   * console.log(componentId); // 'user'
   * ```
   */
  register(enumObj: AnyBrandedEnum, componentId?: string): string {
    // 1. Check if already registered by reference (idempotent)
    const existingId = this.registeredEnums.get(enumObj);
    if (existingId !== undefined) {
      return existingId;
    }

    // 2. If explicit componentId provided, use it directly (escape hatch)
    if (componentId !== undefined) {
      return this.registerWithComponentId(enumObj, componentId);
    }

    // 3. Try branded enum detection (happy path)
    if (isBrandedEnum(enumObj)) {
      const id = getBrandedEnumComponentId(enumObj);
      if (id !== null) {
        return this.registerWithComponentId(enumObj, id);
      }
    }

    // 4. Structural fallback: try to infer component ID
    const inferredId = this.inferComponentId(enumObj);
    if (inferredId !== null) {
      return this.registerWithComponentId(enumObj, inferredId);
    }

    // 5. All detection failed
    throw I18nError.invalidStringKeyEnum();
  }

  /**
   * Checks if an enum is registered.
   *
   * Uses object reference equality to check registration status.
   *
   * @param enumObj - The branded enum to check
   * @returns `true` if the enum is registered, `false` otherwise
   *
   * @example
   * ```typescript
   * registry.has(UserKeys); // false (not registered yet)
   * registry.register(UserKeys);
   * registry.has(UserKeys); // true
   * ```
   */
  has(enumObj: AnyBrandedEnum): boolean {
    // 1. Reference equality (fast path)
    if (this.registeredEnums.has(enumObj)) {
      return true;
    }

    // 2. Component ID fallback for cross-module duplicates
    const componentId = this.tryExtractComponentId(enumObj);
    if (componentId !== null) {
      return this.componentIdToEnum.has(componentId);
    }

    return false;
  }

  /**
   * Gets all registered enums with their component IDs.
   *
   * Returns a readonly array of entries containing the enum reference
   * and its associated component ID.
   *
   * @returns Readonly array of StringKeyEnumEntry objects
   *
   * @example
   * ```typescript
   * registry.register(UserKeys);
   * registry.register(AdminKeys);
   *
   * const entries = registry.getAll();
   * // [
   * //   { enumObj: UserKeys, componentId: 'user' },
   * //   { enumObj: AdminKeys, componentId: 'admin' }
   * // ]
   * ```
   */
  getAll(): readonly StringKeyEnumEntry[] {
    const entries: StringKeyEnumEntry[] = [];
    for (const [enumObj, componentId] of this.registeredEnums) {
      entries.push({ enumObj, componentId });
    }
    return entries;
  }

  /**
   * Resolves a string key value to its component ID.
   *
   * Uses branded-enum's `findEnumSources` to locate the owning enum,
   * then looks up the component ID from the registry.
   *
   * ## Resolution Strategy
   *
   * 1. Call `findEnumSources(stringKeyValue)` to get all enum IDs containing the value
   * 2. Filter for i18n-prefixed IDs (created by `createI18nStringKeys`)
   * 3. Strip the `i18n:` prefix to get the component ID
   * 4. Verify the component ID is registered in this registry
   *
   * @param stringKeyValue - The string key value to resolve
   * @returns The component ID that owns this string key
   * @throws {I18nError} If the key doesn't belong to a registered enum (STRING_KEY_NOT_REGISTERED)
   *
   * @example
   * ```typescript
   * const UserKeys = createI18nStringKeys('user', { Welcome: 'user.welcome' });
   * registry.register(UserKeys);
   *
   * registry.resolveComponentId('user.welcome'); // 'user'
   * registry.resolveComponentId('unknown.key');  // throws I18nError
   * ```
   */
  resolveComponentId(stringKeyValue: string): string {
    const componentId = this.safeResolveComponentId(stringKeyValue);
    if (componentId === null) {
      throw I18nError.stringKeyNotRegistered(stringKeyValue);
    }
    return componentId;
  }

  /**
   * Safely resolves a string key value to its component ID.
   *
   * Returns `null` if the key doesn't belong to any registered enum,
   * instead of throwing an error.
   *
   * @param stringKeyValue - The string key value to resolve
   * @returns The component ID, or `null` if not found
   *
   * @example
   * ```typescript
   * registry.safeResolveComponentId('user.welcome'); // 'user'
   * registry.safeResolveComponentId('unknown.key');  // null
   * ```
   */
  safeResolveComponentId(stringKeyValue: string): string | null {
    // Use findEnumSources to locate which enum(s) contain this value
    const sources = findEnumSources(stringKeyValue);

    // Filter for i18n-prefixed sources and find one that's registered
    for (const source of sources) {
      if (source.startsWith('i18n:')) {
        const componentId = source.slice(5); // Remove 'i18n:' prefix
        if (this.componentIdToEnum.has(componentId)) {
          return componentId;
        }
      }
    }

    return null;
  }

  /**
   * Clears all registrations.
   *
   * Primarily intended for testing purposes to reset the registry state.
   *
   * @example
   * ```typescript
   * registry.register(UserKeys);
   * registry.getAll().length; // 1
   *
   * registry.clear();
   * registry.getAll().length; // 0
   * ```
   */
  clear(): void {
    this.registeredEnums.clear();
    this.componentIdToEnum.clear();
  }

  /**
   * Attempts to infer a component ID from an object's structure.
   *
   * Uses two strategies:
   * 1. **Global registry lookup**: Calls `findEnumSources()` with the object's
   *    string values. If any source starts with `i18n:`, extracts the component ID.
   * 2. **Value prefix extraction**: If the object's values follow the
   *    `{componentId}.{key}` convention, extracts the common prefix.
   *
   * @param enumObj - The object to infer a component ID from
   * @returns The inferred component ID, or `null` if detection fails
   */
  private inferComponentId(enumObj: AnyBrandedEnum): string | null {
    // Collect string values from the object
    const values = Object.values(enumObj).filter(
      (v): v is string => typeof v === 'string',
    );
    if (values.length === 0) {
      return null;
    }

    // Strategy 1: Global registry lookup via findEnumSources
    for (const value of values) {
      const sources = findEnumSources(value);
      for (const source of sources) {
        if (source.startsWith('i18n:')) {
          return source.slice(5); // Remove 'i18n:' prefix
        }
      }
    }

    // Strategy 2: Value prefix extraction — find common {componentId}. prefix
    const firstDotIndex = values[0].indexOf('.');
    if (firstDotIndex <= 0) {
      return null;
    }
    const prefix = values[0].substring(0, firstDotIndex);

    // Verify all values share the same prefix
    for (const value of values) {
      if (!value.startsWith(prefix + '.')) {
        return null;
      }
    }

    return prefix;
  }
  /**
   * Attempts to extract a component ID from an enum object using all available strategies.
   *
   * Tries branded enum metadata first (via `getBrandedEnumComponentId()`), then
   * falls back to structural detection (via `inferComponentId()`).
   *
   * @param enumObj - The enum object to extract a component ID from
   * @returns The extracted component ID, or `null` if all strategies fail
   */
  private tryExtractComponentId(enumObj: AnyBrandedEnum): string | null {
    // Strategy 1: Try branded enum metadata
    const brandedId = getBrandedEnumComponentId(enumObj);
    if (brandedId !== null) {
      return brandedId;
    }

    // Strategy 2: Structural detection fallback
    return this.inferComponentId(enumObj);
  }

  /**
   * Registers an enum object with a known component ID.
   *
   * Stores the enum in both the `registeredEnums` and `componentIdToEnum` maps.
   * If another enum with the same component ID is already registered, the
   * registration is skipped (idempotent by component ID).
   *
   * @param enumObj - The enum object to register
   * @param componentId - The component ID to associate with the enum
   * @returns The component ID
   */
  private registerWithComponentId(
    enumObj: AnyBrandedEnum,
    componentId: string,
  ): string {
    // Check if another enum with the same component ID is already registered
    if (this.componentIdToEnum.has(componentId)) {
      return componentId;
    }

    // Store the registration
    this.registeredEnums.set(enumObj, componentId);
    this.componentIdToEnum.set(componentId, enumObj);

    return componentId;
  }
}
