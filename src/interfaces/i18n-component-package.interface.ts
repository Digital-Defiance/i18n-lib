import type { AnyBrandedEnum } from '@digitaldefiance/branded-enum';
import type { BrandedInterfaceDefinition } from '@digitaldefiance/branded-interface';
import type { ComponentConfig } from './component-config.interface';
import type { II18nConstants } from './i18n-constants.interface';

/**
 * Bundles a ComponentConfig with its optional branded string key enum.
 * Library authors export functions returning this type so the factory
 * can auto-register both the component and its enum in one step.
 */
export interface I18nComponentPackage {
  /** The component configuration for registration */
  readonly config: ComponentConfig;
  /** Optional branded string key enum for direct translateStringKey support */
  readonly stringKeyEnum?: AnyBrandedEnum;
  /** Optional constants to register for this component */
  readonly constants?: II18nConstants;
  /** Optional branded interface schema for validating constants */
  readonly constantsSchema?: BrandedInterfaceDefinition;
}
