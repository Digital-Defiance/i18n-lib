import {
  ComponentDefinition,
  ComponentRegistration,
  PluginI18nEngine,
  LanguageDefinition,
} from '../src';
import { CurrencyCode } from '../src/utils/currency';
import { Timezone } from '../src/utils/timezone';

describe('Context Variables in Templates', () => {
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

  let engine: PluginI18nEngine<'en' | 'fr'>;

  beforeEach(() => {
    PluginI18nEngine.resetAll();
    engine = new PluginI18nEngine([englishLang, frenchLang]);
  });

  afterEach(() => {
    PluginI18nEngine.resetAll();
  });

  describe('timezone context variables', () => {
    it('should inject timezone into template variables', () => {
      const component: ComponentDefinition<'message'> = {
        id: 'test',
        name: 'Test',
        stringKeys: ['message'],
      };

      const registration: ComponentRegistration<'message', 'en' | 'fr'> = {
        component,
        strings: {
          en: { message: 'Current timezone: {timezone}' },
          fr: { message: 'Fuseau horaire actuel: {timezone}' },
        },
      };

      engine.registerComponent(registration);

      // Default timezone should be UTC
      const result = engine.t('{{test.message}}');
      expect(result).toBe('Current timezone: UTC');
    });

    it('should respect user timezone in user context', () => {
      engine.updateContext({
        timezone: new Timezone('America/New_York'),
      });

      const component: ComponentDefinition<'message'> = {
        id: 'test',
        name: 'Test',
        stringKeys: ['message'],
      };

      const registration: ComponentRegistration<'message', 'en' | 'fr'> = {
        component,
        strings: {
          en: { message: 'Your timezone: {timezone}' },
          fr: { message: 'Votre fuseau horaire: {timezone}' },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}');
      expect(result).toBe('Your timezone: America/New_York');
    });

    it('should respect admin timezone in admin context', () => {
      engine.updateContext({
        timezone: new Timezone('America/New_York'),
        adminTimezone: new Timezone('Europe/London'),
        currentContext: 'admin',
      });

      const component: ComponentDefinition<'message'> = {
        id: 'test',
        name: 'Test',
        stringKeys: ['message'],
      };

      const registration: ComponentRegistration<'message', 'en' | 'fr'> = {
        component,
        strings: {
          en: { message: 'Admin timezone: {timezone}' },
          fr: { message: 'Fuseau horaire admin: {timezone}' },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}');
      expect(result).toBe('Admin timezone: Europe/London');
    });

    it('should provide both userTimezone and adminTimezone variables', () => {
      engine.updateContext({
        timezone: new Timezone('America/Los_Angeles'),
        adminTimezone: new Timezone('UTC'),
      });

      const component: ComponentDefinition<'message'> = {
        id: 'test',
        name: 'Test',
        stringKeys: ['message'],
      };

      const registration: ComponentRegistration<'message', 'en' | 'fr'> = {
        component,
        strings: {
          en: { message: 'User: {userTimezone}, Admin: {adminTimezone}' },
          fr: { message: 'Utilisateur: {userTimezone}, Admin: {adminTimezone}' },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}');
      expect(result).toBe('User: America/Los_Angeles, Admin: UTC');
    });
  });

  describe('currency code context variables', () => {
    it('should inject currencyCode into template variables', () => {
      const component: ComponentDefinition<'message'> = {
        id: 'test',
        name: 'Test',
        stringKeys: ['message'],
      };

      const registration: ComponentRegistration<'message', 'en' | 'fr'> = {
        component,
        strings: {
          en: { message: 'Currency: {currencyCode}' },
          fr: { message: 'Devise: {currencyCode}' },
        },
      };

      engine.registerComponent(registration);

      // Default currency should be USD
      const result = engine.t('{{test.message}}');
      expect(result).toBe('Currency: USD');
    });

    it('should update currencyCode when context changes', () => {
      engine.updateContext({
        currencyCode: new CurrencyCode('EUR'),
      });

      const component: ComponentDefinition<'message'> = {
        id: 'test',
        name: 'Test',
        stringKeys: ['message'],
      };

      const registration: ComponentRegistration<'message', 'en' | 'fr'> = {
        component,
        strings: {
          en: { message: 'Price in {currencyCode}' },
          fr: { message: 'Prix en {currencyCode}' },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}');
      expect(result).toBe('Price in EUR');
    });

    it('should work with multiple currency codes', () => {
      const component: ComponentDefinition<'message'> = {
        id: 'test',
        name: 'Test',
        stringKeys: ['message'],
      };

      const registration: ComponentRegistration<'message', 'en' | 'fr'> = {
        component,
        strings: {
          en: { message: 'Currencies: {currencyCode}' },
          fr: { message: 'Devises: {currencyCode}' },
        },
      };

      engine.registerComponent(registration);

      // Test USD
      let result = engine.t('{{test.message}}');
      expect(result).toBe('Currencies: USD');

      // Change to GBP
      engine.updateContext({ currencyCode: new CurrencyCode('GBP') });
      result = engine.t('{{test.message}}');
      expect(result).toBe('Currencies: GBP');

      // Change to JPY
      engine.updateContext({ currencyCode: new CurrencyCode('JPY') });
      result = engine.t('{{test.message}}');
      expect(result).toBe('Currencies: JPY');
    });
  });

  describe('language context variables', () => {
    it('should inject language into template variables', () => {
      const component: ComponentDefinition<'message'> = {
        id: 'test',
        name: 'Test',
        stringKeys: ['message'],
      };

      const registration: ComponentRegistration<'message', 'en' | 'fr'> = {
        component,
        strings: {
          en: { message: 'Current language: {language}' },
          fr: { message: 'Langue actuelle: {language}' },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}');
      expect(result).toBe('Current language: en');
    });

    it('should respect user language in user context', () => {
      engine.updateContext({ language: 'fr' });

      const component: ComponentDefinition<'message'> = {
        id: 'test',
        name: 'Test',
        stringKeys: ['message'],
      };

      const registration: ComponentRegistration<'message', 'en' | 'fr'> = {
        component,
        strings: {
          en: { message: 'Language: {language}' },
          fr: { message: 'Langue: {language}' },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}');
      expect(result).toBe('Langue: fr');
    });

    it('should respect admin language in admin context', () => {
      engine.updateContext({
        language: 'fr',
        adminLanguage: 'en',
        currentContext: 'admin',
      });

      const component: ComponentDefinition<'message'> = {
        id: 'test',
        name: 'Test',
        stringKeys: ['message'],
      };

      const registration: ComponentRegistration<'message', 'en' | 'fr'> = {
        component,
        strings: {
          en: { message: 'Admin language: {language}' },
          fr: { message: 'Langue admin: {language}' },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}');
      expect(result).toBe('Admin language: en');
    });

    it('should provide both userLanguage and adminLanguage variables', () => {
      engine.updateContext({
        language: 'fr',
        adminLanguage: 'en',
      });

      const component: ComponentDefinition<'message'> = {
        id: 'test',
        name: 'Test',
        stringKeys: ['message'],
      };

      const registration: ComponentRegistration<'message', 'en' | 'fr'> = {
        component,
        strings: {
          en: { message: 'User: {userLanguage}, Admin: {adminLanguage}' },
          fr: { message: 'Utilisateur: {userLanguage}, Admin: {adminLanguage}' },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}');
      expect(result).toBe('Utilisateur: fr, Admin: en');
    });
  });

  describe('combined context variables', () => {
    it('should inject all context variables together', () => {
      engine.updateContext({
        language: 'en',
        currencyCode: new CurrencyCode('EUR'),
        timezone: new Timezone('Europe/Paris'),
      });

      const component: ComponentDefinition<'message'> = {
        id: 'test',
        name: 'Test',
        stringKeys: ['message'],
      };

      const registration: ComponentRegistration<'message', 'en' | 'fr'> = {
        component,
        strings: {
          en: {
            message:
              'Language: {language}, Currency: {currencyCode}, Timezone: {timezone}',
          },
          fr: {
            message:
              'Langue: {language}, Devise: {currencyCode}, Fuseau: {timezone}',
          },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}');
      expect(result).toBe('Language: en, Currency: EUR, Timezone: Europe/Paris');
    });

    it('should allow user variables to override context variables', () => {
      engine.updateContext({
        currencyCode: new CurrencyCode('USD'),
      });

      const component: ComponentDefinition<'message'> = {
        id: 'test',
        name: 'Test',
        stringKeys: ['message'],
      };

      const registration: ComponentRegistration<'message', 'en' | 'fr'> = {
        component,
        strings: {
          en: { message: 'Currency: {currencyCode}' },
          fr: { message: 'Devise: {currencyCode}' },
        },
      };

      engine.registerComponent(registration);

      // User-provided variable should override context
      const result = engine.t('{{test.message}}', 'en', { currencyCode: 'GBP' });
      expect(result).toBe('Currency: GBP');
    });

    it('should work with complex templates mixing context and user variables', () => {
      engine.updateContext({
        language: 'en',
        currencyCode: new CurrencyCode('USD'),
        timezone: new Timezone('America/New_York'),
      });

      const component: ComponentDefinition<'message'> = {
        id: 'test',
        name: 'Test',
        stringKeys: ['message'],
      };

      const registration: ComponentRegistration<'message', 'en' | 'fr'> = {
        component,
        strings: {
          en: {
            message:
              'Hello {name}! Language: {language}, Currency: {currencyCode}, Timezone: {timezone}, Amount: {amount}',
          },
          fr: {
            message:
              'Bonjour {name}! Langue: {language}, Devise: {currencyCode}, Fuseau: {timezone}, Montant: {amount}',
          },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}', 'en', {
        name: 'Alice',
        amount: '100',
      });
      expect(result).toBe(
        'Hello Alice! Language: en, Currency: USD, Timezone: America/New_York, Amount: 100',
      );
    });
  });

  describe('CurrencyCode and Timezone validation', () => {
    it('should validate currency codes', () => {
      expect(() => new CurrencyCode('USD')).not.toThrow();
      expect(() => new CurrencyCode('EUR')).not.toThrow();
      expect(() => new CurrencyCode('GBP')).not.toThrow();
      expect(() => new CurrencyCode('INVALID')).toThrow();
    });

    it('should validate timezones', () => {
      expect(() => new Timezone('UTC')).not.toThrow();
      expect(() => new Timezone('America/New_York')).not.toThrow();
      expect(() => new Timezone('Europe/London')).not.toThrow();
      expect(() => new Timezone('Invalid/Timezone')).toThrow();
    });

    it('should get currency code value', () => {
      const currency = new CurrencyCode('EUR');
      expect(currency.value).toBe('EUR');
    });

    it('should get timezone value', () => {
      const tz = new Timezone('America/Los_Angeles');
      expect(tz.value).toBe('America/Los_Angeles');
    });

    it('should update context with validated currency and timezone', () => {
      const currency = new CurrencyCode('CAD');
      const timezone = new Timezone('America/Toronto');

      engine.updateContext({
        currencyCode: currency,
        timezone: timezone,
      });

      const context = engine.getContext();
      expect(context.currencyCode.value).toBe('CAD');
      expect(context.timezone.value).toBe('America/Toronto');
    });
  });
});
