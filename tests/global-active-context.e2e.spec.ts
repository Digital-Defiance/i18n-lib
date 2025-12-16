/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { DefaultLanguageCode, LanguageCodes } from '../src';
import { IActiveContext } from '../src/active-context';
import { GlobalActiveContext } from '../src/global-active-context';
import { CurrencyCode } from '../src/utils/currency';
import { Timezone } from '../src/utils/timezone';

interface TestActiveContext extends IActiveContext<DefaultLanguageCode> {}

describe('GlobalActiveContext E2E', () => {
  let globalContext: GlobalActiveContext<
    DefaultLanguageCode,
    TestActiveContext
  >;

  beforeEach(() => {
    // Clear static state
    (GlobalActiveContext as any)._contextMap.clear();
    (GlobalActiveContext as any)._instance = undefined;
    globalContext = new GlobalActiveContext<
      DefaultLanguageCode,
      TestActiveContext
    >();
  });

  describe('real-world usage scenarios', () => {
    it('should handle complete application initialization flow', () => {
      // Initialize with English US
      const context = globalContext.createContext(LanguageCodes.EN_US);

      expect(context.language).toBe(LanguageCodes.EN_US);
      expect(context.adminLanguage).toBe(LanguageCodes.EN_US);
      expect(context.currencyCode.value).toBe('USD');
      expect(context.currentContext).toBe('user');
      expect(context.timezone.value).toBe('UTC');
      expect(context.adminTimezone.value).toBe('UTC');
    });

    it('should handle user preference changes', () => {
      globalContext.createContext(LanguageCodes.EN_US);

      // User changes language to French
      globalContext.userLanguage = LanguageCodes.FR;
      expect(globalContext.context.language).toBe(LanguageCodes.FR);

      // User changes currency to EUR
      globalContext.currencyCode = new CurrencyCode('EUR');
      expect(globalContext.context.currencyCode.value).toBe('EUR');

      // User changes timezone to Paris
      globalContext.userTimezone = new Timezone('Europe/Paris');
      expect(globalContext.context.timezone.value).toBe('Europe/Paris');
    });

    it('should handle admin interface configuration', () => {
      globalContext.createContext(LanguageCodes.FR, LanguageCodes.EN_US);

      // Admin interface uses English while user interface uses French
      expect(globalContext.userLanguage).toBe(LanguageCodes.FR);
      expect(globalContext.adminLanguage).toBe(LanguageCodes.EN_US);

      // Switch to admin context
      globalContext.languageContextSpace = 'admin';
      expect(globalContext.context.currentContext).toBe('admin');

      // Admin timezone remains UTC
      expect(globalContext.adminTimezone.value).toBe('UTC');
    });

    it('should handle multi-tenant application with separate contexts', () => {
      // Tenant 1: US company
      const tenant1Context = globalContext.createContext(
        LanguageCodes.EN_US,
        LanguageCodes.EN_US,
        'tenant1',
      );
      globalContext.setCurrencyCode(new CurrencyCode('USD'), 'tenant1');
      globalContext.setUserTimezone(
        new Timezone('America/New_York'),
        'tenant1',
      );

      // Tenant 2: French company
      const tenant2Context = globalContext.createContext(
        LanguageCodes.FR,
        LanguageCodes.FR,
        'tenant2',
      );
      globalContext.setCurrencyCode(new CurrencyCode('EUR'), 'tenant2');
      globalContext.setUserTimezone(new Timezone('Europe/Paris'), 'tenant2');

      // Verify tenant isolation
      expect(globalContext.getContext('tenant1').language).toBe(
        LanguageCodes.EN_US,
      );
      expect(globalContext.getContext('tenant1').currencyCode.value).toBe(
        'USD',
      );
      expect(globalContext.getContext('tenant1').timezone.value).toBe(
        'America/New_York',
      );

      expect(globalContext.getContext('tenant2').language).toBe(
        LanguageCodes.FR,
      );
      expect(globalContext.getContext('tenant2').currencyCode.value).toBe(
        'EUR',
      );
      expect(globalContext.getContext('tenant2').timezone.value).toBe(
        'Europe/Paris',
      );
    });

    it('should handle singleton instance across modules', () => {
      // Simulate different modules accessing the singleton
      const instance1 = GlobalActiveContext.getInstance<
        DefaultLanguageCode,
        TestActiveContext
      >();
      const instance2 = GlobalActiveContext.getInstance<
        DefaultLanguageCode,
        TestActiveContext
      >();

      expect(instance1).toBe(instance2);

      // Changes in one instance should be reflected in the other
      instance1.userLanguage = LanguageCodes.ES;
      expect(instance2.userLanguage).toBe(LanguageCodes.ES);
    });

    it('should handle complex timezone operations', () => {
      globalContext.createContext(LanguageCodes.EN_US);

      // Set different timezones for user and admin
      globalContext.userTimezone = new Timezone('America/Los_Angeles');
      globalContext.adminTimezone = new Timezone('UTC');

      expect(globalContext.context.timezone.value).toBe('America/Los_Angeles');
      expect(globalContext.context.adminTimezone.value).toBe('UTC');

      // Change user timezone to Tokyo
      globalContext.userTimezone = new Timezone('Asia/Tokyo');
      expect(globalContext.context.timezone.value).toBe('Asia/Tokyo');
      expect(globalContext.context.adminTimezone.value).toBe('UTC'); // Should remain unchanged
    });

    it('should handle currency operations with validation', () => {
      globalContext.createContext(LanguageCodes.EN_US);

      // Test various valid currencies
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];

      currencies.forEach((currencyCode) => {
        const currency = new CurrencyCode(currencyCode);
        globalContext.currencyCode = currency;
        expect(globalContext.context.currencyCode.value).toBe(currencyCode);
      });
    });

    it('should handle language context space transitions', () => {
      globalContext.createContext(LanguageCodes.EN_US);

      const contexts: LanguageContextSpace[] = ['user', 'admin'];

      contexts.forEach((contextSpace) => {
        globalContext.languageContextSpace = contextSpace;
        expect(globalContext.context.currentContext).toBe(contextSpace);
        expect(globalContext.getLanguageContextSpace()).toBe(contextSpace);
      });
    });

    it('should handle complete application lifecycle', () => {
      // Application startup
      const appContext = globalContext.createContext(
        LanguageCodes.EN_US,
        LanguageCodes.EN_US,
        'app',
      );

      // User logs in and sets preferences
      globalContext.setUserLanguage(LanguageCodes.FR, 'app');
      globalContext.setCurrencyCode(new CurrencyCode('EUR'), 'app');
      globalContext.setUserTimezone(new Timezone('Europe/Paris'), 'app');

      // Admin operations
      globalContext.setLanguageContextSpace('admin', 'app');
      globalContext.setAdminLanguage(LanguageCodes.EN_US, 'app');
      globalContext.setAdminTimezone(new Timezone('UTC'), 'app');

      // Verify final state
      const finalContext = globalContext.getContext('app');
      expect(finalContext.language).toBe(LanguageCodes.FR);
      expect(finalContext.adminLanguage).toBe(LanguageCodes.EN_US);
      expect(finalContext.currencyCode.value).toBe('EUR');
      expect(finalContext.currentContext).toBe('admin');
      expect(finalContext.timezone.value).toBe('Europe/Paris');
      expect(finalContext.adminTimezone.value).toBe('UTC');
    });

    it('should handle error recovery scenarios', () => {
      globalContext.createContext(LanguageCodes.EN_US);

      // Attempt to access non-existent context
      expect(() => globalContext.getContext('nonexistent')).toThrow();

      // Verify default context still works
      expect(globalContext.context.language).toBe(LanguageCodes.EN_US);

      // Attempt invalid operations on non-existent contexts
      expect(() =>
        globalContext.setUserLanguage(LanguageCodes.FR, 'invalid'),
      ).toThrow();
      expect(() =>
        globalContext.setCurrencyCode(new CurrencyCode('EUR'), 'invalid'),
      ).toThrow();
      expect(() =>
        globalContext.setLanguageContextSpace('admin', 'invalid'),
      ).toThrow();

      // Verify default context remains unaffected
      expect(globalContext.context.language).toBe(LanguageCodes.EN_US);
      expect(globalContext.context.currencyCode.value).toBe('USD');
      expect(globalContext.context.currentContext).toBe('user');
    });
  });

  describe('performance and memory scenarios', () => {
    it('should handle multiple context creation and cleanup', () => {
      const contextKeys: string[] = [];

      // Create multiple contexts
      for (let i = 0; i < 100; i++) {
        const key = `context_${i}`;
        contextKeys.push(key);
        globalContext.createContext(
          LanguageCodes.EN_US,
          LanguageCodes.EN_US,
          key,
        );
      }

      // Verify all contexts exist
      contextKeys.forEach((key) => {
        expect(globalContext.getContext(key)).toBeDefined();
      });

      // Verify contexts are independent
      globalContext.setUserLanguage(LanguageCodes.FR, 'context_0');
      globalContext.setUserLanguage(LanguageCodes.ES, 'context_50');

      expect(globalContext.getContext('context_0').language).toBe(
        LanguageCodes.FR,
      );
      expect(globalContext.getContext('context_50').language).toBe(
        LanguageCodes.ES,
      );
      expect(globalContext.getContext('context_99').language).toBe(
        LanguageCodes.EN_US,
      );
    });

    it('should handle rapid context switching', () => {
      globalContext.createContext(LanguageCodes.EN_US);

      const languages = [
        LanguageCodes.EN_US,
        LanguageCodes.FR,
        LanguageCodes.ES,
        LanguageCodes.ZH_CN,
        LanguageCodes.UK,
      ];

      // Rapid language switching
      for (let i = 0; i < 1000; i++) {
        const language = languages[i % languages.length];
        globalContext.userLanguage = language;
        expect(globalContext.context.language).toBe(language);
      }
    });
  });
});
