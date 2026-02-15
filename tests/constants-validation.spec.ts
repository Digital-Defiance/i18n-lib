/**
 * Tests for validateConstantsCoverage() runtime validation utility.
 *
 * Verifies that template variable references ({variable}) in translation
 * strings are validated against registered constants.
 */
import type { II18nConstants } from '../src/interfaces/i18n-constants.interface';
import {
  validateConstantsCoverage,
  type ConstantsCoverageResult,
} from '../src/utils/constants-validation';

describe('validateConstantsCoverage', () => {
  it('should return valid when all template variables have constants', () => {
    const strings = {
      'en-US': {
        greeting: 'Welcome to {Site}',
        tagline: '{SiteTagline}',
      },
    };
    const constants: II18nConstants = {
      Site: 'TestSite',
      SiteTagline: 'Test Tagline',
    };

    const result = validateConstantsCoverage(strings, constants);
    expect(result.isValid).toBe(true);
    expect(result.missingConstants).toEqual([]);
    expect(result.referencedVariables).toContain('Site');
    expect(result.referencedVariables).toContain('SiteTagline');
  });

  it('should detect missing constants', () => {
    const strings = {
      'en-US': {
        greeting: 'Welcome to {Site}',
        info: '{MissingKey} is here',
      },
    };
    const constants: II18nConstants = { Site: 'TestSite' };

    const result = validateConstantsCoverage(strings, constants);
    expect(result.isValid).toBe(false);
    expect(result.missingConstants).toContain('MissingKey');
  });

  it('should detect unused constants', () => {
    const strings = {
      'en-US': { greeting: 'Welcome to {Site}' },
    };
    const constants: II18nConstants = {
      Site: 'TestSite',
      NeverUsed: 'orphan',
    };

    const result = validateConstantsCoverage(strings, constants);
    expect(result.isValid).toBe(true);
    expect(result.unusedConstants).toContain('NeverUsed');
  });

  it('should scan across multiple languages', () => {
    const strings = {
      'en-US': { greeting: 'Welcome to {Site}' },
      fr: { greeting: 'Bienvenue sur {Site}', extra: '{FrenchOnly}' },
    };
    const constants: II18nConstants = { Site: 'TestSite' };

    const result = validateConstantsCoverage(strings, constants);
    expect(result.isValid).toBe(false);
    expect(result.missingConstants).toContain('FrenchOnly');
    expect(result.referencedVariables).toContain('Site');
    expect(result.referencedVariables).toContain('FrenchOnly');
  });

  it('should support ignoreVariables option', () => {
    const strings = {
      'en-US': {
        msg: '{Site} has {count} users named {name}',
      },
    };
    const constants: II18nConstants = { Site: 'TestSite' };

    const result = validateConstantsCoverage(strings, constants, {
      ignoreVariables: ['count', 'name'],
    });
    expect(result.isValid).toBe(true);
    expect(result.missingConstants).toEqual([]);
  });

  it('should handle strings with no template variables', () => {
    const strings = {
      'en-US': { greeting: 'Hello world' },
    };
    const constants: II18nConstants = { Site: 'TestSite' };

    const result = validateConstantsCoverage(strings, constants);
    expect(result.isValid).toBe(true);
    expect(result.referencedVariables).toEqual([]);
    expect(result.unusedConstants).toContain('Site');
  });

  it('should handle empty strings object', () => {
    const strings = {};
    const constants: II18nConstants = { Site: 'TestSite' };

    const result = validateConstantsCoverage(strings, constants);
    expect(result.isValid).toBe(true);
    expect(result.referencedVariables).toEqual([]);
  });

  it('should handle empty constants object', () => {
    const strings = {
      'en-US': { greeting: '{Site}' },
    };
    const constants: II18nConstants = {};

    const result = validateConstantsCoverage(strings, constants);
    expect(result.isValid).toBe(false);
    expect(result.missingConstants).toContain('Site');
  });

  it('should deduplicate variables referenced in multiple strings', () => {
    const strings = {
      'en-US': {
        a: '{Site} page 1',
        b: '{Site} page 2',
        c: '{Site} page 3',
      },
    };
    const constants: II18nConstants = { Site: 'TestSite' };

    const result = validateConstantsCoverage(strings, constants);
    expect(result.isValid).toBe(true);
    // Site should appear only once in referencedVariables
    expect(result.referencedVariables.filter((v) => v === 'Site')).toHaveLength(
      1,
    );
  });

  it('should sort missingConstants and unusedConstants alphabetically', () => {
    const strings = {
      'en-US': { msg: '{Zebra} and {Alpha}' },
    };
    const constants: II18nConstants = { Zeta: 'z', Beta: 'b' };

    const result = validateConstantsCoverage(strings, constants);
    expect(result.missingConstants).toEqual(['Alpha', 'Zebra']);
    expect(result.unusedConstants).toEqual(['Beta', 'Zeta']);
  });

  it('should work with typed interface constants', () => {
    interface IMyConstants extends II18nConstants {
      AppName: string;
      AppVersion: number;
    }

    const strings = {
      'en-US': { title: '{AppName} v{AppVersion}' },
    };
    const constants: IMyConstants = { AppName: 'TestApp', AppVersion: 42 };

    const result = validateConstantsCoverage(strings, constants);
    expect(result.isValid).toBe(true);
    expect(result.missingConstants).toEqual([]);
  });

  it('should return correct ConstantsCoverageResult shape', () => {
    const strings = { 'en-US': { msg: '{A}' } };
    const constants: II18nConstants = { A: 'val' };

    const result: ConstantsCoverageResult = validateConstantsCoverage(
      strings,
      constants,
    );
    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('missingConstants');
    expect(result).toHaveProperty('unusedConstants');
    expect(result).toHaveProperty('referencedVariables');
    expect(Array.isArray(result.missingConstants)).toBe(true);
    expect(Array.isArray(result.unusedConstants)).toBe(true);
    expect(Array.isArray(result.referencedVariables)).toBe(true);
  });
});
