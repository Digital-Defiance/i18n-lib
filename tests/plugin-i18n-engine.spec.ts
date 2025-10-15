import {
  ComponentDefinition,
  ComponentRegistration,
  LanguageDefinition,
  PluginI18nEngine,
  RegistryError,
  CurrencyCode,
  Timezone,
} from '../src';

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

  // Test string enums
  enum TestStrings {
    Welcome = 'welcome',
    Goodbye = 'goodbye',
    Template = 'template',
  }

  enum CoreStrings {
    Error = 'error',
    Success = 'success',
  }

  let engine: PluginI18nEngine<'en' | 'fr' | 'es'>;

  beforeEach(() => {
    PluginI18nEngine.clearAllInstances();
    engine = new PluginI18nEngine([englishLang, frenchLang, spanishLang]);
  });

  afterEach(() => {
    PluginI18nEngine.clearAllInstances();
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
      PluginI18nEngine.clearAllInstances();
      expect(() => {
        new PluginI18nEngine([]);
      }).toThrow('At least one language must be provided');
    });

    it('should use first language as default if no default specified', () => {
      PluginI18nEngine.clearAllInstances();
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
      const testComponent: ComponentDefinition<TestStrings> = {
        id: 'test-component',
        name: 'Test Component',
        stringKeys: Object.values(TestStrings),
      };

      const registration: ComponentRegistration<TestStrings, 'en' | 'fr' | 'es'> = {
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
      const result = engine.translate('test-component', TestStrings.Welcome, undefined, 'fr');
      expect(result).toBe('Bienvenue');
    });

    it('should use safe translate for fallbacks', () => {
      const result = engine.safeTranslate('test-component', 'nonexistent');
      expect(result).toBe('[test-component.nonexistent]');
    });

    it('should get detailed translation response', () => {
      const response = engine.getTranslationDetails('test-component', TestStrings.Welcome);
      expect(response.translation).toBe('Welcome');
      expect(response.actualLanguage).toBe('en');
      expect(response.wasFallback).toBe(false);
    });
  });

  describe('t function (template processor)', () => {
    beforeEach(() => {
      // Register core component for t function testing
      const coreComponent: ComponentDefinition<CoreStrings> = {
        id: 'core',
        name: 'Core Component',
        stringKeys: Object.values(CoreStrings),
      };

      const coreRegistration: ComponentRegistration<CoreStrings, 'en' | 'fr' | 'es'> = {
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
      const templateComponent: ComponentDefinition<'greeting'> = {
        id: 'template-test',
        name: 'Template Test',
        stringKeys: ['greeting'],
      };

      const templateRegistration: ComponentRegistration<'greeting', 'en' | 'fr' | 'es'> = {
        component: templateComponent,
        strings: {
          en: {
            greeting: 'Hello, {name}!',
          },
          fr: {
            greeting: 'Bonjour, {name}!',
          },
          es: {
            greeting: '¡Hola, {name}!',
          },
        },
      };

      engine.registerComponent(templateRegistration);

      const result = engine.t('{{template-test.greeting}}', 'en', { name: 'World' });
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
      const multiVarComponent: ComponentDefinition<'multi'> = {
        id: 'multi-var',
        name: 'Multi Variable',
        stringKeys: ['multi'],
      };

      const multiVarRegistration: ComponentRegistration<'multi', 'en'> = {
        component: multiVarComponent,
        strings: {
          en: {
            multi: '{greeting}, {name}! Today is {day}.',
          },
        },
      };

      engine.registerComponent(multiVarRegistration);

      const result = engine.t(
        '{{multi-var.multi}}',
        'en',
        { greeting: 'Hello' },
        { name: 'John' },
        { day: 'Monday' }
      );
      expect(result).toBe('Hello, John! Today is Monday.');
    });

    it('should handle mixed component patterns and direct variables', () => {
      // Test that both {{component.key}} and {variable} work together
      const result = engine.t(
        'Status: {{core.success}} for {user}',
        'en',
        { user: 'Alice' }
      );
      expect(result).toBe('Status: Operation successful for Alice');
    });

    it('should handle template strings with variables correctly', () => {
      // Register a component with a template string
      const greetingComponent: ComponentDefinition<'greetingTemplate'> = {
        id: 'greeting',
        name: 'Greeting',
        stringKeys: ['greetingTemplate'],
      };

      const greetingRegistration: ComponentRegistration<'greetingTemplate', 'en'> = {
        component: greetingComponent,
        strings: {
          en: {
            greetingTemplate: 'Welcome, {name}!',
          },
        },
      };

      engine.registerComponent(greetingRegistration);

      // The 'template' suffix should trigger using the first variable object
      const result = engine.t(
        '{{greeting.greetingTemplate}}',
        'en',
        { name: 'Bob' }
      );
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
        'TestEnum'
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
      
      const component: ComponentDefinition<TestStrings> = {
        id: 'test-exists',
        name: 'Test Exists',
        stringKeys: Object.values(TestStrings),
      };

      const registration: ComponentRegistration<TestStrings, 'en'> = {
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
      const component: ComponentDefinition<TestStrings> = {
        id: 'update-test',
        name: 'Update Test',
        stringKeys: Object.values(TestStrings),
      };

      const registration: ComponentRegistration<TestStrings, 'en'> = {
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

      const result = engine.updateComponentStrings('update-test', updatedStrings);
      expect(result.isValid).toBe(false); // Still missing fr and es

      const translation = engine.translate('update-test', TestStrings.Welcome);
      expect(translation).toBe('Updated Welcome');
    });

    it('should clear all components', () => {
      const component: ComponentDefinition<TestStrings> = {
        id: 'clear-test',
        name: 'Clear Test',
        stringKeys: Object.values(TestStrings),
      };

      const registration: ComponentRegistration<TestStrings, 'en'> = {
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
      const component: ComponentDefinition<TestStrings> = {
        id: 'validation-test',
        name: 'Validation Test',
        stringKeys: Object.values(TestStrings),
      };

      const completeRegistration: ComponentRegistration<TestStrings, 'en' | 'fr' | 'es'> = {
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
      const component: ComponentDefinition<TestStrings> = {
        id: 'incomplete-test',
        name: 'Incomplete Test',
        stringKeys: Object.values(TestStrings),
      };

      const incompleteRegistration: ComponentRegistration<TestStrings, 'en' | 'fr' | 'es'> = {
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
    it('should provide access to language registry', () => {
      const langRegistry = engine.getLanguageRegistry();
      expect(langRegistry).toBeDefined();
      expect(typeof langRegistry.registerLanguage).toBe('function');
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
      const adminEngine = PluginI18nEngine.createInstance('admin', [englishLang]);
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
});