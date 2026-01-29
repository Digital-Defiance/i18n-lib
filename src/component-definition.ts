/**
 * Component definition with branded string keys
 *
 * @module component-definition
 */

import type {
  AnyBrandedEnum,
  BrandedEnumValue,
} from '@digitaldefiance/branded-enum';
import { getEnumValues } from '@digitaldefiance/branded-enum';

/**
 * Component definition using branded enums for runtime-identifiable string keys
 *
 * This interface provides:
 * - Runtime identification of string key sources
 * - Automatic collision detection during registration
 * - Type-safe string key validation
 * - Automatic translation routing
 *
 * @template TBrandedEnum - The branded enum type containing string keys
 *
 * @example
 * ```typescript
 * const MyKeys = createI18nStringKeys('my-component', {
 *   Key1: 'key1',
 *   Key2: 'key2',
 * } as const);
 *
 * const myComponent: ComponentDefinition<typeof MyKeys> = {
 *   id: 'my-component',
 *   name: 'My Component',
 *   stringKeys: MyKeys,
 * };
 * ```
 */
export interface ComponentDefinition<TBrandedEnum extends AnyBrandedEnum> {
  /** Unique identifier for the component */
  readonly id: string;
  /** Human-readable name for the component */
  readonly name: string;
  /**
   * Branded enum containing all string keys for this component
   * Provides runtime identification and collision detection
   */
  readonly stringKeys: TBrandedEnum;
}

/**
 * Helper to extract string key values from a component definition
 *
 * @param definition - The component definition
 * @returns Array of all string key values
 */
export function getComponentStringKeys<TBrandedEnum extends AnyBrandedEnum>(
  definition: ComponentDefinition<TBrandedEnum>,
): BrandedEnumValue<TBrandedEnum>[] {
  const values = getEnumValues(definition.stringKeys);
  return (values ?? []) as BrandedEnumValue<TBrandedEnum>[];
}

/**
 * Type to extract string key type from a component definition
 */
export type ComponentStringKeys<T extends ComponentDefinition<AnyBrandedEnum>> =
  T extends ComponentDefinition<infer E> ? BrandedEnumValue<E> : never;
