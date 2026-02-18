/**
 * Property-based tests for schema-aware constants registration.
 *
 * Feature: branded-interface-integration, Property 1: Schema-aware registration validates before storing
 * **Validates: Requirements 1.2, 1.3**
 */

import {
  createBrandedInterface,
  resetInterfaceRegistry,
} from '@digitaldefiance/branded-interface';
import type {
  BrandedInterfaceDefinition,
  FieldDescriptor,
} from '@digitaldefiance/branded-interface';
import * as fc from 'fast-check';
import { ConstantsRegistry } from '../../src/core/constants-registry';
import { I18nErrorCode } from '../../src/errors/i18n-error';

let idCounter = 0;

/**
 * Generates a unique schema ID for each test run to avoid registry collisions.
 */
const schemaIdArb = fc
  .stringMatching(/^[A-Z][a-zA-Z]{2,12}$/)
  .map((s) => `${s}${++idCounter}`);

/**
 * Generates a valid component ID (lowercase kebab-case).
 */
const componentIdArb = fc
  .stringMatching(/^[a-z][a-z0-9-]{1,15}$/)
  .filter((s) => !s.endsWith('-'));

/**
 * Creates a simple schema that requires specific field types,
 * then generates a constants object that violates at least one field.
 *
 * Strategy: define a schema with a required 'name' (string) and 'count' (number) field,
 * then produce constants where at least one field has the wrong type.
 */
function _createSchemaAndInvalidConstants(): {
  schema: BrandedInterfaceDefinition;
  constants: Record<string, unknown>;
  id: string;
} {
  const id = `SchemaTest${++idCounter}`;
  const fields: Record<string, FieldDescriptor> = {
    name: { type: 'string' },
    count: { type: 'number' },
  };
  const schema = createBrandedInterface(id, fields);
  // Invalid: 'name' should be string but we give it a number,
  // 'count' should be number but we give it a string
  const constants = { name: 42, count: 'not-a-number' };
  return { schema, constants, id };
}

/**
 * Arbitrary that generates a schema with N required string fields
 * and constants that violate exactly one field by providing a number instead.
 */
const schemaAndInvalidConstantsArb = fc
  .tuple(
    schemaIdArb,
    fc.array(
      fc.stringMatching(/^[a-z][a-zA-Z0-9]{0,8}$/).filter((s) => s.length > 0),
      { minLength: 1, maxLength: 5 },
    ),
  )
  .map(([id, fieldNames]) => {
    // Deduplicate field names
    const uniqueNames = [...new Set(fieldNames)];
    if (uniqueNames.length === 0) return null;

    const fields: Record<string, FieldDescriptor> = {};
    const validConstants: Record<string, unknown> = {};
    const invalidConstants: Record<string, unknown> = {};

    for (const name of uniqueNames) {
      fields[name] = { type: 'string' };
      validConstants[name] = `value-${name}`;
      invalidConstants[name] = `value-${name}`;
    }

    // Corrupt the first field to make it invalid (number instead of string)
    invalidConstants[uniqueNames[0]] = 12345;

    const schema = createBrandedInterface(id, fields);
    return {
      schema,
      validConstants,
      invalidConstants,
      id,
      fieldNames: uniqueNames,
    };
  })
  .filter((v): v is NonNullable<typeof v> => v !== null);

describe('Feature: branded-interface-integration, Property 1: Schema-aware registration validates before storing', () => {
  beforeEach(() => {
    resetInterfaceRegistry();
    idCounter = 0;
  });

  afterEach(() => {
    resetInterfaceRegistry();
  });

  /**
   * Property 1: Schema-aware registration validates before storing
   *
   * For any valid branded interface definition and any constants object that
   * fails validation against that definition, calling register(componentId, constants, schema)
   * should throw an error and the constants should not be stored in the registry.
   *
   * **Validates: Requirements 1.2, 1.3**
   */
  it('Property 1: invalid constants are rejected and not stored when schema is provided', () => {
    fc.assert(
      fc.property(
        componentIdArb,
        schemaAndInvalidConstantsArb,
        (componentId, { schema, invalidConstants }) => {
          const registry = new ConstantsRegistry();

          // Attempting to register invalid constants with a schema should throw
          let threw = false;
          try {
            registry.register(componentId, invalidConstants, schema);
          } catch (err: unknown) {
            threw = true;
            // The error should be an I18nError with the correct code
            expect((err as { code: string }).code).toBe(
              I18nErrorCode.CONSTANTS_SCHEMA_VALIDATION_FAILED,
            );
          }

          expect(threw).toBe(true);

          // The constants should NOT be stored in the registry
          expect(registry.has(componentId)).toBe(false);
          expect(registry.get(componentId)).toBeUndefined();
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Complementary property: valid constants ARE stored when schema is provided.
   *
   * **Validates: Requirements 1.2**
   */
  it('Property 1 (complement): valid constants are accepted and stored when schema is provided', () => {
    fc.assert(
      fc.property(
        componentIdArb,
        schemaAndInvalidConstantsArb,
        (componentId, { schema, validConstants }) => {
          const registry = new ConstantsRegistry();

          // Valid constants should be accepted
          expect(() => {
            registry.register(componentId, validConstants, schema);
          }).not.toThrow();

          // The constants should be stored
          expect(registry.has(componentId)).toBe(true);
          const stored = registry.get(componentId);
          for (const key of Object.keys(validConstants)) {
            expect(stored?.[key]).toBe(validConstants[key]);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
