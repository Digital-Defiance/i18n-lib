import { Formatter, FormatterContext } from './base-formatter';

export class TimeFormatter implements Formatter {
  format(value: unknown, style?: string, context?: FormatterContext): string {
    const date =
      value instanceof Date ? value : new Date(value as string | number);
    if (isNaN(date.getTime())) return String(value);

    const locale = context?.locale || 'en-US';
    const options: Intl.DateTimeFormatOptions = {};

    switch (style) {
      case 'short':
        options.timeStyle = 'short';
        break;
      case 'medium':
        options.timeStyle = 'medium';
        break;
      case 'long':
        options.timeStyle = 'long';
        break;
      case 'full':
        options.timeStyle = 'full';
        break;
      default:
        options.timeStyle = 'medium';
    }

    return new Intl.DateTimeFormat(locale, options).format(date);
  }
}
