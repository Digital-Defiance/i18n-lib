import {
  createContext,
  setAdminLanguage,
  setAdminTimezone,
  setContext,
  setLanguage,
  setTimezone,
} from '../src/context';
import { Timezone } from '../src/timezone';

enum TestLanguages {
  English = 'English',
  Spanish = 'Spanish',
  French = 'French',
}

describe('context utilities', () => {
  describe('createContext', () => {
    it('should create a context with default values', () => {
      const context = createContext(TestLanguages.English, 'admin');

      expect(context).toEqual({
        language: TestLanguages.English,
        adminLanguage: TestLanguages.English,
        currentContext: 'admin',
        currencyCode: expect.objectContaining({ _value: 'USD' }),
        timezone: expect.objectContaining({ _timezone: 'UTC' }),
        adminTimezone: expect.objectContaining({ _timezone: 'UTC' }),
      });
    });

    it('should create context with different language and context', () => {
      const context = createContext(TestLanguages.Spanish, 'user');

      expect(context).toEqual({
        language: TestLanguages.Spanish,
        adminLanguage: TestLanguages.Spanish,
        currentContext: 'user',
        currencyCode: expect.objectContaining({ _value: 'USD' }),
        timezone: expect.objectContaining({ _timezone: 'UTC' }),
        adminTimezone: expect.objectContaining({ _timezone: 'UTC' }),
      });
    });
  });

  describe('setLanguage', () => {
    it('should update the language property', () => {
      const context = createContext(TestLanguages.English, 'admin');

      setLanguage(context, TestLanguages.Spanish);

      expect(context.language).toBe(TestLanguages.Spanish);
      expect(context.adminLanguage).toBe(TestLanguages.English); // Should remain unchanged
    });

    it('should work with different language types', () => {
      const context = createContext(TestLanguages.English, 'admin');

      setLanguage(context, TestLanguages.French);

      expect(context.language).toBe(TestLanguages.French);
    });
  });

  describe('setAdminLanguage', () => {
    it('should update the adminLanguage property', () => {
      const context = createContext(TestLanguages.English, 'admin');

      setAdminLanguage(context, TestLanguages.Spanish);

      expect(context.adminLanguage).toBe(TestLanguages.Spanish);
      expect(context.language).toBe(TestLanguages.English); // Should remain unchanged
    });

    it('should work independently of regular language', () => {
      const context = createContext(TestLanguages.English, 'admin');
      setLanguage(context, TestLanguages.French);

      setAdminLanguage(context, TestLanguages.Spanish);

      expect(context.language).toBe(TestLanguages.French);
      expect(context.adminLanguage).toBe(TestLanguages.Spanish);
    });
  });

  describe('setContext', () => {
    it('should update the currentContext property', () => {
      const context = createContext(TestLanguages.English, 'admin');

      setContext(context, 'user');

      expect(context.currentContext).toBe('user');
      expect(context.language).toBe(TestLanguages.English); // Should remain unchanged
      expect(context.adminLanguage).toBe(TestLanguages.English); // Should remain unchanged
    });
  });

  describe('setTimezone', () => {
    it('should update the timezone property', () => {
      const context = createContext(TestLanguages.English, 'admin');
      const newTimezone = new Timezone('America/New_York');

      setTimezone(context, newTimezone);

      expect(context.timezone).toBe(newTimezone);
      expect(context.adminTimezone).toEqual(
        expect.objectContaining({ _timezone: 'UTC' }),
      ); // Should remain unchanged
    });

    it('should work with different timezone values', () => {
      const context = createContext(TestLanguages.English, 'admin');
      const europeTimezone = new Timezone('Europe/London');

      setTimezone(context, europeTimezone);

      expect(context.timezone).toBe(europeTimezone);
    });
  });

  describe('setAdminTimezone', () => {
    it('should update the adminTimezone property', () => {
      const context = createContext(TestLanguages.English, 'admin');
      const newAdminTimezone = new Timezone('Asia/Tokyo');

      setAdminTimezone(context, newAdminTimezone);

      expect(context.adminTimezone).toBe(newAdminTimezone);
      expect(context.timezone).toEqual(
        expect.objectContaining({ _timezone: 'UTC' }),
      ); // Should remain unchanged
    });

    it('should work independently of regular timezone', () => {
      const context = createContext(TestLanguages.English, 'admin');
      const userTimezone = new Timezone('America/Los_Angeles');
      const adminTimezone = new Timezone('Europe/Paris');

      setTimezone(context, userTimezone);
      setAdminTimezone(context, adminTimezone);

      expect(context.timezone).toBe(userTimezone);
      expect(context.adminTimezone).toBe(adminTimezone);
    });
  });

  describe('integration', () => {
    it('should allow chaining all context modifications', () => {
      const context = createContext(TestLanguages.English, 'admin');
      const userTimezone = new Timezone('America/Chicago');
      const adminTimezone = new Timezone('Europe/Berlin');

      setLanguage(context, TestLanguages.Spanish);
      setAdminLanguage(context, TestLanguages.French);
      setContext(context, 'user');
      setTimezone(context, userTimezone);
      setAdminTimezone(context, adminTimezone);

      expect(context).toEqual({
        language: TestLanguages.Spanish,
        adminLanguage: TestLanguages.French,
        currentContext: 'user',
        currencyCode: expect.objectContaining({ _value: 'USD' }),
        timezone: userTimezone,
        adminTimezone: adminTimezone,
      });
    });

    it('should maintain object reference', () => {
      const context = createContext(TestLanguages.English, 'admin');
      const originalRef = context;

      setLanguage(context, TestLanguages.Spanish);
      setAdminLanguage(context, TestLanguages.French);
      setContext(context, 'user');
      setTimezone(context, new Timezone('Pacific/Auckland'));
      setAdminTimezone(context, new Timezone('Atlantic/Azores'));

      expect(context).toBe(originalRef);
    });
  });
});
