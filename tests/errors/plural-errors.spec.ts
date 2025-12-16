/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { I18nError, I18nErrorCode } from '../../src/errors/i18n-error';

describe('Plural Error Messages', () => {
  describe('pluralFormNotFound', () => {
    it('should create error with correct code', () => {
      const error = I18nError.pluralFormNotFound('few', 'ru', 'items', [
        'one',
        'many',
      ]);
      expect(error.code).toBe(I18nErrorCode.PLURAL_FORM_NOT_FOUND);
    });

    it('should include category in message', () => {
      const error = I18nError.pluralFormNotFound('few', 'ru', 'items', [
        'one',
        'many',
      ]);
      expect(error.message).toContain('few');
    });

    it('should include language in message', () => {
      const error = I18nError.pluralFormNotFound('few', 'ru', 'items', [
        'one',
        'many',
      ]);
      expect(error.message).toContain('ru');
    });

    it('should include key in message', () => {
      const error = I18nError.pluralFormNotFound('few', 'ru', 'items', [
        'one',
        'many',
      ]);
      expect(error.message).toContain('items');
    });

    it('should list available forms', () => {
      const error = I18nError.pluralFormNotFound('few', 'ru', 'items', [
        'one',
        'many',
      ]);
      expect(error.message).toContain('one');
      expect(error.message).toContain('many');
    });

    it('should include metadata', () => {
      const error = I18nError.pluralFormNotFound('few', 'ru', 'items', [
        'one',
        'many',
      ]);
      expect(error.metadata).toEqual({
        category: 'few',
        language: 'ru',
        key: 'items',
        availableForms: ['one', 'many'],
        formCount: 2,
      });
    });
  });

  describe('invalidPluralCategory', () => {
    it('should create error with correct code', () => {
      const error = I18nError.invalidPluralCategory('invalid', [
        'one',
        'other',
      ]);
      expect(error.code).toBe(I18nErrorCode.INVALID_PLURAL_CATEGORY);
    });

    it('should include invalid category in message', () => {
      const error = I18nError.invalidPluralCategory('invalid', [
        'one',
        'other',
      ]);
      expect(error.message).toContain('invalid');
    });

    it('should list valid categories', () => {
      const error = I18nError.invalidPluralCategory('invalid', [
        'one',
        'other',
      ]);
      expect(error.message).toContain('one');
      expect(error.message).toContain('other');
    });

    it('should include metadata', () => {
      const error = I18nError.invalidPluralCategory('invalid', [
        'one',
        'other',
      ]);
      expect(error.metadata).toEqual({
        category: 'invalid',
        validCategories: ['one', 'other'],
        count: 2,
      });
    });
  });

  describe('missingCountVariable', () => {
    it('should create error with correct code', () => {
      const error = I18nError.missingCountVariable('items');
      expect(error.code).toBe(I18nErrorCode.MISSING_COUNT_VARIABLE);
    });

    it('should include key in message', () => {
      const error = I18nError.missingCountVariable('items');
      expect(error.message).toContain('items');
    });

    it('should mention count variable', () => {
      const error = I18nError.missingCountVariable('items');
      expect(error.message).toContain('count');
    });

    it('should include metadata', () => {
      const error = I18nError.missingCountVariable('items');
      expect(error.metadata).toEqual({ key: 'items' });
    });
  });
});
