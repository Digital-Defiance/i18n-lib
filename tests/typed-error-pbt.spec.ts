/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

/**
 * Property-based tests for TypedError class
 *
 * **Feature: type-safety-audit, Property: Typed error preserves all properties**
 * **Validates: Requirements 3.1**
 */

import * as fc from 'fast-check';
import { TypedError } from '../src/errors/simple-typed-error';

describe('TypedError Property-Based Tests', () => {
  describe('Property: Typed error preserves all properties', () => {
    it('should preserve all properties for any valid error configuration', () => {
      fc.assert(
        fc.property(
          // Generate random error messages
          fc.string({ minLength: 1, maxLength: 200 }),
          // Generate random type strings
          fc.string({ minLength: 1, maxLength: 50 }),
          // Generate optional componentId
          fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          // Generate optional reasonMap
          fc.option(fc.dictionary(fc.string(), fc.anything())),
          // Generate optional metadata
          fc.option(fc.dictionary(fc.string(), fc.anything())),
          (message, type, componentId, reasonMap, metadata) => {
            // Create TypedError with generated properties
            const error = new TypedError(message, {
              type,
              componentId: componentId ?? undefined,
              reasonMap: reasonMap ?? undefined,
              metadata: metadata ?? undefined,
            });

            // Property: All provided properties should be preserved
            expect(error.message).toBe(message);
            expect(error.type).toBe(type);
            expect(error.name).toBe('TypedError');

            if (componentId !== null) {
              expect(error.componentId).toBe(componentId);
            }

            if (reasonMap !== null) {
              expect(error.reasonMap).toEqual(reasonMap);
            }

            if (metadata !== null) {
              expect(error.metadata).toEqual(metadata);
            }

            // Property: Error should be an instance of Error
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(TypedError);

            // Property: Error should have a stack trace
            expect(error.stack).toBeDefined();
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should preserve cause chain for any error', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (message1, type1, message2, type2) => {
            // Create a cause error
            const causeError = new Error(message1);

            // Create TypedError with cause
            const error = new TypedError(message2, {
              type: type2,
              cause: causeError,
            });

            // Property: Cause should be preserved
            expect(error.cause).toBe(causeError);
            expect((error.cause as Error).message).toBe(message1);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should correctly identify TypedError instances', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (message, type) => {
            const error = new TypedError(message, { type });

            // Property: isTypedError should correctly identify TypedError instances
            expect(TypedError.isTypedError(error)).toBe(true);
            expect(TypedError.isTypedError(new Error('test'))).toBe(false);
            expect(TypedError.isTypedError(null)).toBe(false);
            expect(TypedError.isTypedError(undefined)).toBe(false);
            expect(TypedError.isTypedError('string')).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should convert standard Error to TypedError preserving message', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.option(fc.string({ minLength: 1 })),
          (errorMessage, type, componentId) => {
            const originalError = new Error(errorMessage);

            const typedError = TypedError.fromError(originalError, {
              type,
              componentId: componentId ?? undefined,
            });

            // Property: Message should be preserved
            expect(typedError.message).toBe(errorMessage);

            // Property: Type should be set
            expect(typedError.type).toBe(type);

            // Property: Original error should be the cause
            expect(typedError.cause).toBe(originalError);

            if (componentId !== null) {
              expect(typedError.componentId).toBe(componentId);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle empty metadata and reasonMap correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (message, type) => {
            // Create error with empty objects
            const error = new TypedError(message, {
              type,
              metadata: {},
              reasonMap: {},
            });

            // Property: Empty objects should be preserved (not undefined)
            expect(error.metadata).toEqual({});
            expect(error.reasonMap).toEqual({});
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should handle complex nested metadata structures', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.object({ maxDepth: 3 }), // Generate nested objects
          (message, type, metadata) => {
            const error = new TypedError(message, {
              type,
              metadata,
            });

            // Property: Complex metadata should be preserved
            expect(error.metadata).toEqual(metadata);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
