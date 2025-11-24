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

/**
 * Type utility to extract string keys from a component definition
 */
type ExtractStringKeys<T> = T extends ComponentDefinition<infer K> ? K : never;

/**
 * Type utility to create a strongly typed component registration
 */
export type CreateComponentRegistration<
  TComponent extends ComponentDefinition<any>,
  TLanguages extends string,
> = ComponentRegistration<ExtractStringKeys<TComponent>, TLanguages>;
