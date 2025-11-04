# Migration Guide: v1.x → v2.0

## Overview

Version 2.0 is a major refactor that simplifies the library by 40-50% while maintaining all core functionality. The primary change is moving from compile-time generic types to runtime registry-based validation.

## Breaking Changes Summary

### 1. Legacy I18nEngine Removed
**Status**: ⚠️ BREAKING
**Impact**: High

The old `I18nEngine` class has been completely removed. All users must migrate to `PluginI18nEngine`.

```typescript
// ❌ v1.x - No longer supported
import { I18nEngine } from '@digitaldefiance/i18n-lib';
const engine = new I18nEngine(config);

// ✅ v2.0 - Use PluginI18nEngine
import { PluginI18nEngine } from '@digitaldefiance/i18n-lib';
const engine = new PluginI18nEngine(languages, config);
```

### 2. Language Generic Removed
**Status**: ⚠️ BREAKING  
**Impact**: Medium

The `TLanguages` generic parameter has been removed. Language validation now happens at runtime via the registry.

```typescript
// ❌ v1.x
const engine = new PluginI18nEngine<'en-US' | 'fr' | 'es'>(languages);

// ✅ v2.0
const engine = new PluginI18nEngine(languages);
// Language validation happens at runtime via LanguageRegistry
```

**Why**: 
- Compile-time types don't prevent runtime errors
- Runtime validation is required anyway
- Simpler API, same flexibility
- Registry is single source of truth

### 3. Fluent Builder API
**Status**: ✨ NEW
**Impact**: Low (old constructor still works)

New fluent builder pattern for cleaner configuration:

```typescript
// ✅ v2.0 - Recommended
import { I18nBuilder } from '@digitaldefiance/i18n-lib';

const engine = I18nBuilder.create()
  .withLanguages(languages)
  .withDefaultLanguage('en-US')
  .withConstants({ Site: 'MyApp' })
  .build();

// ✅ v2.0 - Old style still works
const engine = new PluginI18nEngine(languages, config);
```

### 4. Unified Error Class
**Status**: ⚠️ BREAKING
**Impact**: Medium

Multiple error types consolidated into single `I18nError` class:

```typescript
// ❌ v1.x
import { RegistryError, ContextError } from '@digitaldefiance/i18n-lib';
try {
  engine.translate('component', 'key');
} catch (error) {
  if (error instanceof RegistryError) {
    console.error(error.type);
  }
}

// ✅ v2.0
import { I18nError, I18nErrorCode } from '@digitaldefiance/i18n-lib';
try {
  engine.translate('component', 'key');
} catch (error) {
  if (error instanceof I18nError) {
    console.error(error.code); // I18nErrorCode.COMPONENT_NOT_FOUND
    console.error(error.metadata);
  }
}
```

**Removed Error Types**:
- `RegistryError` → `I18nError`
- `RegistryErrorType` → `I18nErrorCode`
- `ContextError` → `I18nError`
- `ContextErrorType` → `I18nErrorCode`

### 5. Currency & Timezone Features Removed
**Status**: ⚠️ BREAKING
**Impact**: Low

Currency and timezone features have been removed as they're out of scope for an i18n library.

```typescript
// ❌ v1.x - No longer available
import { CurrencyCode, Timezone, getCurrencyFormat } from '@digitaldefiance/i18n-lib';
const currency = new CurrencyCode('USD');
const tz = new Timezone('America/New_York');

// ✅ v2.0 - Use standard libraries
// For currency: use Intl.NumberFormat
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

// For timezone: use Intl.DateTimeFormat or moment-timezone
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York'
});
```

### 6. Enum Translation System Removed
**Status**: ⚠️ BREAKING
**Impact**: Low

Separate enum translation system removed. Use regular component strings instead.

```typescript
// ❌ v1.x
enum Status { Active = 'active', Inactive = 'inactive' }
engine.registerEnum(Status, translations, 'Status');
const text = engine.translateEnum(Status, Status.Active, 'fr');

// ✅ v2.0 - Use regular component strings
engine.register({
  id: 'status',
  strings: {
    'en-US': { active: 'Active', inactive: 'Inactive' },
    'fr': { active: 'Actif', inactive: 'Inactif' }
  }
});
const text = engine.translate('status', Status.Active);
```

### 7. Simplified Context API
**Status**: ⚠️ BREAKING
**Impact**: Low

Context management simplified with specific methods:

```typescript
// ❌ v1.x
engine.updateContext({
  language: 'fr',
  adminLanguage: 'en-US',
  currentContext: 'admin'
});

// ✅ v2.0 - More explicit
engine.setLanguage('fr');
engine.setAdminLanguage('en-US');
engine.switchToAdmin();
```

### 8. Template Pattern Simplification
**Status**: ⚠️ BREAKING
**Impact**: Low

Only component-based and variable patterns supported:

```typescript
// ✅ v2.0 - Supported patterns
engine.t('{{component.key}}')           // Component translation
engine.t('{variable}', { variable: 'value' })  // Variable replacement
engine.t('{{comp.key}} {var}', { var: 'value' }) // Mixed

// ❌ v2.0 - No longer supported
engine.t('{{EnumName.EnumKey}}')        // Enum patterns removed
// Use regular component keys instead
```

## Migration Steps

### Step 1: Update Dependencies

```bash
npm install @digitaldefiance/i18n-lib@^2.0.0
# or
yarn add @digitaldefiance/i18n-lib@^2.0.0
```

### Step 2: Remove Legacy I18nEngine

Find and replace all `I18nEngine` usage with `PluginI18nEngine`:

```bash
# Find all usages
grep -r "I18nEngine" src/

# Replace imports
sed -i 's/import { I18nEngine }/import { PluginI18nEngine }/g' src/**/*.ts
```

### Step 3: Remove Generic Type Parameters

```typescript
// Before
const engine = new PluginI18nEngine<MyLanguages>(languages);

// After
const engine = new PluginI18nEngine(languages);
```

### Step 4: Update Error Handling

```typescript
// Before
import { RegistryError, RegistryErrorType } from '@digitaldefiance/i18n-lib';
try {
  // ...
} catch (error) {
  if (error instanceof RegistryError) {
    if (error.type === RegistryErrorType.ComponentNotFound) {
      // ...
    }
  }
}

// After
import { I18nError, I18nErrorCode } from '@digitaldefiance/i18n-lib';
try {
  // ...
} catch (error) {
  if (error instanceof I18nError) {
    if (error.code === I18nErrorCode.COMPONENT_NOT_FOUND) {
      // ...
    }
  }
}
```

### Step 5: Replace Currency/Timezone

```typescript
// Before
import { CurrencyCode, Timezone } from '@digitaldefiance/i18n-lib';
const config = {
  defaultCurrencyCode: new CurrencyCode('USD'),
  timezone: new Timezone('UTC')
};

// After - Remove from config
const config = {
  // Currency and timezone removed
};

// Use standard APIs instead
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});
```

### Step 6: Convert Enum Translations

```typescript
// Before
enum Status { Active = 'active', Inactive = 'inactive' }
engine.registerEnum(Status, {
  'en-US': { [Status.Active]: 'Active', [Status.Inactive]: 'Inactive' },
  'fr': { [Status.Active]: 'Actif', [Status.Inactive]: 'Inactif' }
}, 'Status');

// After
engine.register({
  id: 'status',
  strings: {
    'en-US': { active: 'Active', inactive: 'Inactive' },
    'fr': { active: 'Actif', inactive: 'Inactif' }
  }
});
```

### Step 7: Simplify Context Updates

```typescript
// Before
engine.updateContext({
  language: 'fr',
  adminLanguage: 'en-US',
  currentContext: 'admin'
});

// After
engine.setLanguage('fr');
engine.setAdminLanguage('en-US');
engine.switchToAdmin();
```

## Automated Migration Tool

We provide a codemod to automate most of the migration:

```bash
npx @digitaldefiance/i18n-migrate
```

This will:
- Replace `I18nEngine` with `PluginI18nEngine`
- Remove generic type parameters
- Update error handling
- Convert enum registrations
- Update context API calls
- Add TODO comments for manual changes

## What Stays the Same

### ✅ Component Registration
```typescript
engine.registerComponent({
  component: { id: 'auth', name: 'Auth', stringKeys: ['login'] },
  strings: {
    'en-US': { login: 'Login' },
    'fr': { login: 'Connexion' }
  }
});
```

### ✅ Translation API
```typescript
const text = engine.translate('component', 'key', variables, language);
const safe = engine.safeTranslate('component', 'key', variables, language);
```

### ✅ Language Management
```typescript
engine.registerLanguage({ id: 'it', name: 'Italiano', code: 'it' });
engine.setLanguage('it');
const languages = engine.getLanguages();
```

### ✅ Template Processing
```typescript
const result = engine.t('{{component.key}} {variable}', { variable: 'value' });
```

### ✅ Instance Management
```typescript
const engine1 = PluginI18nEngine.createInstance('app1', languages);
const engine2 = PluginI18nEngine.getInstance('app1');
```

## Benefits of v2.0

### Simpler API
- No generic type parameters to manage
- Single error class instead of multiple
- Clearer method names
- Fluent builder pattern

### Smaller Bundle
- 40-50% code reduction
- Removed unused features (currency, timezone)
- Consolidated error handling
- Removed enum system

### Better Runtime Validation
- Registry-based language validation
- Clearer error messages
- Better debugging experience

### Maintained Flexibility
- Still support any languages
- Add/remove languages dynamically
- Custom language codes
- Same validation capabilities

## Common Issues

### Issue: Type errors after removing generics

```typescript
// Problem
const lang: MyLanguages = 'fr';
engine.setLanguage(lang); // Type error

// Solution: Use string type
const lang: string = 'fr';
engine.setLanguage(lang); // ✓ Works
```

### Issue: Currency formatting missing

```typescript
// Problem
import { getCurrencyFormat } from '@digitaldefiance/i18n-lib'; // Not found

// Solution: Use Intl.NumberFormat
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});
console.log(formatter.format(1234.56)); // "$1,234.56"
```

### Issue: Enum translations not working

```typescript
// Problem
engine.translateEnum(Status, Status.Active, 'fr'); // Method not found

// Solution: Use regular component strings
engine.translate('status', Status.Active, {}, 'fr');
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/Digital-Defiance/i18n-lib/issues
- Documentation: See README.md
- Examples: See examples/ directory

## Timeline

- **v1.x**: Deprecated, security updates only (6 months)
- **v2.0**: Current, active development
- **v3.0**: Planned for 2025

## Feedback

We welcome feedback on the v2.0 refactor. Please open an issue if you encounter problems or have suggestions for improvement.
