import { Formatter } from './formatters/base-formatter';
import { NumberFormatter } from './formatters/number-formatter';
import { DateFormatter } from './formatters/date-formatter';
import { TimeFormatter } from './formatters/time-formatter';
import { PluralFormatter } from './formatters/plural-formatter';
import { SelectFormatter } from './formatters/select-formatter';
import { SelectOrdinalFormatter } from './formatters/selectordinal-formatter';

export class FormatterRegistry {
  private formatters = new Map<string, Formatter>();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.register('number', new NumberFormatter());
    this.register('date', new DateFormatter());
    this.register('time', new TimeFormatter());
    this.register('plural', new PluralFormatter());
    this.register('select', new SelectFormatter());
    this.register('selectordinal', new SelectOrdinalFormatter());
  }

  register(type: string, formatter: Formatter): void {
    this.formatters.set(type, formatter);
  }

  get(type: string): Formatter | undefined {
    return this.formatters.get(type);
  }

  has(type: string): boolean {
    return this.formatters.has(type);
  }
}
