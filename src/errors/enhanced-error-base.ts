/**
 * Enhanced error base with i18n 3.0/3.5 feature support
 * Provides helper methods for ICU MessageFormat, pluralization, gender, and advanced features
 */

import { formatICUMessage } from '../icu/helpers';
import { PluralCategory } from '../pluralization/plural-categories';
import { GenderCategory } from '../gender/gender-categories';

/**
 * Options for enhanced error message formatting
 */
export interface EnhancedErrorOptions {
  /** Variables for ICU substitution */
  variables?: Record<string, string | number | boolean>;
  /** Language code for message formatting */
  language?: string;
  /** Count for plural formatting */
  count?: number;
  /** Gender for gender-aware formatting */
  gender?: GenderCategory;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Helper class providing advanced i18n features for error messages
 * This can be used as a mixin or utility class for error classes
 */
export class EnhancedErrorHelper {
  /**
   * Format error message with ICU MessageFormat
   * @param pattern - ICU message pattern
   * @param options - Formatting options
   * @returns Formatted message string
   */
  static formatMessage(
    pattern: string,
    options: EnhancedErrorOptions = {},
  ): string {
    const { variables = {}, language = 'en-US', count, gender } = options;
    
    // Add count and gender to variables if provided
    const allVars = {
      ...variables,
      ...(count !== undefined ? { count } : {}),
      ...(gender ? { gender } : {}),
    };

    return formatICUMessage(pattern, allVars, language);
  }

  /**
   * Create a plural-aware error message
   * @param singularPattern - Pattern for singular form
   * @param pluralPattern - Pattern for plural form
   * @param count - Count value
   * @param options - Additional formatting options
   * @returns Formatted message
   */
  static formatPlural(
    singularPattern: string,
    pluralPattern: string,
    count: number,
    options: Omit<EnhancedErrorOptions, 'count'> = {},
  ): string {
    const pattern = `{count, plural, one {${singularPattern}} other {${pluralPattern}}}`;
    return this.formatMessage(pattern, { ...options, count });
  }

  /**
   * Create a gender-aware error message
   * @param patterns - Patterns for different genders
   * @param gender - Gender value
   * @param options - Additional formatting options
   * @returns Formatted message
   */
  static formatGender(
    patterns: Partial<Record<GenderCategory, string>>,
    gender: GenderCategory,
    options: Omit<EnhancedErrorOptions, 'gender'> = {},
  ): string {
    const { male, female, neutral, other } = patterns;
    const selectPattern = `{gender, select, ${male ? `male {${male}}` : ''} ${female ? `female {${female}}` : ''} ${neutral ? `neutral {${neutral}}` : ''} other {${other || patterns.male || patterns.female || patterns.neutral || 'Error'}}}`;
    return this.formatMessage(selectPattern, { ...options, gender });
  }

  /**
   * Format ordinal numbers (1st, 2nd, 3rd, etc.)
   * @param number - The number to format
   * @param pattern - Pattern with {number} placeholder
   * @param options - Additional formatting options
   * @returns Formatted message with ordinal
   */
  static formatOrdinal(
    number: number,
    pattern: string,
    options: EnhancedErrorOptions = {},
  ): string {
    const ordinalPattern = pattern.replace(
      '{number}',
      `{number, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}`
    );
    return this.formatMessage(ordinalPattern, {
      ...options,
      variables: { ...options.variables, number },
    });
  }

  /**
   * Format numbers with specific formatting (integer, currency, percent)
   * @param value - Number value
   * @param format - Format type
   * @param pattern - Pattern with {value} placeholder
   * @param options - Additional formatting options
   * @returns Formatted message
   */
  static formatNumber(
    value: number,
    format: 'integer' | 'currency' | 'percent',
    pattern: string,
    options: EnhancedErrorOptions = {},
  ): string {
    const numberPattern = pattern.replace(
      '{value}',
      `{value, number, ${format}}`
    );
    return this.formatMessage(numberPattern, {
      ...options,
      variables: { ...options.variables, value },
    });
  }

  /**
   * Create nested messages with multiple levels of ICU formatting
   * @param pattern - Complex nested ICU pattern
   * @param options - Formatting options
   * @returns Formatted message
   */
  static formatNested(
    pattern: string,
    options: EnhancedErrorOptions = {},
  ): string {
    return this.formatMessage(pattern, options);
  }

  /**
   * Detect if a string key represents a nested path
   * @param key - String key to check
   * @returns Object with nesting information
   */
  static analyzeKeyPath(key: string): {
    isNested: boolean;
    depth: number;
    parts: string[];
  } {
    const parts = key.split('.');
    return {
      isNested: parts.length > 1,
      depth: parts.length,
      parts,
    };
  }

  /**
   * Create metadata object with count information for debugging
   * @param count - Count value
   * @param additionalMetadata - Additional metadata to include
   * @returns Metadata object
   */
  static createCountMetadata(
    count: number,
    additionalMetadata: Record<string, any> = {},
  ): Record<string, any> {
    return {
      count,
      ...additionalMetadata,
    };
  }

  /**
   * Validate that all required ICU variables are provided
   * @param pattern - ICU pattern
   * @param variables - Provided variables
   * @returns Object with validation result
   */
  static validateVariables(
    pattern: string,
    variables: Record<string, any>,
  ): { valid: boolean; missing: string[] } {
    // Extract variable names from ICU pattern
    const variableMatches = pattern.match(/\{([a-zA-Z_][a-zA-Z0-9_]*)/g);
    if (!variableMatches) {
      return { valid: true, missing: [] };
    }

    const required = variableMatches
      .map(match => match.substring(1))
      .filter((name, index, self) => self.indexOf(name) === index);

    const missing = required.filter(name => !(name in variables));

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}

/**
 * Mixin function to add enhanced i18n features to error classes
 * @param Base - Base error class
 * @returns Enhanced error class
 */
export function withEnhancedI18n<T extends new (...args: any[]) => Error>(
  Base: T
) {
  return class extends Base {
    public formatMessage(
      pattern: string,
      options: EnhancedErrorOptions = {},
    ): string {
      return EnhancedErrorHelper.formatMessage(pattern, options);
    }

    public formatPlural(
      singularPattern: string,
      pluralPattern: string,
      count: number,
      options: Omit<EnhancedErrorOptions, 'count'> = {},
    ): string {
      return EnhancedErrorHelper.formatPlural(singularPattern, pluralPattern, count, options);
    }

    public formatGender(
      patterns: Partial<Record<GenderCategory, string>>,
      gender: GenderCategory,
      options: Omit<EnhancedErrorOptions, 'gender'> = {},
    ): string {
      return EnhancedErrorHelper.formatGender(patterns, gender, options);
    }

    public formatOrdinal(
      number: number,
      pattern: string,
      options: EnhancedErrorOptions = {},
    ): string {
      return EnhancedErrorHelper.formatOrdinal(number, pattern, options);
    }

    public formatNumber(
      value: number,
      format: 'integer' | 'currency' | 'percent',
      pattern: string,
      options: EnhancedErrorOptions = {},
    ): string {
      return EnhancedErrorHelper.formatNumber(value, format, pattern, options);
    }
  };
}
