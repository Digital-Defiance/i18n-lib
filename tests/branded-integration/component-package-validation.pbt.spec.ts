/**
 * Property-based tests for component package registration with constantsSchema.
 *
 * Feature: branded-interface-integration, Property 4: Component package registration validates constants against schema
 * **Validates: Requirements 2.2, 2.3**
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
import { createI18nStringKeys } from '../../src/branded-string-key';
import { I18nEngine } from '../../src/core/i18n-engine';
import { createI18nSetup } from '../../src/create-i18n-setup';
import { I18nErrorCode } from '../../src/errors/i18n-error';
import type { I18nComponentPackage } from '../../src/interfaces/i18n-component-package.interface';

let idCounter = 0;

/**
 * Generates a unique schema ID for each test run to avoid registry collisions.
 */
const schemaIdArb = fc
  .stringMatching(/^[A-Z][a-zA-Z]{2,12}$/)
  .map((s) => `${s}Pkg${++idCounter}`);

/**
 * Generates a valid component ID (lowercase kebab-case).
 */
const componentIdArb = fc
  .stringMatching(/^[a-z][a-z0-9]{1,10}$/)
  .filter((s) => !s.endsWith('-'));

/**
 * Generates a set of unique field names for schema definitions.
 */
const fieldNamesArb = fc
  .array(
    fc.stringMatching(/^[a-z][a-zA-Z0-9]{0,8}$/).filter((s) => s.length > 0),
    { minLength: 1, maxLength: 5 },
  )
  .map((names) => [...new Set(names)])
  .filter((names) => names.length > 0);

/**
 * Builds a schema + valid constants + invalid constants triple from field names.
 */
function buildSchemaAndConstants(
  schemaId: string,
  fieldNames: string[],
): {
  schema: BrandedInterfaceDefinition;
  validConstants: Record<string, unknown>;
  invalidConstants: Record<string, unknown>;
} {
  const fields: Record<string, FieldDescriptor> = {};
  const validConstants: Record<string, unknown> = {};
  const invalidConstants: Record<string, unknown> = {};

  for (const name of fieldNames) {
    fields[name] = { type: 'string' };
    validConstants[name] = `value-${name}`;
    invalidConstants[name] = `value-${name}`;
  }

  // Corrupt the first field to make it invalid (number instead of string)
  invalidConstants[fieldNames[0]] = 99999;

  const schema = createBrandedInterface(schemaId, fields);
  return { schema, validConstants, invalidConstants };
}

/**
 * Creates a minimal component config with a single string for en-US.
 */
function makeComponentConfig(componentId: string) {
  return {
    id: componentId,
    strings: { 'en-US': { [`${componentId}.key`]: 'hello' } },
  };
}

describe('Feature: branded-interface-integration, Property 4: Component package registration validates constants against schema', () => {
  beforeEach(() => {
    resetInterfaceRegistry();
    I18nEngine.resetAll();
    idCounter = 0;
  });

  afterEach(() => {
    resetInterfaceRegistry();
    I18nEngine.resetAll();
  });

  /**
   * Property 4: Component package registration validates constants against schema
   *
   * For any I18nComponentPackage containing both constants and constantsSchema,
   * if the constants fail validation against the schema, the factory registration
   * should throw an error with the interface ID and field-level errors.
   *
   * **Validates: Requirements 2.2, 2.3**
   */
  it('Property 4: packages with invalid constants and schema throw on registration', () => {
    fc.assert(
      fc.property(
        componentIdArb,
        schemaIdArb,
        fieldNamesArb,
        (componentId, schemaId, fieldNames) => {
          // Reset between iterations to avoid instance key collisions
          I18nEngine.resetAll();
          resetInterfaceRegistry();

          const { schema, invalidConstants } = buildSchemaAndConstants(
            schemaId,
            fieldNames,
          );

          const libPkg: I18nComponentPackage = {
            config: makeComponentConfig(componentId),
            constants: invalidConstants,
            constantsSchema: schema,
          };

          const AppKeys = createI18nStringKeys(`app-${componentId}`, {
            Hello: `app-${componentId}.hello`,
          } as const);

          const instanceKey = `test-${componentId}-${schemaId}`;

          let threw = false;
          try {
            createI18nSetup({
              componentId: `app-${componentId}`,
              stringKeyEnum: AppKeys,
              strings: {
                'en-US': { [`app-${componentId}.hello`]: 'Hi' },
              },
              instanceKey,
              libraryComponents: [libPkg],
            });
          } catch (err: unknown) {
            threw = true;
            const i18nErr = err as {
              code: string;
              message: string;
              metadata?: Record<string, unknown>;
            };
            // Error should have the correct code
            expect(i18nErr.code).toBe(
              I18nErrorCode.CONSTANTS_SCHEMA_VALIDATION_FAILED,
            );
            // Error message should contain the interface ID
            expect(i18nErr.message).toContain(schemaId);
            // Error metadata should contain field errors
            expect(i18nErr.metadata).toBeDefined();
            const fieldErrors = i18nErr.metadata?.['fieldErrors'] as
              | ReadonlyArray<{ field: string; message: string }>
              | undefined;
            expect(fieldErrors).toBeDefined();
            expect(fieldErrors!.length).toBeGreaterThan(0);
          }

          expect(threw).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Complementary property: packages with valid constants and schema succeed.
   *
   * **Validates: Requirements 2.2**
   */
  it('Property 4 (complement): packages with valid constants and schema register successfully', () => {
    fc.assert(
      fc.property(
        componentIdArb,
        schemaIdArb,
        fieldNamesArb,
        (componentId, schemaId, fieldNames) => {
          I18nEngine.resetAll();
          resetInterfaceRegistry();

          const { schema, validConstants } = buildSchemaAndConstants(
            schemaId,
            fieldNames,
          );

          const libPkg: I18nComponentPackage = {
            config: makeComponentConfig(componentId),
            constants: validConstants,
            constantsSchema: schema,
          };

          const AppKeys = createI18nStringKeys(`app-${componentId}`, {
            Hello: `app-${componentId}.hello`,
          } as const);

          const instanceKey = `test-valid-${componentId}-${schemaId}`;

          // Should not throw
          const result = createI18nSetup({
            componentId: `app-${componentId}`,
            stringKeyEnum: AppKeys,
            strings: {
              'en-US': { [`app-${componentId}.hello`]: 'Hi' },
            },
            instanceKey,
            libraryComponents: [libPkg],
          });

          // Constants should be registered
          expect(result.engine.hasConstants(componentId)).toBe(true);
          const stored = result.engine.getConstants(componentId);
          for (const key of Object.keys(validConstants)) {
            expect(stored?.[key]).toBe(validConstants[key]);
          }

          result.reset();
        },
      ),
      { numRuns: 100 },
    );
  });
});
