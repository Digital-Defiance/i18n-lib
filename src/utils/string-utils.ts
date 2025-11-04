/**
 * String utility functions
 */

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

export function isTemplate(key: string): boolean {
  return key.trim().toLowerCase().endsWith('template');
}
