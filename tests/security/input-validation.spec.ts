/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { I18nBuilder } from '../../src/builders/i18n-builder';
import {
  validateComponentId,
  validateTemplateLength,
} from '../../src/utils/validation';

describe('Security: Input Validation', () => {
  describe('validateComponentId', () => {
    it('should accept valid component IDs', () => {
      expect(() => validateComponentId('test')).not.toThrow();
      expect(() => validateComponentId('test-component')).not.toThrow();
      expect(() => validateComponentId('test_component')).not.toThrow();
      expect(() => validateComponentId('test123')).not.toThrow();
    });

    it('should reject excessively long component IDs', () => {
      const long = 'a'.repeat(200);
      expect(() => validateComponentId(long)).toThrow(/maximum length/i);
    });

    it('should reject invalid characters', () => {
      expect(() => validateComponentId('../../../etc/passwd')).toThrow(
        /invalid characters/i,
      );
      expect(() => validateComponentId('<script>')).toThrow(
        /invalid characters/i,
      );
      expect(() => validateComponentId('test.component')).toThrow(
        /invalid characters/i,
      );
    });
  });

  describe('validateTemplateLength', () => {
    it('should accept normal templates', () => {
      expect(() => validateTemplateLength('Hello {name}')).not.toThrow();
    });

    it('should reject excessively long templates', () => {
      const long = 'a'.repeat(20000);
      expect(() => validateTemplateLength(long)).toThrow(/maximum length/i);
    });
  });

  describe('Component registration validation', () => {
    it('should validate component ID on registration', () => {
      const engine = I18nBuilder.create()
        .withLanguages([{ id: 'en-US', name: 'English', isDefault: true }])
        .isolated()
        .build();

      expect(() => {
        engine.register({
          id: '../../../etc/passwd',
          strings: { 'en-US': { test: 'test' } },
        });
      }).toThrow(/invalid characters/i);
    });

    it('should validate component ID length', () => {
      const engine = I18nBuilder.create()
        .withLanguages([{ id: 'en-US', name: 'English', isDefault: true }])
        .isolated()
        .build();

      const longId = 'a'.repeat(200);
      expect(() => {
        engine.register({
          id: longId,
          strings: { 'en-US': { test: 'test' } },
        });
      }).toThrow(/maximum length/i);
    });
  });
});
