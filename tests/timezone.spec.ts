import { Timezone } from '../src/timezone';

describe('Timezone', () => {
  it('should create timezone with valid timezone string', () => {
    const timezone = new Timezone('America/New_York');
    expect(timezone.value).toBe('America/New_York');
  });

  it('should create timezone with UTC', () => {
    const timezone = new Timezone('UTC');
    expect(timezone.value).toBe('UTC');
  });

  it('should throw error for invalid timezone', () => {
    expect(() => new Timezone('Invalid/Timezone')).toThrow(
      'Invalid timezone: Invalid/Timezone',
    );
  });

  it('should throw error for empty string', () => {
    expect(() => new Timezone('')).toThrow('Invalid timezone: ');
  });

  it('should throw error for non-existent timezone', () => {
    expect(() => new Timezone('NotATimezone')).toThrow(
      'Invalid timezone: NotATimezone',
    );
  });
});
