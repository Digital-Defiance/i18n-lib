# @digitaldefiance/i18n-lib

A production-ready TypeScript internationalization library with component-based architecture, type-safe translations, and comprehensive error handling.

Part of [Express Suite](https://github.com/Digital-Defiance/express-suite)

## What's New in v4.3.0

✨ **String Key Enum Registration** - Register branded string key enums for direct translation without specifying component IDs.

**Prerequisites**: Requires branded enums from v4.0.4+ (see [Branded Enums](#branded-enums) section)

**New Features:**
- **`registerStringKeyEnum()`**: Register branded enums for automatic component routing
- **`translateStringKey()`**: Translate keys directly - component ID resolved from branded enum
- **`safeTranslateStringKey()`**: Safe version returning placeholder on failure
- **`hasStringKeyEnum()` / `getStringKeyEnums()`**: Query registered enums

```typescript
import { createI18nStringKeysFromEnum, PluginI18nEngine, LanguageCodes } from '@digitaldefiance/i18n-lib';

// First, create a branded enum from your string keys
enum MyStringKeys {
  Welcome = 'welcome',
  Goodbye = 'goodbye',
}
const MyBrandedKeys = createI18nStringKeysFromEnum('my-component', MyStringKeys);

// Register your branded enum
engine.registerStringKeyEnum(MyBrandedKeys);

// Translate without component ID - it's resolved automatically
const text = engine.translateStringKey(MyBrandedKeys.Welcome, { name: 'Alice' });
```

## Features

- **Production-Grade Security**: Comprehensive protection against common attacks
  - Prototype pollution prevention
  - ReDoS (Regular Expression Denial of Service) mitigation
  - XSS (Cross-Site Scripting) protection with HTML escaping
  - Input validation with configurable limits
  - Bounded resource usage (cache, recursion, input length)
- **ICU MessageFormat**: Industry-standard message formatting with plural, select, date/time/number formatting
- **Component-Based Architecture**: Register translation components with full type safety
- **37 Supported Languages**: CLDR-compliant plural rules for world's most complex languages
- **Pluralization Support**: Automatic plural form selection based on count (one/few/many/other)
- **Gender Support**: Gender-aware translations (male/female/neutral/other)
- **Advanced Number Formatting**: Thousand separators, currency, percent with decimal precision
- **8 Built-in Languages**: English (US/UK), French, Spanish, German, Chinese, Japanese, Ukrainian
- **Advanced Template Processing**:
  - Component references: `{{Component.key}}`
  - Alias resolution: `{{Alias.key}}`
  - Enum name resolution: `{{EnumName.value}}`
  - Variable substitution: `{variable}`
  - Context variables: `{currency}`, `{timezone}`, `{language}`
- **Context Integration**: Automatic injection of currency, timezone, and language from GlobalActiveContext
- **Smart Object Handling**: CurrencyCode and Timezone objects automatically extract values
- **Multiple Instances**: Create isolated i18n engines for different contexts
- **Fluent Builder**: I18nBuilder for clean, chainable engine configuration
- **Core System Strings**: Pre-built translations for common UI elements and errors
- **Type Safety**: Full TypeScript support with generic types
- **Branded Enums**: Runtime-identifiable string keys with collision detection and component routing
- **Error Handling**: Comprehensive error classes with translation support and ICU formatting
- **93.22% Test Coverage**: 2,007 tests covering all features
- **Security Hardened**: Comprehensive protection against prototype pollution, ReDoS, and XSS attacks

## Installation

```bash
npm install @digitaldefiance/i18n-lib
# or
yarn add @digitaldefiance/i18n-lib
```

## Quick Start

```typescript
import { PluginI18nEngine, LanguageCodes } from '@digitaldefiance/i18n-lib';

// Create engine with languages
const engine = PluginI18nEngine.createInstance('myapp', [
  { id: LanguageCodes.EN_US, name: 'English (US)', code: 'en-US', isDefault: true },
  { id: LanguageCodes.FR, name: 'Français', code: 'fr' }
]);

// Register component with translations
engine.registerComponent({
  component: {
    id: 'app',
    name: 'Application',
    stringKeys: ['welcome', 'goodbye']
  },
  strings: {
    [LanguageCodes.EN_US]: {
      welcome: 'Welcome to {appName}!',
      goodbye: 'Goodbye!'
    },
    [LanguageCodes.FR]: {
      welcome: 'Bienvenue sur {appName}!',
      goodbye: 'Au revoir!'
    }
  }
});

// Translate
console.log(engine.translate('app', 'welcome', { appName: 'MyApp' }));
// Output: "Welcome to MyApp!"

// Switch language
engine.setLanguage(LanguageCodes.FR);
console.log(engine.translate('app', 'welcome', { appName: 'MyApp' }));
// Output: "Bienvenue sur MyApp!"

// Pluralization (automatic form selection)
engine.registerComponent({
  component: {
    id: 'cart',
    name: 'Cart',
    stringKeys: ['items']
  },
  strings: {
    'en-US': {
      items: {
        one: '1 item',
        other: '{count} items'
      }
    }
  }
});

console.log(engine.translate('cart', 'items', { count: 1 }));
// Output: "1 item"
console.log(engine.translate('cart', 'items', { count: 5 }));
// Output: "5 items"
```

## ICU MessageFormat

Industry-standard message formatting with powerful features. See [docs/ICU_MESSAGEFORMAT.md](docs/ICU_MESSAGEFORMAT.md) for complete guide.

**When to use ICU MessageFormat:**
- Complex pluralization with multiple forms
- Gender-specific translations
- Number/date/time formatting with locale awareness
- Nested conditional logic (select within plural)

**When to use simple templates:**
- Basic variable substitution
- Component references ({{Component.key}})
- Simple string interpolation

### Quick Example

```typescript
import { formatICUMessage } from '@digitaldefiance/i18n-lib';

// Simple variable
formatICUMessage('Hello {name}', { name: 'Alice' });
// → "Hello Alice"

// Plural
formatICUMessage('{count, plural, one {# item} other {# items}}', { count: 1 });
// → "1 item"

// Select
formatICUMessage('{gender, select, male {He} female {She} other {They}}', { gender: 'male' });
// → "He"

// Number formatting
formatICUMessage('{price, number, currency}', { price: 99.99 }, 'en-US');
// → "$99.99"

// Complex nested
formatICUMessage(
  '{gender, select, male {He has} female {She has}} {count, plural, one {# item} other {# items}}',
  { gender: 'female', count: 2 }
);
// → "She has 2 items"
```

### Features

- ✅ **Full ICU Syntax**: Variables, plural, select, selectordinal
- ✅ **Formatters**: Number (integer, currency, percent), Date, Time
- ✅ **37 Languages**: CLDR plural rules for all supported languages
- ✅ **Nested Messages**: Up to 4 levels deep
- ✅ **Performance**: <1ms per format, message caching
- ✅ **Specification Compliant**: Unicode ICU, CLDR, FormatJS compatible

### Documentation

- **[docs/ICU_MESSAGEFORMAT.md](docs/ICU_MESSAGEFORMAT.md)** - Complete guide with syntax reference and examples
- **[docs/ICU_COMPREHENSIVE_VALIDATION.md](docs/ICU_COMPREHENSIVE_VALIDATION.md)** - Validation report with test coverage
- **[docs/ICU_PROJECT_COMPLETE.md](docs/ICU_PROJECT_COMPLETE.md)** - Implementation summary

### API

```typescript
import { 
  formatICUMessage,      // One-line formatting
  isICUMessage,          // Detect ICU format
  parseICUMessage,       // Parse to AST
  compileICUMessage,     // Compile to function
  validateICUMessage,    // Validate syntax
  Runtime                // Advanced usage
} from '@digitaldefiance/i18n-lib';
```

---

## Pluralization & Gender

### Pluralization

Automatic plural form selection based on count with CLDR-compliant rules for 37 languages:

```typescript
import { createPluralString, PluginI18nEngine, LanguageCodes } from '@digitaldefiance/i18n-lib';

const engine = PluginI18nEngine.createInstance('app', [
  { id: LanguageCodes.EN_US, name: 'English', code: 'en-US', isDefault: true }
]);

// English (one/other)
engine.registerComponent({
  component: {
    id: 'shop',
    name: 'Shop',
    stringKeys: ['items']
  },
  strings: {
    'en-US': {
      items: createPluralString({
        one: '{count} item',
        other: '{count} items'
      })
    }
  }
});

// Russian (one/few/many)
engine.registerComponent({
  component: {
    id: 'shop',
    name: 'Shop',
    stringKeys: ['items']
  },
  strings: {
    'ru': {
      items: createPluralString({
        one: '{count} товар',
        few: '{count} товара',
        many: '{count} товаров'
      })
    }
  }
});

// Arabic (zero/one/two/few/many/other)
engine.registerComponent({
  component: {
    id: 'shop',
    name: 'Shop',
    stringKeys: ['items']
  },
  strings: {
    'ar': {
      items: createPluralString({
        zero: 'لا عناصر',
        one: 'عنصر واحد',
        two: 'عنصران',
        few: '{count} عناصر',
        many: '{count} عنصرًا',
        other: '{count} عنصر'
      })
    }
  }
});

// Automatic form selection
engine.translate('shop', 'items', { count: 1 });  // "1 item"
engine.translate('shop', 'items', { count: 5 });  // "5 items"
engine.translate('shop', 'items', { count: 21 }, 'ru'); // "21 товар"
```

**Supported Languages** (37 total):

- **Simple** (other only): Japanese, Chinese, Korean, Turkish, Vietnamese, Thai, Indonesian, Malay
- **Two forms** (one/other): English, German, Spanish, Italian, Portuguese, Dutch, Swedish, Norwegian, Danish, Finnish, Greek, Hebrew, Hindi
- **Three forms** (one/few/many): Russian, Ukrainian, Romanian, Latvian
- **Four forms**: Polish, Czech, Lithuanian, Slovenian, Scottish Gaelic
- **Five forms**: Irish, Breton
- **Six forms**: Arabic, Welsh

See [PLURALIZATION_SUPPORT.md](docs/PLURALIZATION_SUPPORT.md) for complete language matrix.

### Gender Support

Gender-aware translations with intelligent fallback:

```typescript
import { createGenderedString, PluginI18nEngine, LanguageCodes } from '@digitaldefiance/i18n-lib';

const engine = PluginI18nEngine.createInstance('app', [
  { id: LanguageCodes.EN_US, name: 'English', code: 'en-US', isDefault: true }
]);

engine.registerComponent({
  component: {
    id: 'profile',
    name: 'Profile',
    stringKeys: ['greeting']
  },
  strings: {
    'en-US': {
      greeting: createGenderedString({
        male: 'Welcome, Mr. {name}',
        female: 'Welcome, Ms. {name}',
        neutral: 'Welcome, {name}'
      })
    }
  }
});

engine.translate('profile', 'greeting', { name: 'Smith', gender: 'male' });
// Output: "Welcome, Mr. Smith"
```

### Combined Plural + Gender

Nested plural and gender forms:

```typescript
// Plural → Gender
const pluralGender = {
  one: {
    male: 'He has {count} item',
    female: 'She has {count} item'
  },
  other: {
    male: 'He has {count} items',
    female: 'She has {count} items'
  }
};

// Gender → Plural
const genderPlural = {
  male: {
    one: 'He has {count} item',
    other: 'He has {count} items'
  },
  female: {
    one: 'She has {count} item',
    other: 'She has {count} items'
  }
};
```

### Helper Functions

```typescript
import { 
  createPluralString, 
  createGenderedString, 
  getRequiredPluralForms 
} from '@digitaldefiance/i18n-lib';

// Get required forms for a language
const forms = getRequiredPluralForms('ru');
// Returns: ['one', 'few', 'many']

// Type-safe plural string creation
const plural = createPluralString({
  one: '1 item',
  other: '{count} items'
});

// Type-safe gender string creation
const gender = createGenderedString({
  male: 'He',
  female: 'She',
  neutral: 'They'
});
```

### Validation

```typescript
import { validatePluralForms } from '@digitaldefiance/i18n-lib';

// Validate plural forms for a language
const result = validatePluralForms(
  { one: 'item', other: 'items' },
  'en',
  'items',
  { strict: true, checkUnused: true, checkVariables: true }
);

if (!result.isValid) {
  console.error('Errors:', result.errors);
}
if (result.warnings.length > 0) {
  console.warn('Warnings:', result.warnings);
}
```

## Core Concepts

### PluginI18nEngine

The main engine class that manages translations, languages, and components.

```typescript
import { PluginI18nEngine, LanguageCodes } from '@digitaldefiance/i18n-lib';

// Recommended: Create named instance (supports multiple engines)
const engine = PluginI18nEngine.createInstance('myapp', languages);

// Alternative: Direct constructor (for single engine use cases)
const engine = new PluginI18nEngine(languages, config);
```

### Component Registration

Components group related translations together:

```typescript
engine.registerComponent({
  component: {
    id: 'auth',
    name: 'Authentication',
    stringKeys: ['login', 'logout', 'error']
  },
  strings: {
    [LanguageCodes.EN_US]: {
      login: 'Login',
      logout: 'Logout',
      error: 'Authentication failed'
    },
    [LanguageCodes.FR]: {
      login: 'Connexion',
      logout: 'Déconnexion',
      error: 'Échec de l\'authentification'
    }
  },
  aliases: ['authentication'] // Optional aliases
});

// Safe registration (won't error if already registered)
engine.registerComponentIfNotExists({
  component: { id: 'auth', /* ... */ },
  strings: { /* ... */ }
});
```

### Translation

```typescript
// Simple translation
const text = engine.translate('auth', 'login');

// With variables
const greeting = engine.translate('app', 'welcome', { name: 'John' });

// Specific language
const french = engine.translate('auth', 'login', {}, LanguageCodes.FR);

// Safe translation (returns fallback on error)
const safe = engine.safeTranslate('missing', 'key'); // Returns "[missing.key]"
```

### Template Processing

```typescript
// Component references: {{componentId.stringKey}}
engine.t('Click {{auth.login}} to continue');

// Alias resolution: {{alias.stringKey}}
engine.registerComponent({
  component: { id: 'authentication', /* ... */ },
  aliases: ['auth', 'AuthModule']
});
engine.t('{{auth.login}}'); // Resolves via alias

// Variables: {variableName}
engine.t('Hello, {username}!', { username: 'Alice' });

// Context variables (automatic injection)
engine.t('Price in {currency}'); // Uses context currency
engine.t('Time: {timezone}'); // Uses context timezone
engine.t('Language: {language}'); // Uses current language

// CurrencyCode and Timezone objects
const currency = new CurrencyCode('EUR');
const timezone = new Timezone('America/New_York');
engine.t('Price: {amount} {currency}', { amount: 100, currency });
// Output: "Price: 100 EUR"

// Variable priority: provided > context > constants
engine.t('{AppName}'); // Uses constant
engine.t('{currency}'); // Uses context
engine.t('{currency}', { currency: 'GBP' }); // Uses provided (overrides context)

// Mixed patterns
engine.t('{{auth.login}}: {username} ({currency})', { username: 'admin' });
```

### Builder Pattern

```typescript
import { I18nBuilder } from '@digitaldefiance/i18n-lib';

const engine = I18nBuilder.create()
  .withLanguages([
    { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
    { id: 'fr', name: 'French', code: 'fr' }
  ])
  .withDefaultLanguage('en-US')
  .withFallbackLanguage('en-US')
  .withConstants({
    AppName: 'MyApp',
    Version: '1.0.0'
  })
  .withValidation({
    requireCompleteStrings: false,
    allowPartialRegistration: true
  })
  .withInstanceKey('myapp')
  .withRegisterInstance(true)
  .withSetAsDefault(true)
  .build();
```

#### Builder with String Key Enum Registration

Register branded string key enums during engine construction for direct translation via `translateStringKey()`:

```typescript
import { I18nBuilder, createI18nStringKeysFromEnum } from '@digitaldefiance/i18n-lib';

// Create branded enum from your string keys
enum MyStringKeys {
  Welcome = 'welcome',
  Goodbye = 'goodbye',
}
const BrandedKeys = createI18nStringKeysFromEnum('my-component', MyStringKeys);

const engine = I18nBuilder.create()
  .withLanguages([
    { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
  ])
  .withStringKeyEnum(BrandedKeys)  // Register single enum
  // Or register multiple at once:
  // .withStringKeyEnums([BrandedKeys, OtherKeys])
  .build();

// Now you can translate directly without component ID
engine.translateStringKey(BrandedKeys.Welcome);
```

### Context Integration

Automatic injection of currency, timezone, and language from GlobalActiveContext:

```typescript
import { 
  GlobalActiveContext, 
  CurrencyCode, 
  Timezone,
  PluginI18nEngine,
  LanguageCodes
} from '@digitaldefiance/i18n-lib';

// Set context variables
const context = GlobalActiveContext.getInstance();
context.setCurrencyCode(new CurrencyCode('EUR'));
context.setUserTimezone(new Timezone('Europe/Paris'));
context.setUserLanguage('fr');

// Context variables automatically available in translations
engine.t('Price in {currency}'); // "Price in EUR"
engine.t('Timezone: {timezone}'); // "Timezone: Europe/Paris"
engine.t('Language: {language}'); // "Language: fr"

// Override context with provided variables
engine.t('Price in {currency}', { currency: 'USD' }); // "Price in USD"
```

### Constants Management

Constants are application-wide values available as template variables in all translations (e.g., `{Site}` in a translation string resolves to the registered value). The `ConstantsRegistry` provides structured, per-component registration with conflict detection and ownership tracking.

#### Type-Safe Constants with `II18nConstants`

All constants passed to the i18n system must satisfy the `II18nConstants` base interface. Library authors define component-specific interfaces extending it for compile-time safety:

```typescript
import type { II18nConstants } from '@digitaldefiance/i18n-lib';

// Define a typed constants interface for your component
export interface IMyAppI18nConstants extends II18nConstants {
  Site: string;
  SiteTagline: string;
  ApiVersion: number;
}

// TypeScript enforces the shape at compile time
const constants: IMyAppI18nConstants = {
  Site: 'Acme Corp',
  SiteTagline: 'Building the future',
  ApiVersion: 2,
};
```

The library ships two helper types for working with typed constants:

- `ConstantKeys<T>` — Extracts the string keys from a constants type
- `ConstantVariables<T>` — Builds a `Partial<Record<key, string | number>>` for translation variable overrides

```typescript
import type { ConstantKeys, ConstantVariables } from '@digitaldefiance/i18n-lib';

type Keys = ConstantKeys<IMyAppI18nConstants>;
// 'Site' | 'SiteTagline' | 'ApiVersion'

type Vars = ConstantVariables<IMyAppI18nConstants>;
// { Site?: string | number; SiteTagline?: string | number; ApiVersion?: string | number }
```

Suite Core ships `ISuiteCoreI18nConstants` (from `@digitaldefiance/suite-core-lib`) with the standard template variable keys used in its translation strings.

#### Registration Flow (via `createI18nSetup`)

Library packages declare default constants in their `I18nComponentPackage`. The app overrides them at runtime. The factory handles the ordering automatically:

```typescript
import { createI18nSetup } from '@digitaldefiance/i18n-lib';
import { createSuiteCoreComponentPackage } from '@digitaldefiance/suite-core-lib';
import { AppStringKey } from './enumerations/app-string-key';
import { Strings } from './strings-collection';

const setup = createI18nSetup({
  componentId: 'my-app',
  stringKeyEnum: AppStringKey,
  strings: Strings,
  // App constants override library defaults — app always wins
  constants: { Site: 'My Real Site', SiteTagline: 'We do things' },
  // Library components register their own defaults
  libraryComponents: [createSuiteCoreComponentPackage()],
});

// The factory does this internally:
// 1. Library components register defaults via registerConstants()
// 2. App constants override via updateConstants() — app values win
```

#### Direct Engine API

```typescript
// Register constants for a component (idempotent, conflict-detecting)
engine.registerConstants('suite-core', { Site: 'New Site', Version: '1.0' });

// Update/override constants (merges, updater wins ownership)
engine.updateConstants('my-app', { Site: 'My Real Site' });

// Replace all constants for a component (wipes old keys)
engine.replaceConstants({ Site: 'Completely New', Version: '2.0' });

// Merge into engine-level constants (legacy, preserved for compat)
engine.mergeConstants({ ExtraKey: 'value' });

// Query
engine.hasConstants('suite-core');           // true
engine.getConstants('suite-core');           // { Site: 'New Site', Version: '1.0' }
engine.getAllConstants();                     // [{ componentId, constants }, ...]
engine.resolveConstantOwner('Site');         // 'my-app' (last updater wins)
```

#### I18nComponentPackage Constants

Library authors can bundle default constants with their component package:

```typescript
import type { I18nComponentPackage, II18nConstants } from '@digitaldefiance/i18n-lib';

export interface IMyLibI18nConstants extends II18nConstants {
  LibName: string;
  LibVersion: string;
}

export function createMyLibComponentPackage(): I18nComponentPackage {
  const constants: IMyLibI18nConstants = {
    LibName: 'My Library',
    LibVersion: '1.0.0',
  };
  return {
    config: createMyLibComponentConfig(),
    stringKeyEnum: MyLibStringKey,
    constants,
  };
}
```

These are registered automatically when passed via `libraryComponents` in `createI18nSetup`.

#### I18nSetupResult Helpers

The result from `createI18nSetup` exposes constants helpers:

```typescript
const setup = createI18nSetup({ /* ... */ });

// Register constants for a new component after setup
setup.registerConstants('analytics', { TrackingId: 'UA-12345' });

// Override constants at runtime
setup.updateConstants('my-app', { Site: 'Updated Site Name' });
```

#### Conflict Detection

If two different components try to `register` the same key with different values, an error is thrown:

```typescript
engine.registerConstants('lib-a', { Site: 'Alpha' });
engine.registerConstants('lib-b', { Site: 'Beta' });
// Throws: I18nError CONSTANT_CONFLICT — "Site" already registered by "lib-a" with a different value
```

Use `updateConstants` instead of `registerConstants` when you intentionally want to override.

#### Runtime Validation with `validateConstantsCoverage()`

Use `validateConstantsCoverage()` in tests to verify that all `{variable}` references in your translation templates have corresponding constant keys. This catches drift between templates and constants at test time:

```typescript
import { validateConstantsCoverage } from '@digitaldefiance/i18n-lib';
import { SuiteCoreComponentStrings } from '@digitaldefiance/suite-core-lib';

const constants = { Site: 'Test', SiteTagline: 'Tagline', SiteDescription: 'Desc' };

const result = validateConstantsCoverage(SuiteCoreComponentStrings, constants, {
  ignoreVariables: ['count', 'name'], // runtime-only variables, not constants
});

expect(result.isValid).toBe(true);
expect(result.missingConstants).toEqual([]);   // no template vars without constants
expect(result.unusedConstants).toEqual([]);     // no constants without template refs
expect(result.referencedVariables).toContain('Site');
```

The result object contains:
- `isValid` — `true` if all template variables have matching constants
- `missingConstants` — variable names referenced in templates but missing from constants
- `unusedConstants` — constant keys registered but never referenced in any template
- `referencedVariables` — all variable names found in templates

**When to use:**
- **Constants**: Application-wide values that rarely change (Site, Version, SiteTagline)
- **Variables**: Request-specific or dynamic values passed to translate()
- **Context**: User-specific values (currency, timezone, language)

**Variable priority**: provided variables > context > constants

### Language Management

```typescript
// Set current language
engine.setLanguage(LanguageCodes.FR);

// Get current language
const lang = engine.getCurrentLanguage();

// Check if language exists (recommended before setLanguage)
if (engine.hasLanguage(LanguageCodes.ES)) {
  engine.setLanguage(LanguageCodes.ES);
} else {
  console.warn('Spanish not available, using default');
}

// Get all languages
const languages = engine.getLanguages();
```

### Admin Context

Separate language for admin interfaces (useful for multi-tenant applications where admins need consistent UI language regardless of user's language):

```typescript
// Set admin language (e.g., always English for admin panel)
engine.setAdminLanguage(LanguageCodes.EN_US);

// Switch to admin context (uses admin language)
engine.switchToAdmin();
const adminText = engine.translate('app', 'dashboard'); // Uses EN_US

// Switch back to user context (uses user's language)
engine.switchToUser();
const userText = engine.translate('app', 'dashboard'); // Uses user's language
```

**Use cases:**
- Admin panels in multi-language applications
- Support interfaces that need consistent language
- Internal tools accessed by multilingual teams

## Core System Strings

Pre-built translations for common UI elements in 8 languages:

```typescript
import { getCoreI18nEngine, CoreStringKey, CoreI18nComponentId } from '@digitaldefiance/i18n-lib';

const coreEngine = getCoreI18nEngine();

// Use core strings
const yes = coreEngine.translate(CoreI18nComponentId, CoreStringKey.Common_Yes);
const error = coreEngine.translate(CoreI18nComponentId, CoreStringKey.Error_NotFound);
```

**Available core string categories:**

- **Common** (30+ strings): Yes, No, Cancel, OK, Save, Delete, Edit, Create, Update, Loading, Search, Filter, Sort, Export, Import, Settings, Help, About, Contact, Terms, Privacy, Logout, Profile, Dashboard, Home, Back, Next, Previous, Submit, Reset
- **Errors** (25+ strings): InvalidInput, NetworkError, NotFound, AccessDenied, ValidationFailed, Unauthorized, Forbidden, ServerError, Timeout, BadRequest, Conflict, Gone, TooManyRequests, ServiceUnavailable
- **System** (20+ strings): Welcome, Goodbye, PleaseWait, ProcessingRequest, OperationComplete, OperationFailed, Success, Warning, Info, Confirm, AreYouSure, UnsavedChanges, SessionExpired, MaintenanceMode

See `CoreStringKey` enum for complete list of available strings.

## Multiple Instances

Create isolated engines for different parts of your application (useful for micro-frontends, plugins, or multi-tenant systems):

```typescript
// Admin engine with admin-specific languages
const adminEngine = PluginI18nEngine.createInstance('admin', adminLanguages);

// User engine with user-facing languages
const userEngine = PluginI18nEngine.createInstance('user', userLanguages);

// Get instance by key
const admin = PluginI18nEngine.getInstance('admin');

// Check if instance exists
if (PluginI18nEngine.hasInstance('admin')) {
  // ...
}

// Remove instance (cleanup)
PluginI18nEngine.removeInstance('admin');

// Reset all instances (useful in tests)
PluginI18nEngine.resetAll(); // ⚠️ Removes ALL instances globally
```

**Use cases:**
- Micro-frontends with independent i18n
- Plugin systems with isolated translations
- Multi-tenant applications with tenant-specific languages
- Testing (create/destroy engines per test)

## Error Handling

### RegistryError

Errors related to component/language registration:

```typescript
import { RegistryError, RegistryErrorType } from '@digitaldefiance/i18n-lib';

try {
  engine.translate('missing', 'key');
} catch (error) {
  if (error instanceof RegistryError) {
    console.log(error.type);     // RegistryErrorType.COMPONENT_NOT_FOUND
    console.log(error.message);  // "Component 'missing' not found"
    console.log(error.metadata); // { componentId: 'missing' }
  }
}
```

### TranslatableError

Base class for errors with translated messages:

```typescript
import { TranslatableError, CoreStringKey, CoreI18nComponentId } from '@digitaldefiance/i18n-lib';

class MyError extends TranslatableError {
  constructor(language?: string) {
    super(
      CoreI18nComponentId,
      CoreStringKey.Error_AccessDenied,
      {},
      language
    );
  }
}

throw new MyError(LanguageCodes.FR); // Throws with French error message
```

## Translation Adapter

Adapt PluginI18nEngine to simpler TranslationEngine interface (useful when integrating with error classes or other components expecting a simplified translation interface):

```typescript
import { createTranslationAdapter } from '@digitaldefiance/i18n-lib';

const adapter = createTranslationAdapter(engine, 'componentId');

// Use adapter where TranslationEngine is expected
// (e.g., error classes, third-party libraries)
const message = adapter.translate('key', { var: 'value' });
```

## Language Codes

Built-in language codes following BCP 47 standard:

```typescript
import { LanguageCodes } from '@digitaldefiance/i18n-lib';

LanguageCodes.EN_US  // 'en-US'
LanguageCodes.EN_GB  // 'en-GB'
LanguageCodes.FR     // 'fr'
LanguageCodes.ES     // 'es'
LanguageCodes.DE     // 'de'
LanguageCodes.ZH_CN  // 'zh-CN'
LanguageCodes.JA     // 'ja'
LanguageCodes.UK     // 'uk'
```

**Adding custom language codes:**

```typescript
// Define your custom language type
type MyLanguages = CoreLanguageCode | 'pt-BR' | 'it' | 'nl';

// Create engine with custom languages
const engine = PluginI18nEngine.createInstance<MyLanguages>('app', [
  { id: LanguageCodes.EN_US, name: 'English', code: 'en-US', isDefault: true },
  { id: 'pt-BR', name: 'Portuguese (Brazil)', code: 'pt-BR' },
  { id: 'it', name: 'Italian', code: 'it' },
  { id: 'nl', name: 'Dutch', code: 'nl' },
]);
```

**Note**: The 8 built-in codes have pre-translated core strings. Custom languages require you to provide all translations.

## API Reference

### PluginI18nEngine

**Static Methods**

- `createInstance<TLanguage>(key: string, languages: LanguageDefinition[], config?: RegistryConfig)` - Create named instance
- `getInstance<TLanguage>(key?: string)` - Get instance by key
- `hasInstance(key?: string)` - Check if instance exists
- `removeInstance(key?: string)` - Remove instance
- `resetAll()` - Reset all instances

**Instance Methods**

- `registerComponent(registration: ComponentRegistration)` - Register component
- `translate(componentId: string, key: string, variables?, language?)` - Translate string
- `safeTranslate(componentId: string, key: string, variables?, language?)` - Safe translate with fallback
- `t(template: string, variables?, language?)` - Process template string
- `setLanguage(language: TLanguage)` - Set current language
- `setAdminLanguage(language: TLanguage)` - Set admin language
- `getCurrentLanguage()` - Get current language
- `getLanguages()` - Get all languages
- `hasLanguage(language: TLanguage)` - Check if language exists
- `switchToAdmin()` - Switch to admin context
- `switchToUser()` - Switch to user context
- `validate()` - Validate all components
- `registerBrandedComponent(registration)` - Register component with branded string keys
- `getCollisionReport()` - Get map of key collisions across components
- `registerStringKeyEnum(enum)` - Register a branded string key enum for direct translation
- `translateStringKey(key, variables?, language?)` - Translate a branded string key directly
- `safeTranslateStringKey(key, variables?, language?)` - Safe version returning placeholder on failure
- `hasStringKeyEnum(enum)` - Check if a branded enum is registered
- `getStringKeyEnums()` - Get all registered branded enums
- `registerConstants(componentId, constants)` - Register constants for a component (idempotent, conflict-detecting)
- `updateConstants(componentId, constants)` - Update/override constants for a component (merges, updater wins)
- `replaceConstants(constants)` - Replace all engine-level constants
- `mergeConstants(constants)` - Merge into engine-level constants
- `hasConstants(componentId)` - Check if constants are registered for a component
- `getConstants(componentId)` - Get constants for a specific component
- `getAllConstants()` - Get all registered constants entries
- `resolveConstantOwner(key)` - Resolve which component owns a constant key

### Branded Enum Functions

- `createI18nStringKeys(componentId, keys)` - Create a branded enum for i18n keys
- `createI18nStringKeysFromEnum(componentId, enum)` - Convert legacy enum to branded enum
- `mergeI18nStringKeys(newId, ...enums)` - Merge multiple branded enums
- `findStringKeySources(key)` - Find components containing a key
- `resolveStringKeyComponent(key)` - Resolve key to single component
- `getStringKeysByComponentId(id)` - Get enum by component ID
- `getRegisteredI18nComponents()` - List all registered components
- `getStringKeyValues(enum)` - Get all values from enum
- `isValidStringKey(value, enum)` - Type guard for key validation
- `checkStringKeyCollisions(...enums)` - Check enums for collisions

### Core Functions

- `getCoreI18nEngine()` - Get core engine with system strings
- `createCoreI18nEngine(instanceKey?)` - Create core engine instance
- `getCoreTranslation(stringKey, variables?, language?, instanceKey?)` - Get core translation
- `safeCoreTranslation(stringKey, variables?, language?, instanceKey?)` - Safe core translation
- `getCoreLanguageCodes()` - Get array of core language codes
- `getCoreLanguageDefinitions()` - Get core language definitions

## Testing

```typescript
import { PluginI18nEngine } from '@digitaldefiance/i18n-lib';

describe('My Tests', () => {
  beforeEach(() => {
    PluginI18nEngine.resetAll();
  });

  afterEach(() => {
    PluginI18nEngine.resetAll();
  });

  it('should translate', () => {
    const engine = PluginI18nEngine.createInstance('test', languages);
    engine.registerComponent(registration);
    expect(engine.translate('app', 'hello')).toBe('Hello');
  });
});
```

## TypeScript Support

Full TypeScript support with generic types:

```typescript
// Type-safe language codes
type MyLanguages = 'en-US' | 'fr' | 'es';
const engine = PluginI18nEngine.createInstance<MyLanguages>('app', languages);

// Type-safe string keys
enum MyStringKeys {
  Welcome = 'welcome',
  Goodbye = 'goodbye'
}

// Type-safe component registration
const registration: ComponentRegistration<MyStringKeys, MyLanguages> = {
  component: {
    id: 'app',
    name: 'App',
    stringKeys: Object.values(MyStringKeys)
  },
  strings: {
    'en-US': {
      [MyStringKeys.Welcome]: 'Welcome',
      [MyStringKeys.Goodbye]: 'Goodbye'
    },
    'fr': {
      [MyStringKeys.Welcome]: 'Bienvenue',
      [MyStringKeys.Goodbye]: 'Au revoir'
    }
  }
};
```

## Branded Enums

Branded enums enable runtime identification of string keys and collision detection between components. Unlike traditional TypeScript enums (erased at compile time), branded enums embed metadata for runtime component routing.

### Why Branded Enums?

- **Runtime Identification**: Determine which component a string key belongs to
- **Collision Detection**: Detect key collisions between components automatically
- **Component Routing**: Route translations to the correct handler when keys overlap
- **Zero Overhead**: Values remain raw strings with embedded metadata

### Creating Branded Enums

```typescript
import { createI18nStringKeys, BrandedStringKeyValue } from '@digitaldefiance/i18n-lib';

// Create a branded enum for i18n keys
export const UserKeys = createI18nStringKeys('user-component', {
  Login: 'user.login',
  Logout: 'user.logout',
  Profile: 'user.profile',
} as const);

// Export the value type for type annotations
export type UserKeyValue = BrandedStringKeyValue<typeof UserKeys>;
```

### Converting from Legacy Enums

```typescript
import { createI18nStringKeysFromEnum } from '@digitaldefiance/i18n-lib';

// Legacy enum
enum LegacyUserKeys {
  Login = 'user.login',
  Logout = 'user.logout',
}

// Convert to branded enum
const BrandedUserKeys = createI18nStringKeysFromEnum('user-component', LegacyUserKeys);
```

### Registering Branded Components

```typescript
// Use registerBrandedComponent instead of registerComponent
engine.registerBrandedComponent({
  component: {
    id: 'user-component',
    name: 'User Component',
    brandedStringKeys: UserKeys,
  },
  strings: {
    [LanguageCodes.EN_US]: {
      [UserKeys.Login]: 'Log In',
      [UserKeys.Logout]: 'Log Out',
      [UserKeys.Profile]: 'My Profile',
    },
  },
});
```

### Collision Detection

```typescript
import { checkStringKeyCollisions } from '@digitaldefiance/i18n-lib';

// Check specific enums for collisions
const result = checkStringKeyCollisions(UserKeys, AdminKeys, CommonKeys);

if (result.hasCollisions) {
  console.warn('String key collisions detected:');
  result.collisions.forEach(c => {
    console.warn(`  "${c.value}" in: ${c.componentIds.join(', ')}`);
  });
}

// Or use the engine's collision report
const collisions = engine.getCollisionReport();
for (const [key, componentIds] of collisions) {
  console.warn(`Key "${key}" found in: ${componentIds.join(', ')}`);
}
```

### Finding Key Sources

```typescript
import { findStringKeySources, resolveStringKeyComponent } from '@digitaldefiance/i18n-lib';

// Find all components that have a specific key
const sources = findStringKeySources('user.login');
// Returns: ['i18n:user-component']

// Resolve to a single component (null if ambiguous)
const componentId = resolveStringKeyComponent('user.login');
// Returns: 'user-component'
```

### Type Guards

```typescript
import { isValidStringKey } from '@digitaldefiance/i18n-lib';

function handleKey(key: string) {
  if (isValidStringKey(key, UserKeys)) {
    // key is now typed as UserKeyValue
    return translateUserKey(key);
  }
  if (isValidStringKey(key, AdminKeys)) {
    // key is now typed as AdminKeyValue
    return translateAdminKey(key);
  }
  return key; // Unknown key
}
```

### Merging Enums

```typescript
import { mergeI18nStringKeys, getStringKeyValues } from '@digitaldefiance/i18n-lib';

// Create a combined key set for the entire app
const AllKeys = mergeI18nStringKeys('all-keys',
  CoreStringKeys,
  UserKeys,
  AdminKeys,
);

// Get all values from an enum
const allValues = getStringKeyValues(AllKeys);
```

### Best Practices

1. **Use Namespaced Key Values**: Prevent collisions with prefixed values
   ```typescript
   // ✅ Good - namespaced values
   const Keys = createI18nStringKeys('user', {
     Welcome: 'user.welcome',
   } as const);
   
   // ❌ Bad - generic values may collide
   const Keys = createI18nStringKeys('user', {
     Welcome: 'welcome',
   } as const);
   ```

2. **Use Consistent Component IDs**: Match IDs across enum creation and registration

3. **Always Use `as const`**: Preserve literal types
   ```typescript
   // ✅ Correct - literal types preserved
   const Keys = createI18nStringKeys('id', { A: 'a' } as const);
   
   // ❌ Wrong - types widened to string
   const Keys = createI18nStringKeys('id', { A: 'a' });
   ```

4. **Check for Collisions During Development**:
   ```typescript
   if (process.env.NODE_ENV === 'development') {
     const collisions = engine.getCollisionReport();
     if (collisions.size > 0) {
       console.warn('⚠️ String key collisions detected!');
     }
   }
   ```

For complete migration guide, see [BRANDED_ENUM_MIGRATION.md](docs/BRANDED_ENUM_MIGRATION.md).

### String Key Enum Registration

Register branded string key enums with the engine for direct translation without specifying component IDs. This simplifies translation calls and enables automatic component routing.

#### Registering String Key Enums

```typescript
import { createI18nStringKeysFromEnum, PluginI18nEngine } from '@digitaldefiance/i18n-lib';

// Create a branded enum from your string keys
enum MyStringKeys {
  Welcome = 'welcome',
  Goodbye = 'goodbye',
}

const BrandedKeys = createI18nStringKeysFromEnum('my-component', MyStringKeys);

// Create engine and register component
const engine = PluginI18nEngine.createInstance('myapp', languages);
engine.registerBrandedComponent({
  component: {
    id: 'my-component',
    name: 'My Component',
    brandedStringKeys: BrandedKeys,
  },
  strings: {
    [LanguageCodes.EN_US]: {
      [BrandedKeys.Welcome]: 'Welcome!',
      [BrandedKeys.Goodbye]: 'Goodbye!',
    },
  },
});

// Register the enum for direct translation
engine.registerStringKeyEnum(BrandedKeys);
```

#### Direct Translation with translateStringKey

Once registered, translate keys directly without specifying the component ID:

```typescript
// Before: Required component ID
const text = engine.translate('my-component', BrandedKeys.Welcome, { name: 'Alice' });

// After: Component ID resolved automatically from branded enum
const text = engine.translateStringKey(BrandedKeys.Welcome, { name: 'Alice' });

// Safe version returns placeholder on failure instead of throwing
const safeText = engine.safeTranslateStringKey(BrandedKeys.Welcome, { name: 'Alice' });
```

#### Checking Registration Status

```typescript
// Check if an enum is registered
if (engine.hasStringKeyEnum(BrandedKeys)) {
  console.log('BrandedKeys is registered');
}

// Get all registered enums
const registeredEnums = engine.getStringKeyEnums();
```

#### Benefits

- **Cleaner Code**: No need to repeat component IDs in every translation call
- **Automatic Routing**: Component ID resolved from branded enum metadata
- **Type Safety**: Full TypeScript support with branded enum types
- **Idempotent**: Safe to call `registerStringKeyEnum()` multiple times

### Branded Enum Translation

The enum translation system supports branded enums from `@digitaldefiance/branded-enum`, enabling automatic name inference and type-safe enum value translations.

#### Why Use Branded Enums for Enum Translation?

- **Automatic Name Inference**: No need to provide an explicit enum name - it's extracted from the branded enum's component ID
- **Type Safety**: Full TypeScript support for enum values and translations
- **Consistent Naming**: Enum names in error messages match your component IDs
- **Unified Pattern**: Use the same branded enum pattern for both string keys and enum translations

#### Registering Branded Enums for Translation

```typescript
import { createBrandedEnum } from '@digitaldefiance/branded-enum';
import { I18nEngine, LanguageCodes } from '@digitaldefiance/i18n-lib';

// Create a branded enum
const Status = createBrandedEnum('status', {
  Active: 'active',
  Inactive: 'inactive',
  Pending: 'pending',
});

// Create engine
const engine = new I18nEngine([
  { id: LanguageCodes.EN_US, name: 'English', code: 'en-US', isDefault: true },
  { id: LanguageCodes.ES, name: 'Spanish', code: 'es' },
]);

// Register branded enum - name is automatically inferred as 'status'
engine.registerEnum(Status, {
  [LanguageCodes.EN_US]: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
  },
  [LanguageCodes.ES]: {
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente',
  },
});

// Translate enum values
engine.translateEnum(Status, Status.Active, LanguageCodes.EN_US); // 'Active'
engine.translateEnum(Status, Status.Active, LanguageCodes.ES);    // 'Activo'
```

#### Comparison: Traditional vs Branded Enum Registration

```typescript
// Traditional enum - requires explicit name
enum TraditionalStatus {
  Active = 'active',
  Inactive = 'inactive',
}
engine.registerEnum(TraditionalStatus, translations, 'Status'); // Name required

// Branded enum - name inferred from component ID
const BrandedStatus = createBrandedEnum('status', {
  Active: 'active',
  Inactive: 'inactive',
});
engine.registerEnum(BrandedStatus, translations); // Name 'status' inferred automatically
```

#### Using with PluginI18nEngine

The `PluginI18nEngine` also supports branded enum translation with language validation:

```typescript
import { PluginI18nEngine, LanguageCodes } from '@digitaldefiance/i18n-lib';
import { createBrandedEnum } from '@digitaldefiance/branded-enum';

const Priority = createBrandedEnum('priority', {
  High: 'high',
  Medium: 'medium',
  Low: 'low',
});

const engine = PluginI18nEngine.createInstance('myapp', [
  { id: LanguageCodes.EN_US, name: 'English', code: 'en-US', isDefault: true },
  { id: LanguageCodes.FR, name: 'French', code: 'fr' },
]);

// Register with automatic name inference
engine.registerEnum(Priority, {
  [LanguageCodes.EN_US]: {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority',
  },
  [LanguageCodes.FR]: {
    high: 'Haute Priorité',
    medium: 'Priorité Moyenne',
    low: 'Basse Priorité',
  },
});

// Translate
engine.translateEnum(Priority, Priority.High); // Uses current language
engine.translateEnum(Priority, Priority.High, LanguageCodes.FR); // 'Haute Priorité'
```

#### Utility Functions

The library provides utility functions for working with branded enums:

```typescript
import { 
  isBrandedEnum, 
  getBrandedEnumComponentId, 
  getBrandedEnumId 
} from '@digitaldefiance/i18n-lib';

// Check if an enum is branded
if (isBrandedEnum(Status)) {
  // TypeScript knows Status is a branded enum here
  const componentId = getBrandedEnumComponentId(Status);
  console.log(componentId); // 'status'
}

// Get the raw brand ID (includes 'i18n:' prefix for i18n string keys)
const rawId = getBrandedEnumId(Status); // 'status'
```

#### Error Messages with Branded Enums

When translation errors occur, the enum name in error messages is automatically derived from the branded enum's component ID:

```typescript
const Status = createBrandedEnum('user-status', { Active: 'active' });
engine.registerEnum(Status, { en: { active: 'Active' } });

// If translation fails, error message includes the inferred name:
// "No translations found for enum: user-status"
// "Translation missing for enum value 'unknown' in language 'en'"
```

#### Type Definitions

New types are available for working with branded enum translations:

```typescript
import type {
  BrandedEnumTranslation,
  RegisterableEnum,
  TranslatableEnumValue,
} from '@digitaldefiance/i18n-lib';

// Type for branded enum translation maps
type MyTranslations = BrandedEnumTranslation<typeof Status, 'en' | 'es'>;

// Union type accepting both traditional and branded enums
function registerAnyEnum<T extends string | number>(
  enumObj: RegisterableEnum<T>,
  translations: Record<string, Record<string, string>>,
): void {
  // Works with both enum types
}

// Union type for translatable values
function translateAnyValue<T extends string | number>(
  value: TranslatableEnumValue<T>,
): string {
  // Works with both traditional and branded enum values
}
```

## Monorepo i18n-setup Guide

When building an application that consumes multiple Express Suite packages (e.g., `suite-core-lib`, `ecies-lib`), you need a single `i18n-setup.ts` file that initializes the engine, registers all components and their branded string key enums, sets up the global context, and exports translation helpers.

### Recommended: Factory Approach (`createI18nSetup`)

The `createI18nSetup()` factory replaces ~200 lines of manual boilerplate with a single function call. It handles engine creation, core component registration, library component registration, branded enum registration, and context initialization automatically.

```typescript
// i18n-setup.ts — Application-level i18n initialization (factory approach)

import {
  createI18nSetup,
  createI18nStringKeys,
  LanguageCodes,
} from '@digitaldefiance/i18n-lib';
import { createSuiteCoreComponentPackage } from '@digitaldefiance/suite-core-lib';
import { createEciesComponentPackage } from '@digitaldefiance/ecies-lib';

// 1. Define your application component
export const AppComponentId = 'MyApp';

export const AppStringKey = createI18nStringKeys(AppComponentId, {
  SiteTitle: 'siteTitle',
  SiteDescription: 'siteDescription',
  WelcomeMessage: 'welcomeMessage',
} as const);

const appStrings = {
  [LanguageCodes.EN_US]: {
    siteTitle: 'My Application',
    siteDescription: 'An Express Suite application',
    welcomeMessage: 'Welcome, {name}!',
  },
  [LanguageCodes.FR]: {
    siteTitle: 'Mon Application',
    siteDescription: 'Une application Express Suite',
    welcomeMessage: 'Bienvenue, {name} !',
  },
};

// 2. Create the i18n setup — one call does everything
const i18n = createI18nSetup({
  componentId: AppComponentId,
  stringKeyEnum: AppStringKey,
  strings: appStrings,
  aliases: ['AppStringKey'],
  libraryComponents: [
    createSuiteCoreComponentPackage(),
    createEciesComponentPackage(),
  ],
});

// 3. Export the public API
export const { engine: i18nEngine, translate, safeTranslate } = i18n;
export const i18nContext = i18n.context;
```

The factory:
- Creates or reuses an `I18nEngine` instance (idempotent via `instanceKey`, defaults to `'default'`)
- Registers the Core i18n component automatically
- Registers each library component's `ComponentConfig` and branded `stringKeyEnum` from the `I18nComponentPackage`
- Registers your application component and its branded enum
- Initializes `GlobalActiveContext` with the specified `defaultLanguage` (defaults to `'en-US'`)
- Returns an `I18nSetupResult` with `engine`, `translate`, `safeTranslate`, `context`, `setLanguage`, `setAdminLanguage`, `setContext`, `getLanguage`, `getAdminLanguage`, and `reset`

Calling `createI18nSetup()` multiple times with the same `instanceKey` reuses the existing engine — safe for monorepos where a subset library and a superset API both call the factory.

### I18nComponentPackage Interface

Library authors bundle a `ComponentConfig` with its branded string key enum in a single `I18nComponentPackage` object. This lets the factory auto-register both the component and its enum in one step.

```typescript
import type { AnyBrandedEnum } from '@digitaldefiance/branded-enum';
import type { ComponentConfig } from '@digitaldefiance/i18n-lib';

interface I18nComponentPackage {
  readonly config: ComponentConfig;
  readonly stringKeyEnum?: AnyBrandedEnum;
}
```

Each library exports a `createXxxComponentPackage()` function:

```typescript
// In suite-core-lib
import { createSuiteCoreComponentPackage } from '@digitaldefiance/suite-core-lib';
const pkg = createSuiteCoreComponentPackage();
// pkg.config  → SuiteCore ComponentConfig
// pkg.stringKeyEnum → SuiteCoreStringKey branded enum

// In ecies-lib
import { createEciesComponentPackage } from '@digitaldefiance/ecies-lib';
const pkg = createEciesComponentPackage();

// In node-ecies-lib
import { createNodeEciesComponentPackage } from '@digitaldefiance/node-ecies-lib';
const pkg = createNodeEciesComponentPackage();
```

The existing `createSuiteCoreComponentConfig()` and `createEciesComponentConfig()` functions remain available for consumers that prefer the manual approach.

### Browser-Safe Fallback

In browser environments, bundlers like Vite and webpack may create separate copies of `@digitaldefiance/branded-enum`, causing `isBrandedEnum()` to fail due to Symbol/WeakSet identity mismatch. This breaks `registerStringKeyEnum()` and `translateStringKey()`.

The engine now includes a transparent fallback: when the `StringKeyEnumRegistry` fails to resolve a component ID for a known string key value, the engine scans all registered components' string keys to find the matching component. The result is cached in a `ValueComponentLookupCache` for subsequent lookups, and the cache is invalidated whenever a new component is registered.

This means consumers do not need manual workarounds (like `safeRegisterStringKeyEnum` or `_componentLookup` maps) for bundler Symbol mismatch issues. Both `translateStringKey` and `safeTranslateStringKey` use the fallback automatically.

### Advanced: Manual Setup

For advanced use cases where you need full control over engine creation, validation options, or custom registration order, you can use the manual approach:

<details>
<summary>Click to expand manual i18n-setup.ts example</summary>

```typescript
// i18n-setup.ts — Manual approach (advanced)

import {
  I18nBuilder,
  I18nEngine,
  LanguageCodes,
  GlobalActiveContext,
  getCoreLanguageDefinitions,
  createCoreComponentRegistration,
  createI18nStringKeys,
  type CoreLanguageCode,
  type IActiveContext,
  type ComponentConfig,
  type LanguageContextSpace,
} from '@digitaldefiance/i18n-lib';
import type { BrandedEnumValue } from '@digitaldefiance/branded-enum';
import {
  createSuiteCoreComponentConfig,
  SuiteCoreStringKey,
} from '@digitaldefiance/suite-core-lib';
import {
  createEciesComponentConfig,
  EciesStringKey,
} from '@digitaldefiance/ecies-lib';

export const AppComponentId = 'MyApp';

export const AppStringKey = createI18nStringKeys(AppComponentId, {
  SiteTitle: 'siteTitle',
  SiteDescription: 'siteDescription',
  WelcomeMessage: 'welcomeMessage',
} as const);

export type AppStringKeyValue = BrandedEnumValue<typeof AppStringKey>;

const appStrings: Record<string, Record<string, string>> = {
  [LanguageCodes.EN_US]: {
    siteTitle: 'My Application',
    siteDescription: 'An Express Suite application',
    welcomeMessage: 'Welcome, {name}!',
  },
  [LanguageCodes.FR]: {
    siteTitle: 'Mon Application',
    siteDescription: 'Une application Express Suite',
    welcomeMessage: 'Bienvenue, {name} !',
  },
};

function createAppComponentConfig(): ComponentConfig {
  return { id: AppComponentId, strings: appStrings, aliases: ['AppStringKey'] };
}

// Create or reuse engine
let i18nEngine: I18nEngine;
if (I18nEngine.hasInstance('default')) {
  i18nEngine = I18nEngine.getInstance('default');
} else {
  i18nEngine = I18nBuilder.create()
    .withLanguages(getCoreLanguageDefinitions())
    .withDefaultLanguage(LanguageCodes.EN_US)
    .withFallbackLanguage(LanguageCodes.EN_US)
    .withInstanceKey('default')
    .build();
}

// Register components
const coreReg = createCoreComponentRegistration();
i18nEngine.registerIfNotExists({
  id: coreReg.component.id,
  strings: coreReg.strings as Record<string, Record<string, string>>,
});
i18nEngine.registerIfNotExists(createSuiteCoreComponentConfig());
i18nEngine.registerIfNotExists(createEciesComponentConfig());
i18nEngine.registerIfNotExists(createAppComponentConfig());

// Register branded enums
if (!i18nEngine.hasStringKeyEnum(SuiteCoreStringKey)) {
  i18nEngine.registerStringKeyEnum(SuiteCoreStringKey);
}
if (!i18nEngine.hasStringKeyEnum(EciesStringKey)) {
  i18nEngine.registerStringKeyEnum(EciesStringKey);
}
if (!i18nEngine.hasStringKeyEnum(AppStringKey)) {
  i18nEngine.registerStringKeyEnum(AppStringKey);
}

// Initialize context
const globalContext = GlobalActiveContext.getInstance<
  CoreLanguageCode,
  IActiveContext<CoreLanguageCode>
>();
globalContext.createContext(LanguageCodes.EN_US, LanguageCodes.EN_US, AppComponentId);

// Export helpers
export { i18nEngine };

export const translate = (
  name: AppStringKeyValue,
  variables?: Record<string, string | number>,
  language?: CoreLanguageCode,
  context?: LanguageContextSpace,
): string => {
  const activeContext =
    context ?? globalContext.getContext(AppComponentId).currentContext;
  const lang =
    language ??
    (activeContext === 'admin'
      ? globalContext.getContext(AppComponentId).adminLanguage
      : globalContext.getContext(AppComponentId).language);
  return i18nEngine.translateStringKey(name, variables, lang);
};

export const safeTranslate = (
  name: AppStringKeyValue,
  variables?: Record<string, string | number>,
  language?: CoreLanguageCode,
  context?: LanguageContextSpace,
): string => {
  const activeContext =
    context ?? globalContext.getContext(AppComponentId).currentContext;
  const lang =
    language ??
    (activeContext === 'admin'
      ? globalContext.getContext(AppComponentId).adminLanguage
      : globalContext.getContext(AppComponentId).language);
  return i18nEngine.safeTranslateStringKey(name, variables, lang);
};
```

</details>

Key points for the manual approach:

- **Idempotent engine creation**: `I18nEngine.hasInstance('default')` checks for an existing engine before building a new one.
- **Core component first**: Always register the Core component before other components — it provides error message translations used internally.
- **`registerIfNotExists`**: All component registrations use the idempotent variant so multiple packages can safely register without conflicts.
- **`hasStringKeyEnum` guard**: Prevents duplicate enum registration when multiple setup files run in the same process.
- **Context-aware helpers**: The `translate` and `safeTranslate` functions resolve the active language from `GlobalActiveContext`, respecting user vs. admin context.

### Migration Guide

Converting an existing manual `i18n-setup.ts` to the factory approach is straightforward. There are no breaking changes — the factory produces the same engine state as the manual approach.

#### Before (manual)

```typescript
import { I18nBuilder, I18nEngine, LanguageCodes, GlobalActiveContext, ... } from '@digitaldefiance/i18n-lib';
import { createSuiteCoreComponentConfig, SuiteCoreStringKey } from '@digitaldefiance/suite-core-lib';
import { createEciesComponentConfig, EciesStringKey } from '@digitaldefiance/ecies-lib';

// ~200 lines: engine creation, core registration, library registration,
// enum registration, context initialization, translate helpers...
```

#### After (factory)

```typescript
import { createI18nSetup, createI18nStringKeys, LanguageCodes } from '@digitaldefiance/i18n-lib';
import { createSuiteCoreComponentPackage } from '@digitaldefiance/suite-core-lib';
import { createEciesComponentPackage } from '@digitaldefiance/ecies-lib';

const i18n = createI18nSetup({
  componentId: AppComponentId,
  stringKeyEnum: AppStringKey,
  strings: appStrings,
  libraryComponents: [
    createSuiteCoreComponentPackage(),
    createEciesComponentPackage(),
  ],
});

export const { engine: i18nEngine, translate, safeTranslate } = i18n;
```

#### Migration steps

1. Replace `createXxxComponentConfig` imports with `createXxxComponentPackage` imports
2. Replace manual engine creation (`I18nBuilder` / `I18nEngine.registerIfNotExists`) with `createI18nSetup()`
3. Move library component registrations into the `libraryComponents` array
4. Remove manual `registerStringKeyEnum` calls — the factory handles them
5. Remove manual `GlobalActiveContext` initialization — the factory handles it
6. Destructure the returned `I18nSetupResult` to get `engine`, `translate`, `safeTranslate`, etc.

#### Notes

- Existing `createXxxComponentConfig()` functions remain available for consumers that prefer the manual approach
- The factory uses the same `registerIfNotExists` pattern internally, so it is safe to mix factory and manual consumers sharing the same engine instance
- There are no breaking changes or behavioral differences between the manual and factory approaches

### createI18nStringKeys vs createI18nStringKeysFromEnum

Both functions produce identical `BrandedStringKeys` output. Choose based on your starting point.

#### createI18nStringKeys — preferred for new code

Creates a branded enum directly from an `as const` object literal:

```typescript
import { createI18nStringKeys } from '@digitaldefiance/i18n-lib';

export const AppStringKey = createI18nStringKeys('my-app', {
  Welcome: 'welcome',
  Goodbye: 'goodbye',
} as const);
```

Use this when writing a new component from scratch. The `as const` assertion preserves literal types so each key is fully type-safe.

#### createI18nStringKeysFromEnum — useful for migration

Wraps an existing TypeScript enum into a branded enum:

```typescript
import { createI18nStringKeysFromEnum } from '@digitaldefiance/i18n-lib';

// Existing traditional enum
enum LegacyStringKeys {
  Welcome = 'welcome',
  Goodbye = 'goodbye',
}

export const AppStringKey = createI18nStringKeysFromEnum(
  'my-app',
  LegacyStringKeys,
);
```

Use this when migrating code that already has a traditional `enum`. Internally, `createI18nStringKeysFromEnum` filters out TypeScript's reverse numeric mappings and then delegates to `createI18nStringKeys`.

#### Comparison

| Aspect | `createI18nStringKeys` | `createI18nStringKeysFromEnum` |
|---|---|---|
| Input | Object literal with `as const` | Existing TypeScript enum |
| Use case | New code, fresh components | Migrating existing enum-based code |
| Output | `BrandedStringKeys<T>` | `BrandedStringKeys<T>` |
| Internal behavior | Calls `createBrandedEnum` directly | Filters reverse numeric mappings, then delegates to `createI18nStringKeys` |

### Troubleshooting: Branded Enum Module Identity in Monorepos

#### Symptom

`registerStringKeyEnum()` throws or `hasStringKeyEnum()` returns `false` for a branded enum that was created with `createI18nStringKeys` or `createI18nStringKeysFromEnum`.

#### Root Cause

`isBrandedEnum()` returns `false` when the `@digitaldefiance/branded-enum` global registry holds a different module instance. This happens when multiple copies of the package are installed — each copy has its own `WeakSet` / `Symbol` registry, so enums created by one copy are not recognized by another.

#### Diagnosis

Check for duplicate installations:

```bash
# npm
npm ls @digitaldefiance/branded-enum

# yarn
yarn why @digitaldefiance/branded-enum
```

If you see more than one resolved version (or multiple paths), the registry is split.

#### Solutions

1. **Single version via resolutions/overrides** — pin a single version in your root `package.json`:

   ```jsonc
   // npm (package.json)
   "overrides": {
     "@digitaldefiance/branded-enum": "<version>"
   }

   // yarn (package.json)
   "resolutions": {
     "@digitaldefiance/branded-enum": "<version>"
   }
   ```

2. **Bundler deduplication** — if you use webpack, Rollup, or esbuild, ensure the `@digitaldefiance/branded-enum` module is resolved to a single path. For webpack, the `resolve.alias` or `resolve.dedupe` options can help.

3. **Consistent package resolution** — in Nx or other monorepo tools, verify that all projects resolve the same physical copy. Running `nx graph` can help visualize dependency relationships.

## Browser Support

- Chrome/Edge: Latest 2 versions (minimum: Chrome 90, Edge 90)
- Firefox: Latest 2 versions (minimum: Firefox 88)
- Safari: Latest 2 versions (minimum: Safari 14)
- Node.js: 18+

**Polyfills**: Not required for supported versions. For older browsers, you may need:
- `Intl.PluralRules` polyfill
- `Intl.NumberFormat` polyfill

## Troubleshooting

### Component Not Found Error

**Problem**: `RegistryError: Component 'xyz' not found`

**Solutions**:
1. Ensure component is registered before use: `engine.registerComponent({...})`
2. Check component ID spelling matches exactly
3. Verify registration completed successfully (no errors thrown)

### Translation Returns `[componentId.key]`

**Problem**: Translation returns placeholder instead of translated text

**Solutions**:
1. Check string key exists in component registration
2. Verify current language has translation for this key
3. Use `engine.validate()` to find missing translations
4. Check if using `safeTranslate()` (returns placeholder on error)

### Plural Forms Not Working

**Problem**: Always shows same plural form regardless of count

**Solutions**:
1. Ensure passing `count` variable: `engine.translate('id', 'key', { count: 5 })`
2. Use `createPluralString()` helper to create plural object
3. Verify language has correct plural rules (see PLURALIZATION_SUPPORT.md)
4. Check required plural forms for language: `getRequiredPluralForms('ru')`

### ICU MessageFormat Not Parsing

**Problem**: ICU syntax appears as literal text

**Solutions**:
1. Use `formatICUMessage()` function, not `translate()`
2. Check ICU syntax is valid: `validateICUMessage(message)`
3. Ensure variables are provided: `formatICUMessage(msg, { count: 1 })`
4. See [docs/ICU_MESSAGEFORMAT.md](docs/ICU_MESSAGEFORMAT.md) for syntax

### Memory Leak with Multiple Instances

**Problem**: Memory usage grows over time

**Solutions**:
1. Call `PluginI18nEngine.removeInstance(key)` when done
2. Use `resetAll()` in test cleanup
3. Reuse instances instead of creating new ones
4. Check for circular references in custom code

### TypeScript Type Errors

**Problem**: Type errors with language codes or string keys

**Solutions**:
1. Use generic types: `PluginI18nEngine.createInstance<MyLanguages>(...)`
2. Ensure `as const` on string key objects
3. Import types: `import type { ComponentRegistration } from '@digitaldefiance/i18n-lib'`
4. Check TypeScript version (4.5+ recommended)

## FAQ

### When should I use ICU MessageFormat vs simple templates?

**Use ICU MessageFormat when:**
- You need complex pluralization (multiple forms)
- You need gender-specific translations
- You need number/date/time formatting
- You need nested conditional logic

**Use simple templates when:**
- You only need variable substitution
- You're referencing other components ({{Component.key}})
- You want simpler, more readable strings

### How do I handle missing translations?

**Options:**
1. Use `safeTranslate()` - returns `[componentId.key]` placeholder
2. Set fallback language in config
3. Use `engine.validate()` to find missing translations during development
4. Implement custom error handling with try/catch

### Can I use this library without TypeScript?

**Yes**, but you lose type safety benefits:
```javascript
const { PluginI18nEngine, LanguageCodes } = require('@digitaldefiance/i18n-lib');
const engine = PluginI18nEngine.createInstance('app', languages);
```

### How do I add a new language?

**Steps:**
1. Add language definition to engine creation
2. Register components with translations for new language
3. If using plurals, check required forms: `getRequiredPluralForms('pt-BR')`
4. See [docs/ADDING_LANGUAGES.md](docs/ADDING_LANGUAGES.md) for details

### What's the difference between branded enums and regular enums?

**Branded enums** (v4.0.4+):
- Runtime identification of component ownership
- Collision detection between components
- Automatic component routing
- Created with `createI18nStringKeys()`

**Regular enums**:
- Compile-time only (erased at runtime)
- No collision detection
- Must specify component ID in every translate call

### How do I migrate from v1.x to v4.x?

**Key changes:**
1. `CoreLanguage` enum → `LanguageCodes` constants
2. Language IDs now use BCP 47 codes ('en-US' not 'English (US)')
3. `register()` → `registerComponent()` (more explicit)
4. See [docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md) for complete guide

### Can I use multiple engines in the same application?

**Yes**, use named instances:
```typescript
const adminEngine = PluginI18nEngine.createInstance('admin', adminLangs);
const userEngine = PluginI18nEngine.createInstance('user', userLangs);
```

See [Multiple Instances](#multiple-instances) section for details.

### How do I test components that use i18n?

**Pattern:**
```typescript
import { PluginI18nEngine } from '@digitaldefiance/i18n-lib';

describe('MyComponent', () => {
  beforeEach(() => {
    PluginI18nEngine.resetAll();
    const engine = PluginI18nEngine.createInstance('test', languages);
    engine.registerComponent(/* ... */);
  });

  afterEach(() => {
    PluginI18nEngine.resetAll();
  });
});
```

See [Testing](#testing) section for more patterns.

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Submit a pull request

## Support

- **Issues**: <https://github.com/Digital-Defiance/i18n-lib/issues>
- **Documentation**: See docs/ directory
- **Examples**: See tests/ directory

## ChangeLog

### Version 4.4.0

**Factory-Based i18n Setup & Browser-Safe Fallback**

This release introduces `createI18nSetup()`, a factory function that replaces ~200 lines of boilerplate per consumer with a single function call. It also adds a browser-safe fallback for `translateStringKey` when bundler-duplicated packages break Symbol-based identity checks.

**New Features:**

- **`createI18nSetup()`**: Factory function that handles engine creation, core/library/app component registration, branded enum registration, and `GlobalActiveContext` initialization in one call
- **`I18nComponentPackage`** interface: Bundles a `ComponentConfig` with its branded string key enum so the factory can auto-register both
- **`I18nSetupConfig`** / **`I18nSetupResult`** interfaces: Typed config input and result output for the factory
- **`createSuiteCoreComponentPackage()`**: New function in `suite-core-lib` returning an `I18nComponentPackage`
- **`createEciesComponentPackage()`**: New function in `ecies-lib` returning an `I18nComponentPackage`
- **`createNodeEciesComponentPackage()`**: New function in `node-ecies-lib` returning an `I18nComponentPackage`
- **Browser-safe fallback**: `translateStringKey` and `safeTranslateStringKey` now fall back to scanning registered components when the `StringKeyEnumRegistry` fails (e.g., due to bundler Symbol mismatch), with a lazily-built `ValueComponentLookupCache` that invalidates on new component registration
- **Updated starter template**: `express-suite-starter` scaffolding now uses `createI18nSetup()` for minimal boilerplate

**Backward Compatibility:**

- All existing APIs (`createSuiteCoreComponentConfig`, `createEciesComponentConfig`, `I18nBuilder`, manual registration) remain unchanged
- The factory uses the same `registerIfNotExists` pattern internally, so factory and manual consumers can safely share the same engine instance

### Version 4.3.0

**String Key Enum Registration for Direct Translation**

This release adds the ability to register branded string key enums with the I18nEngine for direct translation via `translateStringKey()`. This enables automatic component ID resolution from branded enum values.

**New Features:**

- **`registerStringKeyEnum()`**: Register a branded string key enum for direct translation support
  ```typescript
  import { createI18nStringKeysFromEnum } from '@digitaldefiance/i18n-lib';
  
  const MyKeys = createI18nStringKeysFromEnum('my-component', MyStringKeyEnum);
  engine.registerStringKeyEnum(MyKeys);
  ```

- **`translateStringKey()`**: Translate a branded string key value directly without specifying component ID
  ```typescript
  // Before: engine.translate('my-component', MyKeys.Welcome, { name: 'Alice' });
  // After:
  engine.translateStringKey(MyKeys.Welcome, { name: 'Alice' });
  ```

- **`safeTranslateStringKey()`**: Safe version that returns a placeholder on failure instead of throwing

- **`hasStringKeyEnum()`**: Check if a branded enum is registered

- **`getStringKeyEnums()`**: Get all registered branded enums

**New Error Codes:**

- `INVALID_STRING_KEY_ENUM` - When a non-branded enum is passed to `registerStringKeyEnum()`
- `STRING_KEY_NOT_REGISTERED` - When translating a key from an unregistered enum

**Benefits:**

- Cleaner translation calls without repeating component IDs
- Automatic component routing based on branded enum metadata
- Type-safe translations with full TypeScript support
- Idempotent registration (safe to call multiple times)

### Version 4.2.0

**Branded Enum Translation Support**

This release adds comprehensive support for translating branded enums from `@digitaldefiance/branded-enum`, enabling automatic name inference and type-safe enum value translations.

**New Features:**

- **Automatic Name Inference**: When registering a branded enum, the name is automatically extracted from the enum's component ID
  ```typescript
  const Status = createBrandedEnum('status', { Active: 'active', Inactive: 'inactive' });
  engine.registerEnum(Status, translations); // Name 'status' inferred automatically
  ```

- **New Utility Functions**:
  - `isBrandedEnum()` - Type guard to detect branded enums
  - `getBrandedEnumComponentId()` - Extract component ID from branded enum
  - `getBrandedEnumId()` - Get raw brand ID for debugging

- **Enhanced `registerEnum()`**: Now accepts branded enums and returns the registered translations object

- **Property-Based Tests**: Comprehensive property tests for branded enum translation ensuring:
  - Registration idempotence
  - Translation consistency across languages
  - Proper error handling for missing translations

**Documentation:**

- Added "Branded Enum Translation" section to README
- Comprehensive JSDoc documentation for all new utilities

### Version 4.1.0

**Enhanced Type Documentation and BrandedMasterStringsCollection**

This release focuses on improved documentation and ergonomic type aliases for working with branded enums.

**New Features:**

- **`BrandedMasterStringsCollection<E, TLanguage>`**: Ergonomic type alias for defining translation collections with branded enums
  ```typescript
  const translations: BrandedMasterStringsCollection<typeof MyKeys, CoreLanguageCode> = {
    [LanguageCodes.EN_US]: { 'my.welcome': 'Welcome!' },
    [LanguageCodes.FR]: { 'my.welcome': 'Bienvenue!' },
  };
  ```

- **`BrandedPluralMasterStringsCollection<E, TLanguage>`**: Type alias for plural-aware branded translations

- **Comprehensive Module Documentation**: Added extensive JSDoc documentation to `types.ts` explaining:
  - Traditional enums vs branded enums
  - Migration patterns from legacy enums
  - Complete examples for defining translations

**Documentation:**

- Step-by-step guide for creating branded string keys
- Examples showing `BrandedMasterStringsCollection` usage
- Migration guide from traditional `EnumLanguageTranslation` types

### Version 4.0.4

**Branded Enums for Runtime String Key Identification**

This release introduces branded enums - a powerful feature enabling runtime identification of i18n string keys, collision detection, and intelligent component routing.

**Why Branded Enums?**

Traditional TypeScript enums are erased at compile time, making it impossible to:
- Determine which component a string key belongs to at runtime
- Detect key collisions between components
- Route translations to the correct handler when keys overlap

Branded enums solve these problems by embedding metadata that enables runtime identification while maintaining zero overhead (values remain raw strings).

**New Features:**

- **`createI18nStringKeys()`**: Factory function to create branded enums with component metadata
  ```typescript
  const UserKeys = createI18nStringKeys('user-component', {
    Login: 'user.login',
    Logout: 'user.logout',
  } as const);
  ```

- **`createI18nStringKeysFromEnum()`**: Convert existing TypeScript enums to branded enums for gradual migration

- **`mergeI18nStringKeys()`**: Combine multiple branded enums into a single namespace

- **Collision Detection**: Automatically detect when multiple components use the same string key
  ```typescript
  const result = checkStringKeyCollisions(UserKeys, AdminKeys);
  if (result.hasCollisions) {
    // Handle collisions
  }
  ```

- **Key Source Resolution**: Find which component(s) a key belongs to
  ```typescript
  const sources = findStringKeySources('user.login'); // ['i18n:user-component']
  const componentId = resolveStringKeyComponent('user.login'); // 'user-component'
  ```

- **Type Guards**: Runtime validation with TypeScript type narrowing
  ```typescript
  if (isValidStringKey(key, UserKeys)) {
    // key is now typed as UserKeyValue
  }
  ```

- **Engine Integration**: New `registerBrandedComponent()` method and `getCollisionReport()` for engine-level collision tracking

**New Types:**

- `BrandedStringKeys<T>` - Type alias for branded enum objects
- `BrandedStringKeyValue<E>` - Extract value union from branded enum
- `StringKeyCollisionResult` - Result type for collision detection

**API Additions:**

| Function | Description |
|----------|-------------|
| `createI18nStringKeys(componentId, keys)` | Create a branded enum for i18n keys |
| `createI18nStringKeysFromEnum(componentId, enum)` | Convert legacy enum to branded enum |
| `mergeI18nStringKeys(newId, ...enums)` | Merge multiple branded enums |
| `findStringKeySources(key)` | Find components containing a key |
| `resolveStringKeyComponent(key)` | Resolve key to single component |
| `getStringKeysByComponentId(id)` | Get enum by component ID |
| `getRegisteredI18nComponents()` | List all registered components |
| `getStringKeyValues(enum)` | Get all values from enum |
| `isValidStringKey(value, enum)` | Type guard for key validation |
| `checkStringKeyCollisions(...enums)` | Check enums for collisions |

**Documentation:**

- **[BRANDED_ENUM_MIGRATION.md](docs/BRANDED_ENUM_MIGRATION.md)** - Complete migration guide with examples
- Added Branded Enums section to README with usage examples
- API reference updated with all new functions

**Breaking Changes:**

None - This release is fully backward compatible. Traditional enums continue to work with existing APIs. Branded enums are opt-in for new code or gradual migration.

**Migration:**

No migration required for existing code. To adopt branded enums:

1. Convert enums using `createI18nStringKeys()` or `createI18nStringKeysFromEnum()`
2. Use `registerBrandedComponent()` instead of `registerComponent()`
3. Optionally enable collision detection during development

See [BRANDED_ENUM_MIGRATION.md](docs/BRANDED_ENUM_MIGRATION.md) for detailed migration steps.

### Version 3.7.5

**Type Safety Improvements Release**

This release eliminates all unsafe type casts from the production codebase, improving type safety and maintainability.

**Type Safety Enhancements:**

- **New SimpleTypedError Class**: Introduced a type-safe error class (`simple-typed-error.ts`) that properly extends Error without using type casts
  - Supports `type`, `componentId`, `reasonMap`, `metadata` properties with full type safety
  - Includes error cause chaining (ES2022 standard)
  - Provides `isTypedError()` type guard and `fromError()` conversion utility
  - Maintains proper prototype chain for instanceof checks

- **Refactored Error Helper Functions**: Updated all error creation helpers to use SimpleTypedError
  - `createComponentTypedError()` - Now returns SimpleTypedError instead of casting properties
  - `createCoreTypedError()` - Type-safe error creation for core system errors
  - `createTranslatedError()` - Type-safe translated error creation
  - All functions now have proper return types without `as any` casts

- **Fixed Empty Object Initializations**: Replaced `{} as any` with proper `Partial<T>` types
  - `buildTypeSafeReasonMap()` in utils.ts now uses proper partial types
  - `ensureAllLanguagesHaveAllKeys()` in component-registry.ts uses type-safe initialization

- **Improved Enum Translation Type Safety**: Enhanced type safety in enum registry and plural handling
  - Enum registry now uses `String()` conversion instead of `as any` casts
  - Added type guards for PluralCategory validation in `hasPluralForm()`
  - Fixed `getPluralCategory()` return type to properly return `PluralCategory`
  - Removed unsafe casts in plural category handling

- **Global Context Type Safety**: Leveraged ambient type declarations for global objects
  - Removed `(globalThis as any).GlobalActiveContext` casts
  - Uses ambient declarations from `types/global.d.ts` for type-safe global access
  - Fixed Proxy pattern in core-i18n.ts to use proper keyof access

- **Enhanced I18n Engine Interface**: Created comprehensive engine type definitions
  - New `src/types/engine.ts` with generic `II18nEngine<TStringKeys>` interface
  - Proper generic constraints for type-safe string key handling
  - Re-exports main II18nEngine interface for centralized imports

- **Renamed for Clarity**: Improved naming to avoid confusion
  - Renamed abstract `TypedError` to `AbstractTypedError` (with deprecation notice)
  - New `SimpleTypedError` class is the recommended type-safe implementation
  - Maintains backward compatibility with existing code

**Code Quality:**

- **Zero Type Casts**: Eliminated approximately 20 instances of `as any` and `as unknown` casts from production code
- **Improved Type Inference**: Better TypeScript type inference throughout the codebase
- **Enhanced Maintainability**: Clearer code structure with explicit types instead of casts

**Testing:**

- Added comprehensive unit tests for SimpleTypedError class
- Added property-based tests using fast-check for error property preservation
- Created type-safety-fixes.spec.ts with tests for all improvements
- All existing tests continue to pass with enhanced type safety

**Documentation:**

- Updated JSDoc comments with proper type information
- Added deprecation notices for legacy patterns
- Improved code examples in documentation

**Migration Notes:**

This release is fully backward compatible. Existing code will continue to work unchanged. To use the new type-safe patterns:

```typescript
// New: Use SimpleTypedError directly
import { TypedError } from '@digitaldefiance/i18n-lib/errors/simple-typed-error';

const error = new TypedError('Error message', {
  type: 'validation',
  componentId: 'my-component',
  metadata: { field: 'email' }
});

// Old abstract classes still work (now called AbstractTypedError)
// Helper functions automatically use the new SimpleTypedError internally
```

**Breaking Changes:**

None - This release maintains full backward compatibility while improving internal type safety.

### Version 3.8.0

**Internal Refactoring Release** - Circular Dependency Elimination

This release eliminates all circular dependencies from the codebase through internal architectural improvements. All changes are non-breaking and maintain full backward compatibility.

**Internal Improvements:**

- **Zero Circular Dependencies**: Eliminated all 15 circular dependencies that existed in the codebase
  - Broke core/i18n-engine ↔ core-i18n cycle
  - Broke errors/translatable → core/i18n-engine → errors/index cycle
  - Broke core-i18n ↔ plugin-i18n-engine cycle
  - Broke context-related cycles
  - Broke registry-error cycles
  - Optimized barrel exports with type-only exports

- **Lazy Initialization Pattern**: Error classes and core modules now use lazy initialization to avoid circular dependencies
  - `TranslatableError` uses `getInstance()` at construction time instead of module load
  - `TypedError` and related classes use lazy engine lookup
  - Registry errors use lazy initialization for core dependencies
  - Fallback behavior if engine not initialized

- **Factory Pattern**: Introduced `core-plugin-factory.ts` to break plugin engine cycles
  - `createCorePluginI18nEngine()` moved to factory file
  - Factory imports both core-i18n and plugin-i18n-engine
  - Breaks circular dependency between these modules

- **Type-Only Exports**: Optimized barrel exports to eliminate runtime dependencies
  - `src/interfaces/index.ts` uses `export type` for all type exports
  - `src/errors/index.ts` split into base.ts and translatable-exports.ts
  - `src/core/index.ts` uses type-only exports where appropriate

- **Module Organization**: Established clear dependency hierarchy
  - Interfaces & Types (no implementation dependencies)
  - Error Classes (lazy initialization for i18n)
  - Core Modules (clear hierarchy, no cycles)
  - High-Level Modules (core-i18n, plugin-i18n-engine)

**Testing & Quality:**

- **Automated Circular Dependency Detection**: Added test that fails if circular dependencies are introduced
- **Module Independence Tests**: Verify modules can be imported independently
- **All Tests Passing**: 1,779 tests passing with no regressions
- **Zero Breaking Changes**: Public API remains completely unchanged

**Documentation:**

- **[CIRCULAR_DEPENDENCY_FIXES.md](docs/CIRCULAR_DEPENDENCY_FIXES.md)** - Comprehensive internal documentation
  - Detailed explanation of all patterns used
  - Best practices for maintaining zero circular dependencies
  - Examples of lazy initialization, factory pattern, and type-only exports
  - Guidelines for adding new modules without creating cycles

**Files Modified:**

- `src/core-plugin-factory.ts` - New factory file for plugin engine creation
- `src/core-i18n.ts` - Lazy initialization with Proxy pattern
- `src/errors/*.ts` - Lazy initialization in error constructors
- `src/errors/index.ts` - Split into separate barrel files
- `src/interfaces/index.ts` - Type-only exports
- `src/core/index.ts` - Optimized barrel exports
- `src/registry-error.ts` - Lazy initialization for core dependencies
- `tests/circular-dependencies.spec.ts` - Automated detection test

**Breaking Changes:**

None - This release is fully backward compatible. All changes are internal refactoring only.

**Migration:**

No migration required! Your existing code works unchanged. The improvements are entirely internal.

**Benefits:**

- **Improved Maintainability**: Clearer module structure and dependencies
- **Better Tree-Shaking**: Reduced runtime dependencies improve bundle optimization
- **Predictable Initialization**: No more initialization order issues
- **Future-Proof**: Established patterns prevent circular dependencies from being reintroduced

### Version 3.7.2

- Minor version bump to fix an export

### Version 3.7.1

- Minor version bump to fix an export

### Version 3.7.0

**Comprehensive ICU Integration & Number Formatting Enhancements**

Enhanced **all** I18nError methods and core ICU infrastructure to fully leverage 3.5.0 advanced ICU MessageFormat features:

**Core Infrastructure Improvements:**

- **ICU Compiler Enhancements**:
  - Fixed `#` placeholder in plural/selectordinal to use `Intl.NumberFormat` with thousand separators
  - Numbers in plural messages now properly formatted (1,500 instead of 1500)
  - Locale-aware formatting respects regional preferences

- **Number Formatter Upgrades**:
  - **Percent formatting** now shows decimal precision (0-2 places): 5.67% instead of 5%
  - **Integer formatting** maintains thousand separators automatically
  - **Currency formatting** preserves decimal places with locale-specific symbols

**Enhanced Error Methods** (13 existing + 4 new):

*Enhanced Existing Methods:*

- `componentNotFound()` - ICU select for namespaced components
- `stringKeyNotFound()` - SelectOrdinal for nested depth levels
- `duplicateComponent()` - Nested select for namespace context
- `instanceNotFound()` - Select for default vs named instances
- `instanceExists()` - Nested select with detailed messages
- `translationMissing()` - Nested select detecting key paths
- `duplicateLanguage()` - Template literal with proper quoting
- `pluralFormNotFound()` - Nested select + plural + number formatting (form count)
- `invalidPluralCategory()` - Nested plural + number formatting (category count)
- And 4 more existing methods with ICU enhancements...

*New Advanced Methods:*

- `validationThresholdExceeded()` - **Number formatting**: Currency ($1,500.50), Percent (5.67%), Integer (1,500)
- `operationStepFailed()` - **SelectOrdinal**: 1st, 2nd, 3rd, 4th, 21st, 22nd, 23rd...
- `rateLimitExceeded()` - **4-level nested messages**: Plural + number + select with thousand separators
- `nestedValidationError()` - **Complex nesting**: Multiple select + plural for validation context

**ICU Features Fully Integrated:**

- ✅ **Number Formatters**: Currency ($1,500.50), percent (5.67%), integer (1,500) with thousand separators
- ✅ **SelectOrdinal**: Ordinal formatting (1st, 2nd, 3rd, 21st, 22nd, 23rd)
- ✅ **Nested Messages**: Up to 4 levels deep with combined plural, select, and number formatting
- ✅ **ICU Plural**: `#` placeholder now formats with thousand separators
- ✅ **ICU Select**: Nested within plural messages for complex conditional logic
- ✅ **Decimal Precision**: Percent values show up to 2 decimal places
- ✅ **Locale-Aware**: All formatting respects target language/locale

- **Real-World Use Cases**:
  - Validation threshold errors with formatted currency/percentages
  - Multi-step operation failures with ordinal step numbers  
  - Rate limiting with nested request counts and retry timing
  - Complex nested field validation with severity levels

**Testing & Quality:**

- **1,738 total tests passing** (93.22% coverage)
- **250+ new tests** for advanced ICU features:
  - Currency formatting: $1,500.50, €1.500,50, ¥1,500
  - Percent precision: 5.67%, 0.5%, 100%
  - SelectOrdinal: 1st-100th with edge cases (11th, 21st, 22nd, 23rd)
  - Nested messages: 4 levels deep validation
  - Thousand separators: 1,000, 10,000, 1,000,000
  - Multilingual: 8+ languages tested
  - Real-world scenarios: API rate limits, validation thresholds, multi-step operations

**Documentation:**

- All error methods include comprehensive JSDoc with ICU pattern examples
- EnhancedErrorHelper base class with static utility methods
- Integration patterns for all error class types
- Migration guide showing before/after message formats

**New Error Codes:**

- `VALIDATION_THRESHOLD_EXCEEDED` - Numeric threshold violations with formatted values
- `OPERATION_STEP_FAILED` - Step-based operation failures with ordinal formatting
- `RATE_LIMIT_EXCEEDED` - Rate limiting with nested plural/number formatting
- `NESTED_VALIDATION_ERROR` - Complex nested validation with 4-level messages

**Files Modified:**

- `src/icu/compiler.ts` - Enhanced `#` placeholder with `Intl.NumberFormat`
- `src/icu/formatters/number-formatter.ts` - Added percent decimal precision (0-2 places)
- `src/errors/i18n-error.ts` - Enhanced all 17 error methods with ICU patterns
- `src/errors/enhanced-error-base.ts` - New base class with static helper methods
- `src/errors/*.ts` - Enhanced 8 error classes with comprehensive JSDoc
- `tests/errors/*.spec.ts` - 250+ new tests, updated expectations

**Breaking Changes:**

None - Fully backward compatible! All changes are enhancements:

- Enhanced error message formats (more detailed, better formatted)
- Metadata structure extended (formCount, count added where useful)
- New optional parameters for advanced error methods
- All existing code continues to work unchanged

**Migration:**

No migration required! Your existing code works as-is. To use new features:

```typescript
// Use new number formatting in errors
const error = I18nError.validationThresholdExceeded(
  'price', 99.99, 50.00, 'currency', 'en-US'
);
// Message: "Validation failed for price: value $99.99 exceeds maximum threshold of $50.00"

// Use selectordinal for steps
const error = I18nError.operationStepFailed(3, 'deployment', 'Connection timeout');
// Message: "Operation 'deployment' failed at 3rd step: Connection timeout"

// Numbers in plural messages now have thousand separators automatically
const error = I18nError.rateLimitExceeded(1500, 1000, 3600, 300);
// Message: "Rate limit exceeded: 1,500 requests made, exceeding limit of 1,000..."
```

### Version 3.6.4

- Add DefaultLanguageCode

### Version 3.6.3

- make getCodeLabelMap() not readonly

### Version 3.6.2

- Add getCodeLabelMap() for use with react components
- Add documentation jsdocs

### Version 3.6.1

- Upgrade currency-codes

### Version 3.6.0

**Security Hardening Release**

- **Prototype Pollution Prevention**: Validates all object keys, filters dangerous properties
- **ReDoS Mitigation**: Limited regex patterns, input length validation
- **XSS Protection**: HTML escaping option, safe type coercion
- **Input Validation**: Length limits, character whitelisting
- **Resource Limits**: LRU cache (1000 entries), recursion depth (10), message length (10000)
- **101 New Tests**: Comprehensive security test coverage
- **New Utilities**: `safe-object`, `html-escape`, `validation`, `lru-cache`
- **Documentation**: SECURITY.md, SECURITY_AUDIT.md, SECURITY_FIXES_COMPLETE.md

### Version 3.5.0

**Major Feature Release** - ICU MessageFormat Support

**New Features:**

- **ICU MessageFormat**: Full industry-standard message formatting
  - Parser with 6 AST node types (MESSAGE, LITERAL, ARGUMENT, PLURAL, SELECT, SELECTORDINAL)
  - Tokenizer with sophisticated depth tracking
  - Semantic validator with configurable options
  - Message compiler (AST → executable function)
  - Runtime with message caching
  - 304 tests passing (100%)

- **Formatters**: 6 built-in formatters
  - NumberFormatter (integer, currency, percent)
  - DateFormatter (short, medium, long, full)
  - TimeFormatter (short, medium, long, full)
  - PluralFormatter (37 languages via CLDR)
  - SelectFormatter
  - SelectOrdinalFormatter
  - FormatterRegistry (pluggable system)

- **Helper Functions**: Easy-to-use utilities
  - `formatICUMessage()` - One-line formatting
  - `isICUMessage()` - Detect ICU format
  - `parseICUMessage()` - Parse to AST
  - `compileICUMessage()` - Compile to function
  - `validateICUMessage()` - Validate syntax

- **Advanced Features**:
  - Nested messages (4 levels tested)
  - Missing value handling
  - Performance optimization (<1ms/format)
  - Memory-efficient caching
  - Multilingual validation (12 languages, 6 writing systems)

**Documentation:**

- [ICU_MESSAGEFORMAT.md](docs/ICU_MESSAGEFORMAT.md) - Complete guide
- [ICU_COMPREHENSIVE_VALIDATION.md](docs/ICU_COMPREHENSIVE_VALIDATION.md) - Validation report
- [ICU_PROJECT_COMPLETE.md](docs/ICU_PROJECT_COMPLETE.md) - Implementation summary

**Testing:**

- 304 ICU tests passing (100%)
- Specification compliance (Unicode ICU, CLDR)
- Industry compatibility (React Intl, Vue I18n, Angular)
- Edge case coverage (nesting, Unicode, RTL, special chars)
- Performance validation (<1ms, 1000 formats in <100ms)

**Migration:**

```typescript
// Use ICU MessageFormat
import { formatICUMessage } from '@digitaldefiance/i18n-lib';

formatICUMessage('Hello {name}', { name: 'Alice' });
formatICUMessage('{count, plural, one {# item} other {# items}}', { count: 1 });
```

### Version 3.0.0

**Major Feature Release** - Pluralization & Gender Support

**New Features:**

- **CLDR Pluralization**: Full support for 37 languages with automatic plural form selection
  - 19 unique plural rule implementations (English, Russian, Arabic, Polish, French, Spanish, Japanese, Ukrainian, Chinese, German, Scottish Gaelic, Welsh, Breton, Slovenian, Czech, Lithuanian, Latvian, Irish, Romanian)
  - 18 additional languages reusing existing rules
  - Handles world's most complex plural systems (Arabic 6 forms, Welsh 6 forms, Breton 5 forms)
  - Intelligent fallback: requested form → 'other' → first available
  - Type-safe `PluralString` type with backward compatibility

- **Gender Support**: Gender-aware translations with 4 categories
  - Gender categories: male, female, neutral, other
  - `GenderedString` type for type-safe gender forms
  - Intelligent fallback: requested → neutral → other → first available
  - Works seamlessly with pluralization

- **Combined Plural + Gender**: Nested plural and gender resolution
  - Supports both plural→gender and gender→plural nesting
  - Full fallback support for missing forms
  - Works with all 37 supported languages

- **Validation System**: Comprehensive plural form validation
  - `validatePluralForms()` - Validates required forms per language
  - `validateCountVariable()` - Ensures count variable exists
  - Strict and lenient modes
  - Variable consistency checking
  - Unused form detection

- **Helper Functions**: Utilities for easy plural/gender string creation
  - `createPluralString()` - Type-safe plural object creation
  - `createGenderedString()` - Type-safe gender object creation
  - `getRequiredPluralForms()` - Get required forms for any language

- **Error Handling**: New error codes for pluralization
  - `PLURAL_FORM_NOT_FOUND` - Missing plural form with suggestions
  - `INVALID_PLURAL_CATEGORY` - Invalid category with valid options
  - `MISSING_COUNT_VARIABLE` - Count variable missing when plurals used

**Documentation:**

- [PLURALIZATION_SUPPORT.md](docs/PLURALIZATION_SUPPORT.md) - Complete language support matrix
- [PLURALIZATION_USAGE.md](docs/PLURALIZATION_USAGE.md) - Usage guide with examples
- [ADDING_LANGUAGES.md](docs/ADDING_LANGUAGES.md) - Guide for adding custom languages
- Updated README with pluralization and gender sections

**Testing:**

- 348 tests passing (92% of roadmap target)
- 100% coverage on pluralization, gender, and validation code
- Comprehensive edge case testing
- Integration tests for complex scenarios

**Migration:**

```typescript
// Simple strings continue to work unchanged
engine.register({
  id: 'app',
  strings: {
    'en-US': {
      title: 'My App'  // Still works
    }
  }
});

// Add pluralization
import { createPluralString } from '@digitaldefiance/i18n-lib';

engine.register({
  id: 'cart',
  strings: {
    'en-US': {
      items: createPluralString({
        one: '{count} item',
        other: '{count} items'
      })
    }
  }
});

// Use with count variable
engine.translate('cart', 'items', { count: 5 });
// Output: "5 items"
```

### Version 2.1.40

- Alignment

### Version 2.1.32

- Expose config instead of constants

### Version 2.1.31

- Add constants param to i18n creation

### Version 2.1.30

- Version alignment bump

### Version 2.1.25

- Improve test coverage

### Version 2.1.16

- Add static registerIfNotExists to i8nengine

### Version 2.1.15

- Add `registerIfNotExists()` method to I18nEngine for safe component registration
- Add `registerComponentIfNotExists()` method to PluginI18nEngine
- Prevents "Component already registered" errors when reusing engine instances

### Version 2.1.12

- Add constants updateConstants mergeConstants functions to engine

### Version 2.1.10

- Convergence bump

### Version 2.1.6

- Minor update to expose core keys via V2 engine

### Version 2.1.5

- Minor timezone/currency export fix

### Version 2.1.4

- Version bump

### Version 2.1.1

- Minor fix, set this.name in errors

### Version 2.1.0 (December 2025)

**Moderate Feature Release** - Enhanced I18nEngine with context variables, comprehensive testing, and improved architecture

**New Features:**

- **Context Variable Injection**: Automatic injection of timezone, currency, and language from GlobalActiveContext
  - `t()` function now supports `{currency}`, `{timezone}`, `{language}`, `{adminLanguage}`, etc.
  - CurrencyCode and Timezone objects automatically extract their values
  - Variable priority: provided variables > context variables > constants
- **Enhanced t() Function**: Complete template processing with multiple resolution strategies
  - `{{Component.key}}` - Component reference resolution
  - `{{Alias.key}}` - Alias resolution for components
  - `{{EnumName.key}}` - Enum name resolution
  - `{variable}` - Variable substitution with context awareness
  - Mixed patterns supported in single template
- **Object Value Extraction**: Smart handling of wrapper objects
  - CurrencyCode objects: `.value` and `.code` getters
  - Timezone objects: `.value` and `.name` getters
  - Generic objects with `.value` property automatically extracted
- **I18nBuilder**: Fluent builder pattern for engine creation
  - `withLanguages()`, `withConstants()`, `withValidation()`
  - `withInstanceKey()`, `withRegisterInstance()`, `withSetAsDefault()`
  - Method chaining for clean configuration
- **Renamed Classes**: Removed "Plugin" prefix for clarity
  - `PluginTypedError` → `ComponentTypedError` (with backward compatibility alias)
  - `createPluginTypedError()` → `createComponentTypedError()`
  - Old names deprecated but still functional

**Improved:**

- **Test Coverage**: Increased from 87.81% to 91.81% overall
  - string-utils: 0% → 100%
  - typed.ts: 48.68% → 83.17%
  - i18n-builder: 61.53% → 86.66%
  - 714 total tests (all passing)
- **Error Translation**: All error classes now properly translate messages
  - TypedError, TypedHandleableError, TranslatableError
  - Multi-language support with template variables
  - Context-aware language selection
- **Type Safety**: Enhanced generic types throughout
  - Better inference for component IDs and string keys
  - Stricter validation at compile time
- **Documentation**: Comprehensive test examples for all features
  - t() function special cases
  - Context variable integration
  - Error translation patterns
  - Builder pattern usage

**Fixed:**

- TranslatableError now requires componentId as first parameter (breaking change)
- I18nError.stringKeyNotFound() method added
- CurrencyCode error now uses correct TranslatableError signature
- Variable substitution in templates now works with all object types
- Context variables properly override constants

**Testing:**

- Added comprehensive test suites:
  - `t-function.spec.ts` - All t() function capabilities
  - `error-translation.spec.ts` - Error class translation
  - `context-integration.spec.ts` - Context variable injection
  - `string-utils.spec.ts` - String utility functions
  - `i18n-builder.spec.ts` - Builder pattern
  - `typed-helpers.spec.ts` - Typed error helpers

**Migration Notes:**

```typescript
// Old TranslatableError signature
new TranslatableError(stringKey, variables, language);

// New signature (v2.1.0)
new TranslatableError(componentId, stringKey, variables, language);

// Context variables now automatically available in t()
engine.t('Price: {currency}'); // Uses context currency
engine.t('Price: {currency}', { currency: 'EUR' }); // Override with provided

// CurrencyCode and Timezone objects work seamlessly
const currency = new CurrencyCode('USD');
engine.translate('app', 'price', { currency }); // Extracts 'USD'
```

### Version 2.0.3

- Export error classes

### Version 2.0.2

- Version bump

### Version 2.0.1

- Minor bugfix

### Version 2.0.0

**Major Release** - Architecture improvements and bug fixes

**Fixed**:

- Fixed `RegistryError.createWithEngine` to use correct parameter order (removed redundant componentId parameter)
- Fixed `PluginTranslatableGenericError.withEngine` to accept engine as first parameter instead of instanceKey
- Fixed `LanguageRegistry.getMatchingCode` to check and return language codes instead of IDs
- Fixed `createTranslationAdapter` to support both full TranslationEngine interface and simplified bound interface
- Fixed `TypedError` constructor to use correct componentId parameter
- Added missing `Common_Test` to CoreStringKey enum
- Fixed mock TranslationEngine signatures in tests to include componentId parameter

**Improved**:

- Enhanced `createTranslationAdapter` with dual interface support (4-param and 3-param calling conventions)
- Improved JSDoc documentation for `createTranslationAdapter` with usage examples
- Added French language support to typed-error tests
- Updated all test files to use v2 LanguageRegistry APIs
- Added `PluginI18nEngine.resetAll()` calls in test beforeEach hooks for better isolation

**Internal**:

- Refactored core-i18n.ts to use lazy initialization pattern with Proxy for backward compatibility
- Updated error classes to use `getCoreI18nEngine()` instead of direct singleton import
- Fixed duplicate LanguageRegistry exports by commenting out v1 export
- Added v1 compatibility methods to v2 LanguageRegistry
- Changed `getDefault()` to return `LanguageDefinition | null` instead of throwing

**Testing**:

- All 511 tests passing
- Fixed registry-error.spec.ts mock expectations
- Fixed language-registry.spec.ts to handle null default language
- Fixed create-translation-adapter.spec.ts parameter detection
- Fixed typed-error.spec.ts to import and use PluginI18nEngine

### Version 1.3.27

- Version bump
- Fix plugin engine to pass constants to templates as legacy engine did

### Version 1.3.20

- Version bump

### Version 1.3.17

- Skip 1.3.16 for homogenization
- Add component registration aliases for t() func
- Update readme

### Version 1.3.15

- Improve constructor for default instances
- Update README

### Version 1.3.14

- Re-export with js again

### Version 1.3.13

- Migrate to es2022/nx monorepo

### Version 1.3.12

- Update typed-handleable to plugin i18n

### Version 1.3.11

- Export i18nconfig

### Version 1.3.10

- Add UnifiedTranslator

### Version 1.3.9

- Add more handleable/typed classes

### Version 1.3.8

- Add TypedHandleable

### Version 1.3.7

- Add handleable at i18n level
- Add TranslatableGenericHandleable at i18n level

### Version 1.3.6

- Simplify LanguageContextSpace and generics related to it
- Make plugin engine respect admin context

### Version 1.3.5

- CommonJS

### Version 1.3.4

- Deprecate clearAllInstances

### Version 1.3.3

- Make LanguageRegistry static

### Version 1.3.2

- Add functionality to Language Registry for getMatchingLanguageCode

### Version 1.3.1

- **Changed**: `CoreLanguageCode` is now `string` - Language Registry is single source of truth
  - Use `LanguageRegistry.getLanguageIds()` for runtime validation
  - Use `getCoreLanguageCodes()` for static arrays (Mongoose schemas, etc.)
  - Runtime validation via registry, not compile-time types
- **Added**: `getCoreLanguageCodes()` - Get core language codes as runtime array
- **Added**: `getCoreLanguageDefinitions()` - Get core language definitions
- **Philosophy**: Registry-based validation over hardcoded types
- **Benefit**: Maximum flexibility - add languages without code changes

### Version 1.2.5

- Sat Oct 25 2025 15:01:00 GMT-0700 (Pacific Daylight Time)

#### Added

- **`createTranslationAdapter`** - Generic utility function to adapt `PluginI18nEngine` instances to the `TranslationEngine` interface, enabling seamless integration with error classes and other components expecting the simpler interface
  - Maintains full type safety with generic string key and language types
  - Provides graceful error handling with fallback to key strings
  - Zero overhead - direct delegation to underlying `PluginI18nEngine`
  - Comprehensive test coverage (19 tests)
  - Supports both full TranslationEngine interface and simplified bound interface

#### Benefits

- Eliminates need for custom adapter implementations in consuming packages
- Standardizes translation engine integration across the monorepo
- Simplifies error class constructors that require translation engines

#### Migration

Packages using custom translation adapters can now replace them with:

```typescript
import { createTranslationAdapter } from '@digitaldefiance/i18n-lib';
const adapter = createTranslationAdapter(pluginEngine, 'component-id');
```

### Version 1.2.4

- Sat Oct 25 2025 14:29:00 GMT-0700 (Pacific Daylight Time)
  - Remove StringLanguage generic for TLanguage in GlobalActiveLanguage

### Version 1.2.3

- Thu Oct 23 2025 18:50:00 GMT-0700 (Pacific Daylight Time)
  - Minor update to fix safeTranslate being private

### Version 1.2.2

- Thu Oct 23 2025 18:40:00 GMT-0700 (Pacific Daylight Time)

**i18n Library - TranslationEngine Interface Refactoring**

- Made `TranslationEngine` interface generic with `TStringKey` type parameter for improved type safety
- Changed `translate` and `safeTranslate` methods from optional to required in `TranslationEngine` interface
- Exported `TranslationEngine` from `typed-error.ts` for consistent usage across packages
- Updated `TypedHandleableError` in ecies-lib to use generic `TranslationEngine<TStringKey>` instead of inline interface types
- Updated test mocks to implement both required `translate` and `safeTranslate` methods

**Breaking Changes:**

- Any code implementing `TranslationEngine` must now provide both `translate` and `safeTranslate` methods (previously optional)
- `TranslationEngine` now requires explicit type parameter when used (e.g., `TranslationEngine<EciesStringKey>`)

### Version 1.2.1

- Thu Oct 23 2025 15:10:00 GMT-0700 (Pacific Daylight Time)
  - Update README

### Version 1.2.0

- Thu Oct 23 2025 14:13:00 GMT-0700 (Pacific Daylight Time)

#### Breaking Changes

- **Removed `CoreLanguage` enum** - Replaced with `CoreLanguageCode` type and `LanguageCodes` constants
- **Language identifiers now use BCP 47 codes** - Changed from descriptive names (e.g., `'English (US)'`) to standard codes (e.g., `'en-US'`)
- **API changes**:
  - `CoreLanguage` → `CoreLanguageCode` (union type)
  - `DefaultLanguage` enum → `DefaultLanguageCode` type
  - All language references updated to use `LanguageCodes` constants

#### Added

- **`LanguageCodes` constants object** - Provides standard BCP 47 language codes:
  - `EN_US`, `EN_GB`, `FR`, `ES`, `DE`, `ZH_CN`, `JA`, `UK`
- **`LanguageDisplayNames` mapping** - Maps language codes to human-readable names
- **`CommonLanguageCode` type** - Type for built-in language codes
- **`LanguageCode` type** - Generic string type for custom language codes
- **Custom language code support** - Any string can now be used as a language code

#### Changed

- **Language code format** - All language identifiers now use BCP 47 standard (e.g., `'en-US'` instead of `'English (US)'`)
- **Type system** - Languages are now string-based types instead of enums, allowing custom language codes
- **Documentation** - Updated README with new API usage examples and language code constants

#### Migration Guide

```typescript
// Before (v1.1.x)
import { CoreLanguage } from '@digitaldefiance/i18n-lib';
i18n.setLanguage(CoreLanguage.French);

// After
import { LanguageCodes } from '@digitaldefiance/i18n-lib';
i18n.setLanguage(LanguageCodes.FR);

// Extending with custom language codes
type MyLanguageCodes = CoreLanguageCode | 'pt-BR' | 'it';
const myEngine = PluginI18nEngine.createInstance<MyLanguageCodes>('custom', languages);
```

### Version 1.1.10

- Fri Oct 17 2025 15:02:00 GMT-0700 (Pacific Daylight Time)
  - Add String

### Version 1.1.9

- Fri Oct 17 2025 14:44:00 GMT-0700 (Pacific Daylight Time)
  - Add String

### Version 1.1.8

- Wed Oct 15 2025 16:43:00 GMT-0700 (Pacific Daylight Time)
  - Fix to translatable prototype inheritance

### Version 1.1.7

- Wed Oct 15 2025 16:13:00 GMT-0700 (Pacific Daylight Time)
  **Fixed:**
  - Corrected safeCoreTranslation fallback format to use `[CoreStringKey.${stringKey}]`
  - Fixed import issues with DefaultInstanceKey
  **Added:**
    - New TranslatableGenericError class for generic translatable errors across any component
    - CoreI18nComponentId constant export
    - 130+ new tests for comprehensive coverage
    - Complete usage documentation
  **Changed:**
    - Standardized all fallback formats to use square brackets `[componentId.stringKey]`
    - Refactored to use CoreI18nComponentId constant
  All tests pass and backward compatibility is maintained.

### Version 1.1.6

- Tue Oct 14 2025 17:04:00 GMT-0700 (Pacific Daylight Time)
  - Added missing T function to i18n plugin engine

### Version 1.1.5

- Tue Oct 14 2025 14:48:00 GMT-0700 (Pacific Daylight Time)
  - [Current] HotFix for GlobalActiveContext
    - Fixed getInstance method to throw RegistryError when instance not found instead of auto-creating instances
  - Improved test reliability and proper error handling for non-existent instances
  - Updated API documentation to reflect error-throwing behavior

### Version 1.1.4

- Tue Oct 14 2025 14:21:00 GMT-0700 (Pacific Daylight Time)
  - Removed duplicate parallel RegistryContext and focused on GlobalActiveContext

### Version 1.1.3

- Tue Oct 14 2025 14:00:00 GMT-0700 (Pacific Daylight Time)
  - Added GlobalActiveContext class instead of plain object

### Version 1.1.2

- Sat Oct 11 2025 19:25:00 GMT-0700 (Pacific Daylight Time)
  - Added cleanup mechanisms for other modules to deregister, etc.

### Version 1.1.1

- Sat Oct 11 2025 17:47:00 GMT-0700 (Pacific Daylight Time)
  - Improved type checking for completeness of component translations during registration
  - Updated README/Migration guide for clarity.

### Version 1.1.0

- Sat Oct 11 2025 16:49:00 GMT-0700 (Pacific Daylight Time)
  - Introduced plugin-based architecture with component registration and compile-time type safety
  - Added `PluginI18nEngine` with comprehensive validation and fallback system
  - Maintained full support for legacy `I18nEngine`
  - Added pre-built core and user system components
  - Enhanced template processing and context management features
  - Improved documentation and examples for both architectures

### Version 1.0.33

- Wed Sep 24 2025 15:20:07 GMT-0700 (Pacific Daylight Time)
  - Initial release of the TypeScript internationalization library with enum translation, template processing, context management, and currency formatting.

## TypeScript Support

Full TypeScript support with generic types:

```typescript
// Type-safe language codes
type MyLanguages = 'en-US' | 'fr' | 'es';
const engine = PluginI18nEngine.createInstance<MyLanguages>('app', languages);

// Type-safe string keys
enum MyStringKeys {
  Welcome = 'welcome',
  Goodbye = 'goodbye'
}

// Type-safe component registration
const registration: ComponentRegistration<MyStringKeys, MyLanguages> = {
  component: {
    id: 'app',
    name: 'App',
    stringKeys: Object.values(MyStringKeys)
  },
  strings: {
    'en-US': {
      [MyStringKeys.Welcome]: 'Welcome',
      [MyStringKeys.Goodbye]: 'Goodbye'
    },
    'fr': {
      [MyStringKeys.Welcome]: 'Bienvenue',
      [MyStringKeys.Goodbye]: 'Au revoir'
    }
  }
};
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Node.js: 18+

## Testing

### Testing Approach

The i18n-lib package uses a comprehensive testing strategy combining unit tests, integration tests, and property-based testing to ensure correctness across all features.

**Test Framework**: Jest with TypeScript support  
**Property-Based Testing**: fast-check for testing universal properties  
**Coverage Target**: 90%+ statement coverage, 85%+ branch coverage

### Test Structure

```
tests/
  ├── unit/              # Unit tests for individual components
  ├── integration/       # Integration tests for component interactions
  ├── property/          # Property-based tests using fast-check
  └── fixtures/          # Test data and mock translations
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- plugin-i18n-engine.spec.ts

# Run in watch mode
npm test -- --watch
```

### Test Patterns

#### Testing Translation Registration

```typescript
import { PluginI18nEngine, LanguageCodes } from '@digitaldefiance/i18n-lib';

describe('Component Registration', () => {
  let engine: PluginI18nEngine;

  beforeEach(() => {
    PluginI18nEngine.resetAll();
    engine = PluginI18nEngine.createInstance('test', [
      { id: LanguageCodes.EN_US, name: 'English', code: 'en-US', isDefault: true }
    ]);
  });

  afterEach(() => {
    PluginI18nEngine.resetAll();
  });

  it('should register component with translations', () => {
    engine.registerComponent({
      component: {
        id: 'test',
        name: 'Test',
        stringKeys: ['hello']
      },
      strings: {
        [LanguageCodes.EN_US]: {
          hello: 'Hello, {name}!'
        }
      }
    });

    expect(engine.translate('test', 'hello', { name: 'World' }))
      .toBe('Hello, World!');
  });
});
```

#### Testing ICU MessageFormat

```typescript
import { formatICUMessage } from '@digitaldefiance/i18n-lib';

describe('ICU MessageFormat', () => {
  it('should format plural messages', () => {
    const message = '{count, plural, one {# item} other {# items}}';
    
    expect(formatICUMessage(message, { count: 1 })).toBe('1 item');
    expect(formatICUMessage(message, { count: 5 })).toBe('5 items');
  });

  it('should handle nested select and plural', () => {
    const message = '{gender, select, male {He has} female {She has}} {count, plural, one {# item} other {# items}}';
    
    expect(formatICUMessage(message, { gender: 'female', count: 2 }))
      .toBe('She has 2 items');
  });
});
```

#### Testing Error Handling

```typescript
import { RegistryError, RegistryErrorType } from '@digitaldefiance/i18n-lib';

describe('Error Handling', () => {
  it('should throw RegistryError for missing component', () => {
    expect(() => {
      engine.translate('missing', 'key');
    }).toThrow(RegistryError);
  });

  it('should provide error metadata', () => {
    try {
      engine.translate('missing', 'key');
    } catch (error) {
      expect(error).toBeInstanceOf(RegistryError);
      expect(error.type).toBe(RegistryErrorType.COMPONENT_NOT_FOUND);
      expect(error.metadata).toEqual({ componentId: 'missing' });
    }
  });
});
```

#### Property-Based Testing

```typescript
import * as fc from 'fast-check';
import { createPluralString } from '@digitaldefiance/i18n-lib';

describe('Pluralization Properties', () => {
  it('should always return a string for any count', () => {
    fc.assert(
      fc.property(fc.integer(), (count) => {
        const plural = createPluralString({
          one: '{count} item',
          other: '{count} items'
        });
        
        const result = engine.translate('test', 'items', { count });
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      })
    );
  });
});
```

### Testing Best Practices

1. **Always reset engine state** between tests using `PluginI18nEngine.resetAll()`
2. **Test with multiple languages** to ensure translations work correctly
3. **Test edge cases** like empty strings, special characters, and missing variables
4. **Use property-based tests** for testing universal properties across many inputs
5. **Mock external dependencies** when testing error conditions

### Cross-Package Testing

When testing packages that depend on i18n-lib:

```typescript
import { PluginI18nEngine } from '@digitaldefiance/i18n-lib';
import { YourService } from 'your-package';

describe('Service with i18n', () => {
  beforeEach(() => {
    // Set up i18n engine for your service
    PluginI18nEngine.resetAll();
    const engine = PluginI18nEngine.createInstance('test', languages);
    // Register your component translations
  });

  afterEach(() => {
    PluginI18nEngine.resetAll();
  });

  it('should use translated error messages', () => {
    const service = new YourService();
    expect(() => service.doSomething()).toThrow(/translated message/);
  });
});
```

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Submit a pull request

## Support

- **Issues**: <https://github.com/Digital-Defiance/i18n-lib/issues>
- **Documentation**: See docs/ directory
- **Examples**: See tests/ directory

---

**Version**: 2.0.0
**Status**: Production Ready  
**Bundle Size**: ~25KB (minified + gzipped)
