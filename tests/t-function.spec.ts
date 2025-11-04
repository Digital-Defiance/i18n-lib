/**
 * Comprehensive tests for the t() function
 * Tests all special parsing and resolution capabilities
 */

import { I18nEngine } from '../src/core/i18n-engine';
import { I18nBuilder } from '../src/builders/i18n-builder';

describe('t() Function - Comprehensive Tests', () => {
  let engine: I18nEngine;

  beforeEach(() => {
    I18nEngine.resetAll();
    engine = I18nBuilder.create()
      .withLanguages([
        { id: 'en-US', name: 'English (US)', code: 'en-US', isDefault: true },
        { id: 'fr', name: 'French', code: 'fr' },
      ])
      .build();
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  describe('Basic Component.Key Pattern', () => {
    beforeEach(() => {
      engine.register({
        id: 'app',
        strings: {
          'en-US': {
            welcome: 'Welcome!',
            greeting: 'Hello, {name}!',
            farewell: 'Goodbye, {name}!',
          },
          fr: {
            welcome: 'Bienvenue!',
            greeting: 'Bonjour, {name}!',
            farewell: 'Au revoir, {name}!',
          },
        },
      });
    });

    it('should resolve {{component.key}} pattern', () => {
      expect(engine.t('{{app.welcome}}')).toBe('Welcome!');
    });

    it('should resolve multiple {{component.key}} patterns', () => {
      expect(engine.t('{{app.welcome}} {{app.welcome}}')).toBe('Welcome! Welcome!');
    });

    it('should resolve {{component.key}} with variables', () => {
      expect(engine.t('{{app.greeting}}', { name: 'John' })).toBe('Hello, John!');
    });

    it('should resolve mixed text and {{component.key}}', () => {
      expect(engine.t('Start: {{app.welcome}} End')).toBe('Start: Welcome! End');
    });

    it('should resolve {{component.key}} in different language', () => {
      expect(engine.t('{{app.welcome}}', {}, 'fr')).toBe('Bienvenue!');
    });

    it('should handle missing component gracefully', () => {
      expect(engine.t('{{missing.key}}')).toBe('[missing.key]');
    });

    it('should handle missing key gracefully', () => {
      expect(engine.t('{{app.missing}}')).toBe('[app.missing]');
    });
  });

  describe('Alias Resolution', () => {
    beforeEach(() => {
      engine.register({
        id: 'authentication',
        aliases: ['auth', 'AuthComponent', 'AuthModule'],
        strings: {
          'en-US': {
            login: 'Login',
            logout: 'Logout',
            loginSuccess: 'Login successful!',
          },
          fr: {
            login: 'Connexion',
            logout: 'Déconnexion',
            loginSuccess: 'Connexion réussie!',
          },
        },
      });
    });

    it('should resolve {{alias.key}} using first alias', () => {
      expect(engine.t('{{auth.login}}')).toBe('Login');
    });

    it('should resolve {{alias.key}} using second alias', () => {
      expect(engine.t('{{AuthComponent.logout}}')).toBe('Logout');
    });

    it('should resolve {{alias.key}} using third alias', () => {
      expect(engine.t('{{AuthModule.loginSuccess}}')).toBe('Login successful!');
    });

    it('should resolve {{componentId.key}} using actual component ID', () => {
      expect(engine.t('{{authentication.login}}')).toBe('Login');
    });

    it('should resolve multiple aliases in same template', () => {
      expect(engine.t('{{auth.login}} and {{AuthComponent.logout}}')).toBe('Login and Logout');
    });

    it('should resolve aliases in different languages', () => {
      expect(engine.t('{{auth.login}}', {}, 'fr')).toBe('Connexion');
    });
  });

  describe('Enum Name Resolution', () => {
    enum UserRole {
      Admin = 'admin',
      User = 'user',
      Guest = 'guest',
    }

    beforeEach(() => {
      engine.register({
        id: 'roles',
        aliases: ['UserRole'],
        strings: {
          'en-US': {
            admin: 'Administrator',
            user: 'Regular User',
            guest: 'Guest User',
          },
          fr: {
            admin: 'Administrateur',
            user: 'Utilisateur régulier',
            guest: 'Utilisateur invité',
          },
        },
      });
    });

    it('should resolve {{EnumName.enumValue}} pattern', () => {
      expect(engine.t('{{UserRole.admin}}')).toBe('Administrator');
    });

    it('should resolve enum values in different languages', () => {
      expect(engine.t('{{UserRole.admin}}', {}, 'fr')).toBe('Administrateur');
    });

    it('should resolve multiple enum values', () => {
      expect(engine.t('{{UserRole.admin}} and {{UserRole.user}}')).toBe(
        'Administrator and Regular User',
      );
    });
  });

  describe('Variable Substitution', () => {
    beforeEach(() => {
      engine.register({
        id: 'app',
        strings: {
          'en-US': {
            greeting: 'Hello, {name}!',
            multiVar: '{greeting}, {name}! You have {count} messages.',
          },
          fr: {
            greeting: 'Bonjour, {name}!',
            multiVar: '{greeting}, {name}! Vous avez {count} messages.',
          },
        },
      });
    });

    it('should substitute single variable', () => {
      expect(engine.t('{name}', { name: 'John' })).toBe('John');
    });

    it('should substitute multiple variables', () => {
      expect(engine.t('{greeting} {name}!', { greeting: 'Hello', name: 'John' })).toBe(
        'Hello John!',
      );
    });

    it('should substitute variables in {{component.key}} strings', () => {
      expect(engine.t('{{app.greeting}}', { name: 'Alice' })).toBe('Hello, Alice!');
    });

    it('should handle missing variables gracefully', () => {
      expect(engine.t('{missing}')).toBe('{missing}');
    });

    it('should substitute numeric variables', () => {
      expect(engine.t('Count: {count}', { count: 42 })).toBe('Count: 42');
    });
  });

  describe('Template Strings with Variables', () => {
    beforeEach(() => {
      engine.register({
        id: 'errors',
        strings: {
          'en-US': {
            missingKeyTemplate: "Missing key '{key}' in component '{component}'",
            userNotFoundTemplate: "User '{username}' not found in system",
            validationErrorTemplate: "Field '{field}' failed validation: {reason}",
          },
          fr: {
            missingKeyTemplate: "Clé '{key}' manquante dans le composant '{component}'",
            userNotFoundTemplate: "Utilisateur '{username}' introuvable dans le système",
            validationErrorTemplate: "Le champ '{field}' a échoué la validation: {reason}",
          },
        },
      });
    });

    it('should resolve template strings with variables', () => {
      expect(
        engine.t('{{errors.missingKeyTemplate}}', { key: 'login', component: 'auth' }),
      ).toBe("Missing key 'login' in component 'auth'");
    });

    it('should resolve template strings in different languages', () => {
      expect(
        engine.t('{{errors.userNotFoundTemplate}}', { username: 'john' }, 'fr'),
      ).toBe("Utilisateur 'john' introuvable dans le système");
    });

    it('should handle multiple template variables', () => {
      expect(
        engine.t('{{errors.validationErrorTemplate}}', {
          field: 'email',
          reason: 'invalid format',
        }),
      ).toBe("Field 'email' failed validation: invalid format");
    });
  });

  describe('Complex Mixed Patterns', () => {
    beforeEach(() => {
      engine.register({
        id: 'app',
        strings: {
          'en-US': {
            welcome: 'Welcome',
            user: 'User',
          },
          fr: {
            welcome: 'Bienvenue',
            user: 'Utilisateur',
          },
        },
      });

      engine.register({
        id: 'auth',
        aliases: ['AuthModule'],
        strings: {
          'en-US': {
            status: 'Status',
          },
          fr: {
            status: 'Statut',
          },
        },
      });
    });

    it('should handle multiple components in one template', () => {
      expect(engine.t('{{app.welcome}} - {{auth.status}}')).toBe('Welcome - Status');
    });

    it('should handle components, aliases, and variables', () => {
      expect(engine.t('{{app.welcome}}, {name}! {{AuthModule.status}}: {status}', {
        name: 'John',
        status: 'Active',
      })).toBe('Welcome, John! Status: Active');
    });

    it('should handle nested patterns', () => {
      expect(engine.t('{{app.user}}: {username} ({{auth.status}}: {status})', {
        username: 'john',
        status: 'active',
      })).toBe('User: john (Status: active)');
    });

    it('should handle complex patterns in different languages', () => {
      expect(engine.t('{{app.welcome}}, {name}!', { name: 'Jean' }, 'fr')).toBe(
        'Bienvenue, Jean!',
      );
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': {
            simple: 'Simple',
            withBraces: 'Text with {braces}',
            withDoubleBraces: 'Text with {{nested}}',
          },
        },
      });
    });

    it('should handle plain text without patterns', () => {
      expect(engine.t('Plain text')).toBe('Plain text');
    });

    it('should handle empty string', () => {
      expect(engine.t('')).toBe('');
    });

    it('should handle malformed patterns', () => {
      expect(engine.t('{{incomplete')).toBe('{{incomplete');
    });

    it('should handle patterns with spaces', () => {
      expect(engine.t('{{ test.simple }}')).toBe('Simple');
    });

    it('should handle single braces', () => {
      expect(engine.t('{single}')).toBe('{single}');
    });

    it('should handle double braces without dot', () => {
      expect(engine.t('{{nodot}}')).toBe('{{nodot}}');
    });

    it('should preserve unmatched patterns', () => {
      expect(engine.t('{{missing.key}} and {missing}')).toBe('[missing.key] and {missing}');
    });
  });

  describe('Constants Injection', () => {
    beforeEach(() => {
      I18nEngine.resetAll();
      engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withConstants({
          AppName: 'MyApp',
          Version: '1.0.0',
          SupportEmail: 'support@example.com',
        })
        .build();

      engine.register({
        id: 'app',
        strings: {
          'en-US': {
            welcome: 'Welcome to {AppName}!',
            version: 'Version: {Version}',
            contact: 'Contact us at {SupportEmail}',
          },
        },
      });
    });

    it('should inject constants into translations', () => {
      expect(engine.t('{{app.welcome}}')).toBe('Welcome to MyApp!');
    });

    it('should inject multiple constants', () => {
      expect(engine.t('{{app.version}} - {{app.contact}}')).toBe(
        'Version: 1.0.0 - Contact us at support@example.com',
      );
    });

    it('should inject constants in direct templates', () => {
      expect(engine.t('App: {AppName}, Version: {Version}', {})).toBe('App: MyApp, Version: 1.0.0');
    });

    it('should allow variables to override constants', () => {
      expect(engine.t('{AppName}', { AppName: 'CustomApp' })).toBe('CustomApp');
    });
  });

  describe('Performance and Stress Tests', () => {
    beforeEach(() => {
      engine.register({
        id: 'perf',
        strings: {
          'en-US': {
            msg1: 'Message 1',
            msg2: 'Message 2',
            msg3: 'Message 3',
            msg4: 'Message 4',
            msg5: 'Message 5',
          },
        },
      });
    });

    it('should handle many patterns in one template', () => {
      const template = '{{perf.msg1}} {{perf.msg2}} {{perf.msg3}} {{perf.msg4}} {{perf.msg5}}';
      expect(engine.t(template)).toBe('Message 1 Message 2 Message 3 Message 4 Message 5');
    });

    it('should handle many variables', () => {
      const vars = {
        v1: 'a', v2: 'b', v3: 'c', v4: 'd', v5: 'e',
        v6: 'f', v7: 'g', v8: 'h', v9: 'i', v10: 'j',
      };
      const template = '{v1}{v2}{v3}{v4}{v5}{v6}{v7}{v8}{v9}{v10}';
      expect(engine.t(template, vars)).toBe('abcdefghij');
    });

    it('should handle long strings efficiently', () => {
      const longText = 'a'.repeat(1000);
      expect(engine.t(longText)).toBe(longText);
    });
  });

  describe('Context Variables Integration', () => {
    let GlobalActiveContext: any;
    let CurrencyCode: any;
    let Timezone: any;

    beforeEach(() => {
      // Import context classes
      GlobalActiveContext = require('../src/global-active-context').GlobalActiveContext;
      CurrencyCode = require('../src/utils/currency').CurrencyCode;
      Timezone = require('../src/utils/timezone').Timezone;

      // Clear and recreate context
      GlobalActiveContext.clearAll();
      const globalContext = GlobalActiveContext.getInstance();
      globalContext.createContext('en-US');

      engine.register({
        id: 'context-test',
        strings: {
          'en-US': {
            withCurrency: 'Price in {currencyCode}',
            withTimezone: 'Time in {timezone}',
            withLanguage: 'Current language: {language}',
            withMultiple: 'Language: {language}, Currency: {currency}, Timezone: {userTimezone}',
          },
        },
      });
    });

    afterEach(() => {
      GlobalActiveContext.clearAll();
    });

    it('should inject currency code from context', () => {
      const globalContext = GlobalActiveContext.getInstance();
      globalContext.setCurrencyCode(new CurrencyCode('EUR'));

      expect(engine.t('{{context-test.withCurrency}}')).toBe('Price in EUR');
    });

    it('should inject timezone from context', () => {
      const globalContext = GlobalActiveContext.getInstance();
      globalContext.setUserTimezone(new Timezone('America/New_York'));

      expect(engine.t('{{context-test.withTimezone}}')).toBe('Time in America/New_York');
    });

    it('should inject language from context', () => {
      const globalContext = GlobalActiveContext.getInstance();
      globalContext.setUserLanguage('fr');

      expect(engine.t('{{context-test.withLanguage}}')).toBe('Current language: fr');
    });

    it('should inject multiple context variables', () => {
      const globalContext = GlobalActiveContext.getInstance();
      globalContext.setUserLanguage('es');
      globalContext.setCurrencyCode(new CurrencyCode('GBP'));
      globalContext.setUserTimezone(new Timezone('Europe/London'));

      expect(engine.t('{{context-test.withMultiple}}')).toBe(
        'Language: es, Currency: GBP, Timezone: Europe/London',
      );
    });

    it('should allow provided variables to override context variables', () => {
      const globalContext = GlobalActiveContext.getInstance();
      globalContext.setCurrencyCode(new CurrencyCode('USD'));

      expect(engine.t('{{context-test.withCurrency}}', { currencyCode: 'JPY' })).toBe(
        'Price in JPY',
      );
    });

    it('should inject context variables in direct templates', () => {
      const globalContext = GlobalActiveContext.getInstance();
      globalContext.setCurrencyCode(new CurrencyCode('CAD'));
      globalContext.setUserTimezone(new Timezone('America/Toronto'));

      expect(engine.t('Currency: {currency}, Timezone: {timezone}')).toBe(
        'Currency: CAD, Timezone: America/Toronto',
      );
    });

    it('should work when context is not initialized', () => {
      GlobalActiveContext.clearAll();

      // Should not throw, just skip context variables
      expect(engine.t('{{context-test.withCurrency}}', { currencyCode: 'USD' })).toBe(
        'Price in USD',
      );
    });
  });

  describe('Constants and Variables Priority', () => {
    beforeEach(() => {
      I18nEngine.resetAll();
      engine = I18nBuilder.create()
        .withLanguages([{ id: 'en-US', name: 'English', code: 'en-US', isDefault: true }])
        .withConstants({
          AppName: 'MyApp',
          Version: '1.0.0',
          DefaultCurrency: 'USD',
        })
        .build();

      engine.register({
        id: 'priority-test',
        strings: {
          'en-US': {
            message: 'App: {AppName}, Version: {Version}, Currency: {DefaultCurrency}',
          },
        },
      });
    });

    it('should use constants when no variables provided', () => {
      expect(engine.t('{{priority-test.message}}')).toBe(
        'App: MyApp, Version: 1.0.0, Currency: USD',
      );
    });

    it('should allow variables to override constants', () => {
      expect(engine.t('{{priority-test.message}}', { AppName: 'CustomApp' })).toBe(
        'App: CustomApp, Version: 1.0.0, Currency: USD',
      );
    });

    it('should allow variables to override multiple constants', () => {
      expect(
        engine.t('{{priority-test.message}}', {
          AppName: 'TestApp',
          Version: '2.0.0',
          DefaultCurrency: 'EUR',
        }),
      ).toBe('App: TestApp, Version: 2.0.0, Currency: EUR');
    });

    it('should use constants in direct templates', () => {
      expect(engine.t('{AppName} v{Version}')).toBe('MyApp v1.0.0');
    });

    it('should allow variables to override constants in direct templates', () => {
      expect(engine.t('{AppName} v{Version}', { Version: '3.0.0' })).toBe('MyApp v3.0.0');
    });
  });

  describe('Context + Constants + Variables Priority', () => {
    let GlobalActiveContext: any;
    let CurrencyCode: any;

    beforeEach(() => {
      GlobalActiveContext = require('../src/global-active-context').GlobalActiveContext;
      CurrencyCode = require('../src/utils/currency').CurrencyCode;

      GlobalActiveContext.clearAll();
      const globalContext = GlobalActiveContext.getInstance();
      globalContext.createContext('en-US');
      globalContext.setCurrencyCode(new CurrencyCode('EUR'));

      I18nEngine.resetAll();
      engine = I18nBuilder.create()
        .withLanguages([{ id: 'en-US', name: 'English', code: 'en-US', isDefault: true }])
        .withConstants({
          AppName: 'MyApp',
          currency: 'USD', // Note: lowercase to test override
        })
        .build();

      engine.register({
        id: 'combined-test',
        strings: {
          'en-US': {
            message: 'App: {AppName}, Currency: {currency}',
          },
        },
      });
    });

    afterEach(() => {
      GlobalActiveContext.clearAll();
    });

    it('should use context over constants', () => {
      // Context has EUR, constant has USD
      // Context should win
      expect(engine.t('{{combined-test.message}}')).toBe('App: MyApp, Currency: EUR');
    });

    it('should use provided variables over context and constants', () => {
      // Provided variable should override both context and constant
      expect(engine.t('{{combined-test.message}}', { currency: 'GBP' })).toBe(
        'App: MyApp, Currency: GBP',
      );
    });

    it('should use provided variables over context and constants for all vars', () => {
      expect(
        engine.t('{{combined-test.message}}', { AppName: 'CustomApp', currency: 'JPY' }),
      ).toBe('App: CustomApp, Currency: JPY');
    });
  });

  describe('Key Normalization', () => {
    beforeEach(() => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': {
            'simple_key': 'Simple Key',
            'camelCaseKey': 'Camel Case Key',
            'kebab-case-key': 'Kebab Case Key',
            'PascalCaseKey': 'Pascal Case Key',
          },
        },
      });
    });

    it('should resolve snake_case keys', () => {
      expect(engine.t('{{test.simple_key}}')).toBe('Simple Key');
    });

    it('should resolve camelCase keys', () => {
      expect(engine.t('{{test.camelCaseKey}}')).toBe('Camel Case Key');
    });

    it('should resolve kebab-case keys', () => {
      expect(engine.t('{{test.kebab-case-key}}')).toBe('Kebab Case Key');
    });

    it('should resolve PascalCase keys', () => {
      expect(engine.t('{{test.PascalCaseKey}}')).toBe('Pascal Case Key');
    });
  });

  describe('Admin Context Variables', () => {
    let GlobalActiveContext: any;
    let Timezone: any;

    beforeEach(() => {
      GlobalActiveContext = require('../src/global-active-context').GlobalActiveContext;
      Timezone = require('../src/utils/timezone').Timezone;

      GlobalActiveContext.clearAll();
      const globalContext = GlobalActiveContext.getInstance();
      globalContext.createContext('en-US');
      globalContext.setAdminLanguage('fr');
      globalContext.setUserTimezone(new Timezone('America/New_York'));
      globalContext.setAdminTimezone(new Timezone('UTC'));

      engine.register({
        id: 'admin-test',
        strings: {
          'en-US': {
            adminInfo: 'Admin Language: {adminLanguage}, Admin Timezone: {adminTimezone}',
            userInfo: 'User Timezone: {userTimezone}',
          },
        },
      });
    });

    afterEach(() => {
      GlobalActiveContext.clearAll();
    });

    it('should inject admin language from context', () => {
      expect(engine.t('{{admin-test.adminInfo}}')).toContain('Admin Language: fr');
    });

    it('should inject admin timezone from context', () => {
      expect(engine.t('{{admin-test.adminInfo}}')).toContain('Admin Timezone: UTC');
    });

    it('should inject user timezone from context', () => {
      expect(engine.t('{{admin-test.userInfo}}')).toBe('User Timezone: America/New_York');
    });
  });
});

