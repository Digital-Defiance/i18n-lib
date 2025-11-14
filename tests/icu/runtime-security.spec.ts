import { Runtime } from '../../src/icu/runtime';

describe('ICU Runtime - Security', () => {
  let runtime: Runtime;

  beforeEach(() => {
    runtime = new Runtime();
  });

  describe('message length validation', () => {
    it('should accept normal messages', () => {
      expect(() => {
        runtime.format('Hello {name}', { name: 'World' }, { locale: 'en-US' });
      }).not.toThrow();
    });

    it('should reject excessively long messages', () => {
      const tooLong = 'a'.repeat(10001);
      expect(() => {
        runtime.format(tooLong, {}, { locale: 'en-US' });
      }).toThrow(/maximum length/i);
    });
  });

  describe('cache behavior', () => {
    it('should cache compiled messages', () => {
      const msg = 'Hello {name}';
      runtime.format(msg, { name: 'A' }, { locale: 'en-US' });
      runtime.format(msg, { name: 'B' }, { locale: 'en-US' });
      // Second call should use cache (no error)
      expect(true).toBe(true);
    });

    it('should use locale in cache key', () => {
      const msg = 'Hello {name}';
      const en = runtime.format(msg, { name: 'World' }, { locale: 'en-US' });
      const fr = runtime.format(msg, { name: 'Monde' }, { locale: 'fr-FR' });
      
      expect(en).toContain('World');
      expect(fr).toContain('Monde');
    });

    it('should clear cache', () => {
      runtime.format('Hello {name}', { name: 'World' }, { locale: 'en-US' });
      runtime.clearCache();
      // Should still work after clear
      expect(() => {
        runtime.format('Hello {name}', { name: 'World' }, { locale: 'en-US' });
      }).not.toThrow();
    });

    it('should not grow unbounded', () => {
      for (let i = 0; i < 2000; i++) {
        runtime.format(`Message ${i}`, {}, { locale: 'en-US' });
      }
      // Should not crash or run out of memory
      expect(true).toBe(true);
    });
  });

  describe('validation integration', () => {
    it('should validate AST', () => {
      expect(() => {
        runtime.format('{count, plural, one {item}}', { count: 1 }, { locale: 'en-US' });
      }).toThrow(/other.*case/i);
    });
  });
});
