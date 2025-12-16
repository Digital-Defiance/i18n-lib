/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { formatICUMessage } from '../../src/icu/helpers';

describe('Multilingual Edge Cases', () => {
  describe('Russian complex plurals', () => {
    it('should handle 11-14 (many)', () => {
      const msg =
        '{n, plural, one {# день} few {# дня} many {# дней} other {# дней}}';
      expect(formatICUMessage(msg, { n: 11 }, 'ru')).toBe('11 дней');
      expect(formatICUMessage(msg, { n: 12 }, 'ru')).toBe('12 дней');
      expect(formatICUMessage(msg, { n: 14 }, 'ru')).toBe('14 дней');
    });

    it('should handle 21-24 (one/few)', () => {
      const msg =
        '{n, plural, one {# день} few {# дня} many {# дней} other {# дней}}';
      expect(formatICUMessage(msg, { n: 21 }, 'ru')).toBe('21 день');
      expect(formatICUMessage(msg, { n: 22 }, 'ru')).toBe('22 дня');
      expect(formatICUMessage(msg, { n: 24 }, 'ru')).toBe('24 дня');
    });
  });

  describe('Arabic 6-form plurals', () => {
    it('should handle all 6 forms', () => {
      const msg =
        '{n, plural, zero {صفر} one {واحد} two {اثنان} few {# قليل} many {# كثير} other {# آخر}}';
      expect(formatICUMessage(msg, { n: 0 }, 'ar')).toBe('صفر');
      expect(formatICUMessage(msg, { n: 1 }, 'ar')).toBe('واحد');
      expect(formatICUMessage(msg, { n: 2 }, 'ar')).toBe('اثنان');
      expect(formatICUMessage(msg, { n: 5 }, 'ar')).toBe('5 قليل');
      expect(formatICUMessage(msg, { n: 15 }, 'ar')).toBe('15 كثير');
      expect(formatICUMessage(msg, { n: 100 }, 'ar')).toBe('100 آخر');
    });
  });

  describe('Polish edge cases', () => {
    it('should handle 12-14 (many)', () => {
      const msg =
        '{n, plural, one {# przedmiot} few {# przedmioty} many {# przedmiotów} other {# przedmiotów}}';
      expect(formatICUMessage(msg, { n: 12 }, 'pl')).toBe('12 przedmiotów');
      expect(formatICUMessage(msg, { n: 13 }, 'pl')).toBe('13 przedmiotów');
    });
  });

  describe('Mixed scripts', () => {
    it('should handle Latin + Cyrillic', () => {
      const msg =
        'User {name} имеет {n, plural, one {# файл} other {# файлов}}';
      expect(formatICUMessage(msg, { name: 'Alice', n: 5 }, 'ru')).toBe(
        'User Alice имеет 5 файлов',
      );
    });

    it('should handle Latin + Arabic', () => {
      const msg = 'User {name} لديه {n, plural, one {ملف} other {# ملفات}}';
      expect(formatICUMessage(msg, { name: 'Bob', n: 3 }, 'ar')).toBe(
        'User Bob لديه 3 ملفات',
      );
    });

    it('should handle Latin + CJK', () => {
      const msg = 'User {name}は{n}個のアイテムを持っています';
      expect(formatICUMessage(msg, { name: 'Charlie', n: 5 })).toBe(
        'User Charlieは5個のアイテムを持っています',
      );
    });
  });

  describe('RTL text', () => {
    it('should preserve RTL with variables', () => {
      const msg = 'مرحبا {name}، لديك {n} رسائل';
      const result = formatICUMessage(msg, { name: 'أحمد', n: 3 });
      expect(result).toContain('أحمد');
      expect(result).toContain('3');
    });
  });
});
