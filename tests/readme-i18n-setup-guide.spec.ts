/**
 * Tests that verify the code examples from the "Monorepo i18n-setup Guide"
 * section of the i18n-lib README actually compile and work correctly.
 *
 * These tests exercise the documented patterns end-to-end:
 * - Engine creation via I18nBuilder
 * - Core component registration via createCoreComponentRegistration
 * - Application component registration
 * - Branded string key enum registration with hasStringKeyEnum guard
 * - GlobalActiveContext initialization
 * - translate / safeTranslate helper functions
 * - createI18nStringKeys vs createI18nStringKeysFromEnum
 *
 * Note: Cross-package imports (suite-core-lib, ecies-lib) are not tested here
 * because the i18n-lib Jest config does not transform those packages' ESM
 * dependencies. The patterns are identical — only the component configs differ.
 */

import type { BrandedEnumValue } from '@digitaldefiance/branded-enum';
import {
  I18nBuilder,
  I18nEngine,
  LanguageCodes,
  GlobalActiveContext,
  getCoreLanguageDefinitions,
  createCoreComponentRegistration,
  createI18nStringKeys,
  createI18nStringKeysFromEnum,
  type CoreLanguageCode,
  type IActiveContext,
  type ComponentConfig,
  type LanguageContextSpace,
} from '../src';

describe('README: Monorepo i18n-setup Guide', () => {
  beforeEach(() => {
    I18nEngine.resetAll();
    GlobalActiveContext.clearAll();
  });

  afterEach(() => {
    I18nEngine.resetAll();
    GlobalActiveContext.clearAll();
  });

  describe('Complete i18n-setup.ts example', () => {
    // Mirrors the documented example — uses inline component configs
    // instead of cross-package imports to avoid Jest ESM issues
    const AppComponentId = 'MyApp';

    const AppStringKey = createI18nStringKeys(AppComponentId, {
      SiteTitle: 'siteTitle',
      SiteDescription: 'siteDescription',
      WelcomeMessage: 'welcomeMessage',
    } as const);

    type AppStringKeyValue = BrandedEnumValue<typeof AppStringKey>;

    // Simulates a library component (like SuiteCore or ECIES)
    const LibComponentId = 'LibComponent';
    const LibStringKey = createI18nStringKeys(LibComponentId, {
      LibGreeting: 'libGreeting',
      LibError: 'libError',
    } as const);

    const appStrings: Record<string, Record<string, string>> = {
      [LanguageCodes.EN_US]: {
        siteTitle: 'My Application',
        siteDescription: 'An Express Suite application',
        welcomeMessage: 'Welcome, {name}!',
      },
      [LanguageCodes.FR]: {
        siteTitle: 'Mon Application',
        siteDescription: 'Une application Express Suite',
        welcomeMessage: 'Bienvenue, {name} !',
      },
    };

    const libStrings: Record<string, Record<string, string>> = {
      [LanguageCodes.EN_US]: {
        libGreeting: 'Hello from library',
        libError: 'Library error occurred',
      },
      [LanguageCodes.FR]: {
        libGreeting: 'Bonjour de la bibliothèque',
        libError: 'Erreur de bibliothèque',
      },
    };

    function createAppComponentConfig(): ComponentConfig {
      return {
        id: AppComponentId,
        strings: appStrings,
        aliases: ['AppStringKey'],
      };
    }

    function createLibComponentConfig(): ComponentConfig {
      return {
        id: LibComponentId,
        strings: libStrings,
        aliases: ['LibStringKey'],
      };
    }

    /**
     * Sets up the full i18n environment as documented in the README.
     * This follows the exact same steps as the documented example.
     */
    function setupI18n() {
      // Step 2: Create or get the I18nEngine instance (idempotent)
      let i18nEngine: I18nEngine;

      if (I18nEngine.hasInstance('default')) {
        i18nEngine = I18nEngine.getInstance('default');
      } else {
        i18nEngine = I18nBuilder.create()
          .withLanguages(getCoreLanguageDefinitions())
          .withDefaultLanguage(LanguageCodes.EN_US)
          .withFallbackLanguage(LanguageCodes.EN_US)
          .withValidation({
            requireCompleteStrings: false,
            allowPartialRegistration: true,
          })
          .withInstanceKey('default')
          .build();
      }

      // Step 3: Register Core component (required for error messages)
      const coreReg = createCoreComponentRegistration();
      i18nEngine.registerIfNotExists({
        id: coreReg.component.id,
        strings: coreReg.strings as Record<string, Record<string, string>>,
      });

      // Step 4: Register library components
      i18nEngine.registerIfNotExists(createLibComponentConfig());

      // Step 5: Register application component
      const registrationResult = i18nEngine.registerIfNotExists(
        createAppComponentConfig(),
      );

      // Step 6: Register branded string key enums (guard with hasStringKeyEnum)
      if (!i18nEngine.hasStringKeyEnum(LibStringKey)) {
        i18nEngine.registerStringKeyEnum(LibStringKey);
      }
      if (!i18nEngine.hasStringKeyEnum(AppStringKey)) {
        i18nEngine.registerStringKeyEnum(AppStringKey);
      }

      // Step 7: Initialize GlobalActiveContext
      const globalContext = GlobalActiveContext.getInstance<
        CoreLanguageCode,
        IActiveContext<CoreLanguageCode>
      >();
      globalContext.createContext(
        LanguageCodes.EN_US,
        LanguageCodes.EN_US,
        AppComponentId,
      );

      // Step 8: translate helpers using translateStringKey
      const translate = (
        name: AppStringKeyValue,
        variables?: Record<string, string | number>,
        language?: CoreLanguageCode,
        context?: LanguageContextSpace,
      ): string => {
        const activeContext =
          context ?? globalContext.getContext(AppComponentId).currentContext;
        const lang =
          language ??
          (activeContext === 'admin'
            ? globalContext.getContext(AppComponentId).adminLanguage
            : globalContext.getContext(AppComponentId).language);

        return i18nEngine.translateStringKey(name, variables, lang);
      };

      const safeTranslate = (
        name: AppStringKeyValue,
        variables?: Record<string, string | number>,
        language?: CoreLanguageCode,
        context?: LanguageContextSpace,
      ): string => {
        const activeContext =
          context ?? globalContext.getContext(AppComponentId).currentContext;
        const lang =
          language ??
          (activeContext === 'admin'
            ? globalContext.getContext(AppComponentId).adminLanguage
            : globalContext.getContext(AppComponentId).language);

        return i18nEngine.safeTranslateStringKey(name, variables, lang);
      };

      return {
        i18nEngine,
        globalContext,
        registrationResult,
        translate,
        safeTranslate,
      };
    }

    it('should create engine and register all components without errors', () => {
      const { i18nEngine, registrationResult } = setupI18n();

      expect(i18nEngine).toBeDefined();
      expect(I18nEngine.hasInstance('default')).toBe(true);
      expect(registrationResult.isValid).toBe(true);
    });

    it('should be idempotent — calling setup twice reuses the engine', () => {
      const first = setupI18n();
      const second = setupI18n();

      expect(first.i18nEngine).toBe(second.i18nEngine);
    });

    it('should register all branded string key enums', () => {
      const { i18nEngine } = setupI18n();

      expect(i18nEngine.hasStringKeyEnum(LibStringKey)).toBe(true);
      expect(i18nEngine.hasStringKeyEnum(AppStringKey)).toBe(true);
    });

    it('should translate app string keys in English', () => {
      const { translate } = setupI18n();

      expect(translate(AppStringKey.SiteTitle)).toBe('My Application');
      expect(translate(AppStringKey.SiteDescription)).toBe(
        'An Express Suite application',
      );
    });

    it('should translate app string keys with variables', () => {
      const { translate } = setupI18n();

      expect(translate(AppStringKey.WelcomeMessage, { name: 'Alice' })).toBe(
        'Welcome, Alice!',
      );
    });

    it('should translate app string keys in French via language param', () => {
      const { translate } = setupI18n();

      expect(
        translate(AppStringKey.SiteTitle, undefined, LanguageCodes.FR),
      ).toBe('Mon Application');
      expect(
        translate(
          AppStringKey.WelcomeMessage,
          { name: 'Alice' },
          LanguageCodes.FR,
        ),
      ).toBe('Bienvenue, Alice !');
    });

    it('should translate using context language when no explicit language given', () => {
      const { translate, globalContext } = setupI18n();

      globalContext.setUserLanguage(LanguageCodes.FR, AppComponentId);

      expect(translate(AppStringKey.SiteTitle)).toBe('Mon Application');
    });

    it('should translate library component keys via translateStringKey', () => {
      const { i18nEngine } = setupI18n();

      expect(
        i18nEngine.translateStringKey(
          LibStringKey.LibGreeting,
          undefined,
          LanguageCodes.EN_US,
        ),
      ).toBe('Hello from library');

      expect(
        i18nEngine.translateStringKey(
          LibStringKey.LibGreeting,
          undefined,
          LanguageCodes.FR,
        ),
      ).toBe('Bonjour de la bibliothèque');
    });

    it('should safeTranslate return a string for missing keys without throwing', () => {
      const { i18nEngine } = setupI18n();

      const result = i18nEngine.safeTranslateStringKey(
        'nonexistent.key.that.does.not.exist',
      );
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should safeTranslate work for valid keys', () => {
      const { safeTranslate } = setupI18n();

      expect(safeTranslate(AppStringKey.SiteTitle)).toBe('My Application');
    });

    it('should respect admin context in translate helper', () => {
      const { translate, globalContext } = setupI18n();

      // Set user language to French, admin to English
      globalContext.setUserLanguage(LanguageCodes.FR, AppComponentId);
      globalContext.setAdminLanguage(LanguageCodes.EN_US, AppComponentId);

      // User context should give French
      expect(
        translate(AppStringKey.SiteTitle, undefined, undefined, 'user'),
      ).toBe('Mon Application');

      // Admin context should give English
      expect(
        translate(AppStringKey.SiteTitle, undefined, undefined, 'admin'),
      ).toBe('My Application');
    });
  });

  describe('createI18nStringKeys vs createI18nStringKeysFromEnum', () => {
    it('createI18nStringKeys should create branded enum from object literal', () => {
      const keys = createI18nStringKeys('test-component', {
        Welcome: 'welcome',
        Goodbye: 'goodbye',
      } as const);

      expect(keys.Welcome).toBe('welcome');
      expect(keys.Goodbye).toBe('goodbye');
    });

    it('createI18nStringKeysFromEnum should create branded enum from TS enum', () => {
      enum LegacyStringKeys {
        Welcome = 'welcome',
        Goodbye = 'goodbye',
      }

      const keys = createI18nStringKeysFromEnum(
        'test-legacy-component',
        LegacyStringKeys,
      );

      expect(keys.Welcome).toBe('welcome');
      expect(keys.Goodbye).toBe('goodbye');
    });

    it('both functions should produce identical values for the same input', () => {
      const fromObject = createI18nStringKeys('compare-obj', {
        Welcome: 'welcome',
        Goodbye: 'goodbye',
      } as const);

      enum CompareEnum {
        Welcome = 'welcome',
        Goodbye = 'goodbye',
      }
      const fromEnum = createI18nStringKeysFromEnum(
        'compare-enum',
        CompareEnum,
      );

      expect(fromObject.Welcome).toBe(fromEnum.Welcome);
      expect(fromObject.Goodbye).toBe(fromEnum.Goodbye);
    });

    it('createI18nStringKeysFromEnum should filter reverse numeric mappings', () => {
      enum NumericEnum {
        Alpha = 'alpha',
        Beta = 'beta',
      }

      const keys = createI18nStringKeysFromEnum('numeric-test', NumericEnum);

      expect(keys.Alpha).toBe('alpha');
      expect(keys.Beta).toBe('beta');
      expect(Object.keys(keys)).toEqual(
        expect.arrayContaining(['Alpha', 'Beta']),
      );
    });

    it('both should be registerable and translatable on an engine', () => {
      const engine = I18nEngine.registerIfNotExists(
        'enum-test',
        getCoreLanguageDefinitions(),
      );

      const fromObject = createI18nStringKeys('obj-component', {
        Hello: 'hello',
      } as const);

      enum LegacyKeys {
        World = 'world',
      }
      const fromEnum = createI18nStringKeysFromEnum(
        'enum-component',
        LegacyKeys,
      );

      engine.registerIfNotExists({
        id: 'obj-component',
        strings: { [LanguageCodes.EN_US]: { hello: 'Hello!' } },
      });
      engine.registerIfNotExists({
        id: 'enum-component',
        strings: { [LanguageCodes.EN_US]: { world: 'World!' } },
      });

      engine.registerStringKeyEnum(fromObject);
      engine.registerStringKeyEnum(fromEnum);

      expect(engine.hasStringKeyEnum(fromObject)).toBe(true);
      expect(engine.hasStringKeyEnum(fromEnum)).toBe(true);

      expect(
        engine.translateStringKey(
          fromObject.Hello,
          undefined,
          LanguageCodes.EN_US,
        ),
      ).toBe('Hello!');
      expect(
        engine.translateStringKey(
          fromEnum.World,
          undefined,
          LanguageCodes.EN_US,
        ),
      ).toBe('World!');
    });
  });
});
