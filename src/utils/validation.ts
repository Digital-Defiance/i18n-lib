/**
 * Input validation utilities
 */

export const LIMITS = {
  MAX_TEMPLATE_LENGTH: 10000,
  MAX_KEY_LENGTH: 200,
  MAX_COMPONENT_ID_LENGTH: 100,
  MAX_LANGUAGE_CODE_LENGTH: 10,
  MAX_NESTING_DEPTH: 10,
} as const;

export function validateTemplateLength(template: string): void {
  if (template.length > LIMITS.MAX_TEMPLATE_LENGTH) {
    throw new Error(`Template exceeds maximum length of ${LIMITS.MAX_TEMPLATE_LENGTH}`);
  }
}

export function validateKeyLength(key: string): void {
  if (key.length > LIMITS.MAX_KEY_LENGTH) {
    throw new Error(`Key exceeds maximum length of ${LIMITS.MAX_KEY_LENGTH}`);
  }
}

export function validateComponentId(componentId: string): void {
  if (componentId.length > LIMITS.MAX_COMPONENT_ID_LENGTH) {
    throw new Error(`Component ID exceeds maximum length of ${LIMITS.MAX_COMPONENT_ID_LENGTH}`);
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(componentId)) {
    throw new Error('Component ID contains invalid characters');
  }
}

export function validateLanguageCode(language: string): void {
  if (language.length > LIMITS.MAX_LANGUAGE_CODE_LENGTH) {
    throw new Error(`Language code exceeds maximum length of ${LIMITS.MAX_LANGUAGE_CODE_LENGTH}`);
  }
  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(language)) {
    throw new Error('Invalid language code format');
  }
}
