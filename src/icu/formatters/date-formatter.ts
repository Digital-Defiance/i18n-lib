import { Formatter, FormatterContext } from './base-formatter';

export class DateFormatter implements Formatter {
  format(value: unknown, style?: string, context?: FormatterContext): string {
    const date =
      value instanceof Date ? value : new Date(value as string | number);
    if (isNaN(date.getTime())) return String(value);

    const locale = context?.locale || 'en-US';
    const options: Intl.DateTimeFormatOptions = {};

    switch (style) {
      case 'short':
        options.dateStyle = 'short';
        break;
      case 'medium':
        options.dateStyle = 'medium';
        break;
      case 'long':
        options.dateStyle = 'long';
        break;
      case 'full':
        options.dateStyle = 'full';
        break;
      default:
        options.dateStyle = 'medium';
    }

    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}
