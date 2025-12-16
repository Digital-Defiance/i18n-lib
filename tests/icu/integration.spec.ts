/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { formatICUMessage } from '../../src/icu/helpers';

describe('ICU Integration', () => {
  describe('Real-world scenarios', () => {
    it('should format e-commerce order', () => {
      const msg =
        '{name} ordered {count, plural, one {# item} other {# items}} for {price, number, currency}';
      const result = formatICUMessage(
        msg,
        { name: 'Alice', count: 3, price: 99.99 },
        'en-US',
      );
      expect(result).toContain('Alice');
      expect(result).toContain('3 items');
      expect(result).toContain('99.99');
    });

    it('should format notification', () => {
      const msg =
        '{sender} sent you {count, plural, one {a message} other {# messages}}';
      expect(formatICUMessage(msg, { sender: 'Bob', count: 1 })).toBe(
        'Bob sent you a message',
      );
      expect(formatICUMessage(msg, { sender: 'Bob', count: 5 })).toBe(
        'Bob sent you 5 messages',
      );
    });

    it('should format with gender and plural', () => {
      const msg =
        '{gender, select, male {He has} female {She has} other {They have}} {count, plural, one {# item} other {# items}}';
      expect(formatICUMessage(msg, { gender: 'male', count: 1 })).toBe(
        'He has 1 item',
      );
      expect(formatICUMessage(msg, { gender: 'female', count: 2 })).toBe(
        'She has 2 items',
      );
    });

    it('should format calendar event', () => {
      const msg =
        'You have {count, plural, zero {no meetings} one {# meeting} other {# meetings}} today';
      expect(formatICUMessage(msg, { count: 0 })).toBe(
        'You have 0 meetings today',
      );
      expect(formatICUMessage(msg, { count: 1 })).toBe(
        'You have 1 meeting today',
      );
      expect(formatICUMessage(msg, { count: 3 })).toBe(
        'You have 3 meetings today',
      );
    });

    it('should format social media', () => {
      const msg =
        '{name} and {count, plural, zero {no one else} one {# other person} other {# other people}} liked this';
      expect(formatICUMessage(msg, { name: 'Alice', count: 0 })).toBe(
        'Alice and 0 other people liked this',
      );
      expect(formatICUMessage(msg, { name: 'Alice', count: 1 })).toBe(
        'Alice and 1 other person liked this',
      );
      expect(formatICUMessage(msg, { name: 'Alice', count: 5 })).toBe(
        'Alice and 5 other people liked this',
      );
    });
  });

  describe('Multilingual support', () => {
    it('should format Russian plurals', () => {
      const msg =
        '{count, plural, one {# товар} few {# товара} many {# товаров} other {# товаров}}';
      expect(formatICUMessage(msg, { count: 1 }, 'ru')).toBe('1 товар');
      expect(formatICUMessage(msg, { count: 2 }, 'ru')).toBe('2 товара');
      expect(formatICUMessage(msg, { count: 5 }, 'ru')).toBe('5 товаров');
    });

    it('should format Arabic plurals', () => {
      const msg =
        '{count, plural, zero {لا عناصر} one {عنصر واحد} two {عنصران} few {# عناصر} many {# عنصر} other {# عنصر}}';
      expect(formatICUMessage(msg, { count: 0 }, 'ar')).toBe('لا عناصر');
      expect(formatICUMessage(msg, { count: 1 }, 'ar')).toBe('عنصر واحد');
      expect(formatICUMessage(msg, { count: 2 }, 'ar')).toBe('عنصران');
    });
  });

  describe('Performance', () => {
    it('should handle repeated formatting efficiently', () => {
      const msg = 'Hello {name}';
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        formatICUMessage(msg, { name: 'Test' });
      }
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(100);
    });
  });
});
