# i18n-lib v2.0 Quick Reference

## At a Glance

| Feature | v1.x | v2.0 |
|---------|------|------|
| **Engine** | `I18nEngine` + `PluginI18nEngine` | `PluginI18nEngine` only |
| **Generics** | `<TLanguages>` required | None (runtime validation) |
| **Errors** | 5 error types | 1 `I18nError` class |
| **Builder** | Constructor only | Fluent `I18nBuilder` |
| **Currency** | Built-in | Use `Intl.NumberFormat` |
| **Timezone** | Built-in | Use `Intl.DateTimeFormat` |
| **Enums** | Separate system | Regular components |
| **Bundle Size** | Baseline | -40% smaller |

## Quick Migration

### 1. Engine Creation

```typescript
// ❌ v1.x
import { PluginI18nEngine } from '@digitaldefiance/i18n-lib';
const engine = new PluginI18nEngine<'en-US' | 'fr'>(languages, config);

// ✅ v2.0
import { I18nBuilder } from '@digitaldefiance/i18n-lib';
const engine = I18nBuilder.create()
  .withLanguages(languages)
  .withDefaultLanguage('en-US')
  .build();
```

### 2. Error Handling

```typescript
// ❌ v1.x
import { RegistryError, RegistryErrorType } from '@digitaldefiance/i18n-lib';
if (error instanceof RegistryError && error.type === RegistryErrorType.ComponentNotFound) {
  // handle
}

// ✅ v2.0
import { I18nError, I18nErrorCode } from '@digitaldefiance/i18n-lib';
if (error instanceof I18nError && error.code === I18nErrorCode.COMPONENT_NOT_FOUND) {
  // handle
}
```

### 3. Currency Formatting

```typescript
// ❌ v1.x
import { getCurrencyFormat } from '@digitaldefiance/i18n-lib';
const format = getCurrencyFormat('en-US', 'USD');

// ✅ v2.0
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});
console.log(formatter.format(1234.56)); // "$1,234.56"
```

### 4. Timezone Handling

```typescript
// ❌ v1.x
import { Timezone } from '@digitaldefiance/i18n-lib';
const tz = new Timezone('America/New_York');

// ✅ v2.0
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York'
});
console.log(formatter.format(new Date()));
```

### 5. Enum Translations

```typescript
// ❌ v1.x
enum Status { Active = 'active', Inactive = 'inactive' }
engine.registerEnum(Status, translations, 'Status');
const text = engine.translateEnum(Status, Status.Active, 'fr');

// ✅ v2.0
engine.register({
  id: 'status',
  strings: {
    'en-US': { active: 'Active', inactive: 'Inactive' },
    'fr': { active: 'Actif', inactive: 'Inactif' }
  }
});
const text = engine.translate('status', Status.Active, {}, 'fr');
```

### 6. Context Management

```typescript
// ❌ v1.x
engine.updateContext({
  language: 'fr',
  adminLanguage: 'en-US',
  currentContext: 'admin'
});

// ✅ v2.0
engine.setLanguage('fr');
engine.setAdminLanguage('en-US');
engine.switchToAdmin();
```

## New Features

### Fluent Builder

```typescript
const engine = I18nBuilder.create()
  .withLanguages([
    { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
    { id: 'fr', name: 'Français', code: 'fr' }
  ])
  .withDefaultLanguage('en-US')
  .withConstants({ Site: 'MyApp', Version: '2.0' })
  .withValidation({
    requireCompleteStrings: false,
    allowPartialRegistration: true,
    fallbackLanguageId: 'en-US'
  })
  .build();
```

### Chainable Methods

```typescript
engine
  .setLanguage('fr')
  .switchToAdmin()
  .register({ id: 'auth', strings: {...} });
```

### Better Error Messages

```typescript
try {
  engine.translate('missing-component', 'key');
} catch (error) {
  console.log(error.code);     // 'COMPONENT_NOT_FOUND'
  console.log(error.message);  // "Component 'missing-component' not found"
  console.log(error.metadata); // { componentId: 'missing-component' }
}
```

## What Stays the Same

### ✅ Component Registration
```typescript
engine.registerComponent({
  component: { id: 'auth', name: 'Auth', stringKeys: ['login', 'logout'] },
  strings: {
    'en-US': { login: 'Login', logout: 'Logout' },
    'fr': { login: 'Connexion', logout: 'Déconnexion' }
  }
});
```

### ✅ Translation
```typescript
const text = engine.translate('component', 'key', { var: 'value' }, 'fr');
const safe = engine.safeTranslate('component', 'key');
```

### ✅ Templates
```typescript
const result = engine.t('{{component.key}} {variable}', { variable: 'value' });
```

### ✅ Language Management
```typescript
engine.registerLanguage({ id: 'it', name: 'Italiano', code: 'it' });
engine.setLanguage('it');
const languages = engine.getLanguages();
```

### ✅ Instances
```typescript
const app1 = PluginI18nEngine.createInstance('app1', languages);
const app2 = PluginI18nEngine.getInstance('app1');
```

## Common Patterns

### Basic Setup

```typescript
import { I18nBuilder } from '@digitaldefiance/i18n-lib';

const engine = I18nBuilder.create()
  .withLanguages([
    { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
    { id: 'fr', name: 'Français', code: 'fr' }
  ])
  .withDefaultLanguage('en-US')
  .build();

engine.register({
  id: 'app',
  strings: {
    'en-US': { welcome: 'Welcome!', goodbye: 'Goodbye!' },
    'fr': { welcome: 'Bienvenue!', goodbye: 'Au revoir!' }
  }
});

console.log(engine.translate('app', 'welcome')); // "Welcome!"
engine.setLanguage('fr');
console.log(engine.translate('app', 'welcome')); // "Bienvenue!"
```

### With Variables

```typescript
engine.register({
  id: 'user',
  strings: {
    'en-US': { greeting: 'Hello, {name}!' },
    'fr': { greeting: 'Bonjour, {name}!' }
  }
});

console.log(engine.translate('user', 'greeting', { name: 'John' }));
// "Hello, John!"
```

### Error Handling

```typescript
import { I18nError, I18nErrorCode } from '@digitaldefiance/i18n-lib';

try {
  engine.translate('component', 'key');
} catch (error) {
  if (error instanceof I18nError) {
    switch (error.code) {
      case I18nErrorCode.COMPONENT_NOT_FOUND:
        console.error('Component not registered');
        break;
      case I18nErrorCode.TRANSLATION_MISSING:
        console.error('Translation missing', error.metadata);
        break;
      default:
        console.error('Unknown error', error);
    }
  }
}
```

### Multiple Instances

```typescript
const adminEngine = I18nBuilder.create()
  .withLanguages(languages)
  .withInstanceKey('admin')
  .build();

const userEngine = I18nBuilder.create()
  .withLanguages(languages)
  .withInstanceKey('user')
  .build();

// Later...
const admin = PluginI18nEngine.getInstance('admin');
const user = PluginI18nEngine.getInstance('user');
```

## Breaking Changes Checklist

- [ ] Replace `I18nEngine` with `PluginI18nEngine`
- [ ] Remove `<TLanguages>` generic parameter
- [ ] Update error handling to use `I18nError`
- [ ] Replace currency code with `Intl.NumberFormat`
- [ ] Replace timezone with `Intl.DateTimeFormat`
- [ ] Convert enum translations to component strings
- [ ] Update context API calls
- [ ] Remove enum template patterns
- [ ] Test all translations
- [ ] Update documentation

## Resources

- **Full Migration Guide**: `MIGRATION_V2.md`
- **Architecture Plan**: `I18N_V2_ARCHITECTURE_PLAN.md`
- **Status Tracking**: `V2_REFACTOR_STATUS.md`
- **README**: Updated with v2.0 examples
- **GitHub Issues**: Report problems or ask questions

## Support

- **Documentation**: See README.md
- **Examples**: See examples/ directory
- **Issues**: https://github.com/Digital-Defiance/i18n-lib/issues

---

**Version**: 2.0.0
**Status**: Planning Complete
**Migration Difficulty**: Medium
**Estimated Time**: 2-4 hours per project
