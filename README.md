# @digitaldefiance/i18n-lib

A production-ready TypeScript internationalization library with component-based architecture, type-safe translations, and comprehensive error handling.

## Features

- **Component-Based Architecture**: Register translation components with full type safety
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
- **Error Handling**: Comprehensive error classes with translation support
- **91.81% Test Coverage**: 714 tests covering all features

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
```

## Core Concepts

### PluginI18nEngine

The main engine class that manages translations, languages, and components.

```typescript
import { PluginI18nEngine, LanguageCodes } from '@digitaldefiance/i18n-lib';

// Create instance
const engine = PluginI18nEngine.createInstance('myapp', languages);

// Or use constructor
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

### Context Integration

```typescript
import { GlobalActiveContext, CurrencyCode, Timezone } from '@digitaldefiance/i18n-lib';

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

### Language Management

```typescript
// Set current language
engine.setLanguage(LanguageCodes.FR);

// Get current language
const lang = engine.getCurrentLanguage();

// Check if language exists
if (engine.hasLanguage(LanguageCodes.ES)) {
  engine.setLanguage(LanguageCodes.ES);
}

// Get all languages
const languages = engine.getLanguages();
```

### Admin Context

Separate language for admin interfaces:

```typescript
// Set admin language
engine.setAdminLanguage(LanguageCodes.EN_US);

// Switch to admin context
engine.switchToAdmin();

// Switch back to user context
engine.switchToUser();
```

## Core System Strings

Pre-built translations for common UI elements:

```typescript
import { getCoreI18nEngine, CoreStringKey, CoreI18nComponentId } from '@digitaldefiance/i18n-lib';

const coreEngine = getCoreI18nEngine();

// Use core strings
const yes = coreEngine.translate(CoreI18nComponentId, CoreStringKey.Common_Yes);
const error = coreEngine.translate(CoreI18nComponentId, CoreStringKey.Error_NotFound);
```

Available core string categories:

- **Common**: Yes, No, Cancel, OK, Save, Delete, Edit, Create, Update, Loading, etc.
- **Errors**: InvalidInput, NetworkError, NotFound, AccessDenied, ValidationFailed, etc.
- **System**: Welcome, Goodbye, PleaseWait, ProcessingRequest, OperationComplete, etc.

## Multiple Instances

Create isolated engines for different parts of your application:

```typescript
// Admin engine
const adminEngine = PluginI18nEngine.createInstance('admin', adminLanguages);

// User engine
const userEngine = PluginI18nEngine.createInstance('user', userLanguages);

// Get instance by key
const admin = PluginI18nEngine.getInstance('admin');

// Check if instance exists
if (PluginI18nEngine.hasInstance('admin')) {
  // ...
}

// Remove instance
PluginI18nEngine.removeInstance('admin');

// Reset all instances
PluginI18nEngine.resetAll();
```

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

Adapt PluginI18nEngine to simpler TranslationEngine interface:

```typescript
import { createTranslationAdapter } from '@digitaldefiance/i18n-lib';

const adapter = createTranslationAdapter(engine, 'componentId');

// Use adapter where TranslationEngine is expected
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

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Node.js: 18+

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

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Node.js: 18+

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
