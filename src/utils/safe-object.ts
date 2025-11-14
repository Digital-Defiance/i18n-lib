/**
 * Safe object utilities to prevent prototype pollution
 */

const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

export function createSafeObject<T = any>(): Record<string, T> {
  return Object.create(null);
}

export function isDangerousKey(key: string): boolean {
  return DANGEROUS_KEYS.includes(key);
}

export function safeAssign<T extends Record<string, any>>(
  target: T,
  ...sources: Array<Record<string, any> | undefined>
): T {
  for (const source of sources) {
    if (!source) continue;
    
    for (const key of Object.keys(source)) {
      if (!isDangerousKey(key)) {
        (target as any)[key] = source[key];
      }
    }
  }
  return target;
}

export function safeObjectEntries<T>(obj: Record<string, T>): Array<[string, T]> {
  return Object.entries(obj).filter(([key]) => !isDangerousKey(key));
}

export function validateObjectKeys(obj: Record<string, any>): void {
  if (!obj || typeof obj !== 'object') return;
  
  // Check for dangerous keys in Object.keys and getOwnPropertyNames
  const allKeys = [...Object.keys(obj), ...Object.getOwnPropertyNames(obj)];
  for (const key of allKeys) {
    if (DANGEROUS_KEYS.includes(key)) {
      throw new Error(`Dangerous key detected: ${key}`);
    }
  }
}
