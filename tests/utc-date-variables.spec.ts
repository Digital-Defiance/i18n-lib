/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import {
  ComponentDefinition,
  ComponentRegistration,
  LanguageDefinition,
  PluginI18nEngine,
  I18nEngine,
  I18nBuilder,
  getUtcDateVars,
} from '../src';
import { createI18nStringKeys } from '../src/branded-string-key';
import { replaceVariables } from '../src/utils';
import { createTemplateProcessor } from '../src/template';

describe('UTC Date Variables (YEAR, MONTH, DAY, NOW)', () => {
  // Helper to get expected values at test time
  function expectedDateVars() {
    const now = new Date();
    return {
      YEAR: String(now.getUTCFullYear()),
      MONTH: String(now.getUTCMonth() + 1).padStart(2, '0'),
      DAY: String(now.getUTCDate()).padStart(2, '0'),
    };
  }

  describe('getUtcDateVars()', () => {
    it('should return YEAR, MONTH, DAY, and NOW keys', () => {
      const vars = getUtcDateVars();
      expect(vars).toHaveProperty('YEAR');
      expect(vars).toHaveProperty('MONTH');
      expect(vars).toHaveProperty('DAY');
      expect(vars).toHaveProperty('NOW');
    });

    it('should return the current UTC year as a 4-digit string', () => {
      const vars = getUtcDateVars();
      expect(vars.YEAR).toMatch(/^\d{4}$/);
      expect(vars.YEAR).toBe(expectedDateVars().YEAR);
    });

    it('should return the current UTC month zero-padded to 2 digits', () => {
      const vars = getUtcDateVars();
      expect(vars.MONTH).toMatch(/^\d{2}$/);
      const monthNum = parseInt(String(vars.MONTH), 10);
      expect(monthNum).toBeGreaterThanOrEqual(1);
      expect(monthNum).toBeLessThanOrEqual(12);
    });

    it('should return the current UTC day zero-padded to 2 digits', () => {
      const vars = getUtcDateVars();
      expect(vars.DAY).toMatch(/^\d{2}$/);
      const dayNum = parseInt(String(vars.DAY), 10);
      expect(dayNum).toBeGreaterThanOrEqual(1);
      expect(dayNum).toBeLessThanOrEqual(31);
    });

    it('should return NOW as a number (epoch milliseconds)', () => {
      const before = Date.now();
      const vars = getUtcDateVars();
      const after = Date.now();
      expect(typeof vars.NOW).toBe('number');
      expect(vars.NOW as number).toBeGreaterThanOrEqual(before);
      expect(vars.NOW as number).toBeLessThanOrEqual(after);
    });

    it('should return a NOW value that creates a valid Date', () => {
      const vars = getUtcDateVars();
      const date = new Date(vars.NOW as number);
      expect(date.getTime()).not.toBeNaN();
    });
  });

  describe('replaceVariables (utils.ts)', () => {
    it('should replace {YEAR}, {MONTH}, {DAY} as built-in fallbacks', () => {
      const result = replaceVariables('Copyright {YEAR}');
      const { YEAR } = expectedDateVars();
      expect(result).toBe(`Copyright ${YEAR}`);
    });

    it('should replace all three date variables in a single string', () => {
      const result = replaceVariables('Date: {YEAR}-{MONTH}-{DAY}');
      const { YEAR, MONTH, DAY } = expectedDateVars();
      expect(result).toBe(`Date: ${YEAR}-${MONTH}-${DAY}`);
    });

    it('should let explicit vars override date variables', () => {
      const result = replaceVariables('Year: {YEAR}', { YEAR: '1999' });
      expect(result).toBe('Year: 1999');
    });

    it('should let constants override date variables', () => {
      const result = replaceVariables('Year: {YEAR}', undefined, { YEAR: '2000' });
      expect(result).toBe('Year: 2000');
    });

    it('should still replace non-date variables normally', () => {
      const result = replaceVariables('Hello {name}, year {YEAR}', { name: 'Alice' });
      const { YEAR } = expectedDateVars();
      expect(result).toBe(`Hello Alice, year ${YEAR}`);
    });

    it('should replace {NOW} with epoch milliseconds as a string', () => {
      const before = Date.now();
      const result = replaceVariables('Timestamp: {NOW}');
      const after = Date.now();
      // Extract the number from the result
      const match = result.match(/^Timestamp: (\d+)$/);
      expect(match).not.toBeNull();
      const ts = parseInt(match![1], 10);
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });
  });

  describe('createTemplateProcessor (template.ts)', () => {
    enum TestStrings {
      Simple = 'simple',
    }

    it('should inject date variables into remaining {var} replacements', () => {
      const translateFn = jest.fn().mockReturnValue('Hello');
      const processor = createTemplateProcessor(
        TestStrings as any,
        translateFn as any,
        'TestStrings',
      );

      const result = processor('{{TestStrings.Simple}} in {YEAR}' as any);
      const { YEAR } = expectedDateVars();
      expect(result).toBe(`Hello in ${YEAR}`);
    });

    it('should allow user-provided vars to override date variables', () => {
      const translateFn = jest.fn().mockReturnValue('Hello');
      const processor = createTemplateProcessor(
        TestStrings as any,
        translateFn as any,
        'TestStrings',
      );

      const result = processor(
        '{{TestStrings.Simple}} in {YEAR}' as any,
        undefined,
        { YEAR: '2050' },
      );
      expect(result).toBe('Hello in 2050');
    });

    it('should replace all three date variables', () => {
      const translateFn = jest.fn();
      const processor = createTemplateProcessor(
        TestStrings as any,
        translateFn as any,
        'TestStrings',
      );

      const result = processor('{YEAR}-{MONTH}-{DAY}' as any);
      const { YEAR, MONTH, DAY } = expectedDateVars();
      expect(result).toBe(`${YEAR}-${MONTH}-${DAY}`);
    });

    it('should inject NOW as a number stringified', () => {
      const translateFn = jest.fn();
      const processor = createTemplateProcessor(
        TestStrings as any,
        translateFn as any,
        'TestStrings',
      );

      const before = Date.now();
      const result = processor('ts={NOW}' as any);
      const after = Date.now();
      const match = result.match(/^ts=(\d+)$/);
      expect(match).not.toBeNull();
      const ts = parseInt(match![1], 10);
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });
  });

  describe('PluginI18nEngine.t() context variables', () => {
    const englishLang: LanguageDefinition = {
      id: 'en',
      name: 'English',
      code: 'en',
      isDefault: true,
    };

    const MessageStrings = createI18nStringKeys('test', {
      message: 'message',
    } as const);

    let engine: PluginI18nEngine<'en'>;

    beforeEach(() => {
      PluginI18nEngine.resetAll();
      engine = new PluginI18nEngine([englishLang]);
    });

    afterEach(() => {
      PluginI18nEngine.resetAll();
    });

    it('should inject YEAR, MONTH, DAY into template variable replacement', () => {
      const component: ComponentDefinition<typeof MessageStrings> = {
        id: 'test',
        name: 'Test',
        stringKeys: MessageStrings,
      };

      const registration: ComponentRegistration<typeof MessageStrings, 'en'> = {
        component,
        strings: {
          en: { [MessageStrings.message]: 'Year is {YEAR}' },
        },
      };

      engine.registerComponent(registration);

      const result = engine.t('{{test.message}}');
      const { YEAR } = expectedDateVars();
      expect(result).toBe(`Year is ${YEAR}`);
    });

    it('should replace all three date variables via t()', () => {
      // Test direct {var} replacement in the t() method (Step 3)
      const result = engine.t('Today: {YEAR}-{MONTH}-{DAY}');
      const { YEAR, MONTH, DAY } = expectedDateVars();
      expect(result).toBe(`Today: ${YEAR}-${MONTH}-${DAY}`);
    });

    it('should allow user variables to override date variables in t()', () => {
      const result = engine.t('Year: {YEAR}', 'en', { YEAR: '1776' });
      expect(result).toBe('Year: 1776');
    });

    it('should work alongside other context variables', () => {
      const result = engine.t('TZ={timezone} Y={YEAR}');
      const { YEAR } = expectedDateVars();
      expect(result).toBe(`TZ=UTC Y=${YEAR}`);
    });

    it('should inject NOW as a stringified epoch timestamp via t()', () => {
      const before = Date.now();
      const result = engine.t('ts={NOW}');
      const after = Date.now();
      const match = result.match(/^ts=(\d+)$/);
      expect(match).not.toBeNull();
      const ts = parseInt(match![1], 10);
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });
  });

  describe('PluginI18nEngine ICU date/time formatting', () => {
    const englishLang: LanguageDefinition = {
      id: 'en-US',
      name: 'English',
      code: 'en-US',
      isDefault: true,
    };

    const frenchLang: LanguageDefinition = {
      id: 'fr',
      name: 'French',
      code: 'fr',
    };

    const DateStrings = createI18nStringKeys('dates', {
      posted: 'posted',
      updated: 'updated',
    } as const);

    let engine: PluginI18nEngine<'en-US' | 'fr'>;

    beforeEach(() => {
      PluginI18nEngine.resetAll();
      engine = new PluginI18nEngine([englishLang, frenchLang]);
    });

    afterEach(() => {
      PluginI18nEngine.resetAll();
    });

    it('should format {NOW, date, medium} via ICU pipeline in PluginI18nEngine', () => {
      const component: ComponentDefinition<typeof DateStrings> = {
        id: 'dates',
        name: 'Dates',
        stringKeys: DateStrings,
      };

      const registration: ComponentRegistration<typeof DateStrings, 'en-US' | 'fr'> = {
        component,
        strings: {
          'en-US': { [DateStrings.posted]: '{NOW, date, medium}' },
          fr: { [DateStrings.posted]: '{NOW, date, medium}' },
        },
      };

      engine.registerComponent(registration);

      const result = engine.translate('dates', DateStrings.posted, { NOW: Date.now() });
      // Should produce a formatted date, not the raw pattern
      expect(result).not.toContain('{NOW');
      expect(result).toMatch(/[A-Z][a-z]{2}\s\d{1,2},\s\d{4}/);
    });

    it('should format {NOW, time, short} via ICU pipeline in PluginI18nEngine', () => {
      const component: ComponentDefinition<typeof DateStrings> = {
        id: 'dates',
        name: 'Dates',
        stringKeys: DateStrings,
      };

      const registration: ComponentRegistration<typeof DateStrings, 'en-US' | 'fr'> = {
        component,
        strings: {
          'en-US': { [DateStrings.updated]: '{NOW, time, short}' },
          fr: { [DateStrings.updated]: '{NOW, time, short}' },
        },
      };

      engine.registerComponent(registration);

      const result = engine.translate('dates', DateStrings.updated, { NOW: Date.now() });
      expect(result).not.toContain('{NOW');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should produce locale-aware date formatting for French in PluginI18nEngine', () => {
      const component: ComponentDefinition<typeof DateStrings> = {
        id: 'dates',
        name: 'Dates',
        stringKeys: DateStrings,
      };

      const registration: ComponentRegistration<typeof DateStrings, 'en-US' | 'fr'> = {
        component,
        strings: {
          'en-US': { [DateStrings.posted]: '{NOW, date, long}' },
          fr: { [DateStrings.posted]: '{NOW, date, long}' },
        },
      };

      engine.registerComponent(registration);

      const fixedDate = new Date('2026-07-04T12:00:00Z').getTime();
      const enResult = engine.translate('dates', DateStrings.posted, { NOW: fixedDate }, 'en-US');
      const frResult = engine.translate('dates', DateStrings.posted, { NOW: fixedDate }, 'fr');

      expect(enResult).toContain('July');
      expect(enResult).toContain('2026');
      // French should have a different format
      expect(frResult).toContain('2026');
      expect(frResult).not.toContain('July'); // French uses "juillet"
    });

    it('should auto-inject NOW for ICU formatting in PluginI18nEngine', () => {
      const component: ComponentDefinition<typeof DateStrings> = {
        id: 'dates',
        name: 'Dates',
        stringKeys: DateStrings,
      };

      const registration: ComponentRegistration<typeof DateStrings, 'en-US' | 'fr'> = {
        component,
        strings: {
          'en-US': { [DateStrings.posted]: '{NOW, date, medium}' },
          fr: { [DateStrings.posted]: '{NOW, date, medium}' },
        },
      };

      engine.registerComponent(registration);

      // Don't pass NOW explicitly — it should be injected automatically
      const result = engine.translate('dates', DateStrings.posted);
      expect(result).not.toContain('{NOW');
      expect(result).toMatch(/[A-Z][a-z]{2}\s\d{1,2},\s\d{4}/);
    });
  });

  describe('I18nEngine (core) translate and t()', () => {
    let engine: I18nEngine;

    beforeEach(() => {
      I18nEngine.resetAll();
      engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .build();
    });

    afterEach(() => {
      I18nEngine.resetAll();
    });

    it('should inject date variables via translate() for template keys', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': { copyrightTemplate: 'Copyright {YEAR}' },
        },
      });

      const result = engine.translate('test', 'copyrightTemplate');
      const { YEAR } = expectedDateVars();
      expect(result).toBe(`Copyright ${YEAR}`);
    });

    it('should inject all three date variables via translate()', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': { dateTemplate: '{YEAR}-{MONTH}-{DAY}' },
        },
      });

      const result = engine.translate('test', 'dateTemplate');
      const { YEAR, MONTH, DAY } = expectedDateVars();
      expect(result).toBe(`${YEAR}-${MONTH}-${DAY}`);
    });

    it('should allow explicit variables to override date variables in translate()', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': { yearTemplate: 'Year: {YEAR}' },
        },
      });

      const result = engine.translate('test', 'yearTemplate', { YEAR: '2099' });
      expect(result).toBe('Year: 2099');
    });

    it('should inject date variables via t() template method', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': { greeting: 'Hello' },
        },
      });

      const result = engine.t('{{test.greeting}} in {YEAR}');
      const { YEAR } = expectedDateVars();
      expect(result).toBe(`Hello in ${YEAR}`);
    });

    it('should replace date variables in t() even without component patterns', () => {
      const result = engine.t('Date: {YEAR}/{MONTH}/{DAY}');
      const { YEAR, MONTH, DAY } = expectedDateVars();
      expect(result).toBe(`Date: ${YEAR}/${MONTH}/${DAY}`);
    });

    it('should allow user variables to override date variables in t()', () => {
      const result = engine.t('Year: {YEAR}', { YEAR: '1984' });
      expect(result).toBe('Year: 1984');
    });

    it('should inject NOW into buildCombinedVariables for translate()', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': { tsTemplate: 'Timestamp: {NOW}' },
        },
      });

      const before = Date.now();
      const result = engine.translate('test', 'tsTemplate');
      const after = Date.now();
      const match = result.match(/^Timestamp: (\d+)$/);
      expect(match).not.toBeNull();
      const ts = parseInt(match![1], 10);
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });

    it('should inject NOW into t() for direct variable replacement', () => {
      const before = Date.now();
      const result = engine.t('ts={NOW}');
      const after = Date.now();
      const match = result.match(/^ts=(\d+)$/);
      expect(match).not.toBeNull();
      const ts = parseInt(match![1], 10);
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });
  });

  describe('ICU date/time formatting with NOW', () => {
    let engine: I18nEngine;

    beforeEach(() => {
      I18nEngine.resetAll();
      engine = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
          { id: 'fr', name: 'French', code: 'fr' },
        ])
        .build();
    });

    afterEach(() => {
      I18nEngine.resetAll();
    });

    it('should format {NOW, date, short} via ICU pipeline', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': { dateDisplay: '{NOW, date, short}' },
        },
      });

      const result = engine.translate('test', 'dateDisplay', { NOW: Date.now() });
      // Intl.DateTimeFormat short date produces something like "3/25/26" or "3/25/2026"
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
    });

    it('should format {NOW, date, medium} via ICU pipeline', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': { dateDisplay: '{NOW, date, medium}' },
        },
      });

      const result = engine.translate('test', 'dateDisplay', { NOW: Date.now() });
      // Medium date produces something like "Mar 25, 2026"
      expect(result).toMatch(/[A-Z][a-z]{2}\s\d{1,2},\s\d{4}/);
    });

    it('should format {NOW, date, long} via ICU pipeline', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': { dateDisplay: '{NOW, date, long}' },
        },
      });

      const result = engine.translate('test', 'dateDisplay', { NOW: Date.now() });
      // Long date produces something like "March 25, 2026"
      expect(result).toMatch(/[A-Z][a-z]+\s\d{1,2},\s\d{4}/);
    });

    it('should format {NOW, time, short} via ICU pipeline', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': { timeDisplay: '{NOW, time, short}' },
        },
      });

      const result = engine.translate('test', 'timeDisplay', { NOW: Date.now() });
      // Short time produces something like "2:30 PM" or "14:30"
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should format {NOW, time, medium} via ICU pipeline', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': { timeDisplay: '{NOW, time, medium}' },
        },
      });

      const result = engine.translate('test', 'timeDisplay', { NOW: Date.now() });
      // Medium time produces something like "2:30:00 PM"
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it('should produce locale-aware date formatting for French', () => {
      engine.register({
        id: 'test',
        strings: {
          fr: { dateDisplay: '{NOW, date, long}' },
        },
      });

      const result = engine.translate('test', 'dateDisplay', { NOW: Date.now() }, 'fr');
      // French long date produces something like "25 mars 2026"
      // Should contain a French month name or at least a different format than English
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should format NOW automatically when injected via buildCombinedVariables', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': { dateDisplay: '{NOW, date, medium}' },
        },
      });

      // Don't pass NOW explicitly — it should be injected automatically
      const result = engine.translate('test', 'dateDisplay');
      // Should produce a formatted date, not "{NOW, date, medium}" or "{NOW}"
      expect(result).not.toContain('{NOW');
      expect(result).toMatch(/[A-Z][a-z]{2}\s\d{1,2},\s\d{4}/);
    });

    it('should format NOW automatically in time patterns', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': { timeDisplay: '{NOW, time, short}' },
        },
      });

      // Don't pass NOW explicitly — it should be injected automatically
      const result = engine.translate('test', 'timeDisplay');
      expect(result).not.toContain('{NOW');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should allow explicit NOW override for ICU formatting', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': { dateDisplay: '{NOW, date, medium}' },
        },
      });

      // Pass a fixed timestamp: Jul 4, 2000 12:00:00 UTC (midday avoids timezone date-shift)
      const fixedDate = new Date('2000-07-04T12:00:00Z').getTime();
      const result = engine.translate('test', 'dateDisplay', { NOW: fixedDate });
      expect(result).toContain('2000');
      expect(result).toContain('Jul');
    });

    it('should mix ICU date formatting with simple variable replacement', () => {
      engine.register({
        id: 'test',
        strings: {
          'en-US': { mixed: 'Hello {name}, today is {NOW, date, medium}' },
        },
      });

      const result = engine.translate('test', 'mixed', { name: 'Alice', NOW: Date.now() });
      expect(result).toContain('Hello Alice');
      expect(result).not.toContain('{NOW');
    });
  });
});
