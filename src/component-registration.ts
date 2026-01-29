import type {
  AnyBrandedEnum,
  BrandedEnumValue,
} from '@digitaldefiance/branded-enum';
import { ComponentDefinition } from './component-definition';
import { PartialComponentLanguageStrings } from './types';

/**
 * Registration payload for a component with its strings
 *
 * @example
 * ```typescript
 * const MyKeys = createI18nStringKeys('my-component', {
 *   Welcome: 'my.welcome',
 *   Goodbye: 'my.goodbye',
 * } as const);
 *
 * const registration: ComponentRegistration<typeof MyKeys, 'en' | 'es'> = {
 *   component: {
 *     id: 'my-component',
 *     name: 'My Component',
 *     stringKeys: MyKeys,
 *   },
 *   strings: {
 *     en: { 'my.welcome': 'Welcome!', 'my.goodbye': 'Goodbye!' },
 *     es: { 'my.welcome': '¡Bienvenido!', 'my.goodbye': '¡Adiós!' },
 *   },
 * };
 * ```
 */
export interface ComponentRegistration<
  TBrandedEnum extends AnyBrandedEnum,
  TLanguages extends string,
> {
  readonly component: ComponentDefinition<TBrandedEnum>;
  readonly strings: PartialComponentLanguageStrings<
    BrandedEnumValue<TBrandedEnum>,
    TLanguages
  >;
  /** Optional aliases for resolving component references */
  readonly aliases?: readonly string[];
}

/**
 * Type utility to extract string keys type from a component registration
 */
export type RegistrationStringKeys<
  T extends ComponentRegistration<AnyBrandedEnum, string>,
> =
  T extends ComponentRegistration<infer E, string>
    ? BrandedEnumValue<E>
    : never;
