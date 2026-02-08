/**
 * Unit tests for browser-safe fallback in I18nEngine.
 *
 * Tests that translateStringKey and safeTranslateStringKey fall back to
 * scanning registered components when the StringKeyEnumRegistry fails
 * (simulating bundler Symbol mismatch in browser environments).
 *
 * Strategy: We register components with strings but do NOT register the
 * branded enum via registerStringKeyEnum. This means the registry's
 * safeResolveComponentId returns null, forcing the fallback path.
 */

import { createI18nStringKeys } from '../src/branded-string-key';
import { I18nEngine } from '../src/core/i18n-engine';
import type { LanguageDefinition } from '../src/interfaces';

const testLanguages: LanguageDefinition[] = [
  { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
];

describe('Browser-safe fallback', () => {
  beforeEach(() => {
    I18nEngine.resetAll();
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  describe('translateStringKey with fallback', () => {
    it('should translate via registry when branded enum is registered', () => {
      const TestKeys = createI18nStringKeys('test-comp', {
        Hello: 'test-comp.hello',
        World: 'test-comp.world',
      } as const);

      const engine = I18nEngine.createInstance('normal-test', testLanguages);
      engine.register({
        id: 'test-comp',
        strings: {
          'en-US': {
            'test-comp.hello': 'Hello!',
            'test-comp.world': 'World!',
          },
        },
      });
      engine.registerStringKeyEnum(TestKeys);

      // Normal path — registry resolves fine
      expect(engine.translateStringKey(TestKeys.Hello)).toBe('Hello!');
      expect(engine.translateStringKey(TestKeys.World)).toBe('World!');
    });

    it('should fall back to component scan when enum is not registered', () => {
      // Register component with strings but do NOT register the branded enum.
      // This simulates the browser scenario where findEnumSources fails.
      const engine = I18nEngine.createInstance('fallback-test', testLanguages);
      engine.register({
        id: 'widget',
        strings: {
          'en-US': {
            'widget.title': 'My Widget',
            'widget.desc': 'A description',
          },
        },
      });

      // Create a branded enum but don't register it
      const WidgetKeys = createI18nStringKeys('widget', {
        Title: 'widget.title',
        Desc: 'widget.desc',
      } as const);

      // translateStringKey should fall back to scanning components
      expect(engine.translateStringKey(WidgetKeys.Title)).toBe('My Widget');
      expect(engine.translateStringKey(WidgetKeys.Desc)).toBe('A description');
    });

    it('should throw for completely unknown keys even after fallback', () => {
      const engine = I18nEngine.createInstance('throw-test', testLanguages);
      engine.register({
        id: 'some-comp',
        strings: {
          'en-US': { 'some-comp.key': 'value' },
        },
      });

      expect(() => {
        engine.translateStringKey('nonexistent.key' as never);
      }).toThrow();
    });
  });

  describe('safeTranslateStringKey with fallback', () => {
    it('should return translation via fallback when enum is not registered', () => {
      const engine = I18nEngine.createInstance(
        'safe-fallback-test',
        testLanguages,
      );
      engine.register({
        id: 'safe-comp',
        strings: {
          'en-US': {
            'safe-comp.greeting': 'Hi there',
          },
        },
      });

      const SafeKeys = createI18nStringKeys('safe-comp', {
        Greeting: 'safe-comp.greeting',
      } as const);
      // Intentionally NOT registering the enum

      expect(engine.safeTranslateStringKey(SafeKeys.Greeting)).toBe('Hi there');
    });

    it('should return placeholder for completely unknown keys', () => {
      const engine = I18nEngine.createInstance(
        'safe-unknown-test',
        testLanguages,
      );
      engine.register({
        id: 'placeholder-comp',
        strings: {
          'en-US': { 'placeholder-comp.key': 'value' },
        },
      });

      const result = engine.safeTranslateStringKey('totally.unknown' as never);
      expect(result).toContain('unknown');
      expect(result).toContain('totally.unknown');
    });
  });

  describe('cache invalidation', () => {
    it('should resolve new keys after a new component is registered', () => {
      const engine = I18nEngine.createInstance('cache-test', testLanguages);
      engine.register({
        id: 'comp-a',
        strings: {
          'en-US': { 'comp-a.key1': 'Value A1' },
        },
      });

      const KeysA = createI18nStringKeys('comp-a', {
        Key1: 'comp-a.key1',
      } as const);
      // Don't register enum — forces fallback and cache build

      // This triggers cache build via fallback
      expect(engine.translateStringKey(KeysA.Key1)).toBe('Value A1');

      // Now register a new component — cache should be invalidated
      engine.register({
        id: 'comp-b',
        strings: {
          'en-US': { 'comp-b.key2': 'Value B2' },
        },
      });

      const KeysB = createI18nStringKeys('comp-b', {
        Key2: 'comp-b.key2',
      } as const);

      // The new key should be resolvable via fallback (cache was invalidated)
      expect(engine.translateStringKey(KeysB.Key2)).toBe('Value B2');
    });

    it('should still resolve old keys after cache invalidation', () => {
      const engine = I18nEngine.createInstance('cache-old-test', testLanguages);
      engine.register({
        id: 'first',
        strings: {
          'en-US': { 'first.name': 'First Name' },
        },
      });

      const FirstKeys = createI18nStringKeys('first', {
        Name: 'first.name',
      } as const);

      // Build cache via fallback
      expect(engine.translateStringKey(FirstKeys.Name)).toBe('First Name');

      // Register new component (invalidates cache)
      engine.register({
        id: 'second',
        strings: {
          'en-US': { 'second.name': 'Second Name' },
        },
      });

      // Old key should still work after cache rebuild
      expect(engine.translateStringKey(FirstKeys.Name)).toBe('First Name');
    });

    it('should handle registerIfNotExists cache invalidation correctly', () => {
      const engine = I18nEngine.createInstance(
        'registerIfNotExists-test',
        testLanguages,
      );

      // First registration
      engine.registerIfNotExists({
        id: 'lib-comp',
        strings: {
          'en-US': { 'lib-comp.msg': 'Library Message' },
        },
      });

      const LibKeys = createI18nStringKeys('lib-comp', {
        Msg: 'lib-comp.msg',
      } as const);

      // Build cache via fallback
      expect(engine.translateStringKey(LibKeys.Msg)).toBe('Library Message');

      // registerIfNotExists with same id should NOT invalidate (no-op)
      engine.registerIfNotExists({
        id: 'lib-comp',
        strings: {
          'en-US': { 'lib-comp.msg': 'Library Message' },
        },
      });

      // Should still work
      expect(engine.translateStringKey(LibKeys.Msg)).toBe('Library Message');

      // registerIfNotExists with NEW id should invalidate
      engine.registerIfNotExists({
        id: 'new-comp',
        strings: {
          'en-US': { 'new-comp.val': 'New Value' },
        },
      });

      const NewKeys = createI18nStringKeys('new-comp', {
        Val: 'new-comp.val',
      } as const);

      expect(engine.translateStringKey(NewKeys.Val)).toBe('New Value');
    });
  });
});
