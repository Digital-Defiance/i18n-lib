/**
 * Translation request interface
 */
export interface TranslationRequest<
  TStringKeys extends string,
  TLanguages extends string,
> {
  readonly componentId: string;
  readonly stringKey: TStringKeys;
  readonly language?: TLanguages;
  readonly variables?: Record<string, string | number>;
}
