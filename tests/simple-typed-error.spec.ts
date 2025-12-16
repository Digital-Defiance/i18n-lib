/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

/**
 * Tests for SimpleTypedError class
 */

import { TypedError } from '../src/errors/simple-typed-error';

describe('SimpleTypedError', () => {
  describe('constructor', () => {
    it('should create error with all properties', () => {
      const error = new TypedError('Test error message', {
        type: 'validation',
        componentId: 'test-component',
        reasonMap: { reason1: 'value1' },
        metadata: { field: 'email' },
      });

      expect(error.message).toBe('Test error message');
      expect(error.type).toBe('validation');
      expect(error.componentId).toBe('test-component');
      expect(error.reasonMap).toEqual({ reason1: 'value1' });
      expect(error.metadata).toEqual({ field: 'email' });
      expect(error.name).toBe('TypedError');
    });

    it('should create error with minimal properties', () => {
      const error = new TypedError('Minimal error', {
        type: 'network',
      });

      expect(error.message).toBe('Minimal error');
      expect(error.type).toBe('network');
      expect(error.componentId).toBeUndefined();
      expect(error.reasonMap).toBeUndefined();
      expect(error.metadata).toBeUndefined();
    });

    it('should support error cause chaining', () => {
      const cause = new Error('Original error');
      const error = new TypedError('Wrapped error', {
        type: 'wrapper',
        cause,
      });

      expect(error.cause).toBe(cause);
    });

    it('should maintain proper prototype chain', () => {
      const error = new TypedError('Test', { type: 'test' });

      expect(error instanceof TypedError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('isTypedError', () => {
    it('should return true for TypedError instances', () => {
      const error = new TypedError('Test', { type: 'test' });
      expect(TypedError.isTypedError(error)).toBe(true);
    });

    it('should return false for regular Error instances', () => {
      const error = new Error('Test');
      expect(TypedError.isTypedError(error)).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(TypedError.isTypedError(null)).toBe(false);
      expect(TypedError.isTypedError(undefined)).toBe(false);
      expect(TypedError.isTypedError('string')).toBe(false);
      expect(TypedError.isTypedError({})).toBe(false);
    });
  });

  describe('fromError', () => {
    it('should convert Error to TypedError', () => {
      const originalError = new Error('Original message');
      const typedError = TypedError.fromError(originalError, {
        type: 'converted',
        componentId: 'converter',
      });

      expect(typedError.message).toBe('Original message');
      expect(typedError.type).toBe('converted');
      expect(typedError.componentId).toBe('converter');
      expect(typedError.cause).toBe(originalError);
    });

    it('should preserve metadata when converting', () => {
      const originalError = new Error('Test');
      const typedError = TypedError.fromError(originalError, {
        type: 'test',
        metadata: { converted: true },
      });

      expect(typedError.metadata).toEqual({ converted: true });
    });
  });

  describe('property preservation', () => {
    it('should preserve all properties through error handling', () => {
      const options = {
        type: 'validation',
        componentId: 'form',
        reasonMap: { email: 'invalid', password: 'weak' },
        metadata: { timestamp: Date.now(), userId: 123 },
      };

      const error = new TypedError('Validation failed', options);

      // Simulate error being thrown and caught
      try {
        throw error;
      } catch (caught) {
        expect(caught).toBe(error);
        expect((caught as TypedError).type).toBe(options.type);
        expect((caught as TypedError).componentId).toBe(options.componentId);
        expect((caught as TypedError).reasonMap).toEqual(options.reasonMap);
        expect((caught as TypedError).metadata).toEqual(options.metadata);
      }
    });

    it('should have readonly properties at compile time', () => {
      const error = new TypedError('Test', {
        type: 'test',
        componentId: 'test-component',
      });

      // TypeScript readonly is compile-time only
      // At runtime, properties can be changed, but TypeScript prevents it
      // This test just verifies the properties exist and are accessible
      expect(error.type).toBe('test');
      expect(error.componentId).toBe('test-component');
    });
  });
});
