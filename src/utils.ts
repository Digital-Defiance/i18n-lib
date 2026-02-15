/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */

import moment from 'moment-timezone';
import type { II18nConstants } from './interfaces/i18n-constants.interface';

/**
 * Replaces variables in a string with their corresponding values from vars or constants.
 * @param str - The string containing variables to replace
 * @param vars - An object mapping variable names to their replacement values
 * @param constants - An object containing constant values for replacement
 * @returns The string with variables replaced
 */
export function replaceVariables(
  str: string,
  vars?: Record<string, string | number>,
  constants?: II18nConstants,
): string {
  // Ensure input is a string
  if (typeof str !== 'string') {
    str = String(str);
  }

  const variables = str.match(/\{(.+?)\}/g);
  if (!variables) return str;

  let result = str;
  for (const variable of variables) {
    const varName = variable.slice(1, -1);
    let replacement = '';

    if (vars && varName in vars) {
      replacement = String(vars[varName]);
    } else if (constants && varName in constants) {
      replacement = String(constants[varName]);
    }

    if (replacement) {
      result = result.replace(variable, replacement);
    }
  }

  return result;
}

/**
 * Checks if a given key indicates a template string.
 * @param key - The key to check
 * @returns True if the key indicates a template, false otherwise
 */
export function isTemplate(key: string): boolean {
  return key.trim().toLowerCase().endsWith('template');
}

/**
 * Checks if a given timezone string is valid.
 * @param timezone - The timezone string to validate
 * @returns
 */
export function isValidTimezone(timezone: string): boolean {
  return moment.tz.zone(timezone) !== null;
}

/**
 * Converts parts to a single string key, joining with underscores.
 * @param parts - The parts to join
 * @returns The joined string key
 */
export function toStringKey<TStringKey extends string>(
  ...parts: string[]
): TStringKey {
  return parts.join('_') as TStringKey;
}

/**
 * Converts an enum value to a string key by joining parts with underscores and appending the enum value.
 * @param value - The enum value
 * @param parts - Additional parts to join
 * @returns The constructed string key
 */
export function toStringKeyFromEnum<TStringKey extends string>(
  value: string,
  ...parts: string[]
): TStringKey {
  const allParts = [...parts, value];
  return allParts.join('_') as TStringKey;
}

/**
 * Type that constructs string keys from enum values with prefixes and optional template suffix
 */
type BuildStringKey<
  TEnumValue extends string,
  TPrefixes extends readonly string[],
  TIsTemplate extends boolean = false,
> = TPrefixes extends readonly []
  ? `${TEnumValue}${TIsTemplate extends true ? 'Template' : ''}`
  : TPrefixes extends readonly [infer First, ...infer Rest]
    ? First extends string
      ? Rest extends readonly string[]
        ? `${First}_${BuildStringKey<TEnumValue, Rest, TIsTemplate>}`
        : never
      : never
    : never;

/**
 * Type that maps all enum values to their corresponding string keys
 */
type ReasonMapFromEnum<
  TEnum extends Record<string, string>,
  TStringKey extends string,
  TPrefixes extends readonly string[] = [],
  TTemplateKeys extends Set<TEnum[keyof TEnum]> = never,
> = {
  [K in TEnum[keyof TEnum]]: BuildStringKey<
    K,
    TPrefixes,
    TTemplateKeys extends Set<K> ? true : false
  > extends TStringKey
    ? BuildStringKey<K, TPrefixes, TTemplateKeys extends Set<K> ? true : false>
    : never;
};

/**
 * Builds a reason map from an enum object, mapping each enum value to a string key.
 * @param enumObj - The enum object
 * @param prefixes - Prefixes to prepend to each string key
 * @param templateKeys - Optional set of enum values that should have 'Template' suffix for template processing
 * @returns The constructed reason map
 */
export function buildReasonMap<
  TEnum extends Record<string, string>,
  TStringKey extends string,
>(
  enumObj: TEnum,
  prefixes: string[] = [],
  templateKeys?: Set<TEnum[keyof TEnum]>,
): Record<TEnum[keyof TEnum], TStringKey> {
  const map = {} as Record<TEnum[keyof TEnum], TStringKey>;

  Object.values(enumObj).forEach((value) => {
    const baseKey = [...prefixes, value].join('_');
    const finalKey = templateKeys?.has(value as TEnum[keyof TEnum])
      ? baseKey + 'Template'
      : baseKey;
    map[value as TEnum[keyof TEnum]] = finalKey as TStringKey;
  });

  return map;
}

/**
 * Type-safe version of buildReasonMap that ensures all enum values are mapped and all string keys exist
 */
export function buildTypeSafeReasonMap<
  TEnum extends Record<string, string>,
  TStringKey extends string,
  TPrefixes extends readonly string[] = [],
  TTemplateKeys extends Set<TEnum[keyof TEnum]> = never,
>(
  enumObj: TEnum,
  prefixes: TPrefixes,
  templateKeys?: TTemplateKeys,
): ReasonMapFromEnum<TEnum, TStringKey, TPrefixes, TTemplateKeys> {
  const map: Partial<
    ReasonMapFromEnum<TEnum, TStringKey, TPrefixes, TTemplateKeys>
  > = {};

  Object.values(enumObj).forEach((value) => {
    const baseKey = [...prefixes, value].join('_');
    const finalKey = templateKeys?.has(value as TEnum[keyof TEnum])
      ? baseKey + 'Template'
      : baseKey;
    map[value as TEnum[keyof TEnum]] = finalKey as any;
  });

  return map as ReasonMapFromEnum<TEnum, TStringKey, TPrefixes, TTemplateKeys>;
}

/**
 * Validates that a reason map has entries for all enum values
 */
export function validateReasonMap<
  TEnum extends Record<string, string>,
  TStringKey extends string,
>(
  enumObj: TEnum,
  reasonMap: Partial<Record<TEnum[keyof TEnum], TStringKey>>,
): reasonMap is Record<TEnum[keyof TEnum], TStringKey> {
  return Object.values(enumObj).every(
    (value) =>
      value in reasonMap &&
      reasonMap[value as TEnum[keyof TEnum]] !== undefined,
  );
}

/**
 * Creates a complete reason map ensuring all enum values are covered
 */
export function createCompleteReasonMap<
  TEnum extends Record<string, string>,
  TStringKey extends string,
>(
  enumObj: TEnum,
  prefixes: readonly string[] = [],
  templateKeys?: Set<TEnum[keyof TEnum]>,
): Record<TEnum[keyof TEnum], TStringKey> {
  const map = buildReasonMap(enumObj, [...prefixes], templateKeys) as Record<
    TEnum[keyof TEnum],
    TStringKey
  >;

  if (!validateReasonMap(enumObj, map)) {
    const missing = Object.values(enumObj).filter((value) => !(value in map));
    throw new Error(`Missing reason map entries for: ${missing.join(', ')}`);
  }

  return map;
}
