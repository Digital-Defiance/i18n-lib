/**
 * Unit tests for createI18nSetup cross-module scenario.
 *
 * Verifies that createI18nSetup() succeeds when a library component's
 * stringKeyEnum is a plain object (simulating cross-module duplication
 * where Symbol-based identity checks fail). The factory passes
 * pkg.config.id as the fallback componentId, enabling registration.
 *
 * **Validates: Requirements 2.5, 6.5**
 */

import type { AnyBrandedEnum } from '@digitaldefiance/branded-enum';
import { resetRegistry } from '@digitaldefiance/branded-enum';
import { createI18nStringKeys } from '../src/branded-string-key';
import { I18nEngine } from '../src/core/i18n-engine';
import { createI18nSetup } from '../src/create-i18n-setup';
import { GlobalActiveContext } from '../src/global-active-context';

/**
 * Creates a plain object (no Symbol metadata) mimicking a branded enum
 * that lost its identity due to cross-module duplication.
 */
function makePlainStringKeyEnum(
  componentId: string,
  keys: Record<string, string>,
): AnyBrandedEnum {
  const obj: Record<string, string> = {};
  for (const [key, value] of Object.entries(keys)) {
    obj[key] = value;
  }
  return obj as unknown as AnyBrandedEnum;
}

describe('createI18nSetup cross-module scenario', () => {
  const instanceKey = 'cross-module-factory-test';

  beforeEach(() => {
    I18nEngine.resetAll();
    GlobalActiveContext.clearAll();
    resetRegistry();
  });

  afterEach(() => {
    I18nEngine.resetAll();
    GlobalActiveContext.clearAll();
    resetRegistry();
  });

  it('should register a library component whose stringKeyEnum is a plain object', () => {
    // Simulate a library enum that lost Symbol metadata due to cross-module duplication
    const plainLibEnum = makePlainStringKeyEnum('cross-lib', {
      Hello: 'cross-lib.hello',
      World: 'cross-lib.world',
    });

    // The app's own enum is created normally (same module, symbols intact)
    const AppKeys = createI18nStringKeys('cross-app', {
      Greeting: 'cross-app.greeting',
    } as const);

    const result = createI18nSetup({
      componentId: 'cross-app',
      stringKeyEnum: AppKeys,
      strings: {
        'en-US': { 'cross-app.greeting': 'Hello there!' },
      },
      instanceKey,
      libraryComponents: [
        {
          config: {
            id: 'cross-lib',
            strings: {
              'en-US': {
                'cross-lib.hello': 'Hello',
                'cross-lib.world': 'World',
              },
            },
          },
          stringKeyEnum: plainLibEnum,
        },
      ],
    });

    // Library component registered successfully
    expect(result.engine.hasComponent('cross-lib')).toBe(true);
    // The plain enum was registered via the componentId escape hatch
    expect(result.engine.hasStringKeyEnum(plainLibEnum)).toBe(true);
    // App component also registered
    expect(result.engine.hasComponent('cross-app')).toBe(true);
  });

  it('should translate keys from a cross-module library component', () => {
    const plainLibEnum = makePlainStringKeyEnum('cross-lib', {
      Hello: 'cross-lib.hello',
    });

    const AppKeys = createI18nStringKeys('cross-app', {
      Greeting: 'cross-app.greeting',
    } as const);

    const result = createI18nSetup({
      componentId: 'cross-app',
      stringKeyEnum: AppKeys,
      strings: {
        'en-US': { 'cross-app.greeting': 'Hello there!' },
      },
      instanceKey,
      libraryComponents: [
        {
          config: {
            id: 'cross-lib',
            strings: {
              'en-US': { 'cross-lib.hello': 'Hello from lib' },
            },
          },
          stringKeyEnum: plainLibEnum,
        },
      ],
    });

    // App translation works
    expect(result.translate(AppKeys.Greeting)).toBe('Hello there!');
    // Library translation works via translateStringKey
    expect(result.engine.translateStringKey('cross-lib.hello')).toBe(
      'Hello from lib',
    );
  });

  it('should not throw when called twice with the same plain enum (idempotent)', () => {
    const plainLibEnum = makePlainStringKeyEnum('cross-lib', {
      Hello: 'cross-lib.hello',
    });

    const AppKeys = createI18nStringKeys('cross-app', {
      Greeting: 'cross-app.greeting',
    } as const);

    const config = {
      componentId: 'cross-app',
      stringKeyEnum: AppKeys,
      strings: {
        'en-US': { 'cross-app.greeting': 'Hello!' },
      },
      instanceKey,
      libraryComponents: [
        {
          config: {
            id: 'cross-lib',
            strings: { 'en-US': { 'cross-lib.hello': 'Hello' } },
          },
          stringKeyEnum: plainLibEnum,
        },
      ],
    } as const;

    expect(() => {
      createI18nSetup(config);
      createI18nSetup(config);
    }).not.toThrow();
  });
});
