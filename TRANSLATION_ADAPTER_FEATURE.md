# Translation Adapter Feature

## Overview

Added a generic `createTranslationAdapter` utility to `@digitaldefiance/i18n-lib` that allows `PluginI18nEngine` instances to be used where the `TranslationEngine` interface is expected.

## Problem

Many error classes and utilities expect a `TranslationEngine<TStringKey>` interface:
```typescript
interface TranslationEngine<TStringKey> {
  translate: (key: TStringKey, vars?: Record<string, string | number>, lang?: any) => string;
  safeTranslate: (key: TStringKey, vars?: Record<string, string | number>, lang?: any) => string;
}
```

However, `PluginI18nEngine` has a different signature that requires a component ID:
```typescript
translate<TStringKeys extends string>(
  componentId: string,
  stringKey: TStringKeys,
  variables?: Record<string, string | number>,
  language?: TLanguages
): string
```

## Solution

The new `createTranslationAdapter` function creates a lightweight adapter that:
1. Wraps a `PluginI18nEngine` instance
2. Binds to a specific component ID
3. Implements the `TranslationEngine` interface
4. Maintains full type safety

## API

### Function Signature

```typescript
function createTranslationAdapter<TStringKey extends string, TLanguage extends string>(
  pluginEngine: PluginI18nEngine<TLanguage>,
  componentId: string,
): TranslationEngine<TStringKey>
```

### Parameters

- `pluginEngine`: The `PluginI18nEngine` instance to wrap
- `componentId`: The component ID to use for all translations

### Returns

A `TranslationEngine` instance that delegates to the `PluginI18nEngine`

## Usage Example

```typescript
import { createTranslationAdapter, PluginI18nEngine } from '@digitaldefiance/i18n-lib';

// Create or get your plugin engine
const pluginEngine = getMyPluginI18nEngine();

// Create an adapter for a specific component
const adapter = createTranslationAdapter(pluginEngine, 'my-component');

// Use it where TranslationEngine is expected
const error = new MyError(errorType, adapter);

// Or use directly
const message = adapter.translate('error_key', { count: 5 }, 'en-US');
```

## Features

### Type Safety
- ✅ Full TypeScript type checking
- ✅ Generic string key types
- ✅ Generic language types
- ✅ No use of `any` types

### Error Handling
- ✅ Graceful fallback to key string on translation failure
- ✅ `safeTranslate` never throws
- ✅ Handles undefined variables and languages

### Performance
- ✅ Lightweight wrapper (no overhead)
- ✅ Direct delegation to PluginI18nEngine
- ✅ No caching or state management needed

## Testing

Comprehensive test suite with **19 tests** covering:

1. **Basic Functionality** (4 tests)
   - Adapter creation
   - Simple translation
   - Multiple languages
   - Variable substitution

2. **Error Handling** (4 tests)
   - Invalid keys
   - Safe translation
   - Undefined variables
   - Empty variables

3. **Multiple Components** (2 tests)
   - Separate adapters
   - Independence between adapters

4. **Type Safety** (1 test)
   - Generic string key types

5. **Integration Scenarios** (3 tests)
   - Drop-in replacement
   - Chaining operations
   - Rapid successive calls

6. **Edge Cases** (3 tests)
   - Special characters in component ID
   - Empty string keys
   - Numeric-like string keys

7. **Performance** (2 tests)
   - Fast adapter creation
   - Fast translation (1000 translations < 100ms)

## Files Added

- `src/create-translation-adapter.ts` - Main implementation
- `tests/create-translation-adapter.spec.ts` - Test suite

## Files Modified

- `src/index.ts` - Added export for `createTranslationAdapter`

## Benefits for Packages

### Before
Each package had to create its own adapter or workaround:
```typescript
// Custom adapter in each package
function createMyAdapter() {
  const engine = getEngine();
  return {
    translate: (key, vars, lang) => engine.translate('component', key, vars, lang),
    safeTranslate: (key, vars, lang) => engine.safeTranslate('component', key, vars, lang),
  };
}
```

### After
All packages can use the standard utility:
```typescript
import { createTranslationAdapter } from '@digitaldefiance/i18n-lib';

const adapter = createTranslationAdapter(getEngine(), 'component');
```

## Migration Guide

For packages currently using custom adapters:

1. Update `@digitaldefiance/i18n-lib` dependency
2. Import `createTranslationAdapter`
3. Replace custom adapter with `createTranslationAdapter(engine, componentId)`
4. Remove custom adapter code
5. Update tests if needed

## Future Enhancements

Potential improvements:
- Caching layer for frequently accessed translations
- Batch translation support
- Context-aware translation (admin vs user)
- Translation validation utilities
- Performance monitoring hooks

## Version

Added in: `@digitaldefiance/i18n-lib` v[VERSION]
