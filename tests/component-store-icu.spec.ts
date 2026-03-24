/* eslint-disable @typescript-eslint/no-explicit-any */

import { ComponentStore } from '../src/core/component-store';
import { ComponentConfig } from '../src/interfaces';

describe('ComponentStore ICU MessageFormat support', () => {
  let store: ComponentStore;

  beforeEach(() => {
    store = new ComponentStore();
  });

  function registerComponent(strings: Record<string, string | any>) {
    const config: ComponentConfig = {
      id: 'test',
      strings: { 'en-US': strings },
    };
    store.register(config);
  }

  describe('plural', () => {
    it('should format ICU plural with count=1 (one form)', () => {
      registerComponent({
        items: '{count, plural, one {# item} other {# items}}',
      });
      const result = store.translate('test', 'items', { count: 1 }, 'en-US');
      expect(result).toBe('1 item');
    });

    it('should format ICU plural with count=0 (other form)', () => {
      registerComponent({
        items: '{count, plural, one {# item} other {# items}}',
      });
      const result = store.translate('test', 'items', { count: 0 }, 'en-US');
      expect(result).toBe('0 items');
    });

    it('should format ICU plural with count=5 (other form)', () => {
      registerComponent({
        items: '{count, plural, one {# item} other {# items}}',
      });
      const result = store.translate('test', 'items', { count: 5 }, 'en-US');
      expect(result).toBe('5 items');
    });

    it('should format ICU plural with surrounding text', () => {
      registerComponent({
        selected:
          '{count, plural, one {# item selected} other {# items selected}}',
      });
      const result = store.translate('test', 'selected', { count: 2 }, 'en-US');
      expect(result).toBe('2 items selected');
    });

    it('should format ICU plural with count=1 and surrounding text', () => {
      registerComponent({
        selected:
          '{count, plural, one {# item selected} other {# items selected}}',
      });
      const result = store.translate('test', 'selected', { count: 1 }, 'en-US');
      expect(result).toBe('1 item selected');
    });
  });

  describe('select', () => {
    it('should format ICU select', () => {
      registerComponent({
        greeting:
          '{gender, select, male {He} female {She} other {They}} logged in',
      });
      const result = store.translate(
        'test',
        'greeting',
        { gender: 'female' },
        'en-US',
      );
      expect(result).toBe('She logged in');
    });
  });

  describe('mixed ICU and simple variables', () => {
    it('should handle ICU plural alongside simple variable substitution', () => {
      registerComponent({
        moved:
          '{count, plural, one {# file moved to {folder}} other {# files moved to {folder}}}',
      });
      const result = store.translate(
        'test',
        'moved',
        { count: 3, folder: 'Trash' },
        'en-US',
      );
      expect(result).toBe('3 files moved to Trash');
    });
  });

  describe('non-ICU strings are unaffected', () => {
    it('should still do simple variable replacement for non-ICU strings', () => {
      registerComponent({
        greeting: 'Hello, {name}!',
      });
      const result = store.translate(
        'test',
        'greeting',
        { name: 'Alice' },
        'en-US',
      );
      expect(result).toBe('Hello, Alice!');
    });

    it('should return plain strings unchanged', () => {
      registerComponent({
        label: 'No variables here',
      });
      const result = store.translate('test', 'label', undefined, 'en-US');
      expect(result).toBe('No variables here');
    });
  });

  describe('fallback on ICU parse error', () => {
    it('should fall back to simple replacement if ICU syntax is malformed', () => {
      registerComponent({
        // Looks like ICU (has ", plural,") but is malformed
        bad: '{count, plural, one {# item other {# items}}',
      });
      // Should not throw — falls back to replaceVariables
      const result = store.translate('test', 'bad', { count: 2 }, 'en-US');
      expect(typeof result).toBe('string');
    });
  });

  describe('safeTranslate with ICU', () => {
    it('should format ICU plural via safeTranslate', () => {
      registerComponent({
        items: '{count, plural, one {# item} other {# items}}',
      });
      const result = store.safeTranslate(
        'test',
        'items',
        { count: 3 },
        'en-US',
      );
      expect(result).toBe('3 items');
    });
  });
});
