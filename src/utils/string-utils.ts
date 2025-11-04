/**
 * String utility functions
 */

/**
 * Extract the actual value from an object that might be a wrapper (CurrencyCode, Timezone, etc.)
 */
function extractValue(value: any): any {
  // Handle objects with a 'value' property (CurrencyCode, Timezone, etc.)
  if (value && typeof value === 'object' && 'value' in value && typeof value.value !== 'function') {
    return value.value;
  }
  return value;
}

export function replaceVariables(
  str: string,
  vars?: Record<string, any>,
  constants?: Record<string, any>,
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
      replacement = String(value);
    } else if (constants && varName in constants) {
      const value = extractValue(constants[varName]);
      replacement = String(value);
    }

    if (replacement) {
      result = result.replace(variable, replacement);
    }
  }

  return result;
}

export function isTemplate(key: string): boolean {
  return key.trim().toLowerCase().endsWith('template');
}
