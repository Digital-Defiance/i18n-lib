/**
 * Template processing utilities for i18n
 */
export type EnumKeys<T> = keyof T;

/**
 * Recursive type to validate that all enum keys in the template string exist in the provided enum type
 */
export type IsValidEnumTemplate<
  T extends string,
  TEnum,
> = T extends `${string}{{${string}.${infer Key}}}${infer Rest}`
  ? Key extends EnumKeys<TEnum>
    ? IsValidEnumTemplate<Rest, TEnum>
    : false
  : true;

/**
 * Template function that processes {{EnumName.EnumKey}} patterns
 */
export function createTemplateProcessor<
  TEnum extends Record<string, string>,
  TLanguage extends string,
>(
  enumObj: TEnum,
  translateFn: (
    key: TEnum[keyof TEnum],
    vars?: Record<string, string | number>,
    language?: TLanguage,
  ) => string,
  enumName: string,
) {
  return function t<T extends string>(
    str: IsValidEnumTemplate<T, TEnum> extends true ? T : never,
    language?: TLanguage,
    ...otherVars: Record<string, string | number>[]
  ): string {
    let varIndex = 0;
    const pattern = new RegExp(`\\{\\{${enumName}\\.(\\w+)\\}\\}`, 'g');

    // First replace enum patterns
    let result = str.replace(pattern, (match, enumKey) => {
      const enumValue = enumObj[enumKey as keyof TEnum];
      if (!enumValue) {
        return match; // Return original if enum key not found
      }

      const needsVars = (enumValue as string)
        .toLowerCase()
        .endsWith('template');
      const vars = needsVars ? (otherVars[varIndex++] ?? {}) : {};
      return translateFn(enumValue, vars, language);
    });

    // Then replace any remaining variables from all otherVars
    const allVars = otherVars.reduce((acc, vars) => ({ ...acc, ...vars }), {});
    result = result.replace(/\{(\w+)\}/g, (match, varName) => {
      return allVars[varName] !== undefined ? String(allVars[varName]) : match;
    });

    return result;
  };
}
