/**
 * Simplified component configuration
 */

import { PluralString } from '../types/plural-types';

export interface ComponentConfig {
  readonly id: string;
  readonly strings: Record<string, Record<string, string | PluralString>>;
  readonly aliases?: readonly string[];
}
