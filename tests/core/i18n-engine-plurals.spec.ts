/**
 * Tests for plural support in I18nEngine
 */

import { I18nEngine } from '../../src/core/i18n-engine';
import { LanguageDefinition } from '../../src/interfaces';

describe('I18nEngine - Plural Support', () => {
  let engine: I18nEngine;
  const languages: LanguageDefinition[] = [
    { id: 'en-US', name: 'English (US)', code: 'en-US', isDefault: true },
    { id: 'ru', name: 'Russian', code: 'ru' },
    { id: 'ar', name: 'Arabic', code: 'ar' }
  ];

  beforeEach(() => {
    I18nEngine.resetAll();
    engine = I18nEngine.createInstance('test', languages);
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  describe('translate() with plurals', () => {
    beforeEach(() => {
      engine.register({
        id: 'cart',
        strings: {
          'en-US': {
            items: {
              one: '1 item',
              other: '{count} items'
            }
          },
          'ru': {
            items: {
              one: '{count} товар',
              few: '{count} товара',
              many: '{count} товаров'
            }
          }
        }
      });
    });

    it('should handle English plurals', () => {
      expect(engine.translate('cart', 'items', { count: 1 }, 'en-US')).toBe('1 item');
      expect(engine.translate('cart', 'items', { count: 5 }, 'en-US')).toBe('5 items');
    });

    it('should handle Russian plurals', () => {
      expect(engine.translate('cart', 'items', { count: 1 }, 'ru')).toBe('1 товар');
      expect(engine.translate('cart', 'items', { count: 2 }, 'ru')).toBe('2 товара');
      expect(engine.translate('cart', 'items', { count: 5 }, 'ru')).toBe('5 товаров');
    });

    it('should use current language when not specified', () => {
      engine.setLanguage('ru');
      expect(engine.translate('cart', 'items', { count: 5 })).toBe('5 товаров');
    });
  });

  describe('t() with plurals', () => {
    beforeEach(() => {
      engine.register({
        id: 'cart',
        strings: {
          'en-US': {
            items: {
              one: '1 item',
              other: '{count} items'
            }
          }
        }
      });
    });

    it('should resolve plural in template', () => {
      expect(engine.t('You have {{cart.items}}', { count: 1 }, 'en-US')).toBe('You have 1 item');
      expect(engine.t('You have {{cart.items}}', { count: 5 }, 'en-US')).toBe('You have 5 items');
    });

    it('should handle multiple variables', () => {
      engine.register({
        id: 'shop',
        strings: {
          'en-US': {
            summary: 'Total: ${total}'
          }
        }
      });

      expect(engine.t('{{cart.items}} - {{shop.summary}}', { count: 5, total: '99.99' }, 'en-US'))
        .toBe('5 items - Total: $99.99');
    });
  });

  describe('safeTranslate() with plurals', () => {
    beforeEach(() => {
      engine.register({
        id: 'cart',
        strings: {
          'en-US': {
            items: {
              one: '1 item',
              other: '{count} items'
            }
          }
        }
      });
    });

    it('should handle plurals safely', () => {
      expect(engine.safeTranslate('cart', 'items', { count: 5 }, 'en-US')).toBe('5 items');
    });

    it('should return fallback for missing keys', () => {
      expect(engine.safeTranslate('cart', 'missing', { count: 5 }, 'en-US')).toBe('[cart.missing]');
    });
  });

  describe('Multiple plural strings in template', () => {
    beforeEach(() => {
      engine.register({
        id: 'summary',
        strings: {
          'en-US': {
            items: {
              one: '1 item',
              other: '{count} items'
            },
            users: {
              one: '1 user',
              other: '{userCount} users'
            }
          }
        }
      });
    });

    it('should handle multiple plurals with different variables', () => {
      const result = engine.t(
        '{{summary.items}} from {{summary.users}}',
        { count: 5, userCount: 2 },
        'en-US'
      );
      expect(result).toBe('5 items from 2 users');
    });
  });

  describe('Context variables with plurals', () => {
    beforeEach(() => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': {
            items: {
              one: '1 item',
              other: '{count} items'
            }
          }
        }
      });
    });

    it('should work with context variables', () => {
      const result = engine.t('You have {{test.items}} in {currency}', { count: 5, currency: 'USD' }, 'en-US');
      expect(result).toContain('5 items');
      expect(result).toContain('USD');
    });
  });

  describe('Backward compatibility', () => {
    it('should still work with simple strings', () => {
      engine.register({
        id: 'app',
        strings: {
          'en-US': {
            title: 'My App',
            greeting: 'Hello, {name}!'
          }
        }
      });

      expect(engine.translate('app', 'title', {}, 'en-US')).toBe('My App');
      expect(engine.translate('app', 'greeting', { name: 'World' }, 'en-US')).toBe('Hello, World!');
    });

    it('should handle mixed plural and simple strings', () => {
      engine.register({
        id: 'mixed',
        strings: {
          'en-US': {
            title: 'Shopping Cart',
            items: {
              one: '1 item',
              other: '{count} items'
            }
          }
        }
      });

      expect(engine.translate('mixed', 'title', {}, 'en-US')).toBe('Shopping Cart');
      expect(engine.translate('mixed', 'items', { count: 5 }, 'en-US')).toBe('5 items');
    });
  });

  describe('Language switching with plurals', () => {
    beforeEach(() => {
      engine.register({
        id: 'cart',
        strings: {
          'en-US': {
            items: {
              one: '1 item',
              other: '{count} items'
            }
          },
          'ru': {
            items: {
              one: '{count} товар',
              few: '{count} товара',
              many: '{count} товаров'
            }
          }
        }
      });
    });

    it('should use correct plural rules after language switch', () => {
      engine.setLanguage('en-US');
      expect(engine.translate('cart', 'items', { count: 2 })).toBe('2 items');

      engine.setLanguage('ru');
      expect(engine.translate('cart', 'items', { count: 2 })).toBe('2 товара');
    });
  });
});
