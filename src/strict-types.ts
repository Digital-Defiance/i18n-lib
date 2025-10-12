/**
 * Enforces that for each language L, all string keys K are present.
 */
export type CompleteLanguageStrings<TStringKey extends string> = {
  [K in TStringKey]: string;
};

export type CompleteComponentLanguageStrings<
  TStringKey extends string,
  TLanguages extends string,
> = {
  [L in TLanguages]: CompleteLanguageStrings<TStringKey>;
};

/**
 * Helper to assert at compile-time that an object is a complete component language map.
 * Returns the object unchanged at runtime.
 */
export function createCompleteComponentStrings<
  TStringKey extends string,
  TLanguages extends string,
>(
  obj: CompleteComponentLanguageStrings<TStringKey, TLanguages>,
): CompleteComponentLanguageStrings<TStringKey, TLanguages> {
  return obj;
}

/**
 * Utility to extract missing keys at compile time (identity, purely for readability)
 */
export function defineLanguageStrings<TStringKey extends string>(
  strings: CompleteLanguageStrings<TStringKey>,
): CompleteLanguageStrings<TStringKey> {
  return strings;
}
