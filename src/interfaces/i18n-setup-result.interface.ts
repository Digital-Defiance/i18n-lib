import type {
  AnyBrandedEnum,
  BrandedEnumValue,
} from '@digitaldefiance/branded-enum';
import type { LanguageContextSpace } from '../types';
import type { IActiveContext } from './active-context.interface';
import type { II18nConstants } from './i18n-constants.interface';
import type { II18nEngine } from './i18n-engine.interface';

/**
 * Return type of createI18nSetup. Contains everything a consumer needs
 * for i18n: the engine, translate helpers, context, and language management.
 */
export interface I18nSetupResult<
  TStringKeyEnum extends AnyBrandedEnum = AnyBrandedEnum,
> {
  /** The I18nEngine instance */
  readonly engine: II18nEngine;
  /** Translate a branded string key value. Throws on missing translation. */
  readonly translate: (
    key: BrandedEnumValue<TStringKeyEnum>,
    variables?: Record<string, string | number>,
    language?: string,
    context?: LanguageContextSpace,
  ) => string;
  /** Safe translate — returns placeholder on failure, never throws. */
  readonly safeTranslate: (
    key: BrandedEnumValue<TStringKeyEnum>,
    variables?: Record<string, string | number>,
    language?: string,
    context?: LanguageContextSpace,
  ) => string;
  /** The active context for this setup */
  readonly context: IActiveContext<string>;
  /** Set the user-facing language */
  readonly setLanguage: (language: string) => void;
  /** Set the admin language */
  readonly setAdminLanguage: (language: string) => void;
  /** Set the language context space (user vs admin) */
  readonly setContext: (context: LanguageContextSpace) => void;
  /** Get the current user-facing language */
  readonly getLanguage: () => string;
  /** Get the current admin language */
  readonly getAdminLanguage: () => string;
  /** Register constants for a component (available as template variables) */
  readonly registerConstants: <T extends II18nConstants>(
    componentId: string,
    constants: T,
  ) => void;
  /** Update/override constants for a component (merges, app values win) */
  readonly updateConstants: <T extends II18nConstants>(
    componentId: string,
    constants: T,
  ) => void;
  /** Reset the engine instance and context (useful for testing) */
  readonly reset: () => void;
}
