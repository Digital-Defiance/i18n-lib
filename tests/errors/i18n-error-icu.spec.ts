/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

/**
 * Tests for I18nError ICU MessageFormat integration
 * Verifies that error classes properly leverage 3.5.0 ICU features
 */

import { I18nError, I18nErrorCode } from '../../src/errors/i18n-error';

describe('I18nError ICU MessageFormat Integration', () => {
  describe('validationFailed - Plural Support with Number Formatting', () => {
    it('should use ICU plural "one" form for single error with number formatting', () => {
      const error = I18nError.validationFailed(['Missing field']);

      expect(error.message).toMatch(/1 error/i);
      expect(error.message).not.toMatch(/errors/i);
      expect(error.metadata?.count).toBe(1);
    });

    it('should use ICU plural "other" form for multiple errors with number formatting', () => {
      const errors = ['Missing field', 'Invalid format', 'Too long'];
      const error = I18nError.validationFailed(errors);

      expect(error.message).toMatch(/3 errors/i);
      expect(error.metadata?.count).toBe(3);
    });

    it('should format zero errors correctly', () => {
      const error = I18nError.validationFailed([]);

      expect(error.message).toMatch(/0 errors/i);
      expect(error.metadata?.count).toBe(0);
    });

    it('should work with different locales', () => {
      const errors = ['erreur1', 'erreur2'];

      // French pluralization
      const frError = I18nError.validationFailed(errors, 'fr');
      expect(frError.message).toContain('erreur1');
      expect(frError.metadata?.count).toBe(2);

      // Spanish pluralization
      const esError = I18nError.validationFailed(errors, 'es');
      expect(esError.metadata?.count).toBe(2);
    });

    it('should include all error details in message', () => {
      const errors = ['Error A', 'Error B', 'Error C'];
      const error = I18nError.validationFailed(errors);

      errors.forEach((err) => {
        expect(error.message).toContain(err);
      });
    });

    it('should handle complex error messages with special characters', () => {
      const errors = [
        "Field 'username' is required",
        'Password must be at least 8 characters',
        'Email format: user@domain.com',
      ];
      const error = I18nError.validationFailed(errors);

      expect(error.message).toContain('3 errors');
      errors.forEach((err) => {
        expect(error.message).toContain(err);
      });
    });
  });

  describe('pluralFormNotFound - Nested Select and Number Formatting', () => {
    it('should use nested ICU select and number formatting to show available forms', () => {
      const errorWithKey = I18nError.pluralFormNotFound('few', 'ru', 'items', [
        'one',
        'many',
      ]);

      expect(errorWithKey.message).toContain('few');
      expect(errorWithKey.message).toContain('key items');
      expect(errorWithKey.message).toContain('ru');
      expect(errorWithKey.message).toMatch(/Available forms.*\(2\)/);
      expect(errorWithKey.metadata?.formCount).toBe(2);
    });

    it('should list all available forms', () => {
      const forms = ['zero', 'one', 'two', 'few', 'many', 'other'];
      const error = I18nError.pluralFormNotFound(
        'invalid',
        'ar',
        'count',
        forms,
      );

      forms.forEach((form) => {
        expect(error.message).toContain(form);
      });
      expect(error.metadata?.availableForms).toEqual(forms);
    });

    it('should work with minimal available forms', () => {
      const error = I18nError.pluralFormNotFound('many', 'en', 'items', [
        'other',
      ]);

      expect(error.message).toContain('other');
      expect(error.metadata?.availableForms).toEqual(['other']);
    });

    it('should format for different languages', () => {
      // Russian with many forms
      const ruError = I18nError.pluralFormNotFound('few', 'ru', 'товары', [
        'one',
        'few',
        'many',
      ]);
      expect(ruError.message).toContain('ru');

      // Arabic with all forms
      const arError = I18nError.pluralFormNotFound('invalid', 'ar', 'عناصر', [
        'zero',
        'one',
        'two',
        'few',
        'many',
        'other',
      ]);
      expect(arError.message).toContain('ar');
    });
  });

  describe('invalidPluralCategory - Nested Plural and Number Formatting', () => {
    it('should use ICU plural "one" form for single valid category with number count', () => {
      const error = I18nError.invalidPluralCategory('bad', ['one']);

      expect(error.message).toMatch(/Valid category.*\(1\)/i);
      expect(error.message).not.toMatch(/categories/i);
      expect(error.metadata?.count).toBe(1);
    });

    it('should use ICU plural "other" form for multiple valid categories with number count', () => {
      const categories = ['one', 'few', 'many', 'other'];
      const error = I18nError.invalidPluralCategory('invalid', categories);

      expect(error.message).toMatch(/Valid categories.*\(4\)/i);
      expect(error.metadata?.count).toBe(4);
    });

    it('should list all valid categories', () => {
      const categories = ['one', 'other'];
      const error = I18nError.invalidPluralCategory('wrong', categories);

      expect(error.message).toContain('wrong');
      categories.forEach((cat) => {
        expect(error.message).toContain(cat);
      });
    });

    it('should work with different locales', () => {
      const categories = ['one', 'other'];

      // English
      const enError = I18nError.invalidPluralCategory(
        'bad',
        categories,
        'en-US',
      );
      expect(enError.metadata?.count).toBe(2);

      // French
      const frError = I18nError.invalidPluralCategory(
        'mauvais',
        categories,
        'fr',
      );
      expect(frError.metadata?.count).toBe(2);
    });

    it('should handle complex plural systems', () => {
      // Arabic categories
      const arabicCategories = ['zero', 'one', 'two', 'few', 'many', 'other'];
      const error = I18nError.invalidPluralCategory(
        'invalid',
        arabicCategories,
        'ar',
      );

      expect(error.message).toMatch(/Valid categories/i);
      expect(error.metadata?.count).toBe(6);
    });
  });

  describe('ICU Feature Integration', () => {
    it('should handle nested variable substitution in validation errors', () => {
      const errors = [
        'Field {username} is required',
        'Value {price} is invalid',
      ];
      const error = I18nError.validationFailed(errors);

      expect(error.message).toContain('2 errors');
      expect(error.message).toContain('username');
      expect(error.message).toContain('price');
    });

    it('should preserve error metadata for debugging', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      const error = I18nError.validationFailed(errors);

      expect(error.metadata).toMatchObject({
        errors,
        count: 3,
      });
      expect(error.code).toBe(I18nErrorCode.VALIDATION_FAILED);
    });

    it('should work with special characters in error messages', () => {
      const errors = [
        "Field 'user.name' contains invalid characters: @#$",
        'Path "/api/v1" not found',
        'Regex pattern: ^[a-z]+$ failed',
      ];
      const error = I18nError.validationFailed(errors);

      expect(error.message).toContain('3 errors');
      errors.forEach((err) => {
        expect(error.message).toContain(err);
      });
    });

    it('should handle Unicode characters in error messages', () => {
      const errors = [
        '用户名必填',
        'パスワードが無効です',
        'Адреса електронної пошти недійсна',
      ];
      const error = I18nError.validationFailed(errors);

      expect(error.message).toContain('3 errors');
      errors.forEach((err) => {
        expect(error.message).toContain(err);
      });
    });

    it('should format large numbers correctly', () => {
      const manyErrors = Array.from(
        { length: 100 },
        (_, i) => `Error ${i + 1}`,
      );
      const error = I18nError.validationFailed(manyErrors);

      expect(error.message).toContain('100 errors');
      expect(error.metadata?.count).toBe(100);
    });
  });

  describe('Error Class Properties', () => {
    it('should maintain proper error class hierarchy', () => {
      const error = I18nError.validationFailed(['test']);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(I18nError);
      expect(error.name).toBe('I18nError');
    });

    it('should have stack trace', () => {
      const error = I18nError.validationFailed(['test']);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('I18nError');
    });

    it('should be throwable', () => {
      expect(() => {
        throw I18nError.validationFailed(['test']);
      }).toThrow(I18nError);
    });

    it('should be catchable with error code', () => {
      try {
        throw I18nError.validationFailed(['test']);
      } catch (error) {
        expect(error).toBeInstanceOf(I18nError);
        expect((error as I18nError).code).toBe(I18nErrorCode.VALIDATION_FAILED);
      }
    });
  });

  describe('Real-World Error Scenarios', () => {
    it('should format form validation errors', () => {
      const errors = [
        'Email is required',
        'Password must be at least 8 characters',
        'Password must contain at least one number',
        'Password must contain at least one special character',
      ];
      const error = I18nError.validationFailed(errors);

      expect(error.message).toContain('4 errors');
      expect(error.message).toContain('Email');
      expect(error.message).toContain('Password');
    });

    it('should format API validation errors', () => {
      const errors = [
        'Missing required field: username',
        'Invalid format: email',
        'Value out of range: age must be between 18 and 120',
      ];
      const error = I18nError.validationFailed(errors);

      expect(error.message).toContain('3 errors');
      errors.forEach((err) => {
        expect(error.message).toContain(err);
      });
    });

    it('should format pluralization errors with context', () => {
      const error = I18nError.pluralFormNotFound('few', 'ru', 'cart.items', [
        'one',
        'many',
      ]);

      expect(error.message).toContain('few');
      expect(error.message).toContain('cart.items');
      expect(error.message).toContain('ru');
      expect(error.metadata).toMatchObject({
        category: 'few',
        language: 'ru',
        key: 'cart.items',
        availableForms: ['one', 'many'],
      });
    });
  });

  describe('Locale-Specific Formatting', () => {
    it('should respect locale parameter in validationFailed', () => {
      const errors = ['test'];

      const enError = I18nError.validationFailed(errors, 'en-US');
      const frError = I18nError.validationFailed(errors, 'fr');
      const deError = I18nError.validationFailed(errors, 'de');

      // All should work without throwing
      expect(enError).toBeInstanceOf(I18nError);
      expect(frError).toBeInstanceOf(I18nError);
      expect(deError).toBeInstanceOf(I18nError);
    });

    it('should respect locale parameter in invalidPluralCategory', () => {
      const categories = ['one', 'other'];

      const enError = I18nError.invalidPluralCategory(
        'bad',
        categories,
        'en-US',
      );
      const frError = I18nError.invalidPluralCategory('bad', categories, 'fr');
      const esError = I18nError.invalidPluralCategory('bad', categories, 'es');

      // All should work without throwing
      expect(enError).toBeInstanceOf(I18nError);
      expect(frError).toBeInstanceOf(I18nError);
      expect(esError).toBeInstanceOf(I18nError);
    });

    it('should respect locale parameter in all error methods', () => {
      // Test all methods that accept language parameter
      const methods = [
        () => I18nError.componentNotFound('test', 'fr'),
        () => I18nError.stringKeyNotFound('comp', 'key', 'fr'),
        () => I18nError.languageNotFound('en', 'fr'),
        () => I18nError.translationMissing('comp', 'key', 'en', 'fr'),
        () => I18nError.duplicateComponent('test', 'fr'),
        () => I18nError.duplicateLanguage('en', 'fr'),
        () => I18nError.instanceNotFound('key', 'fr'),
        () => I18nError.instanceExists('key', 'fr'),
        () => I18nError.invalidContext('ctx', 'fr'),
        () => I18nError.missingCountVariable('items', 'fr'),
      ];

      methods.forEach((method) => {
        const error = method();
        expect(error).toBeInstanceOf(I18nError);
      });
    });
  });

  describe('All I18nError Methods - ICU Integration', () => {
    it('should format componentNotFound with ICU', () => {
      const error = I18nError.componentNotFound('auth');

      expect(error.message).toContain('auth');
      expect(error.code).toBe(I18nErrorCode.COMPONENT_NOT_FOUND);
      expect(error.metadata?.componentId).toBe('auth');
    });

    it('should format stringKeyNotFound with ICU', () => {
      const error = I18nError.stringKeyNotFound('auth', 'login');

      expect(error.message).toContain('auth');
      expect(error.message).toContain('login');
      expect(error.code).toBe(I18nErrorCode.STRING_KEY_NOT_FOUND);
    });

    it('should format languageNotFound with ICU', () => {
      const error = I18nError.languageNotFound('pt-BR');

      expect(error.message).toContain('pt-BR');
      expect(error.code).toBe(I18nErrorCode.LANGUAGE_NOT_FOUND);
    });

    it('should format translationMissing with ICU', () => {
      const error = I18nError.translationMissing('app', 'welcome', 'ja');

      expect(error.message).toContain('app');
      expect(error.message).toContain('welcome');
      expect(error.message).toContain('ja');
      expect(error.code).toBe(I18nErrorCode.TRANSLATION_MISSING);
    });

    it('should format duplicateComponent with ICU', () => {
      const error = I18nError.duplicateComponent('core');

      expect(error.message).toContain('core');
      expect(error.code).toBe(I18nErrorCode.DUPLICATE_COMPONENT);
    });

    it('should format duplicateLanguage with ICU', () => {
      const error = I18nError.duplicateLanguage('es');

      expect(error.message).toContain('es');
      expect(error.code).toBe(I18nErrorCode.DUPLICATE_LANGUAGE);
    });

    it('should format instanceNotFound with ICU', () => {
      const error = I18nError.instanceNotFound('myapp');

      expect(error.message).toContain('myapp');
      expect(error.code).toBe(I18nErrorCode.INSTANCE_NOT_FOUND);
    });

    it('should format instanceExists with ICU', () => {
      const error = I18nError.instanceExists('default');

      expect(error.message).toContain('default');
      expect(error.code).toBe(I18nErrorCode.INSTANCE_EXISTS);
    });

    it('should format invalidContext with ICU', () => {
      const error = I18nError.invalidContext('invalidKey');

      expect(error.message).toContain('invalidKey');
      expect(error.code).toBe(I18nErrorCode.INVALID_CONTEXT);
    });

    it('should format missingCountVariable with ICU', () => {
      const error = I18nError.missingCountVariable('cart.items');

      expect(error.message).toContain('cart.items');
      expect(error.message).toContain('count');
      expect(error.code).toBe(I18nErrorCode.MISSING_COUNT_VARIABLE);
    });
  });

  describe('ICU Variable Substitution', () => {
    it('should handle special characters in component IDs', () => {
      const error = I18nError.componentNotFound('my-component.v2');

      expect(error.message).toContain('my-component.v2');
    });

    it('should handle special characters in string keys', () => {
      const error = I18nError.stringKeyNotFound('app', 'error.not_found');

      expect(error.message).toContain('error.not_found');
    });

    it('should handle Unicode in language codes', () => {
      const error = I18nError.languageNotFound('zh-汉');

      expect(error.message).toContain('zh-汉');
    });

    it('should handle complex translation paths', () => {
      const error = I18nError.translationMissing(
        'auth.validation',
        'password.requirements.min_length',
        'en-US',
      );

      expect(error.message).toContain('auth.validation');
      expect(error.message).toContain('password.requirements.min_length');
    });

    it('should handle context keys with special characters', () => {
      const error = I18nError.invalidContext('user:context:key');

      expect(error.message).toContain('user:context:key');
    });
  });

  describe('Multilingual Error Messages', () => {
    it('should support English error messages', () => {
      const error = I18nError.componentNotFound('test', 'en-US');
      expect(error).toBeInstanceOf(I18nError);
    });

    it('should support French error messages', () => {
      const error = I18nError.componentNotFound('test', 'fr');
      expect(error).toBeInstanceOf(I18nError);
    });

    it('should support Spanish error messages', () => {
      const error = I18nError.componentNotFound('test', 'es');
      expect(error).toBeInstanceOf(I18nError);
    });

    it('should support German error messages', () => {
      const error = I18nError.componentNotFound('test', 'de');
      expect(error).toBeInstanceOf(I18nError);
    });

    it('should support Russian error messages', () => {
      const error = I18nError.componentNotFound('test', 'ru');
      expect(error).toBeInstanceOf(I18nError);
    });

    it('should support Arabic error messages', () => {
      const error = I18nError.componentNotFound('test', 'ar');
      expect(error).toBeInstanceOf(I18nError);
    });

    it('should support Japanese error messages', () => {
      const error = I18nError.componentNotFound('test', 'ja');
      expect(error).toBeInstanceOf(I18nError);
    });

    it('should support Chinese error messages', () => {
      const error = I18nError.componentNotFound('test', 'zh-CN');
      expect(error).toBeInstanceOf(I18nError);
    });
  });

  describe('Backward Compatibility', () => {
    it('should work without language parameter (default en-US)', () => {
      const errors = [
        I18nError.componentNotFound('test'),
        I18nError.stringKeyNotFound('comp', 'key'),
        I18nError.languageNotFound('lang'),
        I18nError.duplicateComponent('comp'),
        I18nError.duplicateLanguage('lang'),
        I18nError.instanceNotFound('key'),
        I18nError.instanceExists('key'),
        I18nError.invalidContext('ctx'),
        I18nError.missingCountVariable('items'),
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(I18nError);
        expect(error.message).toBeTruthy();
      });
    });

    it('should maintain same error codes as before', () => {
      expect(I18nError.componentNotFound('test').code).toBe(
        I18nErrorCode.COMPONENT_NOT_FOUND,
      );
      expect(I18nError.validationFailed([]).code).toBe(
        I18nErrorCode.VALIDATION_FAILED,
      );
      expect(I18nError.pluralFormNotFound('few', 'ru', 'items', []).code).toBe(
        I18nErrorCode.PLURAL_FORM_NOT_FOUND,
      );
    });

    it('should maintain same metadata structure', () => {
      const compError = I18nError.componentNotFound('test');
      expect(compError.metadata).toHaveProperty('componentId');

      const validError = I18nError.validationFailed(['err1']);
      expect(validError.metadata).toHaveProperty('errors');
      expect(validError.metadata).toHaveProperty('count');
    });
  });
});
