import { Formatter, FormatterContext } from './base-formatter';

export class SelectOrdinalFormatter implements Formatter {
  format(value: any, style?: string, context?: FormatterContext): string {
    const num = Number(value);
    if (isNaN(num)) return 'other';

    // English ordinal rules (1st, 2nd, 3rd, 4th, etc.)
    const mod10 = num % 10;
    const mod100 = num % 100;

    if (mod10 === 1 && mod100 !== 11) return 'one';
    if (mod10 === 2 && mod100 !== 12) return 'two';
    if (mod10 === 3 && mod100 !== 13) return 'few';
    return 'other';
  }
}
