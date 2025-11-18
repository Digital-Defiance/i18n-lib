/**
 * Simplified component configuration
 */

import { PluralString } from '../types/plural-types';

/**
 * Configuration for registering a component with the i18n system.
 */
export interface ComponentConfig {
  /** Unique identifier for the component */
  readonly id: string;
  /** Translation strings organized by language and key */
  readonly strings: Record<string, Record<string, string | PluralString>>;
  /** Optional alternative names for referencing this component */
  readonly aliases?: readonly string[];
}
