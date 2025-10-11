/**
 * Component definition with its string keys
 */
export interface ComponentDefinition<TStringKeys extends string> {
  /** Unique identifier for the component */
  readonly id: string;
  /** Human-readable name for the component */
  readonly name: string;
  /** Array of all string keys this component requires */
  readonly stringKeys: readonly TStringKeys[];
}