# Error System v2.0 Alignment

## Summary

All error classes in the `src/errors/` directory have been reviewed and updated to align with the v2.0 architecture, which removes the `TLanguage` generic parameter while preserving useful generics like `TStringKey` and `TEnum`.

## Changes Made

### 1. PluginTranslatableGenericError ✅
**File**: `plugin-translatable-generic.ts`

**Before**:
```typescript
export class PluginTranslatableGenericError<
  TStringKey extends string = string,
  TLanguage extends string = string,
>
```

**After**:
```typescript
export class PluginTranslatableGenericError<TStringKey extends string = string>
```

**Changes**:
- Removed `TLanguage` generic parameter
- Changed `language` property type from `TLanguage` to `string`
- Removed `<TLanguage>` from `PluginI18nEngine.getInstance()` calls
- Updated `withEngine` static method
- Updated `retranslate` method

### 2. PluginTranslatableHandleableGenericError ✅
**File**: `plugin-translatable-handleable-generic.ts`

**Status**: Already aligned - extends `PluginTranslatableGenericError<TStringKey>` correctly

### 3. TypedHandleableError ✅
**File**: `typed-handleable.ts`

**Before**:
```typescript
export class TypedHandleableError<
  TEnum extends Record<string, string>,
  TStringKey extends string,
  TLanguage extends CoreLanguageCode = CoreLanguageCode,
>
```

**After**:
```typescript
export class TypedHandleableError<
  TEnum extends Record<string, string>,
  TStringKey extends string,
>
```

**Changes**:
- Removed `TLanguage` generic parameter
- Changed `language` property type to `string`
- Removed `<TLanguage>` from `PluginI18nEngine.getInstance()` call
- Removed `CoreLanguageCode` import

### 4. Other Error Classes ✅

All other error classes already aligned with v2.0:

- **i18n-error.ts**: New v2.0 unified error class (no generics needed)
- **context-error.ts**: Uses `string` for language
- **handleable.ts**: No language generics
- **plugin-typed-handleable.ts**: Uses `TEnum` and `TStringKey` only
- **translatable.ts**: Uses `TStringKey` only, `string` for language
- **typed.ts**: All classes use `string` for language parameters

## Architecture Alignment

### ✅ Preserved Generics (Useful)
- `TStringKey` - Type-safe translation keys
- `TEnum` - Type-safe error type enums
- `TError` - Type-safe error class construction

### ✅ Removed Generics (Unnecessary)
- `TLanguage` - Runtime validation via registry is sufficient

### ✅ Runtime Validation
All error classes now use runtime language validation through:
- `PluginI18nEngine.getInstance()` (no generic)
- `I18nEngine.getInstance()` (no generic)
- Language validation happens at runtime via `LanguageRegistry`

## Benefits

1. **Simpler API**: No language generic to manage
2. **Same Flexibility**: Still support any languages via runtime validation
3. **Better DX**: Less type complexity, clearer intent
4. **Consistent**: All error classes follow same pattern

## Usage Examples

### Before (v1.x)
```typescript
const error = new PluginTranslatableGenericError<'login', 'en-US' | 'fr'>(
  'auth',
  'login',
  {},
  'fr'
);
```

### After (v2.0)
```typescript
const error = new PluginTranslatableGenericError<'login'>(
  'auth',
  'login',
  {},
  'fr' // Runtime validated
);
```

## Validation

All error classes:
- ✅ Use `string` for language parameters
- ✅ Call `getInstance()` without generic
- ✅ Preserve useful generics (`TStringKey`, `TEnum`)
- ✅ Follow v2.0 architecture principles
- ✅ Maintain backward compatibility where possible

## Status

**Complete** - All error classes aligned with v2.0 architecture.
