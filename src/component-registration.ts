import { ComponentDefinition } from './component-definition';
import { PartialComponentLanguageStrings } from './types';

/**
 * Registration payload for a component with its strings
 */
export interface ComponentRegistration<
  TStringKeys extends string,
  TLanguages extends string,
> {
  readonly component: ComponentDefinition<TStringKeys>;
  readonly strings: PartialComponentLanguageStrings<TStringKeys, TLanguages>;
  readonly enumName?: string;
  readonly enumObject?: Record<string, TStringKeys>;
  readonly aliases?: readonly string[];
}
