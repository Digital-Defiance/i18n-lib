/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { FormatterRegistry } from '../../src/icu/formatter-registry';
import { Formatter } from '../../src/icu/formatters/base-formatter';

describe('FormatterRegistry', () => {
  let registry: FormatterRegistry;

  beforeEach(() => {
    registry = new FormatterRegistry();
  });

  it('should have default formatters', () => {
    expect(registry.has('number')).toBe(true);
    expect(registry.has('date')).toBe(true);
    expect(registry.has('time')).toBe(true);
    expect(registry.has('plural')).toBe(true);
    expect(registry.has('select')).toBe(true);
    expect(registry.has('selectordinal')).toBe(true);
  });

  it('should get formatter', () => {
    const formatter = registry.get('number');
    expect(formatter).toBeDefined();
  });

  it('should return undefined for unknown formatter', () => {
    expect(registry.get('unknown')).toBeUndefined();
  });

  it('should register custom formatter', () => {
    const custom: Formatter = { format: () => 'custom' };
    registry.register('custom', custom);
    expect(registry.has('custom')).toBe(true);
    expect(registry.get('custom')).toBe(custom);
  });

  it('should override existing formatter', () => {
    const custom: Formatter = { format: () => 'override' };
    registry.register('number', custom);
    expect(registry.get('number')).toBe(custom);
  });
});
