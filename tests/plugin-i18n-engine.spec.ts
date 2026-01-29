/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import {
  ComponentDefinition,
  ComponentRegistration,
  CoreI18nComponentId,
  LanguageDefinition,
  LanguageRegistry,
  PluginI18nEngine,
} from '../src';
import { createI18nStringKeys } from '../src/branded-string-key';
import { CurrencyCode } from '../src/utils/currency';
import { Timezone } from '../src/utils/timezone';

describe('PluginI18nEngine', () => {
  // Define test languages
  const englishLang: LanguageDefinition = {
    id: 'en',
    name: 'English',
    code: 'en',
    isDefault: true,
  };

  const frenchLang: LanguageDefinition = {
    id: 'fr',
    name: 'French',
    code: 'fr',
  };

  const spanishLang: LanguageDefinition = {
    id: 'es',
    name: 'Spanish',
    code: 'es',
  };

  // Test string enums (using branded enums)
  // Use unique test-prefixed IDs to avoid conflicts with globally registered enums
  const TestStrings = createI18nStringKeys('test-plugin-i18n-engine-test-component', {
    Welcome: 'welcome',
    Goodbye: 'goodbye',
    Template: 'template',
  } as const);

  const CoreStrings = createI18nStringKeys('test-plugin-i18n-engine-core', {
    Error: 'error',
    Success: 'success',
  } as const);

  let engine: PluginI18nEngine<'en' | 'fr' | 'es'>;

  beforeEach(() => {
    PluginI18nEngine.resetAll();
    engine = new PluginI18nEngine([englishLang, frenchLang, spanishLang]);
  });

  afterEach(() => {
    PluginI18nEngine.resetAll();
  });

  describe('constructor and initialization', () => {
    it('should create engine with default configuration', () => {
      expect(engine).toBeDefined();
      expect(engine.getLanguages()).toHaveLength(3);
      expect(engine.hasLanguage('en')).toBe(true);
      expect(engine.hasLanguage('fr')).toBe(true);
      expect(engine.hasLanguage('es')).toBe(true);
    });

    it('should initialize t function', () => {
      expect(engine.t).toBeDefined();
      expect(typeof engine.t).toBe('function');
    });

    it('should throw error if no languages provided', () => {
      PluginI18nEngine.resetAll();
      expect(() => {
        new PluginI18nEngine([]);
      }).toThrow('At least one language must be provided');
    });

    it('should use first language as default if no default specified', () => {
      PluginI18nEngine.resetAll();
      const langs = [
        { id: 'fr', name: 'French', code: 'fr' },
        { id: 'en', name: 'English', code: 'en' },
      ];
      const testEngine = new PluginI18nEngine(langs);

      const context = testEngine.getContext();
      expect(context.language).toBe('fr');
    });
  });

  describe('component registration and translation', () => {
    beforeEach(() => {
      const testComponent: ComponentDefinition<typeof TestStrings> = {
        id: 'test-component',
        name: 'Test Component',
        stringKeys: TestStrings,
      };

      const registration: ComponentRegistration<
        typeof TestStrings,
        'en' | 'fr' | 'es'
      > = {
        component: testComponent,
        strings: {
          en: {
            [TestStrings.Welcome]: 'Welcome',
            [TestStrings.Goodbye]: 'Goodbye',
            [TestStrings.Template]: 'Hello, {name}!',
          },
          fr: {
            [TestStrings.Welcome]: 'Bienvenue',
            [TestStrings.Goodbye]: 'Au revoir',
            [TestStrings.Template]: 'Bonjour, {name}!',
          },
          es: {
            [TestStrings.Welcome]: 'Bienvenido',
            [TestStrings.Goodbye]: 'Adiós',
            [TestStrings.Template]: '¡Hola, {name}!',
          },
        },
      };

      engine.registerComponent(registration);
    });

    it('should not throw when using registerComponentIfNotExists on duplicate', () => {
      const testComponent: ComponentDefinition<typeof TestStrings> = {
        id: 'test-component',
        name: 'Test Component',
        stringKeys: TestStrings,
      };

      const registration: ComponentRegistration<typeof TestStrings, 'en'> = {
        component: testComponent,
        strings: { en: { [TestStrings.Welcome]: 'Welcome' } },
      };

      const result = engine.registerComponentIfNotExists(registration);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should register component when using registerComponentIfNotExists on new component', () => {
      const newComponent: ComponentDefinition<typeof TestStrings> = {
        id: 'new-component',
        name: 'New Component',
        stringKeys: TestStrings,
      };

      const registration: ComponentRegistration<
        typeof TestStrings,
        'en' | 'fr' | 'es'
      > = {
        component: newComponent,
        strings: {
          en: {
            [TestStrings.Welcome]: 'Hello',
            [TestStrings.Goodbye]: 'Bye',
            [TestStrings.Template]: 'Hi, {name}!',
          },
          fr: {
            [TestStrings.Welcome]: 'Salut',
            [TestStrings.Goodbye]: 'Au revoir',
            [TestStrings.Template]: 'Salut, {name}!',
          },
          es: {
            [TestStrings.Welcome]: 'Hola',
            [TestStrings.Goodbye]: 'Adiós',
            [TestStrings.Template]: '¡Hola, {name}!',
          },
        },
      };

      const result = engine.registerComponentIfNotExists(registration);
      expect(result.isValid).toBe(true);
      expect(engine.hasComponent('new-component')).toBe(true);
      expect(engine.translate('new-component', TestStrings.Welcome)).toBe(
        'Hello',
      );
    });

    it('should translate simple strings', () => {
      const result = engine.translate('test-component', TestStrings.Welcome);
      expect(result).toBe('Welcome');
    });

    it('should translate with variables', () => {
      const result = engine.translate('test-component', TestStrings.Template, {
        name: 'John',
      });
      // Variables are only replaced if the string key ends with 'template'
      // Since TestStrings.Template = 'template', isTemplate('template') returns true
      expect(result).toBe('Hello, John!');
    });

    it('should translate with specified language', () => {
      const result = engine.translate(
        'test-component',
        TestStrings.Welcome,
        undefined,
        'fr',
      );
      expect(result).toBe('Bienvenue');
    });

    it('should use safe translate for fallbacks', () => {
      const result = engine.safeTranslate('test-component', 'nonexistent');
      expect(result).toBe('[test-component.nonexistent]');
    });

    it('should get detailed translation response', () => {
      const response = engine.getTranslationDetails(
        'test-component',
        TestStrings.Welcome,
      );
      expect(response.translation).toBe('Welcome');
      expect(response.actualLanguage).toBe('en');
      expect(response.wasFallback).toBe(false);
    });
  });

  describe('component alias resolution', () => {
    const AliasStrings = createI18nStringKeys('test-plugin-i18n-engine-alias', {
      WelcomeMessage: 'welcomeMessage',
      FarewellTemplate: 'farewellTemplate',
    } as const);

    beforeEach(() => {
      const aliasComponent: ComponentDefinition<typeof AliasStrings> = {
        id: 'alias-component',
        name: 'Alias Component',
        stringKeys: AliasStrings,
      };

      const aliasRegistration: ComponentRegistration<
        typeof AliasStrings,
        'en' | 'fr' | 'es'
      > = {
        component: aliasComponent,
        strings: {
          en: {
            [AliasStrings.WelcomeMessage]: 'Alias welcome',
            [AliasStrings.FarewellTemplate]: 'Goodbye, {name}!',
          },
          fr: {
            [AliasStrings.WelcomeMessage]: 'Alias bienvenue',
            [AliasStrings.FarewellTemplate]: 'Au revoir, {name}!',
          },
          es: {
            [AliasStrings.WelcomeMessage]: 'Alias bienvenido',
            [AliasStrings.FarewellTemplate]: '¡Adiós, {name}!',
          },
        },
        aliases: ['AliasComponent', 'AliasStrings'],
      };

      engine.registerComponent(aliasRegistration);
    });

    it('should translate using enum name prefixes in templates', () => {
      const result = engine.t('{{AliasStrings.WelcomeMessage}}');
      expect(result).toBe('Alias welcome');
    });

    it('should translate using explicit aliases for component id', () => {
      const result = engine.t('{{AliasComponent.WelcomeMessage}}', 'fr');
      expect(result).toBe('Alias bienvenue');
    });

    it('should translate using component id with canonical keys', () => {
      const result = engine.t('{{alias-component.farewellTemplate}}', 'es', {
        name: 'Carlos',
      });
      expect(result).toBe('¡Adiós, Carlos!');
    });

    it('should translate template strings using enum keys', () => {
      const result = engine.t('{{AliasStrings.FarewellTemplate}}', 'en', {
        name: 'Jamie',
      });
      expect(result).toBe('Goodbye, Jamie!');
    });
  });

  describe('constants support', () => {
    it('should replace constants in templates', () => {
      PluginI18nEngine.resetAll();
      const constants = { Site: 'TestSite.com', Version: '1.0' };
      const engineWithConstants = new PluginI18nEngine([englishLang], {
        constants,
      });

      const SiteTemplateStrings = createI18nStringKeys('test-plugin-i18n-engine-site-template', {
        siteTemplate: 'siteTemplate',
      } as const);

      const component: ComponentDefinition<typeof SiteTemplateStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: SiteTemplateStrings,
      };

      const registration: ComponentRegistration<typeof SiteTemplateStrings, 'en'> = {
        component,
        strings: {
          en: { [SiteTemplateStrings.siteTemplate]: 'Welcome to {Site} v{Version}' },
        },
      };

      engineWithConstants.registerComponent(registration);
      const result = engineWithConstants.translate('test', SiteTemplateStrings.siteTemplate);
      expect(result).toBe('Welcome to TestSite.com v1.0');
    });

    it('should prioritize variables over constants', () => {
      PluginI18nEngine.resetAll();
      const constants = { name: 'ConstantName' };
      const engineWithConstants = new PluginI18nEngine([englishLang], {
        constants,
      });

      const GreetingTemplateStrings = createI18nStringKeys('test-plugin-i18n-engine-greeting-template', {
        greetingTemplate: 'greetingTemplate',
      } as const);

      const component: ComponentDefinition<typeof GreetingTemplateStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: GreetingTemplateStrings,
      };

      const registration: ComponentRegistration<typeof GreetingTemplateStrings, 'en'> = {
        component,
        strings: {
          en: { [GreetingTemplateStrings.greetingTemplate]: 'Hello {name}' },
        },
      };

      engineWithConstants.registerComponent(registration);
      const result = engineWithConstants.translate('test', GreetingTemplateStrings.greetingTemplate, {
        name: 'VariableName',
      });
      expect(result).toBe('Hello VariableName');
    });
  });

  describe('t function (template processor)', () => {
    beforeEach(() => {
      // Register core component for t function testing
      const coreComponent: ComponentDefinition<typeof CoreStrings> = {
        id: CoreI18nComponentId,
        name: 'Core Component',
        stringKeys: CoreStrings,
      };

      const coreRegistration: ComponentRegistration<
        typeof CoreStrings,
        'en' | 'fr' | 'es'
      > = {
        component: coreComponent,
        strings: {
          en: {
            [CoreStrings.Error]: 'Error occurred',
            [CoreStrings.Success]: 'Operation successful',
          },
          fr: {
            [CoreStrings.Error]: 'Erreur survenue',
            [CoreStrings.Success]: 'Opération réussie',
          },
          es: {
            [CoreStrings.Error]: 'Error ocurrido',
            [CoreStrings.Success]: 'Operación exitosa',
          },
        },
      };

      engine.registerComponent(coreRegistration);
    });

    it('should process plain text without patterns', () => {
      const result = engine.t('Plain text message');
      expect(result).toBe('Plain text message');
    });

    it('should process component-based template patterns', () => {
      const result = engine.t('{{core.error}}');
      expect(result).toBe('Error occurred');
    });

    it('should process template patterns with specified language', () => {
      const result = engine.t('{{core.success}}', 'fr');
      expect(result).toBe('Opération réussie');
    });

    it('should process template patterns with variables', () => {
      // Register a component with template strings for this test
      const GreetingStrings = createI18nStringKeys('test-plugin-i18n-engine-template-test', {
        greeting: 'greeting',
      } as const);

      const templateComponent: ComponentDefinition<typeof GreetingStrings> = {
        id: 'template-test',
        name: 'Template Test',
        stringKeys: GreetingStrings,
      };

      const templateRegistration: ComponentRegistration<
        typeof GreetingStrings,
        'en' | 'fr' | 'es'
      > = {
        component: templateComponent,
        strings: {
          en: {
            [GreetingStrings.greeting]: 'Hello, {name}!',
          },
          fr: {
            [GreetingStrings.greeting]: 'Bonjour, {name}!',
          },
          es: {
            [GreetingStrings.greeting]: '¡Hola, {name}!',
          },
        },
      };

      engine.registerComponent(templateRegistration);

      const result = engine.t('{{template-test.greeting}}', 'en', {
        name: 'World',
      });
      expect(result).toBe('Hello, World!');
    });

    it('should handle multiple template patterns', () => {
      const result = engine.t('{{core.error}} - {{core.success}}');
      expect(result).toBe('Error occurred - Operation successful');
    });

    it('should handle non-existent patterns gracefully', () => {
      const result = engine.t('{{core.nonexistent}}');
      expect(result).toBe('[core.nonexistent]');
    });

    it('should merge multiple variable objects', () => {
      // Register a component with multiple variables
      const MultiStrings = createI18nStringKeys('test-plugin-i18n-engine-multi-var', {
        multi: 'multi',
      } as const);

      const multiVarComponent: ComponentDefinition<typeof MultiStrings> = {
        id: 'multi-var',
        name: 'Multi Variable',
        stringKeys: MultiStrings,
      };

      const multiVarRegistration: ComponentRegistration<typeof MultiStrings, 'en'> = {
        component: multiVarComponent,
        strings: {
          en: {
            [MultiStrings.multi]: '{greeting}, {name}! Today is {day}.',
          },
        },
      };

      engine.registerComponent(multiVarRegistration);

      const result = engine.t(
        '{{multi-var.multi}}',
        'en',
        { greeting: 'Hello' },
        { name: 'John' },
        { day: 'Monday' },
      );
      expect(result).toBe('Hello, John! Today is Monday.');
    });

    it('should handle mixed component patterns and direct variables', () => {
      // Test that both {{component.key}} and {variable} work together
      const result = engine.t('Status: {{core.success}} for {user}', 'en', {
        user: 'Alice',
      });
      expect(result).toBe('Status: Operation successful for Alice');
    });

    it('should handle template strings with variables correctly', () => {
      // Register a component with a template string
      const GreetingTemplateStrings = createI18nStringKeys('test-plugin-i18n-engine-greeting', {
        greetingTemplate: 'greetingTemplate',
      } as const);

      const greetingComponent: ComponentDefinition<typeof GreetingTemplateStrings> = {
        id: 'greeting',
        name: 'Greeting',
        stringKeys: GreetingTemplateStrings,
      };

      const greetingRegistration: ComponentRegistration<
        typeof GreetingTemplateStrings,
        'en'
      > = {
        component: greetingComponent,
        strings: {
          en: {
            [GreetingTemplateStrings.greetingTemplate]: 'Welcome, {name}!',
          },
        },
      };

      engine.registerComponent(greetingRegistration);

      // The 'template' suffix should trigger using the first variable object
      const result = engine.t('{{greeting.greetingTemplate}}', 'en', {
        name: 'Bob',
      });
      expect(result).toBe('Welcome, Bob!');
    });

    it('should leave unmatched patterns unchanged', () => {
      const result = engine.t('{{invalid}} and {unmatched}');
      expect(result).toBe('{{invalid}} and {unmatched}');
    });
  });

  describe('language management', () => {
    it('should register new language', () => {
      const germanLang: LanguageDefinition = {
        id: 'de',
        name: 'German',
        code: 'de',
      };

      engine.registerLanguage(germanLang);
      expect(engine.hasLanguage('de' as any)).toBe(true);
      expect(engine.getLanguages()).toHaveLength(4);
    });

    it('should register multiple languages', () => {
      const newLangs = [
        { id: 'de', name: 'German', code: 'de' },
        { id: 'it', name: 'Italian', code: 'it' },
      ];

      engine.registerLanguages(newLangs);
      expect(engine.hasLanguage('de' as any)).toBe(true);
      expect(engine.hasLanguage('it' as any)).toBe(true);
      expect(engine.getLanguages()).toHaveLength(5);
    });

    it('should set current language', () => {
      engine.setLanguage('fr');
      const context = engine.getContext();
      expect(context.language).toBe('fr');
    });

    it('should throw error for unregistered language', () => {
      expect(() => {
        engine.setLanguage('de' as any);
      }).toThrow("Language 'de' is not registered");
    });

    it('should get language by code', () => {
      const lang = engine.getLanguageByCode('fr');
      expect(lang).toEqual(frenchLang);
    });

    it('should return undefined for unknown language code', () => {
      const lang = engine.getLanguageByCode('unknown');
      expect(lang).toBeUndefined();
    });
  });

  describe('context management', () => {
    it('should get current context', () => {
      const context = engine.getContext();
      expect(context.language).toBe('en');
      expect(context.adminLanguage).toBe('en');
    });

    it('should update context', () => {
      engine.updateContext({
        language: 'fr',
        adminLanguage: 'es',
        currencyCode: new CurrencyCode('EUR'),
        timezone: new Timezone('Europe/Paris'),
      });

      const context = engine.getContext();
      expect(context.language).toBe('fr');
      expect(context.adminLanguage).toBe('es');
      expect(context.currencyCode.value).toBe('EUR');
      expect(context.timezone.value).toBe('Europe/Paris');
    });
  });

  describe('enum registration and translation', () => {
    enum TestEnum {
      Active = 'active',
      Inactive = 'inactive',
    }

    beforeEach(() => {
      engine.registerEnum(
        TestEnum,
        {
          en: {
            [TestEnum.Active]: 'Active',
            [TestEnum.Inactive]: 'Inactive',
          },
          fr: {
            [TestEnum.Active]: 'Actif',
            [TestEnum.Inactive]: 'Inactif',
          },
          es: {
            [TestEnum.Active]: 'Activo',
            [TestEnum.Inactive]: 'Inactivo',
          },
        },
        'TestEnum',
      );
    });

    it('should translate enum values', () => {
      const result = engine.translateEnum(TestEnum, TestEnum.Active, 'fr');
      expect(result).toBe('Actif');
    });

    it('should translate enum with current language', () => {
      engine.setLanguage('es');
      const result = engine.translateEnum(TestEnum, TestEnum.Inactive);
      expect(result).toBe('Inactivo');
    });
  });

  describe('component management', () => {
    it('should check if component exists', () => {
      expect(engine.hasComponent('nonexistent')).toBe(false);

      const component: ComponentDefinition<typeof TestStrings> = {
        id: 'test-exists',
        name: 'Test Exists',
        stringKeys: TestStrings,
      };

      const registration: ComponentRegistration<typeof TestStrings, 'en'> = {
        component,
        strings: {
          en: {
            [TestStrings.Welcome]: 'Welcome',
            [TestStrings.Goodbye]: 'Goodbye',
            [TestStrings.Template]: 'Hello, {name}!',
          },
        },
      };

      engine.registerComponent(registration);
      expect(engine.hasComponent('test-exists')).toBe(true);
    });

    it('should get registered components', () => {
      const components = engine.getComponents();
      expect(Array.isArray(components)).toBe(true);
    });

    it('should update component strings', () => {
      const component: ComponentDefinition<typeof TestStrings> = {
        id: 'update-test',
        name: 'Update Test',
        stringKeys: TestStrings,
      };

      const registration: ComponentRegistration<typeof TestStrings, 'en'> = {
        component,
        strings: {
          en: {
            [TestStrings.Welcome]: 'Welcome',
            [TestStrings.Goodbye]: 'Goodbye',
            [TestStrings.Template]: 'Hello, {name}!',
          },
        },
      };

      engine.registerComponent(registration);

      const updatedStrings = {
        en: {
          [TestStrings.Welcome]: 'Updated Welcome',
          [TestStrings.Goodbye]: 'Updated Goodbye',
          [TestStrings.Template]: 'Updated {name}!',
        },
      };

      const result = engine.updateComponentStrings(
        'update-test',
        updatedStrings,
      );
      expect(result.isValid).toBe(false); // Still missing fr and es

      const translation = engine.translate('update-test', TestStrings.Welcome);
      expect(translation).toBe('Updated Welcome');
    });

    it('should clear all components', () => {
      const component: ComponentDefinition<typeof TestStrings> = {
        id: 'clear-test',
        name: 'Clear Test',
        stringKeys: TestStrings,
      };

      const registration: ComponentRegistration<typeof TestStrings, 'en'> = {
        component,
        strings: {
          en: {
            [TestStrings.Welcome]: 'Welcome',
            [TestStrings.Goodbye]: 'Goodbye',
            [TestStrings.Template]: 'Hello, {name}!',
          },
        },
      };

      engine.registerComponent(registration);
      expect(engine.hasComponent('clear-test')).toBe(true);

      engine.clearAllComponents();
      expect(engine.hasComponent('clear-test')).toBe(false);
    });
  });

  describe('validation', () => {
    it('should validate all components', () => {
      const component: ComponentDefinition<typeof TestStrings> = {
        id: 'validation-test',
        name: 'Validation Test',
        stringKeys: TestStrings,
      };

      const completeRegistration: ComponentRegistration<
        typeof TestStrings,
        'en' | 'fr' | 'es'
      > = {
        component,
        strings: {
          en: {
            [TestStrings.Welcome]: 'Welcome',
            [TestStrings.Goodbye]: 'Goodbye',
            [TestStrings.Template]: 'Hello, {name}!',
          },
          fr: {
            [TestStrings.Welcome]: 'Bienvenue',
            [TestStrings.Goodbye]: 'Au revoir',
            [TestStrings.Template]: 'Bonjour, {name}!',
          },
          es: {
            [TestStrings.Welcome]: 'Bienvenido',
            [TestStrings.Goodbye]: 'Adiós',
            [TestStrings.Template]: '¡Hola, {name}!',
          },
        },
      };

      engine.registerComponent(completeRegistration);

      const validation = engine.validateAllComponents();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect validation errors', () => {
      const component: ComponentDefinition<typeof TestStrings> = {
        id: 'incomplete-test',
        name: 'Incomplete Test',
        stringKeys: TestStrings,
      };

      const incompleteRegistration: ComponentRegistration<
        typeof TestStrings,
        'en' | 'fr' | 'es'
      > = {
        component,
        strings: {
          en: {
            [TestStrings.Welcome]: 'Welcome',
            [TestStrings.Goodbye]: 'Goodbye',
            // Missing Template
          },
          fr: {
            [TestStrings.Welcome]: 'Bienvenue',
            // Missing other strings
          },
          // Missing es entirely
        },
      };

      const result = engine.registerComponent(incompleteRegistration);
      // Registration succeeds with allowPartialRegistration=true (default)
      // but the registration result shows it's incomplete
      expect(result.isValid).toBe(false);
      expect(result.missingKeys.length).toBeGreaterThan(0);

      // However, validateAllComponents returns true because missing strings
      // were filled with fallbacks during registration
      const validation = engine.validateAllComponents();
      expect(validation.isValid).toBe(true); // Fallbacks were added

      // But we can verify the component was registered
      expect(engine.hasComponent('incomplete-test')).toBe(true);
    });
  });

  describe('registry access', () => {
    it('should provide access to language registry via static class', () => {
      expect(typeof LanguageRegistry.registerLanguage).toBe('function');
      expect(typeof LanguageRegistry.getLanguageIds).toBe('function');
    });

    it('should provide access to component registry', () => {
      const compRegistry = engine.getComponentRegistry();
      expect(compRegistry).toBeDefined();
      expect(typeof compRegistry.registerComponent).toBe('function');
    });

    it('should provide access to enum registry', () => {
      const enumRegistry = engine.getEnumRegistry();
      expect(enumRegistry).toBeDefined();
      expect(typeof enumRegistry.register).toBe('function');
    });
  });

  describe('static instance management', () => {
    it('should create named instances', () => {
      const adminEngine = PluginI18nEngine.createInstance('admin', [
        englishLang,
      ]);
      const userEngine = PluginI18nEngine.createInstance('user', [frenchLang]);

      expect(PluginI18nEngine.getInstance('admin')).toBe(adminEngine);
      expect(PluginI18nEngine.getInstance('user')).toBe(userEngine);
    });

    it('should throw error for duplicate instance keys', () => {
      PluginI18nEngine.createInstance('duplicate', [englishLang]);

      expect(() => {
        PluginI18nEngine.createInstance('duplicate', [frenchLang]);
      }).toThrow("I18n instance with key 'duplicate' already exists");
    });

    it('should check instance existence', () => {
      expect(PluginI18nEngine.hasInstance('test')).toBe(false);

      PluginI18nEngine.createInstance('test', [englishLang]);
      expect(PluginI18nEngine.hasInstance('test')).toBe(true);
    });

    it('should remove specific instances', () => {
      PluginI18nEngine.createInstance('removable', [englishLang]);
      expect(PluginI18nEngine.hasInstance('removable')).toBe(true);

      const removed = PluginI18nEngine.removeInstance('removable');
      expect(removed).toBe(true);
      expect(PluginI18nEngine.hasInstance('removable')).toBe(false);
    });

    it('should reset all instances', () => {
      PluginI18nEngine.createInstance('reset1', [englishLang]);
      PluginI18nEngine.createInstance('reset2', [frenchLang]);

      PluginI18nEngine.resetAll();

      expect(PluginI18nEngine.hasInstance('reset1')).toBe(false);
      expect(PluginI18nEngine.hasInstance('reset2')).toBe(false);
    });
  });

  describe('safeTranslate bracket formatting', () => {
    it('should return square bracket format for missing translations', () => {
      const result = engine.safeTranslate(
        'nonexistent-component',
        'missing-key',
      );
      expect(result).toBe('[nonexistent-component.missing-key]');
    });

    it('should use square brackets not curly braces', () => {
      const result = engine.safeTranslate('invalid', 'key');
      expect(result).not.toContain('{{');
      expect(result).not.toContain('}}');
      expect(result).toMatch(/^\[.*\]$/);
    });

    it('should format as [componentId.stringKey]', () => {
      const componentId = 'test-component';
      const stringKey = 'test-key';
      const result = engine.safeTranslate(componentId, stringKey);
      expect(result).toBe(`[${componentId}.${stringKey}]`);
    });

    it('should handle various component and key combinations', () => {
      const testCases = [
        { component: 'comp1', key: 'key1', expected: '[comp1.key1]' },
        {
          component: 'my-component',
          key: 'my-key',
          expected: '[my-component.my-key]',
        },
        {
          component: CoreI18nComponentId,
          key: 'error',
          expected: '[core.error]',
        },
      ];

      testCases.forEach(({ component, key, expected }) => {
        const result = engine.safeTranslate(component, key);
        expect(result).toBe(expected);
      });
    });

    it('should not throw errors for any input', () => {
      expect(() => engine.safeTranslate('', '')).not.toThrow();
      expect(() => engine.safeTranslate('a', 'b')).not.toThrow();
      expect(() =>
        engine.safeTranslate('test', 'key', { var: 'value' }),
      ).not.toThrow();
    });

    it('should return actual translation when component exists', () => {
      const TestKeyStrings = createI18nStringKeys('test-plugin-i18n-engine-safe-test', {
        testKey: 'testKey',
      } as const);

      const component: ComponentDefinition<typeof TestKeyStrings> = {
        id: 'safe-test',
        name: 'Safe Test',
        stringKeys: TestKeyStrings,
      };

      const registration: ComponentRegistration<typeof TestKeyStrings, 'en'> = {
        component,
        strings: {
          en: {
            [TestKeyStrings.testKey]: 'Test Value',
          },
        },
      };

      engine.registerComponent(registration);

      const result = engine.safeTranslate('safe-test', TestKeyStrings.testKey);
      expect(result).toBe('Test Value');
      expect(result).not.toContain('[');
      expect(result).not.toContain(']');
    });

    it('should handle variables in safe translate', () => {
      const TemplateStrings = createI18nStringKeys('test-plugin-i18n-engine-var-test', {
        template: 'template',
      } as const);

      const component: ComponentDefinition<typeof TemplateStrings> = {
        id: 'var-test',
        name: 'Variable Test',
        stringKeys: TemplateStrings,
      };

      const registration: ComponentRegistration<typeof TemplateStrings, 'en'> = {
        component,
        strings: {
          en: {
            [TemplateStrings.template]: 'Hello, {name}!',
          },
        },
      };

      engine.registerComponent(registration);

      const result = engine.safeTranslate('var-test', TemplateStrings.template, {
        name: 'World',
      });
      expect(result).toBe('Hello, World!');
    });

    it('should return bracket format when translation throws', () => {
      // Try to translate with unregistered component
      const result = engine.safeTranslate('unregistered', 'key');
      expect(result).toBe('[unregistered.key]');
    });

    it('should be consistent with t function fallback format', () => {
      // When t function encounters a missing component.key, it should use safeTranslate
      const tResult = engine.t('{{missing.key}}');
      const safeResult = engine.safeTranslate('missing', 'key');

      expect(tResult).toBe(safeResult);
      expect(tResult).toBe('[missing.key]');
    });
  });

  describe('bracket format edge cases', () => {
    it('should handle empty component id', () => {
      const result = engine.safeTranslate('', 'key');
      expect(result).toBe('[.key]');
    });

    it('should handle empty string key', () => {
      const result = engine.safeTranslate('component', '');
      expect(result).toBe('[component.]');
    });

    it('should handle special characters in component id', () => {
      const result = engine.safeTranslate('my-component_v2', 'test-key');
      expect(result).toBe('[my-component_v2.test-key]');
    });

    it('should handle special characters in string key', () => {
      const result = engine.safeTranslate('component', 'Error_NotFound');
      expect(result).toBe('[component.Error_NotFound]');
    });

    it('should preserve exact format without extra spaces', () => {
      const result = engine.safeTranslate('comp', 'key');
      expect(result).not.toContain(' ');
      expect(result).toBe('[comp.key]');
    });
  });
});
