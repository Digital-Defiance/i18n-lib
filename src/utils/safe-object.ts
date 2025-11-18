/**
 * Safe object utilities to prevent prototype pollution
 */

/**
 * List of dangerous keys that should never be set on objects to prevent prototype pollution.
 */
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

/**
 * Creates a safe object without a prototype chain.
 * This prevents prototype pollution attacks.
 * @template T - The type of values in the object
 * @returns A new object without a prototype
 */
export function createSafeObject<T = any>(): Record<string, T> {
  return Object.create(null);
}

/**
 * Checks if a key is in the list of dangerous keys that could enable prototype pollution.
 * @param key - The key to check
 * @returns True if the key is dangerous, false otherwise
 */
export function isDangerousKey(key: string): boolean {
  return DANGEROUS_KEYS.includes(key);
}

/**
 * Safely assigns properties from source objects to a target object.
 * Filters out dangerous keys to prevent prototype pollution.
 * @template T - The type of the target object
 * @param target - The target object to assign to
 * @param sources - One or more source objects to copy properties from
 * @returns The target object with properties assigned
 */
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

/**
 * Gets key-value pairs from an object, filtering out dangerous keys.
 * @template T - The type of values in the object
 * @param obj - The object to get entries from
 * @returns Array of [key, value] pairs, excluding dangerous keys
 */
export function safeObjectEntries<T>(obj: Record<string, T>): Array<[string, T]> {
  return Object.entries(obj).filter(([key]) => !isDangerousKey(key));
}

/**
 * Validates that an object does not contain dangerous keys.
 * @param obj - The object to validate
 * @throws {Error} If a dangerous key is detected
 */
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
