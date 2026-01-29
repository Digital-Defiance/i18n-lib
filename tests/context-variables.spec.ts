/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import {
  ComponentDefinition,
  ComponentRegistration,
  LanguageDefinition,
  PluginI18nEngine,
} from '../src';
import { CurrencyCode } from '../src/utils/currency';
import { Timezone } from '../src/utils/timezone';
import { createI18nStringKeys } from '../src/branded-string-key';

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

  const MessageStrings = createI18nStringKeys('test', {
    message: 'message',
  } as const);

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
      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en' | 'fr'> = {
        component,
        strings: {
          en: { [MessageStrings.message]: 'Current timezone: {timezone}' },
          fr: { [MessageStrings.message]: 'Fuseau horaire actuel: {timezone}' },
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

      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en' | 'fr'> = {
        component,
        strings: {
          en: { [MessageStrings.message]: 'Your timezone: {timezone}' },
          fr: { [MessageStrings.message]: 'Votre fuseau horaire: {timezone}' },
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

      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en' | 'fr'> = {
        component,
        strings: {
          en: { [MessageStrings.message]: 'Admin timezone: {timezone}' },
          fr: { [MessageStrings.message]: 'Fuseau horaire admin: {timezone}' },
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

      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en' | 'fr'> = {
        component,
        strings: {
          en: { [MessageStrings.message]: 'User: {userTimezone}, Admin: {adminTimezone}' },
          fr: {
            [MessageStrings.message]: 'Utilisateur: {userTimezone}, Admin: {adminTimezone}',
          },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}');
      expect(result).toBe('User: America/Los_Angeles, Admin: UTC');
    });
  });

  describe('currency code context variables', () => {
    it('should inject currencyCode into template variables', () => {
      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en' | 'fr'> = {
        component,
        strings: {
          en: { [MessageStrings.message]: 'Currency: {currencyCode}' },
          fr: { [MessageStrings.message]: 'Devise: {currencyCode}' },
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

      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en' | 'fr'> = {
        component,
        strings: {
          en: { [MessageStrings.message]: 'Price in {currencyCode}' },
          fr: { [MessageStrings.message]: 'Prix en {currencyCode}' },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}');
      expect(result).toBe('Price in EUR');
    });

    it('should work with multiple currency codes', () => {
      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en' | 'fr'> = {
        component,
        strings: {
          en: { [MessageStrings.message]: 'Currencies: {currencyCode}' },
          fr: { [MessageStrings.message]: 'Devises: {currencyCode}' },
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
      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en' | 'fr'> = {
        component,
        strings: {
          en: { [MessageStrings.message]: 'Current language: {language}' },
          fr: { [MessageStrings.message]: 'Langue actuelle: {language}' },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}');
      expect(result).toBe('Current language: en');
    });

    it('should respect user language in user context', () => {
      engine.updateContext({ language: 'fr' });

      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en' | 'fr'> = {
        component,
        strings: {
          en: { [MessageStrings.message]: 'Language: {language}' },
          fr: { [MessageStrings.message]: 'Langue: {language}' },
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

      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en' | 'fr'> = {
        component,
        strings: {
          en: { [MessageStrings.message]: 'Admin language: {language}' },
          fr: { [MessageStrings.message]: 'Langue admin: {language}' },
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

      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en' | 'fr'> = {
        component,
        strings: {
          en: { [MessageStrings.message]: 'User: {userLanguage}, Admin: {adminLanguage}' },
          fr: {
            [MessageStrings.message]: 'Utilisateur: {userLanguage}, Admin: {adminLanguage}',
          },
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

      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en' | 'fr'> = {
        component,
        strings: {
          en: {
            [MessageStrings.message]:
              'Language: {language}, Currency: {currencyCode}, Timezone: {timezone}',
          },
          fr: {
            [MessageStrings.message]:
              'Langue: {language}, Devise: {currencyCode}, Fuseau: {timezone}',
          },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}');
      expect(result).toBe(
        'Language: en, Currency: EUR, Timezone: Europe/Paris',
      );
    });

    it('should allow user variables to override context variables', () => {
      engine.updateContext({
        currencyCode: new CurrencyCode('USD'),
      });

      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en' | 'fr'> = {
        component,
        strings: {
          en: { [MessageStrings.message]: 'Currency: {currencyCode}' },
          fr: { [MessageStrings.message]: 'Devise: {currencyCode}' },
        },
      };

      engine.registerComponent(registration);

      // User-provided variable should override context
      const result = engine.t('{{test.message}}', 'en', {
        currencyCode: 'GBP',
      });
      expect(result).toBe('Currency: GBP');
    });

    it('should work with complex templates mixing context and user variables', () => {
      engine.updateContext({
        language: 'en',
        currencyCode: new CurrencyCode('USD'),
        timezone: new Timezone('America/New_York'),
      });

      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en' | 'fr'> = {
        component,
        strings: {
          en: {
            [MessageStrings.message]:
              'Hello {name}! Language: {language}, Currency: {currencyCode}, Timezone: {timezone}, Amount: {amount}',
          },
          fr: {
            [MessageStrings.message]:
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
