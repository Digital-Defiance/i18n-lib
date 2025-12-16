/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { GenderedString } from '../../src/gender/gender-categories';
import { resolveGenderForm } from '../../src/gender/gender-resolver';

describe('Gender Resolver', () => {
  describe('Simple gender resolution', () => {
    it('should resolve male form', () => {
      const value: GenderedString = {
        male: 'He is here',
        female: 'She is here',
      };
      expect(resolveGenderForm(value, 'male')).toBe('He is here');
    });

    it('should resolve female form', () => {
      const value: GenderedString = {
        male: 'He is here',
        female: 'She is here',
      };
      expect(resolveGenderForm(value, 'female')).toBe('She is here');
    });

    it('should resolve neutral form', () => {
      const value: GenderedString = {
        male: 'He',
        female: 'She',
        neutral: 'They',
      };
      expect(resolveGenderForm(value, 'neutral')).toBe('They');
    });

    it('should resolve other form', () => {
      const value: GenderedString = {
        male: 'He',
        female: 'She',
        other: 'Person',
      };
      expect(resolveGenderForm(value, 'other')).toBe('Person');
    });
  });

  describe('Fallback logic', () => {
    it('should fallback to neutral when gender not found', () => {
      const value: GenderedString = { male: 'He', neutral: 'They' };
      expect(resolveGenderForm(value, 'female')).toBe('They');
    });

    it('should fallback to other when neutral not found', () => {
      const value: GenderedString = { male: 'He', other: 'Person' };
      expect(resolveGenderForm(value, 'female')).toBe('Person');
    });

    it('should fallback to first available when neutral and other not found', () => {
      const value: GenderedString = { male: 'He', female: 'She' };
      expect(resolveGenderForm(value, 'neutral')).toBe('He');
    });

    it('should use neutral when no gender provided', () => {
      const value: GenderedString = {
        male: 'He',
        female: 'She',
        neutral: 'They',
      };
      expect(resolveGenderForm(value, undefined)).toBe('They');
    });

    it('should use other when no gender and no neutral', () => {
      const value: GenderedString = {
        male: 'He',
        female: 'She',
        other: 'Person',
      };
      expect(resolveGenderForm(value, undefined)).toBe('Person');
    });

    it('should use first available when no gender, neutral, or other', () => {
      const value: GenderedString = { male: 'He', female: 'She' };
      expect(resolveGenderForm(value, undefined)).toBe('He');
    });
  });

  describe('Simple strings', () => {
    it('should return simple string as-is', () => {
      expect(resolveGenderForm('Hello', 'male')).toBe('Hello');
    });

    it('should return simple string when no gender', () => {
      expect(resolveGenderForm('Hello', undefined)).toBe('Hello');
    });
  });

  describe('Edge cases', () => {
    it('should return empty string for empty object', () => {
      const value: GenderedString = {};
      expect(resolveGenderForm(value, 'male')).toBe('');
    });

    it('should handle unknown gender gracefully', () => {
      const value: GenderedString = { male: 'He', female: 'She' };
      expect(resolveGenderForm(value, 'unknown')).toBe('He');
    });

    it('should handle all four gender categories', () => {
      const value: GenderedString = {
        male: 'He',
        female: 'She',
        neutral: 'They',
        other: 'Person',
      };
      expect(resolveGenderForm(value, 'male')).toBe('He');
      expect(resolveGenderForm(value, 'female')).toBe('She');
      expect(resolveGenderForm(value, 'neutral')).toBe('They');
      expect(resolveGenderForm(value, 'other')).toBe('Person');
    });

    it('should handle partial gender objects', () => {
      const value: GenderedString = { male: 'He' };
      expect(resolveGenderForm(value, 'male')).toBe('He');
      expect(resolveGenderForm(value, 'female')).toBe('He');
    });

    it('should prioritize neutral over other in fallback', () => {
      const value: GenderedString = {
        male: 'He',
        neutral: 'They',
        other: 'Person',
      };
      expect(resolveGenderForm(value, 'female')).toBe('They');
    });

    it('should use other when neutral missing', () => {
      const value: GenderedString = { male: 'He', other: 'Person' };
      expect(resolveGenderForm(value, 'female')).toBe('Person');
    });

    it('should handle empty string values', () => {
      const value: GenderedString = { male: '', female: 'She' };
      expect(resolveGenderForm(value, 'male')).toBe('');
      expect(resolveGenderForm(value, 'female')).toBe('She');
    });

    it('should handle undefined gender parameter', () => {
      const value: GenderedString = {
        male: 'He',
        female: 'She',
        neutral: 'They',
      };
      expect(resolveGenderForm(value, undefined)).toBe('They');
    });

    it('should handle empty string gender parameter', () => {
      const value: GenderedString = {
        male: 'He',
        female: 'She',
        neutral: 'They',
      };
      expect(resolveGenderForm(value, '')).toBe('They');
    });
  });
});
