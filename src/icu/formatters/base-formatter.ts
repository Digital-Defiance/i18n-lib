export interface FormatterContext {
  locale: string;
  [key: string]: any;
}

export interface Formatter {
  format(value: any, style?: string, context?: FormatterContext): string;
}
