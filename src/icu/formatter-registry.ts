/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { Formatter } from './formatters/base-formatter';
import { DateFormatter } from './formatters/date-formatter';
import { NumberFormatter } from './formatters/number-formatter';
import { PluralFormatter } from './formatters/plural-formatter';
import { SelectFormatter } from './formatters/select-formatter';
import { SelectOrdinalFormatter } from './formatters/selectordinal-formatter';
import { TimeFormatter } from './formatters/time-formatter';

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
