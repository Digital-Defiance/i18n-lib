/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { I18nError, I18nErrorCode } from '../src/errors/i18n-error';

describe('I18nError coverage', () => {
  describe('static factory methods with ICU formatting', () => {
    it('should create componentNotFound error with ICU formatting', () => {
      const error = I18nError.componentNotFound('myComponent');

      expect(error.code).toBe(I18nErrorCode.COMPONENT_NOT_FOUND);
      expect(error.message).toContain('myComponent');
      expect(error.metadata?.componentId).toBe('myComponent');
    });

    it('should create componentNotFound error in different language', () => {
      const error = I18nError.componentNotFound('myComponent', 'fr');

      expect(error.code).toBe(I18nErrorCode.COMPONENT_NOT_FOUND);
      expect(error.message).toContain('myComponent');
    });

    it('should create stringKeyNotFound error with ICU formatting', () => {
      const error = I18nError.stringKeyNotFound('myComponent', 'myKey');

      expect(error.code).toBe(I18nErrorCode.STRING_KEY_NOT_FOUND);
      expect(error.message).toContain('myComponent');
      expect(error.message).toContain('myKey');
      expect(error.metadata?.componentId).toBe('myComponent');
      expect(error.metadata?.stringKey).toBe('myKey');
    });

    it('should create languageNotFound error with ICU formatting', () => {
      const error = I18nError.languageNotFound('ru');

      expect(error.code).toBe(I18nErrorCode.LANGUAGE_NOT_FOUND);
      expect(error.message).toContain('ru');
      expect(error.metadata?.language).toBe('ru');
    });

    it('should create translationMissing error with ICU formatting', () => {
      const error = I18nError.translationMissing('app', 'title', 'fr');

      expect(error.code).toBe(I18nErrorCode.TRANSLATION_MISSING);
      expect(error.message).toContain('app');
      expect(error.message).toContain('title');
      expect(error.message).toContain('fr');
      expect(error.metadata).toMatchObject({
        componentId: 'app',
        stringKey: 'title',
        language: 'fr',
      });
    });

    it('should create duplicateComponent error with ICU formatting', () => {
      const error = I18nError.duplicateComponent('existingComponent');

      expect(error.code).toBe(I18nErrorCode.DUPLICATE_COMPONENT);
      expect(error.message).toContain('existingComponent');
      expect(error.metadata?.componentId).toBe('existingComponent');
    });

    it('should create duplicateLanguage error with ICU formatting', () => {
      const error = I18nError.duplicateLanguage('en-US');

      expect(error.code).toBe(I18nErrorCode.DUPLICATE_LANGUAGE);
      expect(error.message).toContain('en-US');
      expect(error.metadata?.language).toBe('en-US');
    });

    it('should create validationFailed error with ICU plural formatting', () => {
      const errors = ['error1', 'error2'];
      const error = I18nError.validationFailed(errors);

      expect(error.code).toBe(I18nErrorCode.VALIDATION_FAILED);
      expect(error.message).toContain('2 errors'); // ICU plural
      expect(error.message).toContain('error1');
      expect(error.message).toContain('error2');
      expect(error.metadata?.errors).toEqual(errors);
      expect(error.metadata?.count).toBe(2);
    });

    it('should create validationFailed error with singular form', () => {
      const errors = ['single error'];
      const error = I18nError.validationFailed(errors);

      expect(error.code).toBe(I18nErrorCode.VALIDATION_FAILED);
      expect(error.message).toContain('1 error'); // ICU singular
      expect(error.message).toContain('single error');
      expect(error.metadata?.count).toBe(1);
    });

    it('should create validationFailed error in different language', () => {
      const errors = ['erreur1', 'erreur2'];
      const error = I18nError.validationFailed(errors, 'fr');

      expect(error.code).toBe(I18nErrorCode.VALIDATION_FAILED);
      expect(error.message).toContain('erreur1');
      expect(error.message).toContain('erreur2');
      expect(error.metadata?.count).toBe(2);
    });

    it('should create instanceNotFound error with ICU formatting', () => {
      const error = I18nError.instanceNotFound('test-key');

      expect(error.code).toBe(I18nErrorCode.INSTANCE_NOT_FOUND);
      expect(error.message).toContain('test-key');
      expect(error.metadata?.key).toBe('test-key');
    });

    it('should create instanceExists error with ICU formatting', () => {
      const error = I18nError.instanceExists('existing-key');

      expect(error.code).toBe(I18nErrorCode.INSTANCE_EXISTS);
      expect(error.message).toContain('existing-key');
      expect(error.metadata?.key).toBe('existing-key');
    });

    it('should create invalidContext error with ICU formatting', () => {
      const error = I18nError.invalidContext('bad-context');

      expect(error.code).toBe(I18nErrorCode.INVALID_CONTEXT);
      expect(error.message).toContain('bad-context');
      expect(error.metadata?.contextKey).toBe('bad-context');
    });

    it('should create missingCountVariable error with ICU formatting', () => {
      const error = I18nError.missingCountVariable('items');

      expect(error.code).toBe(I18nErrorCode.MISSING_COUNT_VARIABLE);
      expect(error.message).toContain('items');
      expect(error.message).toContain('count');
      expect(error.metadata?.key).toBe('items');
    });

    it('should create pluralFormNotFound error with ICU select formatting', () => {
      const error = I18nError.pluralFormNotFound('few', 'ru', 'items', [
        'one',
        'many',
      ]);

      expect(error.code).toBe(I18nErrorCode.PLURAL_FORM_NOT_FOUND);
      expect(error.message).toContain('few');
      expect(error.message).toContain('ru');
      expect(error.message).toContain('items');
      expect(error.message).toContain('one');
      expect(error.message).toContain('many');
      expect(error.metadata?.availableForms).toEqual(['one', 'many']);
    });

    it('should create invalidPluralCategory error with ICU plural formatting', () => {
      const validCategories = ['one', 'other'];
      const error = I18nError.invalidPluralCategory('invalid', validCategories);

      expect(error.code).toBe(I18nErrorCode.INVALID_PLURAL_CATEGORY);
      expect(error.message).toContain('invalid');
      expect(error.message).toContain('Valid categories'); // ICU plural
      expect(error.message).toContain('one');
      expect(error.message).toContain('other');
      expect(error.metadata?.count).toBe(2);
    });

    it('should create invalidPluralCategory error with singular form', () => {
      const validCategories = ['one'];
      const error = I18nError.invalidPluralCategory('invalid', validCategories);

      expect(error.code).toBe(I18nErrorCode.INVALID_PLURAL_CATEGORY);
      expect(error.message).toContain('Valid category'); // ICU singular
      expect(error.metadata?.count).toBe(1);
    });
  });

  describe('error properties', () => {
    it('should have correct prototype', () => {
      const error = I18nError.invalidConfig('test');
      expect(error instanceof I18nError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should have name property', () => {
      const error = I18nError.invalidConfig('test');
      expect(error.name).toBe('I18nError');
    });
  });
});
