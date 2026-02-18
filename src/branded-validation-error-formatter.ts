/**
 * Branded Validation Error Formatter
 *
 * Bridges branded-interface validation failures to translated error messages
 * via the i18n translation engine. Supports configurable key patterns and
 * a fallback language chain.
 *
 * @module branded-validation-error-formatter
 */

import type { InterfaceSafeParseFailure } from '@digitaldefiance/branded-interface';
import type { II18nEngine } from './interfaces/i18n-engine.interface';

/**
 * A single formatted validation error with a translated (or raw) message.
 */
export interface FormattedValidationError {
  readonly field?: string;
  readonly message: string;
  readonly code: string;
}

/**
 * Options for configuring the BrandedValidationErrorFormatter.
 */
export interface BrandedValidationErrorFormatterOptions {
  /**
   * Translation key pattern. Supports `{code}`, `{field}`, and `{interfaceId}` tokens.
   * @default 'validation.{code}.{field}'
   */
  readonly keyPattern?: string;
  /**
   * Fallback language to try when the active language has no translation.
   * @default 'en-US'
   */
  readonly fallbackLanguage?: string;
}

const DEFAULT_KEY_PATTERN = 'validation.{code}.{field}';
const DEFAULT_FALLBACK_LANGUAGE = 'en-US';

/**
 * Formats branded-interface Safe_Parse failures into translated error messages.
 *
 * Fallback chain per error entry:
 * 1. Translate using the engine's active language
 * 2. Translate using the configured fallback language
 * 3. Return the raw error message from the Safe_Parse result
 *
 * This class never throws — it always returns results gracefully.
 */
export class BrandedValidationErrorFormatter {
  private readonly keyPattern: string;
  private readonly fallbackLanguage: string;

  constructor(
    private readonly engine: II18nEngine,
    options?: BrandedValidationErrorFormatterOptions,
  ) {
    this.keyPattern = options?.keyPattern ?? DEFAULT_KEY_PATTERN;
    this.fallbackLanguage =
      options?.fallbackLanguage ?? DEFAULT_FALLBACK_LANGUAGE;
  }

  /**
   * Formats a Safe_Parse failure into an array of translated validation errors.
   *
   * - When the failure has N field errors (N > 0), produces N entries.
   * - When the failure has 0 field errors, produces 1 entry using the error code.
   */
  format(failure: InterfaceSafeParseFailure): FormattedValidationError[] {
    const { error } = failure;
    const fieldErrors = error.fieldErrors;

    if (fieldErrors && fieldErrors.length > 0) {
      return fieldErrors.map((fe) => ({
        field: fe.field,
        message: this.resolveMessage(
          fe.field,
          error.code,
          error.interfaceId,
          fe.message,
        ),
        code: error.code,
      }));
    }

    // No field errors — produce a single entry using the error code as key
    return [
      {
        message: this.resolveMessage(
          undefined,
          error.code,
          error.interfaceId,
          error.message,
        ),
        code: error.code,
      },
    ];
  }

  /**
   * Resolves a translated message through the fallback chain.
   */
  private resolveMessage(
    field: string | undefined,
    code: string,
    interfaceId: string | undefined,
    rawMessage: string,
  ): string {
    const key = this.interpolateKey(field, code, interfaceId);
    const componentId = interfaceId ?? 'validation';

    // 1. Try active language
    const activeResult = this.tryTranslate(componentId, key);
    if (activeResult !== null) {
      return activeResult;
    }

    // 2. Try fallback language
    const fallbackResult = this.tryTranslate(
      componentId,
      key,
      this.fallbackLanguage,
    );
    if (fallbackResult !== null) {
      return fallbackResult;
    }

    // 3. Return raw error message
    return rawMessage;
  }

  /**
   * Attempts to translate a key. Returns null if translation fails or returns
   * a placeholder/key-echo (indicating no translation exists).
   */
  private tryTranslate(
    componentId: string,
    key: string,
    language?: string,
  ): string | null {
    try {
      const result = this.engine.translate(
        componentId,
        key,
        undefined,
        language,
      );
      // If the engine returns the key itself or a bracketed placeholder,
      // treat it as "no translation found"
      if (result === key || result === `[${key}]` || result === `{${key}}`) {
        return null;
      }
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Interpolates the key pattern with the given tokens.
   */
  private interpolateKey(
    field: string | undefined,
    code: string,
    interfaceId: string | undefined,
  ): string {
    return this.keyPattern
      .replace(/\{code\}/g, code)
      .replace(/\{field\}/g, field ?? '')
      .replace(/\{interfaceId\}/g, interfaceId ?? '');
  }
}
