import { Formatter, FormatterContext } from './base-formatter';

export class SelectFormatter implements Formatter {
  format(value: unknown, _style?: string, _context?: FormatterContext): string {
    return String(value);
  }
}
