/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

/**
 * Tests for TranslatableGenericError with ICU MessageFormat, pluralization, and nested messages (v3.5.0 features)
 */

import { I18nEngine } from '../../src/core/i18n-engine';
import { TranslatableGenericError } from '../../src/errors/translatable-generic';
import { formatICUMessage } from '../../src/icu/helpers';
import { createPluralString } from '../../src/utils/plural-helpers';

describe('TranslatableGenericError with ICU MessageFormat', () => {
  let engine: I18nEngine;

  beforeEach(() => {
    // Reset all instances before each test
    I18nEngine.resetAll();

    // Create engine with English and French
    engine = I18nEngine.createInstance('test-icu-errors', [
      { id: 'en-US', name: 'English (US)', code: 'en-US', isDefault: true },
      { id: 'fr', name: 'Français', code: 'fr' },
      { id: 'uk', name: 'Українська', code: 'uk' },
    ]);
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  describe('Pluralization Support (PluralString)', () => {
    beforeEach(() => {
      // Register component with plural strings
      engine.register({
        id: 'validation',
        strings: {
          'en-US': {
            itemsFound: createPluralString({
              one: 'Found {count} item',
              other: 'Found {count} items',
            }),
            errorsDetected: createPluralString({
              one: 'Detected {count} error in {context}',
              other: 'Detected {count} errors in {context}',
            }),
          },
          fr: {
            itemsFound: createPluralString({
              one: 'Trouvé {count} élément',
              other: 'Trouvé {count} éléments',
            }),
            errorsDetected: createPluralString({
              one: 'Détecté {count} erreur dans {context}',
              other: 'Détecté {count} erreurs dans {context}',
            }),
          },
          uk: {
            itemsFound: createPluralString({
              one: 'Знайдено {count} елемент',
              few: 'Знайдено {count} елементи',
              many: 'Знайдено {count} елементів',
              other: 'Знайдено {count} елемента',
            }),
            errorsDetected: createPluralString({
              one: 'Виявлено {count} помилку в {context}',
              few: 'Виявлено {count} помилки в {context}',
              many: 'Виявлено {count} помилок в {context}',
              other: 'Виявлено {count} помилки в {context}',
            }),
          },
        },
      });
    });

    it('should handle plural forms with one item in English', () => {
      const error = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'itemsFound',
        { count: 1 },
      );

      expect(error.message).toBe('Found 1 item');
      expect(error.variables).toEqual({ count: 1 });
    });

    it('should handle plural forms with multiple items in English', () => {
      const error = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'itemsFound',
        { count: 5 },
      );

      expect(error.message).toBe('Found 5 items');
    });

    it('should handle plural forms in French', () => {
      const error1 = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'itemsFound',
        { count: 1 },
        'fr',
      );

      const error2 = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'itemsFound',
        { count: 5 },
        'fr',
      );

      expect(error1.message).toBe('Trouvé 1 élément');
      expect(error2.message).toBe('Trouvé 5 éléments');
    });

    it('should handle complex Ukrainian pluralization (one/few/many/other)', () => {
      const error1 = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'itemsFound',
        { count: 1 },
        'uk',
      );

      const error2 = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'itemsFound',
        { count: 2 },
        'uk',
      );

      const error5 = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'itemsFound',
        { count: 5 },
        'uk',
      );

      const error21 = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'itemsFound',
        { count: 21 },
        'uk',
      );

      expect(error1.message).toBe('Знайдено 1 елемент'); // one
      expect(error2.message).toBe('Знайдено 2 елементи'); // few
      expect(error5.message).toBe('Знайдено 5 елементів'); // many
      expect(error21.message).toBe('Знайдено 21 елемент'); // one (21 ends in 1)
    });

    it('should handle plural forms with multiple variables', () => {
      const error = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'errorsDetected',
        { count: 3, context: 'configuration' },
      );

      expect(error.message).toBe('Detected 3 errors in configuration');
    });

    it('should support retranslation with different languages', () => {
      const error = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'itemsFound',
        { count: 5 },
      );

      expect(error.message).toBe('Found 5 items'); // English
      expect(error.retranslate('fr')).toBe('Trouvé 5 éléments'); // French
      expect(error.retranslate('uk')).toBe('Знайдено 5 елементів'); // Ukrainian
    });
  });

  describe('ICU MessageFormat Integration', () => {
    it('should demonstrate ICU format capabilities (standalone)', () => {
      // ICU MessageFormat works standalone
      const message1 = formatICUMessage(
        '{count, plural, one {# item} other {# items}}',
        { count: 1 },
      );

      const message5 = formatICUMessage(
        '{count, plural, one {# item} other {# items}}',
        { count: 5 },
      );

      expect(message1).toBe('1 item');
      expect(message5).toBe('5 items');
    });

    it('should demonstrate ICU select format', () => {
      const male = formatICUMessage(
        '{gender, select, male {He} female {She} other {They}} found {count} items',
        { gender: 'male', count: 1 },
      );

      const female = formatICUMessage(
        '{gender, select, male {He} female {She} other {They}} found {count} items',
        { gender: 'female', count: 2 },
      );

      expect(male).toContain('He found 1');
      expect(female).toContain('She found 2');
    });

    it('should demonstrate ICU nested messages', () => {
      const message = formatICUMessage(
        '{gender, select, male {He has} female {She has} other {They have}} {count, plural, one {# item} other {# items}}',
        { gender: 'female', count: 2 },
      );

      expect(message).toBe('She has 2 items');
    });

    it('should demonstrate ICU number formatting', () => {
      const price = formatICUMessage(
        'Price: {amount, number, currency}',
        { amount: 99.99 },
        'en-US',
      );

      expect(price).toContain('99.99');
    });
  });

  describe('Real-World Scenarios', () => {
    beforeEach(() => {
      engine.register({
        id: 'validation',
        strings: {
          'en-US': {
            configValidationFailed: createPluralString({
              one: 'Configuration validation failed ({count} invariant):\n\n{failures}',
              other:
                'Configuration validation failed ({count} invariants):\n\n{failures}',
            }),
            unknownInvariant: 'Unknown invariant: {name}',
          },
          fr: {
            configValidationFailed: createPluralString({
              one: 'La validation de la configuration a échoué ({count} invariant):\n\n{failures}',
              other:
                'La validation de la configuration a échoué ({count} invariants):\n\n{failures}',
            }),
            unknownInvariant: 'Invariant inconnu: {name}',
          },
        },
      });
    });

    it('should handle complex validation error with single failure', () => {
      const error = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'configValidationFailed',
        {
          count: 1,
          failures: 'MEMBER_ID_LENGTH !== RECIPIENT_ID_SIZE (12 !== 32)',
        },
      );

      expect(error.message).toContain('(1 invariant)');
      expect(error.message).toContain('12 !== 32');
    });

    it('should handle complex validation error with multiple failures', () => {
      const failures = [
        'MEMBER_ID_LENGTH !== RECIPIENT_ID_SIZE',
        'Invalid PBKDF2 iterations: 999',
        'Unsupported curve: secp256r1',
      ].join('\n\n');

      const error = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'configValidationFailed',
        { count: 3, failures },
      );

      expect(error.message).toContain('(3 invariants)');
      expect(error.message).toContain('MEMBER_ID_LENGTH');
      expect(error.message).toContain('PBKDF2');
      expect(error.message).toContain('secp256r1');
    });

    it('should handle simple template errors', () => {
      const error = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'unknownInvariant',
        { name: 'CustomInvariant' },
      );

      expect(error.message).toBe('Unknown invariant: CustomInvariant');
    });

    it('should support multilingual error reporting', () => {
      const failures = 'Test failure';

      const errorEn = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'configValidationFailed',
        { count: 2, failures },
        'en-US',
      );

      const errorFr = TranslatableGenericError.withEngine(
        engine,
        'validation',
        'configValidationFailed',
        { count: 2, failures },
        'fr',
      );

      expect(errorEn.message).toContain('(2 invariants)');
      expect(errorFr.message).toContain('(2 invariants)');
      expect(errorFr.message).toContain('échoué');

      // Verify retranslation works
      expect(errorEn.retranslate('fr')).toContain('échoué');
    });
  });
});
