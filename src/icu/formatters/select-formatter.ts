import { Formatter, FormatterContext } from './base-formatter';

export class SelectFormatter implements Formatter {
  format(value: any, style?: string, context?: FormatterContext): string {
    return String(value);
  }
}
