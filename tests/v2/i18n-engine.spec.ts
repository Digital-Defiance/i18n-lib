/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

/**
 * I18n Engine v2 tests
 */

import { I18nBuilder, I18nEngine, I18nError, I18nErrorCode } from '../../src';

describe('I18nEngine v2', () => {
  beforeEach(() => {
    I18nEngine.resetAll();
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  describe('Builder Pattern', () => {
    it('should create engine with builder', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
          { id: 'fr', name: 'French', code: 'fr' },
        ])
        .withDefaultLanguage('en-US')
        .build();

      expect(engine).toBeInstanceOf(I18nEngine);
    });

    it('should throw if no languages provided', () => {
      expect(() => {
        I18nBuilder.create().build();
      }).toThrow('At least one language must be provided');
    });

    it('should support constants', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withConstants({ Site: 'TestSite' })
        .build();

      engine.register({
        id: 'test',
        strings: {
          'en-US': { welcome: 'Welcome to {Site}' },
        },
      });

      expect(engine.translate('test', 'welcome')).toBe('Welcome to TestSite');
    });
  });

  describe('Component Registration', () => {
    let engine: I18nEngine;

    beforeEach(() => {
      engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
          { id: 'fr', name: 'French', code: 'fr' },
        ])
        .build();
    });

    it('should register component', () => {
      const result = engine.register({
        id: 'auth',
        strings: {
          'en-US': { login: 'Login', logout: 'Logout' },
          fr: { login: 'Connexion', logout: 'Déconnexion' },
        },
      });

      expect(result.isValid).toBe(true);
      expect(engine.hasComponent('auth')).toBe(true);
    });

    it('should throw on duplicate component', () => {
      engine.register({
        id: 'auth',
        strings: { 'en-US': { login: 'Login' } },
      });

      expect(() => {
        engine.register({
          id: 'auth',
          strings: { 'en-US': { login: 'Login' } },
        });
      }).toThrow(I18nError);
    });

    it('should not throw when using registerIfNotExists on duplicate', () => {
      engine.register({
        id: 'auth',
        strings: { 'en-US': { login: 'Login' } },
      });

      const result = engine.registerIfNotExists({
        id: 'auth',
        strings: { 'en-US': { login: 'Login' } },
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should register component when using registerIfNotExists on new component', () => {
      const result = engine.registerIfNotExists({
        id: 'auth',
        strings: { 'en-US': { login: 'Login' } },
      });

      expect(result.isValid).toBe(true);
      expect(engine.hasComponent('auth')).toBe(true);
      expect(engine.translate('auth', 'login')).toBe('Login');
    });

    it('should support aliases', () => {
      engine.register({
        id: 'auth',
        strings: { 'en-US': { login: 'Login' } },
        aliases: ['authentication', 'AuthComponent'],
      });

      expect(engine.hasComponent('auth')).toBe(true);
      expect(engine.hasComponent('authentication')).toBe(true);
      expect(engine.hasComponent('AuthComponent')).toBe(true);
    });
  });

  describe('Translation', () => {
    let engine: I18nEngine;

    beforeEach(() => {
      engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
          { id: 'fr', name: 'French', code: 'fr' },
        ])
        .build();

      engine.register({
        id: 'app',
        strings: {
          'en-US': {
            welcome: 'Welcome!',
            greeting: 'Hello, {name}!',
          },
          fr: {
            welcome: 'Bienvenue!',
            greeting: 'Bonjour, {name}!',
          },
        },
      });
    });

    it('should translate simple string', () => {
      expect(engine.translate('app', 'welcome')).toBe('Welcome!');
    });

    it('should translate with variables', () => {
      expect(engine.translate('app', 'greeting', { name: 'John' })).toBe(
        'Hello, John!',
      );
    });

    it('should translate in different language', () => {
      expect(engine.translate('app', 'welcome', {}, 'fr')).toBe('Bienvenue!');
    });

    it('should use current language', () => {
      engine.setLanguage('fr');
      expect(engine.translate('app', 'welcome')).toBe('Bienvenue!');
    });

    it('should throw on missing component', () => {
      expect(() => {
        engine.translate('missing', 'key');
      }).toThrow(I18nError);
    });

    it('should throw on missing key', () => {
      expect(() => {
        engine.translate('app', 'missing');
      }).toThrow(I18nError);
    });
  });

  describe('Safe Translation', () => {
    let engine: I18nEngine;

    beforeEach(() => {
      engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .build();

      engine.register({
        id: 'app',
        strings: { 'en-US': { welcome: 'Welcome!' } },
      });
    });

    it('should return placeholder on missing component', () => {
      expect(engine.safeTranslate('missing', 'key')).toBe('[missing.key]');
    });

    it('should return placeholder on missing key', () => {
      expect(engine.safeTranslate('app', 'missing')).toBe('[app.missing]');
    });

    it('should return translation when valid', () => {
      expect(engine.safeTranslate('app', 'welcome')).toBe('Welcome!');
    });
  });

  describe('Template Processing', () => {
    let engine: I18nEngine;

    beforeEach(() => {
      engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .build();

      engine.register({
        id: 'app',
        strings: {
          'en-US': {
            welcome: 'Welcome!',
            greeting: 'Hello, {name}!',
          },
        },
      });
    });

    it('should process component patterns', () => {
      expect(engine.t('{{app.welcome}}')).toBe('Welcome!');
    });

    it('should process variable patterns', () => {
      expect(engine.t('User: {name}', { name: 'John' })).toBe('User: John');
    });

    it('should process mixed patterns', () => {
      expect(engine.t('{{app.welcome}} {name}!', { name: 'John' })).toBe(
        'Welcome! John!',
      );
    });

    it('should handle missing components gracefully', () => {
      expect(engine.t('{{missing.key}}')).toBe('[missing.key]');
    });
  });

  describe('Constants Management', () => {
    let engine: I18nEngine;

    beforeEach(() => {
      engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withConstants({ Site: 'OriginalSite', Version: '1.0' })
        .build();

      engine.register({
        id: 'app',
        strings: {
          'en-US': {
            info: 'Welcome to {Site} v{Version}',
            site: '{Site}',
          },
        },
      });
    });

    it('should use initial constants', () => {
      expect(engine.translate('app', 'info')).toBe(
        'Welcome to OriginalSite v1.0',
      );
    });

    it('should merge constants', () => {
      engine.mergeConstants({ Version: '2.0', Author: 'Test' });
      expect(engine.translate('app', 'info')).toBe(
        'Welcome to OriginalSite v2.0',
      );
    });

    it('should preserve existing constants when merging', () => {
      engine.mergeConstants({ Version: '2.0' });
      expect(engine.translate('app', 'site')).toBe('OriginalSite');
    });

    it('should update all constants', () => {
      engine.replaceConstants({ NewSite: 'UpdatedSite' });
      expect(engine.translate('app', 'site')).toBe('{Site}'); // Original constant gone
    });
  });

  describe('Language Management', () => {
    let engine: I18nEngine;

    beforeEach(() => {
      engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
          { id: 'fr', name: 'French', code: 'fr' },
        ])
        .build();
    });

    it('should set language', () => {
      engine.setLanguage('fr');
      expect(engine.getCurrentLanguage()).toBe('fr');
    });

    it('should throw on invalid language', () => {
      expect(() => {
        engine.setLanguage('invalid');
      }).toThrow(I18nError);
    });

    it('should register new language', () => {
      engine.registerLanguage({ id: 'es', name: 'Spanish', code: 'es' });
      expect(engine.hasLanguage('es')).toBe(true);
    });

    it('should get all languages', () => {
      const languages = engine.getLanguages();
      expect(languages).toHaveLength(2);
      expect(languages[0].id).toBe('en-US');
    });
  });

  describe('Context Management', () => {
    let engine: I18nEngine;

    beforeEach(() => {
      engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
          { id: 'fr', name: 'French', code: 'fr' },
        ])
        .build();
    });

    it('should switch to admin context', () => {
      engine.setLanguage('fr');
      engine.setAdminLanguage('en-US');
      engine.switchToAdmin();
      expect(engine.getCurrentLanguage()).toBe('en-US');
    });

    it('should switch to user context', () => {
      engine.setLanguage('fr');
      engine.setAdminLanguage('en-US');
      engine.switchToAdmin();
      engine.switchToUser();
      expect(engine.getCurrentLanguage()).toBe('fr');
    });
  });

  describe('Instance Management', () => {
    it('should create named instance', () => {
      const engine = I18nEngine.createInstance('app1', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);

      expect(I18nEngine.hasInstance('app1')).toBe(true);
      expect(I18nEngine.getInstance('app1')).toBe(engine);
    });

    it('should get default instance', () => {
      const engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .build();

      expect(I18nEngine.getInstance()).toBe(engine);
    });

    it('should remove instance', () => {
      I18nEngine.createInstance('app1', [
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ]);

      expect(I18nEngine.removeInstance('app1')).toBe(true);
      expect(I18nEngine.hasInstance('app1')).toBe(false);
    });

    it('should throw on missing instance', () => {
      expect(() => {
        I18nEngine.getInstance('missing');
      }).toThrow(I18nError);
    });
  });

  describe('Error Handling', () => {
    it('should throw I18nError with correct code', () => {
      try {
        throw I18nError.componentNotFound('test');
      } catch (error) {
        expect(error).toBeInstanceOf(I18nError);
        expect((error as I18nError).code).toBe(
          I18nErrorCode.COMPONENT_NOT_FOUND,
        );
        expect((error as I18nError).metadata).toEqual({ componentId: 'test' });
      }
    });
  });

  describe('Enum Translation', () => {
    enum Status {
      Active = 'active',
      Inactive = 'inactive',
    }

    let engine: I18nEngine;

    beforeEach(() => {
      engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
          { id: 'fr', name: 'French', code: 'fr' },
        ])
        .build();
    });

    it('should register and translate enums', () => {
      engine.registerEnum(
        Status,
        {
          'en-US': { [Status.Active]: 'Active', [Status.Inactive]: 'Inactive' },
          fr: { [Status.Active]: 'Actif', [Status.Inactive]: 'Inactif' },
        },
        'Status',
      );

      expect(engine.translateEnum(Status, Status.Active)).toBe('Active');
      expect(engine.translateEnum(Status, Status.Active, 'fr')).toBe('Actif');
    });

    it('should check if enum is registered', () => {
      engine.registerEnum(
        Status,
        {
          'en-US': { [Status.Active]: 'Active', [Status.Inactive]: 'Inactive' },
        },
        'Status',
      );

      expect(engine.hasEnum(Status)).toBe(true);
      expect(engine.hasEnum({})).toBe(false);
    });

    it('should throw on unregistered enum', () => {
      expect(() => {
        engine.translateEnum(Status, Status.Active);
      }).toThrow();
    });
  });
});
