/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

/**
 * Tests for CLDR Plural Rules
 */

import {
  getAllPluralForms,
  getPluralCategory,
  getRequiredPluralForms,
  hasPluralForm,
} from '../../src/pluralization/language-plural-map';
import {
  pluralRuleArabic,
  pluralRuleBreton,
  pluralRuleChinese,
  pluralRuleCzech,
  pluralRuleEnglish,
  pluralRuleFrench,
  pluralRuleGerman,
  pluralRuleIrish,
  pluralRuleJapanese,
  pluralRuleLatvian,
  pluralRuleLithuanian,
  pluralRulePolish,
  pluralRuleRomanian,
  pluralRuleRussian,
  pluralRuleScottishGaelic,
  pluralRuleSlovenian,
  pluralRuleSpanish,
  pluralRuleUkrainian,
  pluralRuleWelsh,
} from '../../src/pluralization/plural-rules';

describe('Plural Rules', () => {
  describe('English (en-US, en-GB)', () => {
    it('should return "one" for 1', () => {
      expect(pluralRuleEnglish(1)).toBe('one');
    });

    it('should return "other" for 0', () => {
      expect(pluralRuleEnglish(0)).toBe('other');
    });

    it('should return "other" for 2', () => {
      expect(pluralRuleEnglish(2)).toBe('other');
    });

    it('should return "other" for 5', () => {
      expect(pluralRuleEnglish(5)).toBe('other');
    });

    it('should return "other" for 21', () => {
      expect(pluralRuleEnglish(21)).toBe('other');
    });

    it('should return "other" for 100', () => {
      expect(pluralRuleEnglish(100)).toBe('other');
    });

    it('should return "other" for 1.5', () => {
      expect(pluralRuleEnglish(1.5)).toBe('other');
    });
  });

  describe('Russian (ru)', () => {
    // Test "one" form: ends in 1, but not 11
    it('should return "one" for 1', () => {
      expect(pluralRuleRussian(1)).toBe('one');
    });

    it('should return "one" for 21', () => {
      expect(pluralRuleRussian(21)).toBe('one');
    });

    it('should return "one" for 31', () => {
      expect(pluralRuleRussian(31)).toBe('one');
    });

    it('should return "one" for 101', () => {
      expect(pluralRuleRussian(101)).toBe('one');
    });

    it('should return "one" for 1001', () => {
      expect(pluralRuleRussian(1001)).toBe('one');
    });

    // Test "few" form: ends in 2-4, but not 12-14
    it('should return "few" for 2', () => {
      expect(pluralRuleRussian(2)).toBe('few');
    });

    it('should return "few" for 3', () => {
      expect(pluralRuleRussian(3)).toBe('few');
    });

    it('should return "few" for 4', () => {
      expect(pluralRuleRussian(4)).toBe('few');
    });

    it('should return "few" for 22', () => {
      expect(pluralRuleRussian(22)).toBe('few');
    });

    it('should return "few" for 23', () => {
      expect(pluralRuleRussian(23)).toBe('few');
    });

    it('should return "few" for 24', () => {
      expect(pluralRuleRussian(24)).toBe('few');
    });

    it('should return "few" for 102', () => {
      expect(pluralRuleRussian(102)).toBe('few');
    });

    it('should return "few" for 103', () => {
      expect(pluralRuleRussian(103)).toBe('few');
    });

    it('should return "few" for 104', () => {
      expect(pluralRuleRussian(104)).toBe('few');
    });

    // Test "many" form: all others including 0, 5-20, 25-30, etc.
    it('should return "many" for 0', () => {
      expect(pluralRuleRussian(0)).toBe('many');
    });

    it('should return "many" for 5', () => {
      expect(pluralRuleRussian(5)).toBe('many');
    });

    it('should return "many" for 6', () => {
      expect(pluralRuleRussian(6)).toBe('many');
    });

    it('should return "many" for 10', () => {
      expect(pluralRuleRussian(10)).toBe('many');
    });

    // Critical: 11-14 should be "many" not "one"/"few"
    it('should return "many" for 11 (not "one")', () => {
      expect(pluralRuleRussian(11)).toBe('many');
    });

    it('should return "many" for 12 (not "few")', () => {
      expect(pluralRuleRussian(12)).toBe('many');
    });

    it('should return "many" for 13 (not "few")', () => {
      expect(pluralRuleRussian(13)).toBe('many');
    });

    it('should return "many" for 14 (not "few")', () => {
      expect(pluralRuleRussian(14)).toBe('many');
    });

    it('should return "many" for 15', () => {
      expect(pluralRuleRussian(15)).toBe('many');
    });

    it('should return "many" for 20', () => {
      expect(pluralRuleRussian(20)).toBe('many');
    });

    it('should return "many" for 25', () => {
      expect(pluralRuleRussian(25)).toBe('many');
    });

    it('should return "many" for 30', () => {
      expect(pluralRuleRussian(30)).toBe('many');
    });

    it('should return "many" for 100', () => {
      expect(pluralRuleRussian(100)).toBe('many');
    });

    it('should return "many" for 105', () => {
      expect(pluralRuleRussian(105)).toBe('many');
    });

    it('should return "many" for 111 (not "one")', () => {
      expect(pluralRuleRussian(111)).toBe('many');
    });

    it('should return "many" for 112 (not "few")', () => {
      expect(pluralRuleRussian(112)).toBe('many');
    });
  });

  describe('Arabic (ar)', () => {
    // Test "zero" form
    it('should return "zero" for 0', () => {
      expect(pluralRuleArabic(0)).toBe('zero');
    });

    // Test "one" form
    it('should return "one" for 1', () => {
      expect(pluralRuleArabic(1)).toBe('one');
    });

    // Test "two" form
    it('should return "two" for 2', () => {
      expect(pluralRuleArabic(2)).toBe('two');
    });

    // Test "few" form: 3-10, 103-110, 203-210, etc.
    it('should return "few" for 3', () => {
      expect(pluralRuleArabic(3)).toBe('few');
    });

    it('should return "few" for 4', () => {
      expect(pluralRuleArabic(4)).toBe('few');
    });

    it('should return "few" for 5', () => {
      expect(pluralRuleArabic(5)).toBe('few');
    });

    it('should return "few" for 10', () => {
      expect(pluralRuleArabic(10)).toBe('few');
    });

    it('should return "few" for 103', () => {
      expect(pluralRuleArabic(103)).toBe('few');
    });

    it('should return "few" for 110', () => {
      expect(pluralRuleArabic(110)).toBe('few');
    });

    it('should return "few" for 203', () => {
      expect(pluralRuleArabic(203)).toBe('few');
    });

    // Test "many" form: 11-99, 111-199, 211-299, etc.
    it('should return "many" for 11', () => {
      expect(pluralRuleArabic(11)).toBe('many');
    });

    it('should return "many" for 12', () => {
      expect(pluralRuleArabic(12)).toBe('many');
    });

    it('should return "many" for 20', () => {
      expect(pluralRuleArabic(20)).toBe('many');
    });

    it('should return "many" for 50', () => {
      expect(pluralRuleArabic(50)).toBe('many');
    });

    it('should return "many" for 99', () => {
      expect(pluralRuleArabic(99)).toBe('many');
    });

    it('should return "many" for 111', () => {
      expect(pluralRuleArabic(111)).toBe('many');
    });

    it('should return "many" for 199', () => {
      expect(pluralRuleArabic(199)).toBe('many');
    });

    it('should return "many" for 211', () => {
      expect(pluralRuleArabic(211)).toBe('many');
    });

    // Test "other" form: 100, 200, 300, etc. and 101, 102, 201, 202
    it('should return "other" for 100', () => {
      expect(pluralRuleArabic(100)).toBe('other');
    });

    it('should return "other" for 101', () => {
      expect(pluralRuleArabic(101)).toBe('other');
    });

    it('should return "other" for 102', () => {
      expect(pluralRuleArabic(102)).toBe('other');
    });

    it('should return "other" for 200', () => {
      expect(pluralRuleArabic(200)).toBe('other');
    });

    it('should return "other" for 201', () => {
      expect(pluralRuleArabic(201)).toBe('other');
    });

    it('should return "other" for 202', () => {
      expect(pluralRuleArabic(202)).toBe('other');
    });

    it('should return "other" for 1000', () => {
      expect(pluralRuleArabic(1000)).toBe('other');
    });
  });

  describe('Polish (pl)', () => {
    // Test "one" form: exactly 1
    it('should return "one" for 1', () => {
      expect(pluralRulePolish(1)).toBe('one');
    });

    // Test "few" form: ends in 2-4, but not 12-14
    it('should return "few" for 2', () => {
      expect(pluralRulePolish(2)).toBe('few');
    });

    it('should return "few" for 3', () => {
      expect(pluralRulePolish(3)).toBe('few');
    });

    it('should return "few" for 4', () => {
      expect(pluralRulePolish(4)).toBe('few');
    });

    it('should return "few" for 22', () => {
      expect(pluralRulePolish(22)).toBe('few');
    });

    it('should return "few" for 23', () => {
      expect(pluralRulePolish(23)).toBe('few');
    });

    it('should return "few" for 24', () => {
      expect(pluralRulePolish(24)).toBe('few');
    });

    it('should return "few" for 32', () => {
      expect(pluralRulePolish(32)).toBe('few');
    });

    it('should return "few" for 102', () => {
      expect(pluralRulePolish(102)).toBe('few');
    });

    // Test "many" form: 0, 5-21, 25-31, etc. (but not 1)
    it('should return "many" for 0', () => {
      expect(pluralRulePolish(0)).toBe('many');
    });

    it('should return "many" for 5', () => {
      expect(pluralRulePolish(5)).toBe('many');
    });

    it('should return "many" for 6', () => {
      expect(pluralRulePolish(6)).toBe('many');
    });

    it('should return "many" for 10', () => {
      expect(pluralRulePolish(10)).toBe('many');
    });

    it('should return "many" for 11', () => {
      expect(pluralRulePolish(11)).toBe('many');
    });

    // Critical: 12-14 should be "many" not "few"
    it('should return "many" for 12 (not "few")', () => {
      expect(pluralRulePolish(12)).toBe('many');
    });

    it('should return "many" for 13 (not "few")', () => {
      expect(pluralRulePolish(13)).toBe('many');
    });

    it('should return "many" for 14 (not "few")', () => {
      expect(pluralRulePolish(14)).toBe('many');
    });

    it('should return "many" for 15', () => {
      expect(pluralRulePolish(15)).toBe('many');
    });

    it('should return "many" for 20', () => {
      expect(pluralRulePolish(20)).toBe('many');
    });

    it('should return "many" for 21', () => {
      expect(pluralRulePolish(21)).toBe('many');
    });

    it('should return "many" for 25', () => {
      expect(pluralRulePolish(25)).toBe('many');
    });

    it('should return "many" for 100', () => {
      expect(pluralRulePolish(100)).toBe('many');
    });

    it('should return "many" for 101', () => {
      expect(pluralRulePolish(101)).toBe('many');
    });

    it('should return "many" for 111', () => {
      expect(pluralRulePolish(111)).toBe('many');
    });

    it('should return "many" for 112', () => {
      expect(pluralRulePolish(112)).toBe('many');
    });

    // Test "other" form: fractional numbers
    it('should return "other" for 0.5', () => {
      expect(pluralRulePolish(0.5)).toBe('other');
    });

    it('should return "other" for 1.5', () => {
      expect(pluralRulePolish(1.5)).toBe('other');
    });

    it('should return "other" for 2.5', () => {
      expect(pluralRulePolish(2.5)).toBe('other');
    });
  });

  describe('French (fr)', () => {
    it('should return "one" for 0', () => {
      expect(pluralRuleFrench(0)).toBe('one');
    });

    it('should return "one" for 1', () => {
      expect(pluralRuleFrench(1)).toBe('one');
    });

    it('should return "other" for 2', () => {
      expect(pluralRuleFrench(2)).toBe('other');
    });

    it('should return "other" for 1.5', () => {
      expect(pluralRuleFrench(1.5)).toBe('other');
    });
  });

  describe('Spanish (es)', () => {
    it('should return "one" for 1', () => {
      expect(pluralRuleSpanish(1)).toBe('one');
    });

    it('should return "other" for 2', () => {
      expect(pluralRuleSpanish(2)).toBe('other');
    });

    it('should return "other" for 0', () => {
      expect(pluralRuleSpanish(0)).toBe('other');
    });
  });

  describe('Japanese (ja)', () => {
    it('should return "other" for 0', () => {
      expect(pluralRuleJapanese(0)).toBe('other');
    });

    it('should return "other" for 1', () => {
      expect(pluralRuleJapanese(1)).toBe('other');
    });

    it('should return "other" for 2', () => {
      expect(pluralRuleJapanese(2)).toBe('other');
    });

    it('should return "other" for 100', () => {
      expect(pluralRuleJapanese(100)).toBe('other');
    });
  });

  describe('Ukrainian (uk)', () => {
    it('should return "one" for 1', () => {
      expect(pluralRuleUkrainian(1)).toBe('one');
    });

    it('should return "few" for 2', () => {
      expect(pluralRuleUkrainian(2)).toBe('few');
    });

    it('should return "many" for 5', () => {
      expect(pluralRuleUkrainian(5)).toBe('many');
    });

    it('should return "one" for 21', () => {
      expect(pluralRuleUkrainian(21)).toBe('one');
    });

    it('should return "few" for 22', () => {
      expect(pluralRuleUkrainian(22)).toBe('few');
    });

    it('should return "many" for 25', () => {
      expect(pluralRuleUkrainian(25)).toBe('many');
    });
  });

  describe('Scottish Gaelic (gd)', () => {
    // One of the most complex plural systems
    it('should return "one" for 1', () => {
      expect(pluralRuleScottishGaelic(1)).toBe('one');
    });

    it('should return "one" for 11', () => {
      expect(pluralRuleScottishGaelic(11)).toBe('one');
    });

    it('should return "two" for 2', () => {
      expect(pluralRuleScottishGaelic(2)).toBe('two');
    });

    it('should return "two" for 12', () => {
      expect(pluralRuleScottishGaelic(12)).toBe('two');
    });

    it('should return "few" for 3', () => {
      expect(pluralRuleScottishGaelic(3)).toBe('few');
    });

    it('should return "few" for 10', () => {
      expect(pluralRuleScottishGaelic(10)).toBe('few');
    });

    it('should return "few" for 13', () => {
      expect(pluralRuleScottishGaelic(13)).toBe('few');
    });

    it('should return "few" for 19', () => {
      expect(pluralRuleScottishGaelic(19)).toBe('few');
    });

    it('should return "other" for 0', () => {
      expect(pluralRuleScottishGaelic(0)).toBe('other');
    });

    it('should return "other" for 20', () => {
      expect(pluralRuleScottishGaelic(20)).toBe('other');
    });

    it('should return "other" for 21', () => {
      expect(pluralRuleScottishGaelic(21)).toBe('other');
    });

    it('should return "other" for 100', () => {
      expect(pluralRuleScottishGaelic(100)).toBe('other');
    });
  });

  describe('Welsh (cy)', () => {
    it('should return "zero" for 0', () => {
      expect(pluralRuleWelsh(0)).toBe('zero');
    });

    it('should return "one" for 1', () => {
      expect(pluralRuleWelsh(1)).toBe('one');
    });

    it('should return "two" for 2', () => {
      expect(pluralRuleWelsh(2)).toBe('two');
    });

    it('should return "few" for 3', () => {
      expect(pluralRuleWelsh(3)).toBe('few');
    });

    it('should return "many" for 6', () => {
      expect(pluralRuleWelsh(6)).toBe('many');
    });

    it('should return "other" for 4', () => {
      expect(pluralRuleWelsh(4)).toBe('other');
    });

    it('should return "other" for 5', () => {
      expect(pluralRuleWelsh(5)).toBe('other');
    });

    it('should return "other" for 7', () => {
      expect(pluralRuleWelsh(7)).toBe('other');
    });

    it('should return "other" for 100', () => {
      expect(pluralRuleWelsh(100)).toBe('other');
    });
  });

  describe('Breton (br)', () => {
    it('should return "one" for 1', () => {
      expect(pluralRuleBreton(1)).toBe('one');
    });

    it('should return "one" for 21', () => {
      expect(pluralRuleBreton(21)).toBe('one');
    });

    it('should return "other" for 11 (not "one")', () => {
      expect(pluralRuleBreton(11)).toBe('other');
    });

    it('should return "other" for 71 (not "one")', () => {
      expect(pluralRuleBreton(71)).toBe('other');
    });

    it('should return "other" for 91 (not "one")', () => {
      expect(pluralRuleBreton(91)).toBe('other');
    });

    it('should return "two" for 2', () => {
      expect(pluralRuleBreton(2)).toBe('two');
    });

    it('should return "two" for 22', () => {
      expect(pluralRuleBreton(22)).toBe('two');
    });

    it('should return "other" for 12 (not "two")', () => {
      expect(pluralRuleBreton(12)).toBe('other');
    });

    it('should return "few" for 3', () => {
      expect(pluralRuleBreton(3)).toBe('few');
    });

    it('should return "few" for 9', () => {
      expect(pluralRuleBreton(9)).toBe('few');
    });

    it('should return "many" for 1000000', () => {
      expect(pluralRuleBreton(1000000)).toBe('many');
    });

    it('should return "other" for 5', () => {
      expect(pluralRuleBreton(5)).toBe('other');
    });
  });

  describe('Slovenian (sl)', () => {
    it('should return "one" for 1', () => {
      expect(pluralRuleSlovenian(1)).toBe('one');
    });

    it('should return "one" for 101', () => {
      expect(pluralRuleSlovenian(101)).toBe('one');
    });

    it('should return "two" for 2', () => {
      expect(pluralRuleSlovenian(2)).toBe('two');
    });

    it('should return "two" for 102', () => {
      expect(pluralRuleSlovenian(102)).toBe('two');
    });

    it('should return "few" for 3', () => {
      expect(pluralRuleSlovenian(3)).toBe('few');
    });

    it('should return "few" for 4', () => {
      expect(pluralRuleSlovenian(4)).toBe('few');
    });

    it('should return "other" for 5', () => {
      expect(pluralRuleSlovenian(5)).toBe('other');
    });
  });

  describe('Czech (cs)', () => {
    it('should return "one" for 1', () => {
      expect(pluralRuleCzech(1)).toBe('one');
    });

    it('should return "few" for 2', () => {
      expect(pluralRuleCzech(2)).toBe('few');
    });

    it('should return "few" for 4', () => {
      expect(pluralRuleCzech(4)).toBe('few');
    });

    it('should return "many" for 1.5', () => {
      expect(pluralRuleCzech(1.5)).toBe('many');
    });

    it('should return "other" for 5', () => {
      expect(pluralRuleCzech(5)).toBe('other');
    });
  });

  describe('Lithuanian (lt)', () => {
    it('should return "one" for 1', () => {
      expect(pluralRuleLithuanian(1)).toBe('one');
    });

    it('should return "one" for 21', () => {
      expect(pluralRuleLithuanian(21)).toBe('one');
    });

    it('should return "other" for 11 (not "one")', () => {
      expect(pluralRuleLithuanian(11)).toBe('other');
    });

    it('should return "few" for 2', () => {
      expect(pluralRuleLithuanian(2)).toBe('few');
    });

    it('should return "few" for 9', () => {
      expect(pluralRuleLithuanian(9)).toBe('few');
    });

    it('should return "many" for 1.5', () => {
      expect(pluralRuleLithuanian(1.5)).toBe('many');
    });

    it('should return "other" for 10', () => {
      expect(pluralRuleLithuanian(10)).toBe('other');
    });
  });

  describe('Latvian (lv)', () => {
    it('should return "zero" for 0', () => {
      expect(pluralRuleLatvian(0)).toBe('zero');
    });

    it('should return "one" for 1', () => {
      expect(pluralRuleLatvian(1)).toBe('one');
    });

    it('should return "one" for 21', () => {
      expect(pluralRuleLatvian(21)).toBe('one');
    });

    it('should return "other" for 11 (not "one")', () => {
      expect(pluralRuleLatvian(11)).toBe('other');
    });

    it('should return "other" for 2', () => {
      expect(pluralRuleLatvian(2)).toBe('other');
    });
  });

  describe('Irish (ga)', () => {
    it('should return "one" for 1', () => {
      expect(pluralRuleIrish(1)).toBe('one');
    });

    it('should return "two" for 2', () => {
      expect(pluralRuleIrish(2)).toBe('two');
    });

    it('should return "few" for 3', () => {
      expect(pluralRuleIrish(3)).toBe('few');
    });

    it('should return "few" for 6', () => {
      expect(pluralRuleIrish(6)).toBe('few');
    });

    it('should return "many" for 7', () => {
      expect(pluralRuleIrish(7)).toBe('many');
    });

    it('should return "many" for 10', () => {
      expect(pluralRuleIrish(10)).toBe('many');
    });

    it('should return "other" for 11', () => {
      expect(pluralRuleIrish(11)).toBe('other');
    });
  });

  describe('Romanian (ro)', () => {
    it('should return "one" for 1', () => {
      expect(pluralRuleRomanian(1)).toBe('one');
    });

    it('should return "few" for 0', () => {
      expect(pluralRuleRomanian(0)).toBe('few');
    });

    it('should return "few" for 2', () => {
      expect(pluralRuleRomanian(2)).toBe('few');
    });

    it('should return "few" for 19', () => {
      expect(pluralRuleRomanian(19)).toBe('few');
    });

    it('should return "other" for 20', () => {
      expect(pluralRuleRomanian(20)).toBe('other');
    });

    it('should return "other" for 100', () => {
      expect(pluralRuleRomanian(100)).toBe('other');
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative numbers (English)', () => {
      expect(getPluralCategory('en', -1)).toBe('one');
      expect(getPluralCategory('en', -2)).toBe('other');
    });

    it('should handle decimals (English)', () => {
      expect(pluralRuleEnglish(0.5)).toBe('other');
      expect(pluralRuleEnglish(1.1)).toBe('other');
    });

    it('should handle very large numbers (Russian)', () => {
      expect(pluralRuleRussian(1000001)).toBe('one');
      expect(pluralRuleRussian(1000002)).toBe('few');
    });

    it('should handle zero consistently', () => {
      expect(pluralRuleEnglish(0)).toBe('other');
      expect(pluralRuleRussian(0)).toBe('many');
      expect(pluralRuleArabic(0)).toBe('zero');
      expect(pluralRuleFrench(0)).toBe('one');
    });

    it('should handle boundary numbers for Russian 11-14 exception', () => {
      expect(pluralRuleRussian(10)).toBe('many');
      expect(pluralRuleRussian(11)).toBe('many');
      expect(pluralRuleRussian(14)).toBe('many');
      expect(pluralRuleRussian(15)).toBe('many');
      expect(pluralRuleRussian(111)).toBe('many');
      expect(pluralRuleRussian(211)).toBe('many');
    });

    it('should handle boundary numbers for Polish 12-14 exception', () => {
      expect(pluralRulePolish(11)).toBe('many');
      expect(pluralRulePolish(12)).toBe('many');
      expect(pluralRulePolish(14)).toBe('many');
      expect(pluralRulePolish(15)).toBe('many');
      expect(pluralRulePolish(112)).toBe('many');
    });

    it('should handle Arabic boundary numbers', () => {
      expect(pluralRuleArabic(2)).toBe('two');
      expect(pluralRuleArabic(3)).toBe('few');
      expect(pluralRuleArabic(10)).toBe('few');
      expect(pluralRuleArabic(11)).toBe('many');
      expect(pluralRuleArabic(99)).toBe('many');
      expect(pluralRuleArabic(100)).toBe('other');
    });

    it('should handle very small decimals', () => {
      expect(pluralRuleEnglish(0.001)).toBe('other');
      expect(pluralRulePolish(0.001)).toBe('other');
    });

    it('should handle numbers ending in specific digits', () => {
      // Test mod10 logic
      expect(pluralRuleRussian(31)).toBe('one');
      expect(pluralRuleRussian(41)).toBe('one');
      expect(pluralRuleRussian(51)).toBe('one');
      expect(pluralRuleRussian(32)).toBe('few');
      expect(pluralRuleRussian(43)).toBe('few');
      expect(pluralRuleRussian(54)).toBe('few');
    });
  });

  describe('Chinese (zh)', () => {
    it('should always return "other"', () => {
      expect(pluralRuleChinese(0)).toBe('other');
      expect(pluralRuleChinese(1)).toBe('other');
      expect(pluralRuleChinese(2)).toBe('other');
      expect(pluralRuleChinese(100)).toBe('other');
    });
  });

  describe('German (de)', () => {
    it('should follow English rules', () => {
      expect(pluralRuleGerman(1)).toBe('one');
      expect(pluralRuleGerman(0)).toBe('other');
      expect(pluralRuleGerman(2)).toBe('other');
    });
  });

  describe('getPluralCategory', () => {
    it('should return correct category for English', () => {
      expect(getPluralCategory('en-US', 1)).toBe('one');
      expect(getPluralCategory('en-US', 2)).toBe('other');
    });

    it('should return correct category for Russian', () => {
      expect(getPluralCategory('ru', 1)).toBe('one');
      expect(getPluralCategory('ru', 2)).toBe('few');
      expect(getPluralCategory('ru', 5)).toBe('many');
    });

    it('should handle invalid inputs', () => {
      expect(getPluralCategory('en', NaN)).toBe('other');
      expect(getPluralCategory('en', Infinity)).toBe('other');
      expect(getPluralCategory('en', -Infinity)).toBe('other');
    });

    it('should fallback to English for unknown language', () => {
      expect(getPluralCategory('unknown', 1)).toBe('one');
      expect(getPluralCategory('unknown', 2)).toBe('other');
    });
  });

  describe('getRequiredPluralForms', () => {
    it('should return required forms for English', () => {
      const forms = getRequiredPluralForms('en-US');
      expect(forms).toEqual(['one', 'other']);
    });

    it('should return required forms for Russian', () => {
      const forms = getRequiredPluralForms('ru');
      expect(forms).toEqual(['one', 'few', 'many']);
    });

    it('should return required forms for Arabic', () => {
      const forms = getRequiredPluralForms('ar');
      expect(forms).toEqual(['zero', 'one', 'two', 'few', 'many', 'other']);
    });
  });

  describe('getAllPluralForms', () => {
    it('should return all forms for English', () => {
      const forms = getAllPluralForms('en-US');
      expect(forms).toContain('one');
      expect(forms).toContain('other');
      expect(forms).toContain('zero');
    });

    it('should return all forms for Russian', () => {
      const forms = getAllPluralForms('ru');
      expect(forms).toContain('one');
      expect(forms).toContain('few');
      expect(forms).toContain('many');
      expect(forms).toContain('zero');
    });
  });

  describe('hasPluralForm', () => {
    it('should return true for required forms', () => {
      expect(hasPluralForm('en-US', 'one')).toBe(true);
      expect(hasPluralForm('en-US', 'other')).toBe(true);
    });

    it('should return true for optional forms', () => {
      expect(hasPluralForm('en-US', 'zero')).toBe(true);
    });

    it('should return false for unsupported forms', () => {
      expect(hasPluralForm('en-US', 'few')).toBe(false);
      expect(hasPluralForm('ja', 'one')).toBe(false);
    });
  });
});
