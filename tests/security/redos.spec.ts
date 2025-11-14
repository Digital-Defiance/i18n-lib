import { I18nBuilder } from '../../src/builders/i18n-builder';
import { parse } from '../../src/icu/parser';

describe('Security: ReDoS', () => {
  let engine: any;

  beforeEach(() => {
    engine = I18nBuilder.create()
      .withLanguages([{ id: 'en-US', name: 'English', isDefault: true }])
      .isolated()
      .build();
    
    engine.register({
      id: 'test',
      strings: { 'en-US': { test: 'test' } },
    });
  });

  it('should reject excessively long templates', () => {
    const long = 'a'.repeat(20000);
    expect(() => engine.t(long)).toThrow(/maximum length/i);
  });

  it('should handle nested braces without catastrophic backtracking', () => {
    const attack = '{'.repeat(5000) + 'a' + '}'.repeat(5000);
    expect(() => engine.t(attack)).toThrow(/maximum length/i);
  });

  it('should limit variable name length in patterns', () => {
    const longVar = '{' + 'a'.repeat(100) + '}';
    const result = engine.t(longVar);
    expect(result).toBe(longVar);
  });

  it('should limit component.key pattern length', () => {
    const longPattern = '{{' + 'a'.repeat(200) + '}}';
    const result = engine.t(longPattern);
    expect(result).toBe(longPattern);
  });

  it('should reject excessively long ICU messages', () => {
    const long = '{x, select, a {' + 'text'.repeat(5000) + '}}';
    expect(() => parse(long)).toThrow(/maximum length/i);
  });
});
