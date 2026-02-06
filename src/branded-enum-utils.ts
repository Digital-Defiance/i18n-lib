/**
 * Branded Enum Utilities for i18n enum translation support
 *
 * This module provides utility functions for detecting and extracting
 * information from branded enums created with `@digitaldefiance/branded-enum`.
 * These utilities enable the i18n library to seamlessly support both traditional
 * TypeScript enums and branded enums for enum translations.
 *
 * ## Overview
 *
 * Branded enums carry runtime metadata (a unique component ID) that enables:
 * - Automatic enum name inference during registration
 * - Runtime identification for debugging and logging
 * - Type-safe translation lookups
 *
 * ## Key Functions
 *
 * - {@link isBrandedEnum} - Type guard to detect branded enums
 * - {@link getBrandedEnumComponentId} - Extract component ID (prefix stripped)
 * - {@link getBrandedEnumId} - Get raw brand ID (for debugging)
 *
 * ## Usage with Enum Translation
 *
 * These utilities are used internally by `EnumRegistry` and `EnumTranslationRegistry`
 * to provide automatic name inference and proper translation lookups for branded enums.
 *
 * @example
 * ```typescript
 * import { createBrandedEnum } from '@digitaldefiance/branded-enum';
 * import { isBrandedEnum, getBrandedEnumComponentId } from '@digitaldefiance/i18n-lib';
 *
 * const Status = createBrandedEnum('status', { Active: 'active', Inactive: 'inactive' });
 *
 * if (isBrandedEnum(Status)) {
 *   const componentId = getBrandedEnumComponentId(Status);
 *   console.log(componentId); // 'status'
 * }
 * ```
 *
 * @module branded-enum-utils
 * @see {@link EnumRegistry} - V2 enum registry with branded enum support
 * @see {@link EnumTranslationRegistry} - Legacy registry with branded enum support
 */

import type { AnyBrandedEnum } from '@digitaldefiance/branded-enum';
import { getEnumId } from '@digitaldefiance/branded-enum';

/**
 * Type guard to check if an object is a branded enum from `@digitaldefiance/branded-enum`.
 *
 * Branded enums are identified by having a valid enum ID retrievable via `getEnumId()`.
 * This function safely checks for this property without throwing errors, making it
 * suitable for use in conditional logic and type narrowing.
 *
 * ## When to Use
 *
 * Use this function when you need to:
 * - Determine if an enum object is branded or traditional
 * - Conditionally apply branded enum-specific logic
 * - Type-narrow an unknown enum object
 *
 * ## Implementation Details
 *
 * The function checks:
 * 1. The object is not null or undefined
 * 2. The object is of type 'object'
 * 3. The object has a valid enum ID (via `getEnumId()`)
 *
 * @param obj - The object to check (can be any value)
 * @returns `true` if the object is a branded enum, `false` otherwise
 *
 * @example Basic usage
 * ```typescript
 * import { createBrandedEnum } from '@digitaldefiance/branded-enum';
 * import { isBrandedEnum } from '@digitaldefiance/i18n-lib';
 *
 * const BrandedStatus = createBrandedEnum('status', { Active: 'active' });
 * const TraditionalStatus = { Active: 'active' };
 *
 * isBrandedEnum(BrandedStatus);     // true
 * isBrandedEnum(TraditionalStatus); // false
 * ```
 *
 * @example Type narrowing
 * ```typescript
 * function processEnum(enumObj: object) {
 *   if (isBrandedEnum(enumObj)) {
 *     // TypeScript knows enumObj is AnyBrandedEnum here
 *     const id = getBrandedEnumComponentId(enumObj);
 *     console.log(`Processing branded enum: ${id}`);
 *   } else {
 *     console.log('Processing traditional enum');
 *   }
 * }
 * ```
 *
 * @example Edge cases
 * ```typescript
 * isBrandedEnum(null);        // false
 * isBrandedEnum(undefined);   // false
 * isBrandedEnum('string');    // false
 * isBrandedEnum(123);         // false
 * isBrandedEnum({});          // false
 * ```
 *
 * @see {@link getBrandedEnumComponentId} - Extract component ID from branded enum
 * @see {@link getBrandedEnumId} - Get raw brand ID from branded enum
 */
export function isBrandedEnum(obj: unknown): obj is AnyBrandedEnum {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return false;
  }
  // Branded enums have an enum ID retrievable via getEnumId
  const enumId = getEnumId(obj as AnyBrandedEnum);
  return enumId !== undefined;
}

/**
 * Extracts the component ID from a branded enum.
 *
 * For branded enums created with `createI18nStringKeys()`, the brand ID
 * is prefixed with `'i18n:'`. This function strips that prefix to return
 * just the component ID, which is suitable for use as an enum name in
 * registration and error messages.
 *
 * ## Prefix Stripping
 *
 * | Input Brand ID | Returned Component ID |
 * |----------------|----------------------|
 * | `'i18n:my-component'` | `'my-component'` |
 * | `'my-component'` | `'my-component'` |
 * | `'status'` | `'status'` |
 *
 * ## When to Use
 *
 * Use this function when you need:
 * - The component ID for automatic enum name inference
 * - A clean identifier without the `i18n:` prefix
 * - The default name for error messages
 *
 * For debugging purposes where you need the full brand ID including prefix,
 * use {@link getBrandedEnumId} instead.
 *
 * @param enumObj - The object to extract the component ID from
 * @returns The component ID without the `'i18n:'` prefix, or `null` if not a branded enum
 *
 * @example Basic usage
 * ```typescript
 * import { createI18nStringKeys } from '@digitaldefiance/i18n-lib';
 *
 * const MyKeys = createI18nStringKeys('my-component', { A: 'a' });
 *
 * getBrandedEnumComponentId(MyKeys); // 'my-component'
 * getBrandedEnumComponentId({ A: 'a' }); // null (not a branded enum)
 * ```
 *
 * @example With createBrandedEnum (no prefix)
 * ```typescript
 * import { createBrandedEnum } from '@digitaldefiance/branded-enum';
 *
 * const Status = createBrandedEnum('status', { Active: 'active' });
 *
 * getBrandedEnumComponentId(Status); // 'status'
 * ```
 *
 * @example Automatic name inference in registration
 * ```typescript
 * const MyKeys = createI18nStringKeys('user-profile', { Title: 'title' });
 *
 * // When registering without explicit name, component ID is used
 * registry.register(MyKeys, translations);
 * // Internally uses: getBrandedEnumComponentId(MyKeys) → 'user-profile'
 * ```
 *
 * @see {@link isBrandedEnum} - Check if an object is a branded enum
 * @see {@link getBrandedEnumId} - Get raw brand ID without prefix stripping
 */
export function getBrandedEnumComponentId(enumObj: unknown): string | null {
  if (!isBrandedEnum(enumObj)) {
    return null;
  }
  const brand = getEnumId(enumObj);
  if (brand === undefined) {
    return null;
  }
  // Remove 'i18n:' prefix if present (used by createI18nStringKeys)
  return brand.startsWith('i18n:') ? brand.slice(5) : brand;
}

/**
 * Gets the raw brand/ID from a branded enum without prefix stripping.
 *
 * Unlike {@link getBrandedEnumComponentId}, this function returns the full
 * brand ID including any prefixes (such as `'i18n:'`). This is useful for
 * debugging, logging, and cases where you need the exact brand identifier.
 *
 * ## Comparison with getBrandedEnumComponentId
 *
 * | Function | Input Brand | Output |
 * |----------|-------------|--------|
 * | `getBrandedEnumId` | `'i18n:my-component'` | `'i18n:my-component'` |
 * | `getBrandedEnumComponentId` | `'i18n:my-component'` | `'my-component'` |
 *
 * ## When to Use
 *
 * Use this function when you need:
 * - The exact brand ID for debugging or logging
 * - To distinguish between different branded enum sources
 * - The full identifier including any prefixes
 *
 * For registration and user-facing names, use {@link getBrandedEnumComponentId}
 * which strips the `i18n:` prefix.
 *
 * @param enumObj - The object to get the brand ID from
 * @returns The raw brand ID, or `null` if not a branded enum
 *
 * @example Debugging and logging
 * ```typescript
 * import { createI18nStringKeys } from '@digitaldefiance/i18n-lib';
 *
 * const MyKeys = createI18nStringKeys('my-component', { A: 'a' });
 *
 * // For debugging, get the full brand ID
 * console.log(`Brand ID: ${getBrandedEnumId(MyKeys)}`);
 * // Output: 'Brand ID: i18n:my-component'
 *
 * // For user-facing names, use component ID
 * console.log(`Component: ${getBrandedEnumComponentId(MyKeys)}`);
 * // Output: 'Component: my-component'
 * ```
 *
 * @example Comparing branded enums
 * ```typescript
 * import { createBrandedEnum } from '@digitaldefiance/branded-enum';
 * import { createI18nStringKeys } from '@digitaldefiance/i18n-lib';
 *
 * const RegularBranded = createBrandedEnum('status', { A: 'a' });
 * const I18nBranded = createI18nStringKeys('status', { A: 'a' });
 *
 * getBrandedEnumId(RegularBranded); // 'status'
 * getBrandedEnumId(I18nBranded);    // 'i18n:status'
 * ```
 *
 * @see {@link isBrandedEnum} - Check if an object is a branded enum
 * @see {@link getBrandedEnumComponentId} - Get component ID with prefix stripped
 */
export function getBrandedEnumId(enumObj: unknown): string | null {
  if (!isBrandedEnum(enumObj)) {
    return null;
  }
  const brand = getEnumId(enumObj);
  return brand ?? null;
}
