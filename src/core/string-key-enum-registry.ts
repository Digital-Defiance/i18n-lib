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
  register(enumObj: AnyBrandedEnum): string {
    // Check if already registered (idempotent)
    const existingId = this.registeredEnums.get(enumObj);
    if (existingId !== undefined) {
      return existingId;
    }

    // Validate that it's a branded enum
    if (!isBrandedEnum(enumObj)) {
      throw I18nError.invalidStringKeyEnum();
    }

    // Extract component ID
    const componentId = getBrandedEnumComponentId(enumObj);
    if (componentId === null) {
      throw I18nError.invalidStringKeyEnum();
    }

    // Check if another enum with the same component ID is already registered
    // If so, skip re-registration (Requirement 1.5)
    if (this.componentIdToEnum.has(componentId)) {
      return componentId;
    }

    // Store the registration
    this.registeredEnums.set(enumObj, componentId);
    this.componentIdToEnum.set(componentId, enumObj);

    return componentId;
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
    return this.registeredEnums.has(enumObj);
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
}
