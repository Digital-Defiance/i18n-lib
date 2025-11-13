/**
 * Tests for plural resolution in ComponentStore
 */

import { ComponentStore } from '../../src/core/component-store';
import { ComponentConfig } from '../../src/interfaces';

describe('ComponentStore - Plural Resolution', () => {
  let store: ComponentStore;

  beforeEach(() => {
    store = new ComponentStore();
  });

  describe('Simple plural (English)', () => {
    beforeEach(() => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'en-US': {
            items: {
              one: '1 item',
              other: '{count} items'
            }
          }
        }
      };
      store.register(config);
    });

    it('should use "one" form for count=1', () => {
      expect(store.translate('test', 'items', { count: 1 }, 'en-US')).toBe('1 item');
    });

    it('should use "other" form for count=0', () => {
      expect(store.translate('test', 'items', { count: 0 }, 'en-US')).toBe('0 items');
    });

    it('should use "other" form for count=2', () => {
      expect(store.translate('test', 'items', { count: 2 }, 'en-US')).toBe('2 items');
    });

    it('should use "other" form for count=100', () => {
      expect(store.translate('test', 'items', { count: 100 }, 'en-US')).toBe('100 items');
    });

    it('should substitute count variable', () => {
      expect(store.translate('test', 'items', { count: 5 }, 'en-US')).toBe('5 items');
    });
  });

  describe('Complex plural (Russian)', () => {
    beforeEach(() => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'ru': {
            items: {
              one: '{count} товар',
              few: '{count} товара',
              many: '{count} товаров'
            }
          }
        }
      };
      store.register(config);
    });

    it('should use "one" form for 1', () => {
      expect(store.translate('test', 'items', { count: 1 }, 'ru')).toBe('1 товар');
    });

    it('should use "few" form for 2', () => {
      expect(store.translate('test', 'items', { count: 2 }, 'ru')).toBe('2 товара');
    });

    it('should use "many" form for 5', () => {
      expect(store.translate('test', 'items', { count: 5 }, 'ru')).toBe('5 товаров');
    });

    it('should use "many" form for 11 (not "one")', () => {
      expect(store.translate('test', 'items', { count: 11 }, 'ru')).toBe('11 товаров');
    });

    it('should use "one" form for 21', () => {
      expect(store.translate('test', 'items', { count: 21 }, 'ru')).toBe('21 товар');
    });

    it('should use "few" form for 22', () => {
      expect(store.translate('test', 'items', { count: 22 }, 'ru')).toBe('22 товара');
    });

    it('should use "many" form for 25', () => {
      expect(store.translate('test', 'items', { count: 25 }, 'ru')).toBe('25 товаров');
    });
  });

  describe('Very complex plural (Arabic)', () => {
    beforeEach(() => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'ar': {
            items: {
              zero: 'لا عناصر',
              one: 'عنصر واحد',
              two: 'عنصران',
              few: '{count} عناصر',
              many: '{count} عنصرًا',
              other: '{count} عنصر'
            }
          }
        }
      };
      store.register(config);
    });

    it('should use "zero" form for 0', () => {
      expect(store.translate('test', 'items', { count: 0 }, 'ar')).toBe('لا عناصر');
    });

    it('should use "one" form for 1', () => {
      expect(store.translate('test', 'items', { count: 1 }, 'ar')).toBe('عنصر واحد');
    });

    it('should use "two" form for 2', () => {
      expect(store.translate('test', 'items', { count: 2 }, 'ar')).toBe('عنصران');
    });

    it('should use "few" form for 3', () => {
      expect(store.translate('test', 'items', { count: 3 }, 'ar')).toBe('3 عناصر');
    });

    it('should use "many" form for 11', () => {
      expect(store.translate('test', 'items', { count: 11 }, 'ar')).toBe('11 عنصرًا');
    });

    it('should use "other" form for 100', () => {
      expect(store.translate('test', 'items', { count: 100 }, 'ar')).toBe('100 عنصر');
    });
  });

  describe('Fallback logic', () => {
    it('should fallback to "other" when specific form missing', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'en-US': {
            items: {
              one: '1 item',
              other: 'Many items'
            }
          }
        }
      };
      store.register(config);

      expect(store.translate('test', 'items', { count: 0 }, 'en-US')).toBe('Many items');
      expect(store.translate('test', 'items', { count: 2 }, 'en-US')).toBe('Many items');
    });

    it('should fallback to first available when "other" missing', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'en-US': {
            items: {
              one: 'One item'
            }
          }
        }
      };
      store.register(config);

      expect(store.translate('test', 'items', { count: 5 }, 'en-US')).toBe('One item');
    });

    it('should use "other" when count not provided', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'en-US': {
            items: {
              one: '1 item',
              other: 'Items'
            }
          }
        }
      };
      store.register(config);

      expect(store.translate('test', 'items', {}, 'en-US')).toBe('Items');
    });
  });

  describe('Mixed plural and non-plural strings', () => {
    beforeEach(() => {
      const config: ComponentConfig = {
        id: 'test',
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
      };
      store.register(config);
    });

    it('should handle simple string', () => {
      expect(store.translate('test', 'title', {}, 'en-US')).toBe('Shopping Cart');
    });

    it('should handle plural string', () => {
      expect(store.translate('test', 'items', { count: 5 }, 'en-US')).toBe('5 items');
    });

    it('should handle string with variables', () => {
      expect(store.translate('test', 'total', { amount: '99.99' }, 'en-US')).toBe('Total: $99.99');
    });
  });

  describe('Edge cases', () => {
    it('should handle fractional counts', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'en-US': {
            items: {
              one: '1 item',
              other: '{count} items'
            }
          }
        }
      };
      store.register(config);

      expect(store.translate('test', 'items', { count: 1.5 }, 'en-US')).toBe('1.5 items');
    });

    it('should handle negative counts (uses absolute value for plural rules)', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'en-US': {
            items: {
              one: '{count} item',
              other: '{count} items'
            }
          }
        }
      };
      store.register(config);

      // Plural rules use absolute value, but count variable keeps sign
      expect(store.translate('test', 'items', { count: -1 }, 'en-US')).toBe('-1 item');
      expect(store.translate('test', 'items', { count: -2 }, 'en-US')).toBe('-2 items');
    });

    it('should handle zero with explicit zero form (French)', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'fr': {
            items: {
              one: 'Aucun élément',
              other: '{count} éléments'
            }
          }
        }
      };
      store.register(config);

      // French treats 0 as "one"
      expect(store.translate('test', 'items', { count: 0 }, 'fr')).toBe('Aucun élément');
    });

    it('should handle count=0', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'en-US': {
            items: {
              one: '1 item',
              other: '{count} items'
            }
          }
        }
      };
      store.register(config);

      expect(store.translate('test', 'items', { count: 0 }, 'en-US')).toBe('0 items');
    });

    it('should handle very large counts', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'en-US': {
            items: {
              one: '1 item',
              other: '{count} items'
            }
          }
        }
      };
      store.register(config);

      expect(store.translate('test', 'items', { count: 1000000 }, 'en-US')).toBe('1000000 items');
    });

    it('should handle multiple variables with plurals', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'en-US': {
            items: {
              one: '{user} has 1 {type}',
              other: '{user} has {count} {type}s'
            }
          }
        }
      };
      store.register(config);

      expect(store.translate('test', 'items', { count: 1, user: 'Alice', type: 'item' }, 'en-US'))
        .toBe('Alice has 1 item');
      expect(store.translate('test', 'items', { count: 5, user: 'Bob', type: 'item' }, 'en-US'))
        .toBe('Bob has 5 items');
    });

    it('should handle empty plural object gracefully', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'en-US': {
            items: {}
          }
        }
      };
      store.register(config);

      expect(store.translate('test', 'items', { count: 5 }, 'en-US')).toBe('');
    });
  });

  describe('Works with both translate() and t()', () => {
    beforeEach(() => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'en-US': {
            items: {
              one: '1 item',
              other: '{count} items'
            }
          }
        }
      };
      store.register(config);
    });

    it('should work with translate() method', () => {
      expect(store.translate('test', 'items', { count: 1 }, 'en-US')).toBe('1 item');
      expect(store.translate('test', 'items', { count: 5 }, 'en-US')).toBe('5 items');
    });

    it('should work with safeTranslate() method', () => {
      expect(store.safeTranslate('test', 'items', { count: 1 }, 'en-US')).toBe('1 item');
      expect(store.safeTranslate('test', 'items', { count: 5 }, 'en-US')).toBe('5 items');
    });
  });

  describe('Backward compatibility', () => {
    it('should still work with simple strings', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'en-US': {
            greeting: 'Hello, {name}!'
          }
        }
      };
      store.register(config);

      expect(store.translate('test', 'greeting', { name: 'World' }, 'en-US')).toBe('Hello, World!');
    });

    it('should handle mixed old and new style', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'en-US': {
            simple: 'Simple string',
            plural: {
              one: '1 item',
              other: '{count} items'
            }
          }
        }
      };
      store.register(config);

      expect(store.translate('test', 'simple', {}, 'en-US')).toBe('Simple string');
      expect(store.translate('test', 'plural', { count: 5 }, 'en-US')).toBe('5 items');
    });
  });
});
