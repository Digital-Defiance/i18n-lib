/**
 * String utility functions
 */

import { escapeHtml, safeStringify } from './html-escape';

/**
 * Extract the actual value from an object that might be a wrapper (CurrencyCode, Timezone, etc.).
 * @param value - The value to extract from
 * @returns The extracted value or the original value if not a wrapper
 */
function extractValue(value: any): any {
  // Handle objects with a 'value' property (CurrencyCode, Timezone, etc.)
  if (value && typeof value === 'object' && 'value' in value && typeof value.value !== 'function') {
    return value.value;
  }
  return value;
}

/**
 * Options for the replaceVariables function.
 */
export interface ReplaceVariablesOptions {
  /** If true, HTML-escapes the replaced values */
  escapeHtml?: boolean;
}

/**
 * Replaces variables in a string template with values from vars or constants.
 * Variables are denoted by {variableName} in the template string.
 * @param str - The template string containing variables
 * @param vars - Optional object mapping variable names to values
 * @param constants - Optional object containing constant values
 * @param options - Optional configuration including HTML escaping
 * @returns The string with variables replaced
 */
export function replaceVariables(
  str: string,
  vars?: Record<string, any>,
  constants?: Record<string, any>,
  options?: ReplaceVariablesOptions,
): string {
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
      const value = extractValue(vars[varName]);
      replacement = safeStringify(value, options);
      result = result.replace(variable, replacement);
    } else if (constants && varName in constants) {
      const value = extractValue(constants[varName]);
      replacement = safeStringify(value, options);
      result = result.replace(variable, replacement);
    }
  }

  return result;
}

/**
 * Checks if a string key indicates a template that expects variable replacement.
 * Template keys end with 'template' (case-insensitive).
 * @param key - The key to check
 * @returns True if the key indicates a template, false otherwise
 */
export function isTemplate(key: string): boolean {
  return key.trim().toLowerCase().endsWith('template');
}
