/**
 * Simplified component configuration
 */

export interface ComponentConfig {
  readonly id: string;
  readonly strings: Record<string, Record<string, string>>;
  readonly aliases?: readonly string[];
}
