import { GlobalActiveContext } from '../src/global-active-context';
import { IActiveContext } from '../src/active-context';
import { CurrencyCode } from '../src/currency-code';
import { Timezone } from '../src/timezone';
import { DefaultLanguage } from '../src/default-config';
import { LanguageContextSpace } from '../src/types';

interface TestActiveContext extends IActiveContext<DefaultLanguage> {}

describe('GlobalActiveContext E2E', () => {
  let globalContext: GlobalActiveContext<DefaultLanguage, TestActiveContext>;

  beforeEach(() => {
    // Clear static state
    (GlobalActiveContext as any)._contextMap.clear();
    (GlobalActiveContext as any)._instance = undefined;
    globalContext = new GlobalActiveContext<DefaultLanguage, TestActiveContext>();
  });

  describe('real-world usage scenarios', () => {
    it('should handle complete application initialization flow', () => {
      // Initialize with English US
      const context = globalContext.createContext(DefaultLanguage.EnglishUS);
      
      expect(context.language).toBe(DefaultLanguage.EnglishUS);
      expect(context.adminLanguage).toBe(DefaultLanguage.EnglishUS);
      expect(context.currencyCode.value).toBe('USD');
      expect(context.currentContext).toBe('user');
      expect(context.timezone.value).toBe('UTC');
      expect(context.adminTimezone.value).toBe('UTC');
    });

    it('should handle user preference changes', () => {
      globalContext.createContext(DefaultLanguage.EnglishUS);
      
      // User changes language to French
      globalContext.userLanguage = DefaultLanguage.French;
      expect(globalContext.context.language).toBe(DefaultLanguage.French);
      
      // User changes currency to EUR
      globalContext.currencyCode = new CurrencyCode('EUR');
      expect(globalContext.context.currencyCode.value).toBe('EUR');
      
      // User changes timezone to Paris
      globalContext.userTimezone = new Timezone('Europe/Paris');
      expect(globalContext.context.timezone.value).toBe('Europe/Paris');
    });

    it('should handle admin interface configuration', () => {
      globalContext.createContext(DefaultLanguage.French, DefaultLanguage.EnglishUS);
      
      // Admin interface uses English while user interface uses French
      expect(globalContext.userLanguage).toBe(DefaultLanguage.French);
      expect(globalContext.adminLanguage).toBe(DefaultLanguage.EnglishUS);
      
      // Switch to admin context
      globalContext.languageContextSpace = 'admin';
      expect(globalContext.context.currentContext).toBe('admin');
      
      // Admin timezone remains UTC
      expect(globalContext.adminTimezone.value).toBe('UTC');
    });

    it('should handle multi-tenant application with separate contexts', () => {
      // Tenant 1: US company
      const tenant1Context = globalContext.createContext(
        DefaultLanguage.EnglishUS,
        DefaultLanguage.EnglishUS,
        'tenant1'
      );
      globalContext.setCurrencyCode(new CurrencyCode('USD'), 'tenant1');
      globalContext.setUserTimezone(new Timezone('America/New_York'), 'tenant1');
      
      // Tenant 2: French company
      const tenant2Context = globalContext.createContext(
        DefaultLanguage.French,
        DefaultLanguage.French,
        'tenant2'
      );
      globalContext.setCurrencyCode(new CurrencyCode('EUR'), 'tenant2');
      globalContext.setUserTimezone(new Timezone('Europe/Paris'), 'tenant2');
      
      // Verify tenant isolation
      expect(globalContext.getContext('tenant1').language).toBe(DefaultLanguage.EnglishUS);
      expect(globalContext.getContext('tenant1').currencyCode.value).toBe('USD');
      expect(globalContext.getContext('tenant1').timezone.value).toBe('America/New_York');
      
      expect(globalContext.getContext('tenant2').language).toBe(DefaultLanguage.French);
      expect(globalContext.getContext('tenant2').currencyCode.value).toBe('EUR');
      expect(globalContext.getContext('tenant2').timezone.value).toBe('Europe/Paris');
    });

    it('should handle context switching in API operations', () => {
      globalContext.createContext(DefaultLanguage.EnglishUS);
      
      // Start in user context
      expect(globalContext.languageContextSpace).toBe('user');
      
      // Switch to API context for logging
      globalContext.languageContextSpace = 'api';
      expect(globalContext.context.currentContext).toBe('api');
      
      // Switch to system context for internal operations
      globalContext.languageContextSpace = 'system';
      expect(globalContext.context.currentContext).toBe('system');
      
      // Return to user context
      globalContext.languageContextSpace = 'user';
      expect(globalContext.context.currentContext).toBe('user');
    });

    it('should handle singleton instance across modules', () => {
      // Simulate different modules accessing the singleton
      const instance1 = GlobalActiveContext.getInstance<DefaultLanguage, TestActiveContext>();
      const instance2 = GlobalActiveContext.getInstance<DefaultLanguage, TestActiveContext>();
      
      expect(instance1).toBe(instance2);
      
      // Changes in one instance should be reflected in the other
      instance1.userLanguage = DefaultLanguage.Spanish;
      expect(instance2.userLanguage).toBe(DefaultLanguage.Spanish);
    });

    it('should handle complex timezone operations', () => {
      globalContext.createContext(DefaultLanguage.EnglishUS);
      
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
      globalContext.createContext(DefaultLanguage.EnglishUS);
      
      // Test various valid currencies
      const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
      
      currencies.forEach(currencyCode => {
        const currency = new CurrencyCode(currencyCode);
        globalContext.currencyCode = currency;
        expect(globalContext.context.currencyCode.value).toBe(currencyCode);
      });
    });

    it('should handle language context space transitions', () => {
      globalContext.createContext(DefaultLanguage.EnglishUS);
      
      const contexts: LanguageContextSpace[] = ['user', 'admin', 'system', 'api'];
      
      contexts.forEach(contextSpace => {
        globalContext.languageContextSpace = contextSpace;
        expect(globalContext.context.currentContext).toBe(contextSpace);
        expect(globalContext.getLanguageContextSpace()).toBe(contextSpace);
      });
    });

    it('should handle complete application lifecycle', () => {
      // Application startup
      const appContext = globalContext.createContext(
        DefaultLanguage.EnglishUS,
        DefaultLanguage.EnglishUS,
        'app'
      );
      
      // User logs in and sets preferences
      globalContext.setUserLanguage(DefaultLanguage.French, 'app');
      globalContext.setCurrencyCode(new CurrencyCode('EUR'), 'app');
      globalContext.setUserTimezone(new Timezone('Europe/Paris'), 'app');
      
      // Admin operations
      globalContext.setLanguageContextSpace('admin', 'app');
      globalContext.setAdminLanguage(DefaultLanguage.EnglishUS, 'app');
      globalContext.setAdminTimezone(new Timezone('UTC'), 'app');
      
      // Verify final state
      const finalContext = globalContext.getContext('app');
      expect(finalContext.language).toBe(DefaultLanguage.French);
      expect(finalContext.adminLanguage).toBe(DefaultLanguage.EnglishUS);
      expect(finalContext.currencyCode.value).toBe('EUR');
      expect(finalContext.currentContext).toBe('admin');
      expect(finalContext.timezone.value).toBe('Europe/Paris');
      expect(finalContext.adminTimezone.value).toBe('UTC');
    });

    it('should handle error recovery scenarios', () => {
      globalContext.createContext(DefaultLanguage.EnglishUS);
      
      // Attempt to access non-existent context
      expect(() => globalContext.getContext('nonexistent')).toThrow();
      
      // Verify default context still works
      expect(globalContext.context.language).toBe(DefaultLanguage.EnglishUS);
      
      // Attempt invalid operations on non-existent contexts
      expect(() => globalContext.setUserLanguage(DefaultLanguage.French, 'invalid')).toThrow();
      expect(() => globalContext.setCurrencyCode(new CurrencyCode('EUR'), 'invalid')).toThrow();
      expect(() => globalContext.setLanguageContextSpace('admin', 'invalid')).toThrow();
      
      // Verify default context remains unaffected
      expect(globalContext.context.language).toBe(DefaultLanguage.EnglishUS);
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
        globalContext.createContext(DefaultLanguage.EnglishUS, DefaultLanguage.EnglishUS, key);
      }
      
      // Verify all contexts exist
      contextKeys.forEach(key => {
        expect(globalContext.getContext(key)).toBeDefined();
      });
      
      // Verify contexts are independent
      globalContext.setUserLanguage(DefaultLanguage.French, 'context_0');
      globalContext.setUserLanguage(DefaultLanguage.Spanish, 'context_50');
      
      expect(globalContext.getContext('context_0').language).toBe(DefaultLanguage.French);
      expect(globalContext.getContext('context_50').language).toBe(DefaultLanguage.Spanish);
      expect(globalContext.getContext('context_99').language).toBe(DefaultLanguage.EnglishUS);
    });

    it('should handle rapid context switching', () => {
      globalContext.createContext(DefaultLanguage.EnglishUS);
      
      const languages = [
        DefaultLanguage.EnglishUS,
        DefaultLanguage.French,
        DefaultLanguage.Spanish,
        DefaultLanguage.MandarinChinese,
        DefaultLanguage.Ukrainian
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