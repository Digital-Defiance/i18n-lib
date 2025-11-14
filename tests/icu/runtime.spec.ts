import { Runtime } from '../../src/icu/runtime';

describe('Runtime', () => {
  let runtime: Runtime;

  beforeEach(() => {
    runtime = new Runtime();
  });

  it('should format simple message', () => {
    const result = runtime.format('Hello {name}', { name: 'Alice' }, { locale: 'en-US' });
    expect(result).toBe('Hello Alice');
  });

  it('should format plural message', () => {
    const result = runtime.format('{count, plural, one {# item} other {# items}}', { count: 1 }, { locale: 'en-US' });
    expect(result).toBe('1 item');
  });

  it('should cache compiled messages', () => {
    const msg = 'Hello {name}';
    runtime.format(msg, { name: 'Alice' }, { locale: 'en-US' });
    runtime.format(msg, { name: 'Bob' }, { locale: 'en-US' });
    expect(runtime['cache'].size).toBe(1);
  });

  it('should clear cache', () => {
    runtime.format('Hello {name}', { name: 'Alice' }, { locale: 'en-US' });
    expect(runtime['cache'].size).toBe(1);
    runtime.clearCache();
    expect(runtime['cache'].size).toBe(0);
  });

  it('should handle complex nested message', () => {
    const msg = '{gender, select, male {He has {count, plural, one {# item} other {# items}}} female {She has {count, plural, one {# item} other {# items}}} other {items}}';
    const result = runtime.format(msg, { gender: 'male', count: 2 }, { locale: 'en-US' });
    expect(result).toBe('He has 2 items');
  });
});
