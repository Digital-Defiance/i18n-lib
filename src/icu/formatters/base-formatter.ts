export interface FormatterContext {
  locale: string;
  [key: string]: unknown;
}

export interface Formatter {
  format(value: unknown, style?: string, context?: FormatterContext): string;
}
