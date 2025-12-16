/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { Timezone, isValidTimezone } from '../src/utils/timezone';

describe('Timezone coverage', () => {
  describe('Timezone class', () => {
    it('should create valid timezone', () => {
      const tz = new Timezone('America/New_York');
      expect(tz.value).toBe('America/New_York');
    });

    it('should throw on invalid timezone', () => {
      expect(() => new Timezone('Invalid/Timezone')).toThrow(
        'Invalid timezone',
      );
    });

    it('should return name property', () => {
      const tz = new Timezone('Europe/London');
      expect(tz.name).toBe('Europe/London');
    });

    it('should validate timezone with isValid', () => {
      expect(Timezone.isValid('UTC')).toBe(true);
      expect(Timezone.isValid('Invalid')).toBe(false);
    });

    it('should return all timezones', () => {
      const all = Timezone.getAll();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThan(0);
      expect(all).toContain('UTC');
    });

    it('should guess current timezone', () => {
      const guessed = Timezone.guess();
      expect(typeof guessed).toBe('string');
      expect(guessed.length).toBeGreaterThan(0);
    });
  });

  describe('isValidTimezone function', () => {
    it('should validate timezone', () => {
      expect(isValidTimezone('America/Los_Angeles')).toBe(true);
      expect(isValidTimezone('NotATimezone')).toBe(false);
    });
  });
});
