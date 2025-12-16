/**
 * Input validation utilities
 */

/**
 * Security limits for various input types to prevent abuse.
 */
export const LIMITS = {
  MAX_TEMPLATE_LENGTH: 10000,
  MAX_KEY_LENGTH: 200,
  MAX_COMPONENT_ID_LENGTH: 100,
  MAX_LANGUAGE_CODE_LENGTH: 10,
  MAX_NESTING_DEPTH: 10,
} as const;

/**
 * Validates that a template string does not exceed the maximum allowed length.
 * @param template - The template string to validate
 * @throws {Error} If the template exceeds the maximum length
 */
export function validateTemplateLength(template: string): void {
  if (template.length > LIMITS.MAX_TEMPLATE_LENGTH) {
    throw new Error(
      `Template exceeds maximum length of ${LIMITS.MAX_TEMPLATE_LENGTH}`,
    );
  }
}

/**
 * Validates that a key does not exceed the maximum allowed length.
 * @param key - The key to validate
 * @throws {Error} If the key exceeds the maximum length
 */
export function validateKeyLength(key: string): void {
  if (key.length > LIMITS.MAX_KEY_LENGTH) {
    throw new Error(`Key exceeds maximum length of ${LIMITS.MAX_KEY_LENGTH}`);
  }
}

/**
 * Validates that a component ID meets length and character requirements.
 * Component IDs must contain only alphanumeric characters, underscores, and hyphens.
 * @param componentId - The component ID to validate
 * @throws {Error} If the component ID is invalid
 */
export function validateComponentId(componentId: string): void {
  if (componentId.length > LIMITS.MAX_COMPONENT_ID_LENGTH) {
    throw new Error(
      `Component ID exceeds maximum length of ${LIMITS.MAX_COMPONENT_ID_LENGTH}`,
    );
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(componentId)) {
    throw new Error('Component ID contains invalid characters');
  }
}

/**
 * Validates that a language code meets BCP 47 format requirements.
 * Expected format: two lowercase letters, optionally followed by a hyphen and two uppercase letters (e.g., 'en', 'en-US').
 * @param language - The language code to validate
 * @throws {Error} If the language code is invalid
 */
export function validateLanguageCode(language: string): void {
  if (language.length > LIMITS.MAX_LANGUAGE_CODE_LENGTH) {
    throw new Error(
      `Language code exceeds maximum length of ${LIMITS.MAX_LANGUAGE_CODE_LENGTH}`,
    );
  }
  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(language)) {
    throw new Error('Invalid language code format');
  }
}
