import { ComponentStore } from '../src/core/component-store';
import { ComponentConfig } from '../src/interfaces';

describe('ComponentStore coverage', () => {
  let store: ComponentStore;

  beforeEach(() => {
    store = new ComponentStore();
  });

  describe('update method', () => {
    it('should throw when updating non-existent component', () => {
      expect(() => {
        store.update('non-existent', { 'en-US': { key: 'value' } });
      }).toThrow();
    });

    it('should update existing component strings', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: { 'en-US': { key1: 'value1' } },
      };
      store.register(config);

      const result = store.update('test', { 'fr': { key1: 'valeur1' } });
      expect(result.isValid).toBe(true);

      const updated = store.get('test');
      expect(updated.strings['fr']).toEqual({ key1: 'valeur1' });
    });
  });

  describe('translate method', () => {
    it('should throw when language not found', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: { 'en-US': { key: 'value' } },
      };
      store.register(config);

      expect(() => {
        store.translate('test', 'key', undefined, 'invalid-lang');
      }).toThrow();
    });

    it('should throw when translation key missing', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: { 'en-US': { key: 'value' } },
      };
      store.register(config);

      expect(() => {
        store.translate('test', 'missing-key', undefined, 'en-US');
      }).toThrow();
    });

    it('should use constants in variable replacement', () => {
      const storeWithConstants = new ComponentStore({ APP_NAME: 'TestApp' });
      const config: ComponentConfig = {
        id: 'test',
        strings: { 'en-US': { key: 'Welcome to {APP_NAME}' } },
      };
      storeWithConstants.register(config);

      const result = storeWithConstants.translate('test', 'key', undefined, 'en-US');
      expect(result).toBe('Welcome to TestApp');
    });
  });

  describe('safeTranslate method', () => {
    it('should return fallback format on error', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: { 'en-US': { key: 'value' } },
      };
      store.register(config);

      const result = store.safeTranslate('test', 'missing-key', undefined, 'en-US');
      expect(result).toBe('[test.missing-key]');
    });
  });

  describe('validation', () => {
    it('should warn about missing keys in languages', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: {
          'en-US': { key1: 'value1', key2: 'value2' },
          'fr': { key1: 'valeur1' }, // missing key2
        },
      };

      const result = store.register(config);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('key2');
      expect(result.warnings[0]).toContain('fr');
    });
  });

  describe('setConstants', () => {
    it('should update constants', () => {
      store.setConstants({ NEW_CONST: 'value' });
      const config: ComponentConfig = {
        id: 'test',
        strings: { 'en-US': { key: '{NEW_CONST}' } },
      };
      store.register(config);

      const result = store.translate('test', 'key', undefined, 'en-US');
      expect(result).toBe('value');
    });
  });

  describe('clear', () => {
    it('should clear all components and aliases', () => {
      const config: ComponentConfig = {
        id: 'test',
        strings: { 'en-US': { key: 'value' } },
        aliases: ['alias1'],
      };
      store.register(config);

      expect(store.has('test')).toBe(true);
      expect(store.has('alias1')).toBe(true);

      store.clear();

      expect(store.has('test')).toBe(false);
      expect(store.has('alias1')).toBe(false);
    });
  });
});
