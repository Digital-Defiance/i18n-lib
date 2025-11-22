/**
 * Unit tests for type safety fixes in i18n-lib
 * Tests the TypedError class, enum translations, and global context access
 */

import { EnumRegistry } from '../src/core/enum-registry';
import { TypedError } from '../src/errors/simple-typed-error';
import { GlobalActiveContext } from '../src/global-active-context';
import {
  getPluralCategory,
  hasPluralForm,
} from '../src/pluralization/language-plural-map';

describe('Type Safety Fixes', () => {
  describe('TypedError class', () => {
    it('should create error with all properties', () => {
      const error = new TypedError('Test error message', {
        type: 'validation',
        componentId: 'test-component',
        reasonMap: { reason1: 'value1' },
        metadata: { field: 'email', value: 'invalid' },
      });

      expect(error.message).toBe('Test error message');
      expect(error.type).toBe('validation');
      expect(error.componentId).toBe('test-component');
      expect(error.reasonMap).toEqual({ reason1: 'value1' });
      expect(error.metadata).toEqual({ field: 'email', value: 'invalid' });
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
      const causeError = new Error('Original error');
      const error = new TypedError('Wrapped error', {
        type: 'wrapper',
        cause: causeError,
      });

      expect(error.cause).toBe(causeError);
      expect((error.cause as Error).message).toBe('Original error');
    });

    it('should correctly identify TypedError instances', () => {
      const typedError = new TypedError('Test', { type: 'test' });
      const regularError = new Error('Test');

      expect(TypedError.isTypedError(typedError)).toBe(true);
      expect(TypedError.isTypedError(regularError)).toBe(false);
      expect(TypedError.isTypedError(null)).toBe(false);
      expect(TypedError.isTypedError(undefined)).toBe(false);
    });

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
  });

  describe('Enum translation type safety', () => {
    enum TestEnum {
      Value1 = 'value1',
      Value2 = 'value2',
      Value3 = 'value3',
    }

    enum NumericEnum {
      First = 1,
      Second = 2,
      Third = 3,
    }

    let registry: EnumRegistry;

    beforeEach(() => {
      registry = new EnumRegistry();
    });

    it('should register and translate string enum values', () => {
      registry.register(
        TestEnum,
        {
          'en-US': {
            value1: 'Value One',
            value2: 'Value Two',
            value3: 'Value Three',
          },
          fr: {
            value1: 'Valeur Un',
            value2: 'Valeur Deux',
            value3: 'Valeur Trois',
          },
        },
        'TestEnum',
      );

      expect(registry.translate(TestEnum, TestEnum.Value1, 'en-US')).toBe(
        'Value One',
      );
      expect(registry.translate(TestEnum, TestEnum.Value2, 'fr')).toBe(
        'Valeur Deux',
      );
    });

    it('should register and translate numeric enum values', () => {
      registry.register(
        NumericEnum,
        {
          'en-US': {
            '1': 'First',
            '2': 'Second',
            '3': 'Third',
            First: 'First',
            Second: 'Second',
            Third: 'Third',
          },
        },
        'NumericEnum',
      );

      expect(registry.translate(NumericEnum, NumericEnum.First, 'en-US')).toBe(
        'First',
      );
      expect(registry.translate(NumericEnum, 1, 'en-US')).toBe('First');
    });

    it('should check if enum is registered', () => {
      expect(registry.has(TestEnum)).toBe(false);

      registry.register(
        TestEnum,
        { 'en-US': { value1: 'Value One' } },
        'TestEnum',
      );

      expect(registry.has(TestEnum)).toBe(true);
    });
  });

  describe('Global context access', () => {
    beforeEach(() => {
      GlobalActiveContext.clearAll();
    });

    afterEach(() => {
      GlobalActiveContext.clearAll();
    });

    it('should access GlobalActiveContext from globalThis', () => {
      // The GlobalActiveContext should be registered in globalThis
      expect(globalThis.GlobalActiveContext).toBeDefined();
      expect(globalThis.GlobalActiveContext).toBe(GlobalActiveContext);
    });

    it('should create and access context', () => {
      const context = GlobalActiveContext.getInstance();
      context.createContext('en-US');

      expect(context.userLanguage).toBe('en-US');
    });

    it('should manage multiple contexts', () => {
      const context = GlobalActiveContext.getInstance();
      context.createContext('en-US', 'en-US', 'context1');
      context.createContext('fr', 'fr', 'context2');

      const ctx1 = context.getContext('context1');
      const ctx2 = context.getContext('context2');

      expect(ctx1.language).toBe('en-US');
      expect(ctx2.language).toBe('fr');
    });
  });

  describe('Plural category type safety', () => {
    it('should return correct plural category for English', () => {
      expect(getPluralCategory('en', 0)).toBe('other');
      expect(getPluralCategory('en', 1)).toBe('one');
      expect(getPluralCategory('en', 2)).toBe('other');
      expect(getPluralCategory('en', 5)).toBe('other');
    });

    it('should return correct plural category for Russian', () => {
      expect(getPluralCategory('ru', 1)).toBe('one');
      expect(getPluralCategory('ru', 2)).toBe('few');
      expect(getPluralCategory('ru', 5)).toBe('many');
      expect(getPluralCategory('ru', 11)).toBe('many');
    });

    it('should check if language has plural form', () => {
      expect(hasPluralForm('en', 'one')).toBe(true);
      expect(hasPluralForm('en', 'other')).toBe(true);
      expect(hasPluralForm('en', 'few')).toBe(false);
      expect(hasPluralForm('en', 'invalid')).toBe(false);
    });

    it('should handle invalid plural categories', () => {
      expect(hasPluralForm('en', 'notacategory')).toBe(false);
      expect(hasPluralForm('en', '')).toBe(false);
    });

    it('should fallback to English for unknown languages', () => {
      const category = getPluralCategory('unknown-lang', 1);
      expect(category).toBe('one'); // English rule
    });
  });
});
