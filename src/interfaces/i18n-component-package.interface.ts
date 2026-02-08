import type { AnyBrandedEnum } from '@digitaldefiance/branded-enum';
import type { ComponentConfig } from './component-config.interface';

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
}
