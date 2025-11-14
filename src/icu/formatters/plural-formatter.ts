import { Formatter, FormatterContext } from './base-formatter';
import { getPluralCategory } from '../../pluralization/language-plural-map';

export class PluralFormatter implements Formatter {
  format(value: any, style?: string, context?: FormatterContext): string {
    const num = Number(value);
    if (isNaN(num)) return 'other';

    const locale = context?.locale || 'en-US';
    return getPluralCategory(locale, num);
  }
}
