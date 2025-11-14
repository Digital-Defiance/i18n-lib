import { Formatter, FormatterContext } from './base-formatter';

export class NumberFormatter implements Formatter {
  format(value: any, style?: string, context?: FormatterContext): string {
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
        options.currency = context?.currency || 'USD';
        break;
      case 'percent':
        options.style = 'percent';
        break;
      case 'decimal':
      default:
        break;
    }

    return new Intl.NumberFormat(locale, options).format(num);
  }
}
