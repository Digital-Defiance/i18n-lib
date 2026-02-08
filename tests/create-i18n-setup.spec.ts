/**
 * Unit tests for createI18nSetup factory function.
 *
 * Tests that the factory correctly creates/reuses engines, registers
 * core + library + app components, and returns a complete I18nSetupResult.
 */

import { createI18nStringKeys } from '../src/branded-string-key';
import { I18nEngine } from '../src/core/i18n-engine';
import { CoreI18nComponentId } from '../src/core-component-id';
import { createI18nSetup } from '../src/create-i18n-setup';
import { GlobalActiveContext } from '../src/global-active-context';
import type { I18nSetupConfig } from '../src/interfaces/i18n-setup-config.interface';

const AppKeys = createI18nStringKeys('test-app', {
  Welcome: 'test-app.welcome',
  Goodbye: 'test-app.goodbye',
} as const);

const LibKeys = createI18nStringKeys('test-lib', {
  LibMsg: 'test-lib.msg',
} as const);

function makeAppConfig(
  overrides?: Partial<Omit<I18nSetupConfig, 'stringKeyEnum'>>,
): I18nSetupConfig & { readonly stringKeyEnum: typeof AppKeys } {
  return {
    componentId: 'test-app',
    stringKeyEnum: AppKeys,
    strings: {
      'en-US': {
        'test-app.welcome': 'Welcome!',
        'test-app.goodbye': 'Goodbye!',
      },
    },
    instanceKey: 'unit-test-factory',
    ...overrides,
  };
}

describe('createI18nSetup', () => {
  beforeEach(() => {
    I18nEngine.resetAll();
    GlobalActiveContext.clearAll();
  });

  afterEach(() => {
    I18nEngine.resetAll();
    GlobalActiveContext.clearAll();
  });

  it('should return all expected fields', () => {
    const result = createI18nSetup(makeAppConfig());

    expect(result.engine).toBeDefined();
    expect(typeof result.translate).toBe('function');
    expect(typeof result.safeTranslate).toBe('function');
    expect(result.context).toBeDefined();
    expect(typeof result.setLanguage).toBe('function');
    expect(typeof result.setAdminLanguage).toBe('function');
    expect(typeof result.setContext).toBe('function');
    expect(typeof result.getLanguage).toBe('function');
    expect(typeof result.getAdminLanguage).toBe('function');
    expect(typeof result.reset).toBe('function');
  });

  it('should register core component', () => {
    const result = createI18nSetup(makeAppConfig());
    expect(result.engine.hasComponent(CoreI18nComponentId)).toBe(true);
  });

  it('should register the app component', () => {
    const result = createI18nSetup(makeAppConfig());
    expect(result.engine.hasComponent('test-app')).toBe(true);
  });

  it('should register library components', () => {
    const result = createI18nSetup(
      makeAppConfig({
        libraryComponents: [
          {
            config: {
              id: 'test-lib',
              strings: {
                'en-US': { 'test-lib.msg': 'Library message' },
              },
            },
            stringKeyEnum: LibKeys,
          },
        ],
      }),
    );

    expect(result.engine.hasComponent('test-lib')).toBe(true);
    expect(result.engine.hasStringKeyEnum(LibKeys)).toBe(true);
  });

  it('should translate and safeTranslate correctly', () => {
    const result = createI18nSetup(makeAppConfig());

    expect(result.translate(AppKeys.Welcome)).toBe('Welcome!');
    expect(result.translate(AppKeys.Goodbye)).toBe('Goodbye!');
    expect(result.safeTranslate(AppKeys.Welcome)).toBe('Welcome!');
  });

  it('should set default language to en-US when not specified', () => {
    const result = createI18nSetup(makeAppConfig());
    expect(result.getLanguage()).toBe('en-US');
  });

  it('should use specified defaultLanguage', () => {
    const result = createI18nSetup(
      makeAppConfig({
        defaultLanguage: 'en-US',
        strings: {
          'en-US': {
            'test-app.welcome': 'Welcome!',
            'test-app.goodbye': 'Goodbye!',
          },
        },
      }),
    );
    expect(result.getLanguage()).toBe('en-US');
  });

  it('should work with no libraryComponents', () => {
    const result = createI18nSetup(
      makeAppConfig({ libraryComponents: undefined }),
    );
    expect(result.engine.hasComponent('test-app')).toBe(true);
    expect(result.translate(AppKeys.Welcome)).toBe('Welcome!');
  });

  it('should work with empty libraryComponents array', () => {
    const result = createI18nSetup(makeAppConfig({ libraryComponents: [] }));
    expect(result.engine.hasComponent('test-app')).toBe(true);
  });

  it('should work with no constants', () => {
    const result = createI18nSetup(makeAppConfig({ constants: undefined }));
    expect(result.translate(AppKeys.Welcome)).toBe('Welcome!');
  });

  it('should reuse engine on second call with same instanceKey', () => {
    const config = makeAppConfig();
    const result1 = createI18nSetup(config);
    const result2 = createI18nSetup(config);

    expect(result1.engine).toBe(result2.engine);
  });

  it('should not throw on duplicate registration (idempotent)', () => {
    const config = makeAppConfig();
    expect(() => {
      createI18nSetup(config);
      createI18nSetup(config);
    }).not.toThrow();
  });

  it('should handle library components without stringKeyEnum', () => {
    const result = createI18nSetup(
      makeAppConfig({
        libraryComponents: [
          {
            config: {
              id: 'no-enum-lib',
              strings: {
                'en-US': { 'no-enum-lib.key': 'No enum value' },
              },
            },
            // No stringKeyEnum
          },
        ],
      }),
    );

    expect(result.engine.hasComponent('no-enum-lib')).toBe(true);
  });

  it('should support setLanguage and getLanguage', () => {
    const result = createI18nSetup(makeAppConfig());
    expect(result.getLanguage()).toBe('en-US');
    // setLanguage to a registered language
    result.setLanguage('fr');
    expect(result.getLanguage()).toBe('fr');
  });

  it('should support setAdminLanguage and getAdminLanguage', () => {
    const result = createI18nSetup(makeAppConfig());
    expect(result.getAdminLanguage()).toBe('en-US');
    result.setAdminLanguage('de');
    expect(result.getAdminLanguage()).toBe('de');
  });

  it('should support setContext', () => {
    const result = createI18nSetup(makeAppConfig());
    expect(result.context.currentContext).toBe('user');
    result.setContext('admin');
    expect(result.context.currentContext).toBe('admin');
  });

  it('should support reset', () => {
    const config = makeAppConfig();
    const result = createI18nSetup(config);
    expect(I18nEngine.hasInstance('unit-test-factory')).toBe(true);
    result.reset();
    expect(I18nEngine.hasInstance('unit-test-factory')).toBe(false);
  });

  it('should handle superset consumer re-registering library components', () => {
    // First consumer registers lib
    const result1 = createI18nSetup(
      makeAppConfig({
        instanceKey: 'shared-instance',
        libraryComponents: [
          {
            config: {
              id: 'test-lib',
              strings: { 'en-US': { 'test-lib.msg': 'Library message' } },
            },
            stringKeyEnum: LibKeys,
          },
        ],
      }),
    );

    // Second consumer (superset) re-registers the same lib — should not throw
    const AppKeys2 = createI18nStringKeys('test-app2', {
      Msg: 'test-app2.msg',
    } as const);

    const result2 = createI18nSetup({
      componentId: 'test-app2',
      stringKeyEnum: AppKeys2,
      strings: { 'en-US': { 'test-app2.msg': 'App2 message' } },
      instanceKey: 'shared-instance',
      libraryComponents: [
        {
          config: {
            id: 'test-lib',
            strings: { 'en-US': { 'test-lib.msg': 'Library message' } },
          },
          stringKeyEnum: LibKeys,
        },
      ],
    });

    // Both should work
    expect(result1.engine).toBe(result2.engine);
    expect(result1.engine.hasComponent('test-lib')).toBe(true);
    expect(result2.engine.hasComponent('test-app2')).toBe(true);
  });
});
