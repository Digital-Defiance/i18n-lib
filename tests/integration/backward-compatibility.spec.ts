import { I18nEngine } from '../../src/core/i18n-engine';
import { ComponentStore } from '../../src/core/component-store';
import { LanguageDefinition } from '../../src/interfaces';

describe('Backward Compatibility', () => {
  let engine: I18nEngine;
  const languages: LanguageDefinition[] = [
    { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
    { id: 'ru', name: 'Russian', code: 'ru' }
  ];

  beforeEach(() => {
    I18nEngine.resetAll();
    engine = I18nEngine.createInstance('test', languages);
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  describe('Simple strings still work', () => {
    it('should handle simple string translations', () => {
      engine.register({
        id: 'app',
        strings: {
          'en-US': {
            title: 'My Application',
            greeting: 'Hello, {name}!'
          }
        }
      });

      expect(engine.translate('app', 'title')).toBe('My Application');
      expect(engine.translate('app', 'greeting', { name: 'World' })).toBe('Hello, World!');
    });

    it('should work with t() function', () => {
      engine.register({
        id: 'app',
        strings: {
          'en-US': {
            welcome: 'Welcome'
          }
        }
      });

      expect(engine.t('{{app.welcome}}')).toBe('Welcome');
    });
  });

  describe('Mixed plural and simple strings', () => {
    it('should handle both in same component', () => {
      engine.register({
        id: 'shop',
        strings: {
          'en-US': {
            title: 'Shopping Cart',
            items: {
              one: '1 item',
              other: '{count} items'
            },
            total: 'Total: ${amount}'
          }
        }
      });

      expect(engine.translate('shop', 'title')).toBe('Shopping Cart');
      expect(engine.translate('shop', 'items', { count: 1 })).toBe('1 item');
      expect(engine.translate('shop', 'items', { count: 5 })).toBe('5 items');
      expect(engine.translate('shop', 'total', { amount: '99.99' })).toBe('Total: $99.99');
    });

    it('should work in templates', () => {
      engine.register({
        id: 'cart',
        strings: {
          'en-US': {
            title: 'Cart',
            items: {
              one: '1 item',
              other: '{count} items'
            }
          }
        }
      });

      expect(engine.t('{{cart.title}}: {{cart.items}}', { count: 5 })).toBe('Cart: 5 items');
    });
  });

  describe('Gradual migration path', () => {
    it('should allow adding plurals to existing components', () => {
      // Start with simple strings
      engine.register({
        id: 'app',
        strings: {
          'en-US': {
            title: 'App'
          }
        }
      });

      expect(engine.translate('app', 'title')).toBe('App');

      // Add plural strings later
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

      expect(engine.translate('cart', 'items', { count: 5 })).toBe('5 items');
      expect(engine.translate('app', 'title')).toBe('App');
    });

    it('should handle partial plural forms gracefully', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': {
            items: {
              one: '1 item'
              // Missing 'other' - should fallback
            }
          }
        }
      });

      expect(engine.translate('test', 'items', { count: 1 })).toBe('1 item');
      expect(engine.translate('test', 'items', { count: 5 })).toBe('1 item'); // Fallback
    });
  });

  describe('No breaking changes', () => {
    it('should not break existing translate() calls', () => {
      engine.register({
        id: 'legacy',
        strings: {
          'en-US': {
            message: 'Hello'
          }
        }
      });

      // All existing call patterns should work
      expect(engine.translate('legacy', 'message')).toBe('Hello');
      expect(engine.translate('legacy', 'message', {})).toBe('Hello');
      expect(engine.translate('legacy', 'message', {}, 'en-US')).toBe('Hello');
    });

    it('should not break existing t() calls', () => {
      engine.register({
        id: 'app',
        strings: {
          'en-US': {
            greeting: 'Hi {name}'
          }
        }
      });

      expect(engine.t('{{app.greeting}}', { name: 'Alice' })).toBe('Hi Alice');
    });

    it('should not break safeTranslate()', () => {
      engine.register({
        id: 'app',
        strings: {
          'en-US': {
            exists: 'Value'
          }
        }
      });

      expect(engine.safeTranslate('app', 'exists')).toBe('Value');
      expect(engine.safeTranslate('app', 'missing')).toBe('[app.missing]');
    });
  });

  describe('Language switching', () => {
    it('should work with simple strings', () => {
      engine.register({
        id: 'app',
        strings: {
          'en-US': { hello: 'Hello' },
          'ru': { hello: 'Привет' }
        }
      });

      expect(engine.translate('app', 'hello')).toBe('Hello');
      engine.setLanguage('ru');
      expect(engine.translate('app', 'hello')).toBe('Привет');
    });

    it('should work with plural strings', () => {
      engine.register({
        id: 'cart',
        strings: {
          'en-US': {
            items: { one: '1 item', other: '{count} items' }
          },
          'ru': {
            items: { one: '{count} товар', few: '{count} товара', many: '{count} товаров' }
          }
        }
      });

      expect(engine.translate('cart', 'items', { count: 2 })).toBe('2 items');
      engine.setLanguage('ru');
      expect(engine.translate('cart', 'items', { count: 2 })).toBe('2 товара');
    });
  });

  describe('ComponentStore backward compatibility', () => {
    it('should work with simple strings', () => {
      const store = new ComponentStore();
      store.register({
        id: 'test',
        strings: {
          'en-US': {
            simple: 'Simple string'
          }
        }
      });

      expect(store.translate('test', 'simple', {}, 'en-US')).toBe('Simple string');
    });

    it('should work with mixed strings', () => {
      const store = new ComponentStore();
      store.register({
        id: 'test',
        strings: {
          'en-US': {
            simple: 'Simple',
            plural: { one: '1', other: '{count}' }
          }
        }
      });

      expect(store.translate('test', 'simple', {}, 'en-US')).toBe('Simple');
      expect(store.translate('test', 'plural', { count: 5 }, 'en-US')).toBe('5');
    });
  });
});
