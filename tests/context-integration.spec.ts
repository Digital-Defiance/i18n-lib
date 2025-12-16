/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

/**
 * Comprehensive tests for context variable integration
 * Tests currency, timezone, language injection into translations
 */

import { I18nBuilder } from '../src/builders/i18n-builder';
import { I18nEngine } from '../src/core/i18n-engine';
import { CurrencyCode } from '../src/utils/currency';
import { Timezone } from '../src/utils/timezone';

describe('Context Integration - Currency and Timezone', () => {
  let engine: I18nEngine;

  beforeEach(() => {
    I18nEngine.resetAll();
    engine = I18nBuilder.create()
      .withLanguages([
        { id: 'en-US', name: 'English (US)', code: 'en-US', isDefault: true },
        { id: 'fr', name: 'French', code: 'fr' },
      ])
      .build();

    engine.register({
      id: 'test',
      strings: {
        'en-US': {
          withCurrency: 'Price in {currency}',
          withCurrencyCode: 'Currency code: {currencyCode}',
          withTimezone: 'Timezone: {timezone}',
          withUserTimezone: 'User timezone: {userTimezone}',
          withAdminTimezone: 'Admin timezone: {adminTimezone}',
          combined: 'Currency: {currency}, Timezone: {timezone}',
        },
        fr: {
          withCurrency: 'Prix en {currency}',
          withCurrencyCode: 'Code de devise: {currencyCode}',
          withTimezone: 'Fuseau horaire: {timezone}',
          withUserTimezone: 'Fuseau horaire utilisateur: {userTimezone}',
          withAdminTimezone: 'Fuseau horaire admin: {adminTimezone}',
          combined: 'Devise: {currency}, Fuseau horaire: {timezone}',
        },
      },
    });
  });

  afterEach(() => {
    I18nEngine.resetAll();
  });

  describe('CurrencyCode Object Handling', () => {
    it('should extract value from CurrencyCode object in variables', () => {
      const currency = new CurrencyCode('EUR');
      expect(engine.translate('test', 'withCurrency', { currency })).toBe(
        'Price in EUR',
      );
    });

    it('should extract value from CurrencyCode using currencyCode key', () => {
      const currencyCode = new CurrencyCode('GBP');
      expect(
        engine.translate('test', 'withCurrencyCode', { currencyCode }),
      ).toBe('Currency code: GBP');
    });

    it('should work with CurrencyCode in t() function', () => {
      const currency = new CurrencyCode('JPY');
      expect(engine.t('{{test.withCurrency}}', { currency })).toBe(
        'Price in JPY',
      );
    });

    it('should work with CurrencyCode in different languages', () => {
      const currency = new CurrencyCode('CAD');
      expect(engine.translate('test', 'withCurrency', { currency }, 'fr')).toBe(
        'Prix en CAD',
      );
    });

    it('should handle multiple CurrencyCode objects', () => {
      const currency = new CurrencyCode('USD');
      const currencyCode = new CurrencyCode('EUR');

      const result = engine.t('Currency: {currency}, Code: {currencyCode}', {
        currency,
        currencyCode,
      });

      expect(result).toBe('Currency: USD, Code: EUR');
    });
  });

  describe('Timezone Object Handling', () => {
    it('should extract value from Timezone object in variables', () => {
      const timezone = new Timezone('America/New_York');
      expect(engine.translate('test', 'withTimezone', { timezone })).toBe(
        'Timezone: America/New_York',
      );
    });

    it('should extract value from Timezone using userTimezone key', () => {
      const userTimezone = new Timezone('Europe/London');
      expect(
        engine.translate('test', 'withUserTimezone', { userTimezone }),
      ).toBe('User timezone: Europe/London');
    });

    it('should extract value from Timezone using adminTimezone key', () => {
      const adminTimezone = new Timezone('UTC');
      expect(
        engine.translate('test', 'withAdminTimezone', { adminTimezone }),
      ).toBe('Admin timezone: UTC');
    });

    it('should work with Timezone in t() function', () => {
      const timezone = new Timezone('Asia/Tokyo');
      expect(engine.t('{{test.withTimezone}}', { timezone })).toBe(
        'Timezone: Asia/Tokyo',
      );
    });

    it('should work with Timezone in different languages', () => {
      const timezone = new Timezone('Europe/Paris');
      expect(engine.translate('test', 'withTimezone', { timezone }, 'fr')).toBe(
        'Fuseau horaire: Europe/Paris',
      );
    });

    it('should handle multiple Timezone objects', () => {
      const userTimezone = new Timezone('America/Los_Angeles');
      const adminTimezone = new Timezone('UTC');

      const result = engine.t('User: {userTimezone}, Admin: {adminTimezone}', {
        userTimezone,
        adminTimezone,
      });

      expect(result).toBe('User: America/Los_Angeles, Admin: UTC');
    });
  });

  describe('Combined Currency and Timezone', () => {
    it('should handle both CurrencyCode and Timezone objects', () => {
      const currency = new CurrencyCode('EUR');
      const timezone = new Timezone('Europe/Berlin');

      expect(engine.translate('test', 'combined', { currency, timezone })).toBe(
        'Currency: EUR, Timezone: Europe/Berlin',
      );
    });

    it('should handle both in t() function', () => {
      const currency = new CurrencyCode('AUD');
      const timezone = new Timezone('Australia/Sydney');

      expect(engine.t('{{test.combined}}', { currency, timezone })).toBe(
        'Currency: AUD, Timezone: Australia/Sydney',
      );
    });

    it('should handle both in different languages', () => {
      const currency = new CurrencyCode('CHF');
      const timezone = new Timezone('Europe/Zurich');

      expect(
        engine.translate('test', 'combined', { currency, timezone }, 'fr'),
      ).toBe('Devise: CHF, Fuseau horaire: Europe/Zurich');
    });
  });

  describe('Mixed Object and Primitive Variables', () => {
    it('should handle mix of CurrencyCode objects and strings', () => {
      const currency = new CurrencyCode('USD');
      const name = 'John';

      const result = engine.t('User {name} uses {currency}', {
        currency,
        name,
      });
      expect(result).toBe('User John uses USD');
    });

    it('should handle mix of Timezone objects and numbers', () => {
      const timezone = new Timezone('America/Chicago');
      const count = 42;

      const result = engine.t('Count: {count}, Timezone: {timezone}', {
        timezone,
        count,
      });
      expect(result).toBe('Count: 42, Timezone: America/Chicago');
    });

    it('should handle all types together', () => {
      const currency = new CurrencyCode('GBP');
      const timezone = new Timezone('Europe/London');
      const name = 'Alice';
      const amount = 100;

      const result = engine.t('{name} has {amount} {currency} in {timezone}', {
        currency,
        timezone,
        name,
        amount,
      });

      expect(result).toBe('Alice has 100 GBP in Europe/London');
    });
  });

  describe('Constants with Currency and Timezone', () => {
    beforeEach(() => {
      I18nEngine.resetAll();
      engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withConstants({
          DefaultCurrency: new CurrencyCode('USD'),
          DefaultTimezone: new Timezone('UTC'),
          AppName: 'MyApp',
        })
        .build();

      engine.register({
        id: 'constants-test',
        strings: {
          'en-US': {
            message:
              'App: {AppName}, Currency: {DefaultCurrency}, Timezone: {DefaultTimezone}',
          },
        },
      });
    });

    it('should extract values from CurrencyCode and Timezone in constants', () => {
      expect(engine.translate('constants-test', 'message')).toBe(
        'App: MyApp, Currency: USD, Timezone: UTC',
      );
    });

    it('should allow variables to override constant objects', () => {
      const DefaultCurrency = new CurrencyCode('EUR');
      expect(
        engine.translate('constants-test', 'message', { DefaultCurrency }),
      ).toBe('App: MyApp, Currency: EUR, Timezone: UTC');
    });

    it('should work in t() function', () => {
      expect(engine.t('{{constants-test.message}}')).toBe(
        'App: MyApp, Currency: USD, Timezone: UTC',
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null currency gracefully', () => {
      expect(engine.translate('test', 'withCurrency', { currency: null })).toBe(
        'Price in null',
      );
    });

    it('should handle undefined timezone gracefully', () => {
      expect(
        engine.translate('test', 'withTimezone', { timezone: undefined }),
      ).toBe('Timezone: undefined');
    });

    it('should handle plain string when CurrencyCode expected', () => {
      expect(
        engine.translate('test', 'withCurrency', { currency: 'USD' }),
      ).toBe('Price in USD');
    });

    it('should handle plain string when Timezone expected', () => {
      expect(
        engine.translate('test', 'withTimezone', { timezone: 'UTC' }),
      ).toBe('Timezone: UTC');
    });

    it('should handle objects with value property that are not Currency/Timezone', () => {
      const customObj = { value: 'custom-value' };
      const result = engine.t('Value: {obj}', { obj: customObj });
      expect(result).toBe('Value: custom-value');
    });

    it('should handle objects without value property', () => {
      const customObj = { data: 'test' };
      const result = engine.t('Object: {obj}', { obj: customObj });
      expect(result).toBe('Object: [object Object]');
    });
  });

  describe('safeTranslate with Objects', () => {
    it('should extract CurrencyCode value in safeTranslate', () => {
      const currency = new CurrencyCode('EUR');
      expect(engine.safeTranslate('test', 'withCurrency', { currency })).toBe(
        'Price in EUR',
      );
    });

    it('should extract Timezone value in safeTranslate', () => {
      const timezone = new Timezone('Asia/Shanghai');
      expect(engine.safeTranslate('test', 'withTimezone', { timezone })).toBe(
        'Timezone: Asia/Shanghai',
      );
    });

    it('should handle missing keys with objects gracefully', () => {
      const currency = new CurrencyCode('JPY');
      expect(engine.safeTranslate('test', 'missing', { currency })).toBe(
        '[test.missing]',
      );
    });
  });
});
