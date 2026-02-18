/**
 * Property-based tests for createConstantsSchema helper.
 *
 * Feature: branded-interface-integration, Property 3: createConstantsSchema produces valid definitions
 * **Validates: Requirements 1.5**
 */

import { resetInterfaceRegistry } from '@digitaldefiance/branded-interface';
import type {
  FieldDescriptor,
  FieldBaseType,
} from '@digitaldefiance/branded-interface';
import * as fc from 'fast-check';
import { createConstantsSchema } from '../../src/branded-constants-schema';

/**
 * Arbitrary for valid FieldBaseType values.
 */
const fieldBaseTypeArb: fc.Arbitrary<FieldBaseType> = fc.constantFrom(
  'string',
  'number',
  'boolean',
  'object',
  'array',
);

/**
 * Arbitrary for a valid FieldDescriptor (without validate predicate to keep it serializable).
 */
const fieldDescriptorArb: fc.Arbitrary<FieldDescriptor> = fc
  .record({
    type: fieldBaseTypeArb,
    optional: fc.option(fc.boolean(), { nil: undefined }),
    nullable: fc.option(fc.boolean(), { nil: undefined }),
  })
  .map(({ type, optional, nullable }): FieldDescriptor => {
    const result: FieldDescriptor = {
      type,
      ...(optional !== undefined ? { optional } : {}),
      ...(nullable !== undefined ? { nullable } : {}),
    };
    return result;
  });

/**
 * Arbitrary for a valid field name (lowercase alpha, 1-12 chars).
 */
const fieldNameArb = fc
  .stringMatching(/^[a-z][a-zA-Z0-9]{0,11}$/)
  .filter((s) => s.length > 0);

/**
 * Arbitrary for a non-empty record of field descriptors.
 */
const fieldsRecordArb = fc
  .array(fc.tuple(fieldNameArb, fieldDescriptorArb), {
    minLength: 1,
    maxLength: 8,
  })
  .map((pairs) => {
    const record: Record<string, FieldDescriptor> = {};
    for (const [key, descriptor] of pairs) {
      record[key] = descriptor;
    }
    return record;
  })
  .filter((r) => Object.keys(r).length > 0);

/**
 * Arbitrary for a unique schema ID (kebab-case).
 */
let idCounter = 0;
const schemaIdArb = fc
  .stringMatching(/^[A-Z][a-zA-Z]{2,15}$/)
  .map((s) => `${s}${++idCounter}`);

describe('Feature: branded-interface-integration, Property 3: createConstantsSchema produces valid definitions', () => {
  beforeEach(() => {
    resetInterfaceRegistry();
    idCounter = 0;
  });

  afterEach(() => {
    resetInterfaceRegistry();
  });

  /**
   * Property 3: createConstantsSchema produces valid definitions
   *
   * For any record of valid FieldDescriptor entries with string keys,
   * createConstantsSchema(id, fields) should return a BrandedInterfaceDefinition
   * whose schema contains exactly those field keys with matching descriptors.
   *
   * **Validates: Requirements 1.5**
   */
  it('Property 3: createConstantsSchema produces valid definitions', () => {
    fc.assert(
      fc.property(schemaIdArb, fieldsRecordArb, (id, fields) => {
        const definition = createConstantsSchema(id, fields);

        // The definition should have the correct id
        expect(definition.id).toBe(id);

        // The definition should have a schema property
        expect(definition.schema).toBeDefined();

        // The schema should contain exactly the same field keys
        const schemaKeys = Object.keys(definition.schema).sort();
        const inputKeys = Object.keys(fields).sort();
        expect(schemaKeys).toEqual(inputKeys);

        // Each field descriptor in the schema should match the input
        for (const key of inputKeys) {
          const schemaDescriptor = definition.schema[key];
          const inputDescriptor = fields[key];

          expect(schemaDescriptor.type).toBe(inputDescriptor.type);

          if (inputDescriptor.optional !== undefined) {
            expect(schemaDescriptor.optional).toBe(inputDescriptor.optional);
          }
          if (inputDescriptor.nullable !== undefined) {
            expect(schemaDescriptor.nullable).toBe(inputDescriptor.nullable);
          }
        }

        // The definition should have create and validate functions
        expect(typeof definition.create).toBe('function');
        expect(typeof definition.validate).toBe('function');

        // The definition should have a version (defaults to 1)
        expect(definition.version).toBe(1);
      }),
      { numRuns: 100 },
    );
  });
});
