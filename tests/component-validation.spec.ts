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
});
