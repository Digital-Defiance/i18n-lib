/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { LanguageCodes } from '../src';
import { IActiveContext } from '../src/active-context';
import { GlobalActiveContext } from '../src/global-active-context';
import { CurrencyCode } from '../src/utils/currency';
import { Timezone } from '../src/utils/timezone';

interface TestActiveContext extends IActiveContext<string> {}

describe('GlobalActiveContext', () => {
  let globalContext: GlobalActiveContext<string, TestActiveContext>;

  beforeEach(() => {
    // Clear static state
    (GlobalActiveContext as any)._contextMap.clear();
    (GlobalActiveContext as any)._instance = undefined;
    globalContext = new GlobalActiveContext<string, TestActiveContext>();
  });

  describe('singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = GlobalActiveContext.instance;
      const instance2 = GlobalActiveContext.instance;
      expect(instance1).toBe(instance2);
    });

    it('should create default context on first access', () => {
      const instance = GlobalActiveContext.instance;
      expect(instance.context).toBeDefined();
      expect(instance.context.language).toBe(LanguageCodes.EN_US);
    });

    it('should allow overriding instance', () => {
      const customInstance = new GlobalActiveContext();
      GlobalActiveContext.overrideInstance(customInstance);
      expect(GlobalActiveContext.instance).toBe(customInstance);
    });
  });

  describe('createContext', () => {
    it('should create context with default parameters', () => {
      const context = globalContext.createContext('en');

      expect(context.language).toBe('en');
      expect(context.adminLanguage).toBe('en');
      expect(context.currencyCode.value).toBe('USD');
      expect(context.currentContext).toBe('user');
      expect(context.timezone.value).toBe('UTC');
      expect(context.adminTimezone.value).toBe('UTC');
    });

    it('should create context with custom admin language', () => {
      const context = globalContext.createContext('en', 'fr');

      expect(context.language).toBe('en');
      expect(context.adminLanguage).toBe('fr');
    });

    it('should create context with custom key', () => {
      const context = globalContext.createContext('en', 'en', 'custom');
      const retrieved = globalContext.getContext('custom');

      expect(retrieved).toBe(context);
    });
  });

  describe('getContext', () => {
    it('should return existing context', () => {
      const created = globalContext.createContext('en');
      const retrieved = globalContext.getContext();

      expect(retrieved).toBe(created);
    });

    it('should throw error for non-existent context', () => {
      expect(() => globalContext.getContext('nonexistent')).toThrow();
    });

    it('should return context by custom key', () => {
      const created = globalContext.createContext('en', 'en', 'test');
      const retrieved = globalContext.getContext('test');

      expect(retrieved).toBe(created);
    });
  });

  describe('context property', () => {
    it('should get default context', () => {
      const created = globalContext.createContext('en');
      expect(globalContext.context).toBe(created);
    });

    it('should set default context', () => {
      const newContext = globalContext.createContext('fr', 'fr', 'temp');
      globalContext.context = newContext;

      expect(globalContext.context).toBe(newContext);
    });
  });

  describe('setUserLanguage', () => {
    beforeEach(() => {
      globalContext.createContext('en');
    });

    it('should set user language for default context', () => {
      globalContext.setUserLanguage('fr');
      expect(globalContext.context.language).toBe('fr');
    });

    it('should set user language for custom context', () => {
      globalContext.createContext('en', 'en', 'custom');
      globalContext.setUserLanguage('es', 'custom');

      expect(globalContext.getContext('custom').language).toBe('es');
    });

    it('should throw error for invalid context key', () => {
      expect(() => globalContext.setUserLanguage('fr', 'invalid')).toThrow();
    });
  });

  describe('userLanguage property', () => {
    beforeEach(() => {
      globalContext.createContext('en');
    });

    it('should get user language', () => {
      expect(globalContext.userLanguage).toBe('en');
    });

    it('should set user language', () => {
      globalContext.userLanguage = 'fr';
      expect(globalContext.context.language).toBe('fr');
    });
  });

  describe('setCurrencyCode', () => {
    beforeEach(() => {
      globalContext.createContext('en');
    });

    it('should set currency code for default context', () => {
      const eurCode = new CurrencyCode('EUR');
      globalContext.setCurrencyCode(eurCode);

      expect(globalContext.context.currencyCode).toBe(eurCode);
    });

    it('should set currency code for custom context', () => {
      globalContext.createContext('en', 'en', 'custom');
      const gbpCode = new CurrencyCode('GBP');
      globalContext.setCurrencyCode(gbpCode, 'custom');

      expect(globalContext.getContext('custom').currencyCode).toBe(gbpCode);
    });

    it('should throw error for invalid context key', () => {
      const eurCode = new CurrencyCode('EUR');
      expect(() => globalContext.setCurrencyCode(eurCode, 'invalid')).toThrow();
    });
  });

  describe('currencyCode property', () => {
    beforeEach(() => {
      globalContext.createContext('en');
    });

    it('should get currency code', () => {
      expect(globalContext.currencyCode.value).toBe('USD');
    });

    it('should set currency code', () => {
      const eurCode = new CurrencyCode('EUR');
      globalContext.currencyCode = eurCode;

      expect(globalContext.context.currencyCode).toBe(eurCode);
    });
  });

  describe('setAdminLanguage', () => {
    beforeEach(() => {
      globalContext.createContext('en');
    });

    it('should set admin language for default context', () => {
      globalContext.setAdminLanguage('fr');
      expect(globalContext.context.adminLanguage).toBe('fr');
    });

    it('should set admin language for custom context', () => {
      globalContext.createContext('en', 'en', 'custom');
      globalContext.setAdminLanguage('es', 'custom');

      expect(globalContext.getContext('custom').adminLanguage).toBe('es');
    });

    it('should throw error for invalid context key', () => {
      expect(() => globalContext.setAdminLanguage('fr', 'invalid')).toThrow();
    });
  });

  describe('adminLanguage property', () => {
    beforeEach(() => {
      globalContext.createContext('en');
    });

    it('should get admin language', () => {
      expect(globalContext.adminLanguage).toBe('en');
    });

    it('should set admin language', () => {
      globalContext.adminLanguage = 'fr';
      expect(globalContext.context.adminLanguage).toBe('fr');
    });
  });

  describe('setLanguageContextSpace', () => {
    beforeEach(() => {
      globalContext.createContext('en');
    });

    it('should set language context space for default context', () => {
      globalContext.setLanguageContextSpace('admin');
      expect(globalContext.context.currentContext).toBe('admin');
    });

    it('should throw error for invalid context key', () => {
      expect(() =>
        globalContext.setLanguageContextSpace('admin', 'invalid'),
      ).toThrow();
    });
  });

  describe('getLanguageContextSpace', () => {
    beforeEach(() => {
      globalContext.createContext('en');
    });

    it('should get language context space for default context', () => {
      expect(globalContext.getLanguageContextSpace()).toBe('user');
    });

    it('should throw error for invalid context key', () => {
      expect(() => globalContext.getLanguageContextSpace('invalid')).toThrow();
    });
  });

  describe('languageContextSpace property', () => {
    beforeEach(() => {
      globalContext.createContext('en');
    });

    it('should get language context space', () => {
      expect(globalContext.languageContextSpace).toBe('user');
    });

    it('should set language context space', () => {
      globalContext.languageContextSpace = 'admin';
      expect(globalContext.context.currentContext).toBe('admin');
    });
  });

  describe('setUserTimezone', () => {
    beforeEach(() => {
      globalContext.createContext('en');
    });

    it('should set user timezone for default context', () => {
      const timezone = new Timezone('America/New_York');
      globalContext.setUserTimezone(timezone);

      expect(globalContext.context.timezone).toBe(timezone);
    });

    it('should set user timezone for custom context', () => {
      globalContext.createContext('en', 'en', 'custom');
      const timezone = new Timezone('Europe/London');
      globalContext.setUserTimezone(timezone, 'custom');

      expect(globalContext.getContext('custom').timezone).toBe(timezone);
    });

    it('should throw error for invalid context key', () => {
      const timezone = new Timezone('UTC');
      expect(() =>
        globalContext.setUserTimezone(timezone, 'invalid'),
      ).toThrow();
    });
  });

  describe('userTimezone property', () => {
    beforeEach(() => {
      globalContext.createContext('en');
    });

    it('should get user timezone', () => {
      expect(globalContext.userTimezone.value).toBe('UTC');
    });

    it('should set user timezone', () => {
      const timezone = new Timezone('America/New_York');
      globalContext.userTimezone = timezone;

      expect(globalContext.context.timezone).toBe(timezone);
    });
  });

  describe('setAdminTimezone', () => {
    beforeEach(() => {
      globalContext.createContext('en');
    });

    it('should set admin timezone for default context', () => {
      const timezone = new Timezone('America/New_York');
      globalContext.setAdminTimezone(timezone);

      expect(globalContext.context.adminTimezone).toBe(timezone);
    });

    it('should set admin timezone for custom context', () => {
      globalContext.createContext('en', 'en', 'custom');
      const timezone = new Timezone('Europe/London');
      globalContext.setAdminTimezone(timezone, 'custom');

      expect(globalContext.getContext('custom').adminTimezone).toBe(timezone);
    });

    it('should throw error for invalid context key', () => {
      const timezone = new Timezone('UTC');
      expect(() =>
        globalContext.setAdminTimezone(timezone, 'invalid'),
      ).toThrow();
    });
  });

  describe('adminTimezone property', () => {
    beforeEach(() => {
      globalContext.createContext('en');
    });

    it('should get admin timezone', () => {
      expect(globalContext.adminTimezone.value).toBe('UTC');
    });

    it('should set admin timezone', () => {
      const timezone = new Timezone('America/New_York');
      globalContext.adminTimezone = timezone;

      expect(globalContext.context.adminTimezone).toBe(timezone);
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid context', () => {
      expect(() => globalContext.getContext('nonexistent')).toThrow();
    });
  });

  describe('multiple contexts', () => {
    it('should manage multiple contexts independently', () => {
      const ctx1 = globalContext.createContext('en', 'en', 'ctx1');
      const ctx2 = globalContext.createContext('fr', 'es', 'ctx2');

      globalContext.setUserLanguage('de', 'ctx1');
      globalContext.setCurrencyCode(new CurrencyCode('EUR'), 'ctx2');

      expect(globalContext.getContext('ctx1').language).toBe('de');
      expect(globalContext.getContext('ctx1').currencyCode.value).toBe('USD');
      expect(globalContext.getContext('ctx2').language).toBe('fr');
      expect(globalContext.getContext('ctx2').currencyCode.value).toBe('EUR');
    });
  });
});
