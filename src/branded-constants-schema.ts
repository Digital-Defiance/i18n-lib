/**
 * Helper for creating branded interface definitions for i18n constants schemas.
 *
 * Wraps `createBrandedInterface` from `@digitaldefiance/branded-interface`
 * with a simpler API tailored for constants schema creation.
 *
 * @module branded-constants-schema
 */

import { createBrandedInterface } from '@digitaldefiance/branded-interface';
import type {
  BrandedInterfaceDefinition,
  FieldDescriptor,
} from '@digitaldefiance/branded-interface';

/**
 * Creates a branded interface definition for validating i18n constants.
 *
 * This is a convenience wrapper around `createBrandedInterface` that provides
 * a simpler API for defining constants schemas with field descriptors.
 *
 * @param id - Unique identifier for the constants schema
 * @param fields - Record mapping field names to their descriptors
 * @returns A `BrandedInterfaceDefinition` that can be used for validation
 *
 * @example
 * ```typescript
 * const MyConstantsSchema = createConstantsSchema<MyConstants>('MyConstants', {
 *   siteName: { type: 'string' },
 *   maxRetries: { type: 'number', validate: (v) => typeof v === 'number' && v > 0 },
 * });
 * ```
 */
export function createConstantsSchema<T extends Record<string, unknown>>(
  id: string,
  fields: Record<keyof T & string, FieldDescriptor>,
): BrandedInterfaceDefinition<T> {
  return createBrandedInterface<T>(id, fields);
}
