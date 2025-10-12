import {
  ComponentDefinition,
  ComponentRegistration,
  LanguageDefinition,
  PluginI18nEngine,
  RegistryError,
} from '../src';

describe('Component Registration Validation', () => {
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

  const germanLang: LanguageDefinition = {
    id: 'de',
    name: 'German',
    code: 'de',
  };

  // Test string enums
  enum ComponentAStrings {
    Welcome = 'welcome',
    Goodbye = 'goodbye',
  }

  enum ComponentBStrings {
    Save = 'save',
    Cancel = 'cancel',
    Delete = 'delete',
  }

  let engine: PluginI18nEngine<'en' | 'fr' | 'es' | 'de'>;

  beforeEach(() => {
    // Create engine with initial languages
    engine = new PluginI18nEngine([englishLang, frenchLang, spanishLang]);
  });

  describe('Complete registration validation', () => {
    it('should accept complete registration for all system languages', () => {
      const componentA: ComponentDefinition<ComponentAStrings> = {
        id: 'component-a',
        name: 'Component A',
        stringKeys: Object.values(ComponentAStrings),
      };

      const registrationA: ComponentRegistration<
        ComponentAStrings,
        'en' | 'fr' | 'es'
      > = {
        component: componentA,
        strings: {
          en: {
            [ComponentAStrings.Welcome]: 'Welcome',
            [ComponentAStrings.Goodbye]: 'Goodbye',
          },
          fr: {
            [ComponentAStrings.Welcome]: 'Bienvenue',
            [ComponentAStrings.Goodbye]: 'Au revoir',
          },
          es: {
            [ComponentAStrings.Welcome]: 'Bienvenido',
            [ComponentAStrings.Goodbye]: 'Adiós',
          },
        },
      };

      const result = engine.registerComponent(registrationA);

      expect(result.isValid).toBe(true);
      expect(result.missingKeys).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing languages in component registration', () => {
      const componentA: ComponentDefinition<ComponentAStrings> = {
        id: 'component-a-incomplete',
        name: 'Component A Incomplete',
        stringKeys: Object.values(ComponentAStrings),
      };

      // Missing Spanish translations
      const registrationA: ComponentRegistration<
        ComponentAStrings,
        'en' | 'fr' | 'es'
      > = {
        component: componentA,
        strings: {
          en: {
            [ComponentAStrings.Welcome]: 'Welcome',
            [ComponentAStrings.Goodbye]: 'Goodbye',
          },
          fr: {
            [ComponentAStrings.Welcome]: 'Bienvenue',
            [ComponentAStrings.Goodbye]: 'Au revoir',
          },
          // Missing es (Spanish) language
        },
      };

      const result = engine.registerComponent(registrationA);

      expect(result.isValid).toBe(false);
      expect(result.missingKeys).toHaveLength(2); // 2 string keys missing for Spanish
      expect(
        result.missingKeys.some(
          (mk) =>
            mk.languageId === 'es' &&
            mk.stringKey === ComponentAStrings.Welcome,
        ),
      ).toBe(true);
      expect(
        result.missingKeys.some(
          (mk) =>
            mk.languageId === 'es' &&
            mk.stringKey === ComponentAStrings.Goodbye,
        ),
      ).toBe(true);
    });

    it('should detect missing string keys within provided languages', () => {
      const componentB: ComponentDefinition<ComponentBStrings> = {
        id: 'component-b-partial',
        name: 'Component B Partial',
        stringKeys: Object.values(ComponentBStrings),
      };

      const registrationB: ComponentRegistration<
        ComponentBStrings,
        'en' | 'fr' | 'es'
      > = {
        component: componentB,
        strings: {
          en: {
            [ComponentBStrings.Save]: 'Save',
            [ComponentBStrings.Cancel]: 'Cancel',
            // Missing Delete
          },
          fr: {
            [ComponentBStrings.Save]: 'Enregistrer',
            [ComponentBStrings.Cancel]: 'Annuler',
            [ComponentBStrings.Delete]: 'Supprimer',
          },
          es: {
            [ComponentBStrings.Save]: 'Guardar',
            // Missing Cancel and Delete
          },
        },
      };

      const result = engine.registerComponent(registrationB);

      expect(result.isValid).toBe(false);
      expect(result.missingKeys).toHaveLength(3); // 1 missing in EN, 2 missing in ES
      expect(
        result.missingKeys.some(
          (mk) =>
            mk.languageId === 'en' && mk.stringKey === ComponentBStrings.Delete,
        ),
      ).toBe(true);
      expect(
        result.missingKeys.some(
          (mk) =>
            mk.languageId === 'es' && mk.stringKey === ComponentBStrings.Cancel,
        ),
      ).toBe(true);
      expect(
        result.missingKeys.some(
          (mk) =>
            mk.languageId === 'es' && mk.stringKey === ComponentBStrings.Delete,
        ),
      ).toBe(true);
    });

    it('should allow components with different language coverage when allowPartialRegistration is true', () => {
      // Component A only supports EN and FR
      const componentA: ComponentDefinition<ComponentAStrings> = {
        id: 'component-a-limited',
        name: 'Component A Limited',
        stringKeys: Object.values(ComponentAStrings),
      };

      const registrationA: ComponentRegistration<
        ComponentAStrings,
        'en' | 'fr' | 'es'
      > = {
        component: componentA,
        strings: {
          en: {
            [ComponentAStrings.Welcome]: 'Welcome',
            [ComponentAStrings.Goodbye]: 'Goodbye',
          },
          fr: {
            [ComponentAStrings.Welcome]: 'Bienvenue',
            [ComponentAStrings.Goodbye]: 'Au revoir',
          },
          // No Spanish - will use fallbacks
        },
      };

      // This should succeed because allowPartialRegistration is true by default
      const resultA = engine.registerComponent(registrationA);
      expect(resultA.isValid).toBe(false); // Invalid but allowed
      expect(resultA.missingKeys.length).toBeGreaterThan(0);

      // Verify fallback behavior works
      const translation = engine.safeTranslate(
        'component-a-limited',
        ComponentAStrings.Welcome,
        {},
        'es',
      );
      expect(translation).toBe('Welcome'); // Falls back to English

      // Component B supports EN and ES only
      const componentB: ComponentDefinition<ComponentBStrings> = {
        id: 'component-b-different',
        name: 'Component B Different Languages',
        stringKeys: Object.values(ComponentBStrings),
      };

      const registrationB: ComponentRegistration<
        ComponentBStrings,
        'en' | 'fr' | 'es'
      > = {
        component: componentB,
        strings: {
          en: {
            [ComponentBStrings.Save]: 'Save',
            [ComponentBStrings.Cancel]: 'Cancel',
            [ComponentBStrings.Delete]: 'Delete',
          },
          es: {
            [ComponentBStrings.Save]: 'Guardar',
            [ComponentBStrings.Cancel]: 'Cancelar',
            [ComponentBStrings.Delete]: 'Eliminar',
          },
          // No French - will use fallbacks
        },
      };

      const resultB = engine.registerComponent(registrationB);
      expect(resultB.isValid).toBe(false); // Invalid but allowed

      // Verify both components work with their supported languages
      expect(
        engine.translate(
          'component-a-limited',
          ComponentAStrings.Welcome,
          {},
          'fr',
        ),
      ).toBe('Bienvenue');
      expect(
        engine.translate(
          'component-b-different',
          ComponentBStrings.Save,
          {},
          'es',
        ),
      ).toBe('Guardar');

      // Verify fallback behavior for unsupported languages
      expect(
        engine.safeTranslate(
          'component-b-different',
          ComponentBStrings.Save,
          {},
          'fr',
        ),
      ).toBe('Save'); // Falls back to English
    });

    it('should handle dynamic language addition', () => {
      // Register a component first
      const componentA: ComponentDefinition<ComponentAStrings> = {
        id: 'component-dynamic',
        name: 'Component for Dynamic Language Test',
        stringKeys: Object.values(ComponentAStrings),
      };

      const initialRegistration: ComponentRegistration<
        ComponentAStrings,
        'en' | 'fr' | 'es'
      > = {
        component: componentA,
        strings: {
          en: {
            [ComponentAStrings.Welcome]: 'Welcome',
            [ComponentAStrings.Goodbye]: 'Goodbye',
          },
          fr: {
            [ComponentAStrings.Welcome]: 'Bienvenue',
            [ComponentAStrings.Goodbye]: 'Au revoir',
          },
          es: {
            [ComponentAStrings.Welcome]: 'Bienvenido',
            [ComponentAStrings.Goodbye]: 'Adiós',
          },
        },
      };

      const initialResult = engine.registerComponent(initialRegistration);
      expect(initialResult.isValid).toBe(true);

      // Add German language to the engine
      engine.registerLanguage(germanLang);

      // Verify validation now requires German for new registrations
      const componentB: ComponentDefinition<ComponentBStrings> = {
        id: 'component-after-german',
        name: 'Component After German Added',
        stringKeys: Object.values(ComponentBStrings),
      };

      const postGermanRegistration: ComponentRegistration<
        ComponentBStrings,
        'en' | 'fr' | 'es' | 'de'
      > = {
        component: componentB,
        strings: {
          en: {
            [ComponentBStrings.Save]: 'Save',
            [ComponentBStrings.Cancel]: 'Cancel',
            [ComponentBStrings.Delete]: 'Delete',
          },
          fr: {
            [ComponentBStrings.Save]: 'Enregistrer',
            [ComponentBStrings.Cancel]: 'Annuler',
            [ComponentBStrings.Delete]: 'Supprimer',
          },
          es: {
            [ComponentBStrings.Save]: 'Guardar',
            [ComponentBStrings.Cancel]: 'Cancelar',
            [ComponentBStrings.Delete]: 'Eliminar',
          },
          // Missing German - should be flagged
        },
      };

      const postResult = engine.registerComponent(postGermanRegistration);
      expect(postResult.isValid).toBe(false);
      expect(postResult.missingKeys.some((mk) => mk.languageId === 'de')).toBe(
        true,
      );

      // But existing component should still work
      expect(
        engine.translate(
          'component-dynamic',
          ComponentAStrings.Welcome,
          {},
          'en',
        ),
      ).toBe('Welcome');
      expect(
        engine.safeTranslate(
          'component-dynamic',
          ComponentAStrings.Welcome,
          {},
          'de',
        ),
      ).toBe('Welcome'); // Fallback
    });
  });

  describe('Strict validation mode', () => {
    it('should reject incomplete registrations when requireCompleteStrings is true', () => {
      // Create engine with strict validation
      const strictEngine = new PluginI18nEngine([englishLang, frenchLang], {
        validation: {
          requireCompleteStrings: true,
          allowPartialRegistration: false,
          fallbackLanguageId: 'en',
        },
      });

      const component: ComponentDefinition<ComponentAStrings> = {
        id: 'strict-component',
        name: 'Strict Component',
        stringKeys: Object.values(ComponentAStrings),
      };

      const incompleteRegistration: ComponentRegistration<
        ComponentAStrings,
        'en' | 'fr'
      > = {
        component,
        strings: {
          en: {
            [ComponentAStrings.Welcome]: 'Welcome',
            [ComponentAStrings.Goodbye]: 'Goodbye',
          },
          // Missing French
        },
      };

      expect(() => {
        strictEngine.registerComponent(incompleteRegistration);
      }).toThrow(RegistryError);
    });
  });

  describe('Instance Management and Cleanup', () => {
    beforeEach(() => {
      // Clean up instances before each test for proper isolation
      PluginI18nEngine.clearAllInstances();
    });

    afterEach(() => {
      // Clean up instances after each test for proper isolation
      PluginI18nEngine.clearAllInstances();
    });

    describe('Instance creation and retrieval', () => {
      it('should create and retrieve default instance', () => {
        const engine1 = new PluginI18nEngine([englishLang]);
        const engine2 = PluginI18nEngine.getInstance();

        expect(engine2).toBe(engine1);
      });

      it('should create and retrieve named instances', () => {
        const adminEngine = PluginI18nEngine.createInstance('admin', [
          englishLang,
        ]);
        const userEngine = PluginI18nEngine.createInstance('user', [
          englishLang,
          frenchLang,
        ]);

        expect(PluginI18nEngine.getInstance('admin')).toBe(adminEngine);
        expect(PluginI18nEngine.getInstance('user')).toBe(userEngine);
        expect(adminEngine).not.toBe(userEngine);
      });

      it('should check if instance exists', () => {
        expect(PluginI18nEngine.hasInstance()).toBe(false);
        expect(PluginI18nEngine.hasInstance('custom')).toBe(false);

        new PluginI18nEngine([englishLang]);
        expect(PluginI18nEngine.hasInstance()).toBe(true);
        expect(PluginI18nEngine.hasInstance('custom')).toBe(false);

        PluginI18nEngine.createInstance('custom', [englishLang]);
        expect(PluginI18nEngine.hasInstance('custom')).toBe(true);
      });

      it('should throw error for non-existent instance', () => {
        expect(() => {
          PluginI18nEngine.getInstance('nonexistent');
        }).toThrow("I18n instance with key 'nonexistent' not found");
      });
    });

    describe('Instance cleanup methods', () => {
      beforeEach(() => {
        // Set up some test instances and components
        const engine1 = new PluginI18nEngine([englishLang, frenchLang]);
        const engine2 = PluginI18nEngine.createInstance('test', [englishLang]);

        // Register some components
        const component: ComponentDefinition<ComponentAStrings> = {
          id: 'test-component',
          name: 'Test Component',
          stringKeys: Object.values(ComponentAStrings),
        };

        const registration: ComponentRegistration<
          ComponentAStrings,
          'en' | 'fr'
        > = {
          component,
          strings: {
            en: {
              [ComponentAStrings.Welcome]: 'Welcome',
              [ComponentAStrings.Goodbye]: 'Goodbye',
            },
            fr: {
              [ComponentAStrings.Welcome]: 'Bienvenue',
              [ComponentAStrings.Goodbye]: 'Au revoir',
            },
          },
        };

        engine1.registerComponent(registration);
        engine2.registerComponent(registration);
      });

      it('should clear all instances', () => {
        expect(PluginI18nEngine.hasInstance()).toBe(true);
        expect(PluginI18nEngine.hasInstance('test')).toBe(true);

        PluginI18nEngine.clearAllInstances();

        expect(PluginI18nEngine.hasInstance()).toBe(false);
        expect(PluginI18nEngine.hasInstance('test')).toBe(false);

        // Should throw when trying to get non-existent instances
        expect(() => PluginI18nEngine.getInstance()).toThrow();
        expect(() => PluginI18nEngine.getInstance('test')).toThrow();
      });

      it('should remove specific instance', () => {
        expect(PluginI18nEngine.hasInstance()).toBe(true);
        expect(PluginI18nEngine.hasInstance('test')).toBe(true);

        const removed = PluginI18nEngine.removeInstance('test');
        expect(removed).toBe(true);

        expect(PluginI18nEngine.hasInstance()).toBe(true);
        expect(PluginI18nEngine.hasInstance('test')).toBe(false);

        // Should be able to remove default instance too
        const removedDefault = PluginI18nEngine.removeInstance();
        expect(removedDefault).toBe(true);
        expect(PluginI18nEngine.hasInstance()).toBe(false);
      });

      it('should return false when removing non-existent instance', () => {
        const removed = PluginI18nEngine.removeInstance('nonexistent');
        expect(removed).toBe(false);
      });

      it('should reset all instances and clear component registrations', () => {
        // Verify instances and components exist
        const engine1 = PluginI18nEngine.getInstance();
        const engine2 = PluginI18nEngine.getInstance('test');

        expect(engine1.hasComponent('test-component')).toBe(true);
        expect(engine2.hasComponent('test-component')).toBe(true);

        // Reset all
        PluginI18nEngine.resetAll();

        // Instances should be cleared
        expect(PluginI18nEngine.hasInstance()).toBe(false);
        expect(PluginI18nEngine.hasInstance('test')).toBe(false);

        // Should throw when trying to get instances
        expect(() => PluginI18nEngine.getInstance()).toThrow();
        expect(() => PluginI18nEngine.getInstance('test')).toThrow();
      });

      it('should handle resetAll when no instances exist', () => {
        PluginI18nEngine.clearAllInstances();

        // Should not throw
        expect(() => {
          PluginI18nEngine.resetAll();
        }).not.toThrow();
      });
    });

    describe('Component cleanup integration', () => {
      it('should clear component registrations when clearing instances', () => {
        const engine = new PluginI18nEngine([englishLang]);

        const component: ComponentDefinition<ComponentAStrings> = {
          id: 'cleanup-test',
          name: 'Cleanup Test',
          stringKeys: Object.values(ComponentAStrings),
        };

        const registration: ComponentRegistration<ComponentAStrings, 'en'> = {
          component,
          strings: {
            en: {
              [ComponentAStrings.Welcome]: 'Welcome',
              [ComponentAStrings.Goodbye]: 'Goodbye',
            },
          },
        };

        engine.registerComponent(registration);
        expect(engine.hasComponent('cleanup-test')).toBe(true);

        // Clear instances should allow new engines to start fresh
        PluginI18nEngine.clearAllInstances();

        const newEngine = new PluginI18nEngine([englishLang]);
        expect(newEngine.hasComponent('cleanup-test')).toBe(false);
      });
    });
  });
});
