import { createContext, setLanguage, setAdminLanguage, setContext } from '../src/context';
import { I18nContext } from '../src/types';

enum TestLanguages {
  English = 'English',
  Spanish = 'Spanish',
  French = 'French',
}

type TestContext = 'admin' | 'user' | 'guest';

describe('context utilities', () => {
  describe('createContext', () => {
    it('should create a context with default values', () => {
      const context = createContext(TestLanguages.English, 'admin' as TestContext);
      
      expect(context).toEqual({
        language: TestLanguages.English,
        adminLanguage: TestLanguages.English,
        currentContext: 'admin',
      });
    });

    it('should create context with different language and context', () => {
      const context = createContext(TestLanguages.Spanish, 'user' as TestContext);
      
      expect(context).toEqual({
        language: TestLanguages.Spanish,
        adminLanguage: TestLanguages.Spanish,
        currentContext: 'user',
      });
    });
  });

  describe('setLanguage', () => {
    it('should update the language property', () => {
      const context = createContext(TestLanguages.English, 'admin' as TestContext);
      
      setLanguage(context, TestLanguages.Spanish);
      
      expect(context.language).toBe(TestLanguages.Spanish);
      expect(context.adminLanguage).toBe(TestLanguages.English); // Should remain unchanged
    });

    it('should work with different language types', () => {
      const context = createContext(TestLanguages.English, 'admin' as TestContext);
      
      setLanguage(context, TestLanguages.French);
      
      expect(context.language).toBe(TestLanguages.French);
    });
  });

  describe('setAdminLanguage', () => {
    it('should update the adminLanguage property', () => {
      const context = createContext(TestLanguages.English, 'admin' as TestContext);
      
      setAdminLanguage(context, TestLanguages.Spanish);
      
      expect(context.adminLanguage).toBe(TestLanguages.Spanish);
      expect(context.language).toBe(TestLanguages.English); // Should remain unchanged
    });

    it('should work independently of regular language', () => {
      const context = createContext(TestLanguages.English, 'admin' as TestContext);
      setLanguage(context, TestLanguages.French);
      
      setAdminLanguage(context, TestLanguages.Spanish);
      
      expect(context.language).toBe(TestLanguages.French);
      expect(context.adminLanguage).toBe(TestLanguages.Spanish);
    });
  });

  describe('setContext', () => {
    it('should update the currentContext property', () => {
      const context = createContext(TestLanguages.English, 'admin' as TestContext);
      
      setContext(context, 'user' as TestContext);
      
      expect(context.currentContext).toBe('user');
      expect(context.language).toBe(TestLanguages.English); // Should remain unchanged
      expect(context.adminLanguage).toBe(TestLanguages.English); // Should remain unchanged
    });

    it('should work with custom context types', () => {
      const context = createContext(TestLanguages.English, 'admin' as TestContext);
      
      setContext(context, 'guest' as TestContext);
      
      expect(context.currentContext).toBe('guest');
    });
  });

  describe('integration', () => {
    it('should allow chaining context modifications', () => {
      const context = createContext(TestLanguages.English, 'admin' as TestContext);
      
      setLanguage(context, TestLanguages.Spanish);
      setAdminLanguage(context, TestLanguages.French);
      setContext(context, 'user' as TestContext);
      
      expect(context).toEqual({
        language: TestLanguages.Spanish,
        adminLanguage: TestLanguages.French,
        currentContext: 'user',
      });
    });

    it('should maintain object reference', () => {
      const context = createContext(TestLanguages.English, 'admin' as TestContext);
      const originalRef = context;
      
      setLanguage(context, TestLanguages.Spanish);
      setAdminLanguage(context, TestLanguages.French);
      setContext(context, 'user' as TestContext);
      
      expect(context).toBe(originalRef);
    });
  });
});