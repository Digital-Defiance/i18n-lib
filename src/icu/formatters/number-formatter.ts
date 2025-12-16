import { Formatter, FormatterContext } from './base-formatter';

export class NumberFormatter implements Formatter {
  format(value: unknown, style?: string, context?: FormatterContext): string {
    const num = Number(value);
    if (isNaN(num)) return String(value);

    const locale = context?.locale || 'en-US';
    const options: Intl.NumberFormatOptions = {};

    switch (style) {
      case 'integer':
        options.maximumFractionDigits = 0;
        break;
      case 'currency':
        options.style = 'currency';
        options.currency = (context?.currency as string) || 'USD';
        break;
      case 'percent':
        options.style = 'percent';
        // Show up to 2 decimal places for percent, but don't force trailing zeros
        options.minimumFractionDigits = 0;
        options.maximumFractionDigits = 2;
        break;
      case 'decimal':
      default:
        break;
    }

    return new Intl.NumberFormat(locale, options).format(num);
  }
}
