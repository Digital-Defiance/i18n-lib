# @digitaldefiance/i18n-lib

A comprehensive, production-ready TypeScript internationalization (i18n) library featuring plugin-based architecture, compile-time type safety, component registration, enum translation, template processing, and advanced context management. Built for enterprise applications requiring robust multilingual support with zero-knowledge security patterns.

## 🚀 Plugin-Based Architecture

**Version 1.1.0+** introduces a revolutionary plugin-based architecture with component registration and rigid compile-time type safety:

- **Component Registration System**: Register translation components with their own isolated string keys
- **Language Plugin Support**: Add new languages dynamically with automatic validation
- **Compile-Time Type Safety**: TypeScript ensures all strings are complete for all languages at build time
- **Automatic Validation**: Comprehensive validation with detailed error reporting and missing key detection
- **Intelligent Fallback System**: Graceful degradation to default languages with missing translation tracking
- **Multi-Instance Support**: Named instances for different application contexts (admin, user, API, etc.)
- **Global Context Management**: Centralized context with per-instance language, currency, and timezone settings
- **Translation Adapters**: Generic adapter utilities for seamless integration with error classes and other components

## Features

### Core Translation Features

- **Type-Safe Translations**: Full TypeScript support with generic types for strings, languages, and contexts
- **Plugin Architecture**: Register components and languages dynamically with full compile-time type safety
- **Configuration Validation**: Automatic validation ensures all languages have complete string collections
- **Localized Error Messages**: Error messages translated using the engine's own translation system
- **Enum Translation Registry**: Translate enum values with complete type safety and automatic validation
- **Advanced Template Processing**: 
  - Component-based patterns: `{{componentId.stringKey}}`
  - Legacy enum patterns: `{{EnumName.EnumKey}}`
  - Variable replacement: `{variableName}`
  - Nested template support with multiple variable objects
- **Context Management**: 
  - Admin vs user translation contexts
  - Automatic language switching based on context
  - Per-instance context isolation
  - Global context with named instance support
- **Currency Formatting**: Built-in currency formatting utilities with locale-aware symbol positioning
- **Timezone Support**: Validated timezone handling with moment-timezone integration
- **Intelligent Fallback System**: 
  - Graceful degradation when translations are missing
  - Fallback to default language with tracking
  - Placeholder generation for missing keys: `[componentId.stringKey]`
- **Extensible Configuration**: Module augmentation support for layered library extension
- **Backward Compatibility**: Legacy I18nEngine remains fully supported for migration paths

### Plugin System Features

- **Component Registry**: 
  - Manage translation components with automatic validation
  - Component isolation with independent string key namespaces
  - Dynamic component registration and updates
  - Comprehensive validation reporting
- **Language Registry**: 
  - Dynamic language registration with metadata (name, code, default flag)
  - BCP 47 language code support
  - Language lookup by ID or ISO code
  - Display name mapping for UI rendering
- **Type-Safe Registration**: 
  - Compile-time guarantees for translation completeness
  - Strict type helpers for enforcing complete translations
  - Partial registration support with fallback generation
- **Validation System**:
  - Detailed missing translation reports
  - Per-component validation results
  - Global validation across all components
  - Configurable validation strictness
- **Instance Management**:
  - Named instances for different application contexts
  - Singleton pattern with automatic default instance
  - Instance cleanup utilities for testing
  - Per-instance context and configuration

### Advanced Features

- **Translatable Errors**: 
  - Generic translatable error class for any component
  - Automatic translation with fallback support
  - Error retranslation for dynamic language switching
  - Metadata attachment for debugging
- **Translation Adapters**: 
  - Generic adapter creation for PluginI18nEngine
  - Seamless integration with error classes
  - Zero-overhead delegation pattern
- **Context Change Monitoring**: 
  - Reactive context proxies with change listeners
  - Property-level change notifications
  - Error-safe listener execution
- **Strict Type Enforcement**: 
  - Compile-time completeness checking
  - Helper functions for strict translation maps
  - Type utilities for extracting string keys and languages
- **Testing Utilities**: 
  - Instance cleanup methods
  - Component registry reset
  - Global engine reset for test isolation

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Plugin-Based Architecture](#plugin-based-architecture)
- [Core Components](#core-components)
- [Advanced Features](#advanced-features)
- [API Reference](#api-reference)
- [Type Definitions](#type-definitions)
- [Testing](#testing)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)
- [Changelog](#changelog)

## Installation

```bash
npm install @digitaldefiance/i18n-lib
# or
yarn add @digitaldefiance/i18n-lib
```

### Dependencies

- `currency-codes`: Currency code validation
- `moment-timezone`: Timezone validation and handling
- TypeScript 4.5+ recommended for full type safety

## Quick Start

```typescript
import { I18nEngine, I18nConfig, createContext, CurrencyCode, Timezone } from '@digitaldefiance/i18n-lib';

// Define your string keys
enum MyStrings {
  Welcome = 'welcome',
  UserGreetingTemplate = 'userGreetingTemplate'
}

// Define your language codes (or use string literals)
type MyLanguages = 'en-US' | 'es';

// Configure the engine
const config: I18nConfig<MyStrings, MyLanguages> = {
  stringNames: Object.values(MyStrings),
  strings: {
    'en-US': {
      [MyStrings.Welcome]: 'Welcome!',
      [MyStrings.UserGreetingTemplate]: 'Hello, {name}!'
    },
    'es': {
      [MyStrings.Welcome]: '¡Bienvenido!',
      [MyStrings.UserGreetingTemplate]: '¡Hola, {name}!'
    }
  },
  defaultLanguage: 'en-US',
  defaultTranslationContext: 'user',
  defaultCurrencyCode: new CurrencyCode('USD'),
  languageCodes: {
    'en-US': 'en-US',
    'es': 'es'
  },
  languages: ['en-US', 'es'],
  timezone: new Timezone('UTC'),
  adminTimezone: new Timezone('UTC')
};

// Create engine
const i18n = new I18nEngine(config);

// Translate strings
const welcome = i18n.translate(MyStrings.Welcome);
// "Welcome!"

const greeting = i18n.translate(MyStrings.UserGreetingTemplate, { name: 'John' });
// "Hello, John!"

// Change language
i18n.context = { language: 'es' };
const spanishGreeting = i18n.translate(MyStrings.UserGreetingTemplate, { name: 'Juan' });
// "¡Hola, Juan!"
```

## Core Components

The library is built around several key components that work together to provide comprehensive i18n support:

### Component Registry

Manages translation components with automatic validation:

```typescript
import { ComponentRegistry, ComponentDefinition, ComponentRegistration } from '@digitaldefiance/i18n-lib';

// Define component
const myComponent: ComponentDefinition<MyStringKeys> = {
  id: 'my-component',
  name: 'My Component',
  stringKeys: Object.values(MyStringKeys)
};

// Register with translations
const registration: ComponentRegistration<MyStringKeys, Languages> = {
  component: myComponent,
  strings: {
    'en-US': { /* translations */ },
    'fr': { /* translations */ }
  }
};
```

**Key Features:**
- Component isolation with independent string key namespaces
- Automatic validation of translation completeness
- Dynamic component registration and updates
- Fallback generation for missing translations
- Detailed validation reporting

### Language Registry

Manages supported languages with metadata:

```typescript
import { LanguageRegistry, LanguageDefinition, createLanguageDefinition } from '@digitaldefiance/i18n-lib';

const registry = new LanguageRegistry<'en-US' | 'fr' | 'es'>();

// Register languages
registry.registerLanguage(createLanguageDefinition('en-US', 'English (US)', 'en-US', true));
registry.registerLanguage(createLanguageDefinition('fr', 'Français', 'fr'));

// Query languages
const language = registry.getLanguage('en-US');
const byCode = registry.getLanguageByCode('fr');
const allLanguages = registry.getAllLanguages();
const displayNames = registry.getLanguageDisplayNames();

// Get language codes for Mongoose enum
const languageCodes = registry.getLanguageIds(); // ['en-US', 'fr', 'es']
const isoCodes = registry.getLanguageCodes(); // ['en-US', 'fr', 'es']

// Get matching language code with fallback logic
const matchedCode = registry.getMatchingLanguageCode(
  'de-DE',      // Requested code (not registered)
  'fr',         // User default (registered)
  // Falls back to site default if neither match
);
// Returns: 'fr' (user default)

const defaultCode = registry.getMatchingLanguageCode();
// Returns: 'en-US' (site default)
```

**Key Features:**
- BCP 47 language code support
- Language lookup by ID or ISO code
- Display name mapping for UI rendering
- Default language management
- Duplicate detection and validation
- Extract language codes for schema definitions
- Intelligent language code matching with fallback chain

### Language Code Resolution

The Language Registry provides intelligent language code matching with a fallback chain for handling user preferences and browser language headers:

```typescript
import { LanguageRegistry } from '@digitaldefiance/i18n-lib';

const registry = new LanguageRegistry<'en-US' | 'fr' | 'es'>();
registry.registerLanguages([
  createLanguageDefinition('en-US', 'English (US)', 'en-US', true),
  createLanguageDefinition('fr', 'Français', 'fr'),
  createLanguageDefinition('es', 'Español', 'es'),
]);

// Fallback chain: requested → user default → site default
const languageCode = registry.getMatchingLanguageCode(
  req.headers['accept-language'],  // 1. Try requested code first
  req.user?.siteLanguage,           // 2. Fall back to user default
  // 3. Falls back to site default if neither match
);

// Example scenarios:
registry.getMatchingLanguageCode('fr', 'es');      // Returns: 'fr' (requested exists)
registry.getMatchingLanguageCode('de', 'es');      // Returns: 'es' (user default exists)
registry.getMatchingLanguageCode('de', 'it');      // Returns: 'en-US' (site default)
registry.getMatchingLanguageCode();                // Returns: 'en-US' (site default)
registry.getMatchingLanguageCode('', '');          // Returns: 'en-US' (empty strings ignored)
```

**Use Cases:**
- HTTP Accept-Language header processing
- User preference resolution
- Browser language detection with fallback
- Multi-tenant applications with per-user defaults

**Error Handling:**
```typescript
try {
  const emptyRegistry = new LanguageRegistry();
  emptyRegistry.getMatchingLanguageCode('en-US');
} catch (error) {
  // Throws RegistryError if no default language configured
  console.error('No default language configured');
}
```

### Enum Translation Registry

Translates enum values with type safety:

```typescript
import { EnumTranslationRegistry } from '@digitaldefiance/i18n-lib';

enum Status {
  Active = 'active',
  Inactive = 'inactive'
}

const enumRegistry = new EnumTranslationRegistry<string, 'en-US' | 'fr'>(
  ['en-US', 'fr'],
  (key, vars) => engine.translate('core', key, vars)
);

enumRegistry.register(Status, {
  'en-US': {
    [Status.Active]: 'Active',
    [Status.Inactive]: 'Inactive'
  },
  'fr': {
    [Status.Active]: 'Actif',
    [Status.Inactive]: 'Inactif'
  }
}, 'Status');

const translated = enumRegistry.translate(Status, Status.Active, 'fr'); // 'Actif'
```

**Key Features:**
- Complete enum coverage validation
- Numeric and string enum support
- Automatic key resolution for numeric enums
- Localized error messages

### Global Active Context

Centralized context management for all engine instances:

```typescript
import { GlobalActiveContext, IActiveContext } from '@digitaldefiance/i18n-lib';

const globalContext = GlobalActiveContext.getInstance<'en-US' | 'fr', IActiveContext<'en-US' | 'fr'>>();

// Create context for an instance
globalContext.createContext('en-US', 'en-US', 'my-app');

// Update context properties
globalContext.setUserLanguage('fr', 'my-app');
globalContext.setAdminLanguage('en-US', 'my-app');
globalContext.setCurrencyCode(new CurrencyCode('EUR'), 'my-app');
globalContext.setUserTimezone(new Timezone('Europe/Paris'), 'my-app');

// Get context
const context = globalContext.getContext('my-app');
console.log(context.language); // 'fr'
console.log(context.adminLanguage); // 'en-US'
```

**Key Features:**
- Per-instance context isolation
- User and admin language separation
- Currency code management
- Timezone handling
- Context space management (admin, user, system, api)

### Context Manager

Reactive context with change listeners:

```typescript
import { ContextManager } from '@digitaldefiance/i18n-lib';

interface AppContext {
  language: string;
  theme: string;
}

const manager = new ContextManager<AppContext>();

// Add change listener
manager.addListener((property, oldValue, newValue) => {
  console.log(`${property} changed from ${oldValue} to ${newValue}`);
});

// Create reactive proxy
const context = { language: 'en', theme: 'dark' };
const reactiveContext = manager.createProxy(context);

// Changes trigger listeners
reactiveContext.language = 'fr'; // Logs: "language changed from en to fr"
```

**Key Features:**
- Property-level change notifications
- Multiple listener support
- Error-safe listener execution
- Proxy-based reactivity

## 🆕 Plugin-Based Architecture (New in v1.1.0)

The new plugin-based architecture provides a component registration system with rigid compile-time type safety.

### Quick Start with Plugin Architecture

```typescript
import { 
  createCoreI18nEngine, 
  CoreStringKey,
  CoreLanguageCode,
  LanguageCodes,
  getCoreLanguageCodes,
  ComponentDefinition,
  ComponentRegistration
} from '@digitaldefiance/i18n-lib';

// Create engine with default languages and core strings
const i18n = createCoreI18nEngine('myapp');

// Type-safe language parameter
const lang: CoreLanguageCode = LanguageCodes.FR; // Type-checked!

// Get supported language codes from registry (runtime)
const supportedLanguages = i18n.getLanguageRegistry().getLanguageIds();
// ['en-US', 'en-GB', 'fr', 'es', 'de', 'zh-CN', 'ja', 'uk']

// Use core translations with type safety
const welcomeMessage = i18n.translate('core', CoreStringKey.System_Welcome, undefined, lang);
const errorMessage = i18n.translate('core', CoreStringKey.Error_ValidationFailed);

// Define your own component with type safety
enum MyComponentStringKey {
  Welcome = 'welcome',
  Goodbye = 'goodbye',
  UserGreetingTemplate = 'userGreetingTemplate'
}

const MyComponent: ComponentDefinition<MyComponentStringKey> = {
  id: 'my-component',
  name: 'My Custom Component',
  stringKeys: Object.values(MyComponentStringKey)
};

// Define translations for all supported languages
const myComponentStrings = {
  [LanguageCodes.EN_US]: {
    [MyComponentStringKey.Welcome]: 'Welcome to my component!',
    [MyComponentStringKey.Goodbye]: 'Goodbye from my component!',
    [MyComponentStringKey.UserGreetingTemplate]: 'Hello, {name}!'
  },
  [LanguageCodes.FR]: {
    [MyComponentStringKey.Welcome]: 'Bienvenue dans mon composant !',
    [MyComponentStringKey.Goodbye]: 'Au revoir de mon composant !',
    [MyComponentStringKey.UserGreetingTemplate]: 'Bonjour, {name} !'
  },
  [LanguageCodes.ES]: {
    [MyComponentStringKey.Welcome]: '¡Bienvenido a mi componente!',
    [MyComponentStringKey.Goodbye]: '¡Adiós desde mi componente!',
    [MyComponentStringKey.UserGreetingTemplate]: '¡Hola, {name}!'
  }
  // TypeScript ensures all language codes are handled
};

// Register component (with validation)
const registration: ComponentRegistration<MyComponentStringKey, CoreLanguageCode> = {
  component: MyComponent,
  strings: myComponentStrings
};

const validationResult = i18n.registerComponent(registration);
if (!validationResult.isValid) {
  console.warn('Missing translations:', validationResult.missingKeys);
}

// Use your component's translations
const welcome = i18n.translate('my-component', MyComponentStringKey.Welcome);
const greeting = i18n.translate('my-component', MyComponentStringKey.UserGreetingTemplate, {
  name: 'John'
});

// Change language - affects all components
i18n.setLanguage(LanguageCodes.FR);
const frenchWelcome = i18n.translate('my-component', MyComponentStringKey.Welcome);
// "Bienvenue dans mon composant !"
```

### Key Plugin Architecture Benefits

1. **Compile-Time Type Safety**: TypeScript ensures all string keys exist for all languages
2. **Component Isolation**: Each component manages its own strings independently  
3. **Flexible Language Support**: Components can support different subsets of system languages
4. **Comprehensive Validation**: Automatic detection of missing translations with detailed reporting
5. **Fallback System**: Intelligent fallback to default language when translations are missing
6. **Dynamic Language Addition**: Add new languages at runtime with automatic validation updates
7. **Extensibility**: Easy to add new languages and components dynamically

### Pre-built Components

The library includes several pre-built components:

#### Core I18n Component

Provides essential system strings in 8 languages:

- English (US/UK), French, Spanish, German, Chinese (Simplified), Japanese, Ukrainian

**Language Codes**: Use `LanguageCodes` constants or define your own:
```typescript
import { LanguageCodes } from '@digitaldefiance/i18n-lib';

// Common codes provided
LanguageCodes.EN_US  // 'en-US'
LanguageCodes.FR     // 'fr'
LanguageCodes.ES     // 'es'
// ... or use any string: 'custom-lang'
```

```typescript
import { createCoreI18nEngine, CoreStringKey } from '@digitaldefiance/i18n-lib';

const i18n = createCoreI18nEngine();
const saveText = i18n.translate('core', CoreStringKey.Common_Save);
const errorMsg = i18n.translate('core', CoreStringKey.Error_ValidationFailed);
```

#### Custom Component Example

Create your own component with translations:

```typescript
import { 
  ComponentDefinition,
  ComponentRegistration,
  LanguageCodes
} from '@digitaldefiance/i18n-lib';

enum UserStringKey {
  Auth_Login = 'auth_login',
  Error_UserNotFoundTemplate = 'error_user_not_found_template'
}

const userComponent: ComponentDefinition<UserStringKey> = {
  id: 'user-system',
  name: 'User System',
  stringKeys: Object.values(UserStringKey)
};

const registration: ComponentRegistration<UserStringKey, CoreLanguageCode> = {
  component: userComponent,
  strings: {
    [LanguageCodes.EN_US]: {
      [UserStringKey.Auth_Login]: 'Login',
      [UserStringKey.Error_UserNotFoundTemplate]: 'User "{username}" not found'
    }
  }
};

i18n.registerComponent(registration);

// Use translations
const loginText = i18n.translate('user-system', UserStringKey.Auth_Login);
const userNotFound = i18n.translate(
  'user-system',
  UserStringKey.Error_UserNotFoundTemplate, 
  { username: 'john_doe' }
);
```

## Advanced Features

### Translation Adapters

Create adapters to use PluginI18nEngine with components expecting the TranslationEngine interface:

```typescript
import { createTranslationAdapter, PluginI18nEngine, TranslationEngine } from '@digitaldefiance/i18n-lib';

const pluginEngine = PluginI18nEngine.getInstance<'en-US' | 'fr'>();

// Create adapter for a specific component
const adapter: TranslationEngine<MyStringKey> = createTranslationAdapter(
  pluginEngine,
  'my-component'
);

// Use with error classes or other components
class MyError extends Error {
  constructor(
    type: ErrorType,
    engine: TranslationEngine<ErrorStringKey>
  ) {
    const message = engine.translate(type);
    super(message);
  }
}

const error = new MyError(ErrorType.NotFound, adapter);
```

**Key Features:**
- Zero-overhead delegation to PluginI18nEngine
- Maintains full type safety
- Graceful error handling with fallback to key strings
- Seamless integration with existing code

### Translatable Errors

Generic error class with automatic translation:

```typescript
import { TranslatableGenericError, PluginI18nEngine } from '@digitaldefiance/i18n-lib';

enum UserErrorKey {
  UserNotFound = 'userNotFound',
  InvalidCredentials = 'invalidCredentials'
}

// Throw translatable error
throw new TranslatableGenericError(
  'user-errors',
  UserErrorKey.UserNotFound,
  { username: 'john_doe' },
  'en-US',
  { userId: 123 },
  'myapp'
);

// Create with explicit engine
const engine = PluginI18nEngine.getInstance<'en-US' | 'fr'>();
const error = TranslatableGenericError.withEngine(
  engine,
  'user-errors',
  UserErrorKey.InvalidCredentials,
  undefined,
  'fr'
);

// Retranslate dynamically
try {
  // ... code that throws TranslatableGenericError
} catch (error) {
  if (error instanceof TranslatableGenericError) {
    const localizedMessage = error.retranslate('fr', 'myapp');
    sendToUser(localizedMessage);
  }
}
```

**Key Features:**
- Works with any registered component
- Uses safeTranslate for consistent fallback behavior
- Stores error context for retranslation
- Never throws during construction
- Metadata attachment for debugging

### Typed Errors

Base classes for creating strongly-typed error hierarchies:

```typescript
import { BaseTypedError, CompleteReasonMap, TranslationEngine } from '@digitaldefiance/i18n-lib';

enum DatabaseErrorType {
  ConnectionFailed = 'connectionFailed',
  QueryTimeout = 'queryTimeout'
}

enum DatabaseErrorKey {
  ConnectionFailedMessage = 'connectionFailedMessage',
  QueryTimeoutMessage = 'queryTimeoutMessage'
}

const reasonMap: CompleteReasonMap<typeof DatabaseErrorType, DatabaseErrorKey> = {
  [DatabaseErrorType.ConnectionFailed]: DatabaseErrorKey.ConnectionFailedMessage,
  [DatabaseErrorType.QueryTimeout]: DatabaseErrorKey.QueryTimeoutMessage
};

class DatabaseError extends BaseTypedError<typeof DatabaseErrorType, DatabaseErrorKey> {
  static create(
    engine: TranslationEngine<DatabaseErrorKey>,
    type: DatabaseErrorType,
    metadata?: Record<string, any>
  ): DatabaseError {
    return DatabaseError.createTranslated(
      engine,
      'database',
      type,
      reasonMap,
      undefined,
      undefined,
      metadata
    );
  }
}
```

**Key Features:**
- Complete enum coverage enforcement
- Translation engine integration
- Simple and translated error creation
- Metadata support

### Template Processing

Advanced template system with multiple pattern types:

```typescript
import { PluginI18nEngine } from '@digitaldefiance/i18n-lib';

const engine = PluginI18nEngine.getInstance<'en-US'>();

// Component-based patterns
const message1 = engine.t(
  '{{core.Common_Welcome}} {{user.UserGreetingTemplate}}',
  'en-US',
  { name: 'John' }
);
// "Welcome Hello, John!"

// Variable replacement
const message2 = engine.t(
  'User {username} has {count} messages',
  'en-US',
  { username: 'john_doe', count: 5 }
);
// "User john_doe has 5 messages"

// Mixed patterns
const message3 = engine.t(
  '{{core.System_Welcome}}, {name}! {{core.System_PleaseWait}}',
  'en-US',
  { name: 'Alice' }
);
// "Welcome, Alice! Please wait..."
```

**Pattern Types:**
- `{{componentId.stringKey}}`: Component-based translation
- `{variableName}`: Variable replacement
- Template strings automatically use first variable object
- Multiple variable objects merged for replacement

### Currency Formatting

Locale-aware currency formatting:

```typescript
import { getCurrencyFormat, CurrencyCode } from '@digitaldefiance/i18n-lib';

// Get format details
const usdFormat = getCurrencyFormat('en-US', 'USD');
console.log(usdFormat);
// {
//   symbol: '$',
//   position: 'prefix',
//   groupSeparator: ',',
//   decimalSeparator: '.'
// }

const eurFormat = getCurrencyFormat('de-DE', 'EUR');
console.log(eurFormat);
// {
//   symbol: '€',
//   position: 'postfix',
//   groupSeparator: '.',
//   decimalSeparator: ','
// }

// Validate currency codes
const currencyCode = new CurrencyCode('USD');
console.log(currencyCode.value); // 'USD'
console.log(CurrencyCode.values); // Array of all valid ISO 4217 codes
```

**Key Features:**
- ISO 4217 currency code validation
- Locale-aware symbol positioning
- Group and decimal separator detection
- Intl.NumberFormat integration

### Timezone Handling

Validated timezone management:

```typescript
import { Timezone, isValidTimezone } from '@digitaldefiance/i18n-lib';

// Create validated timezone
const tz = new Timezone('America/New_York');
console.log(tz.value); // 'America/New_York'

// Validate timezone strings
if (isValidTimezone('Europe/Paris')) {
  const parisTz = new Timezone('Europe/Paris');
}

// Invalid timezone throws error
try {
  new Timezone('Invalid/Timezone');
} catch (error) {
  console.error('Invalid timezone');
}
```

**Key Features:**
- Moment-timezone validation
- Immutable timezone values
- Validation utilities
- IANA timezone database support

### Utility Functions

Helper functions for common operations:

```typescript
import {
  replaceVariables,
  isTemplate,
  toStringKey,
  buildReasonMap,
  validateReasonMap,
  createCompleteReasonMap
} from '@digitaldefiance/i18n-lib';

// Variable replacement
const result = replaceVariables(
  'Hello, {name}! You have {count} messages.',
  { name: 'John', count: 5 }
);
// "Hello, John! You have 5 messages."

// Template detection
if (isTemplate('userGreetingTemplate')) {
  // Handle as template
}

// String key construction
const key = toStringKey('error', 'validation', 'failed');
// 'error_validation_failed'

// Reason map building
enum ErrorType {
  NotFound = 'notFound',
  AccessDenied = 'accessDenied'
}

const reasonMap = buildReasonMap(ErrorType, ['error']);
// {
//   notFound: 'error_notFound',
//   accessDenied: 'error_accessDenied'
// }

// Validate reason map completeness
if (validateReasonMap(ErrorType, reasonMap)) {
  // All enum values are mapped
}
```

### Advanced Plugin Usage

#### Compile-Time Completeness Enforcement (Strict Mode)

By default the plugin engine performs runtime validation and provides fallbacks. If you want **compile-time** enforcement that every language mapping contains every string key, use the helper in `strict-types`:

```typescript
import { createCompleteComponentStrings } from '@digitaldefiance/i18n-lib';

enum MyStrings {
  Welcome = 'welcome',
  Farewell = 'farewell'
}

type AppLang = 'en' | 'fr';

// This will only compile if BOTH languages contain BOTH keys.
const myStrictStrings = createCompleteComponentStrings<MyStrings, AppLang>({
  en: {
    [MyStrings.Welcome]: 'Welcome',
    [MyStrings.Farewell]: 'Goodbye'
  },
  fr: {
    [MyStrings.Welcome]: 'Bienvenue',
    [MyStrings.Farewell]: 'Au revoir'
  }
});

// If any key is missing, TypeScript reports an error before runtime.
```

The core library itself uses this helper for the core component (`createCoreComponentStrings`) to guarantee internal completeness. For partial / iterative authoring you can still start with normal objects and later switch to the strict helper when translations stabilize.

#### Adding New Languages

```typescript
import { createLanguageDefinition } from '@digitaldefiance/i18n-lib';

// Add Italian support
const italian = createLanguageDefinition('it', 'Italiano', 'it');
i18n.registerLanguage(italian);

// Update existing components with Italian translations
i18n.updateComponentStrings('my-component', {
  it: {
    [MyComponentStringKey.Welcome]: 'Benvenuto nel mio componente!',
    [MyComponentStringKey.Goodbye]: 'Arrivederci dal mio componente!',
    [MyComponentStringKey.UserGreetingTemplate]: 'Ciao, {name}!'
  }
});
```

#### Component Registration Validation

The plugin engine provides comprehensive validation to ensure translation completeness:

```typescript
// Each component is validated against ALL system languages
enum MyStrings {
  Welcome = 'welcome',
  Goodbye = 'goodbye'
}

const myComponent: ComponentDefinition<MyStrings> = {
  id: 'my-component',
  name: 'My Component',
  stringKeys: Object.values(MyStrings)
};

// System has EN, FR, ES languages - component must provide translations for all three
const registration: ComponentRegistration<MyStrings, CoreLanguageCode> = {
  component: myComponent,
  strings: {
    [LanguageCodes.EN_US]: {
      [MyStrings.Welcome]: 'Welcome',
      [MyStrings.Goodbye]: 'Goodbye'
    },
    [LanguageCodes.FR]: {
      [MyStrings.Welcome]: 'Bienvenue',
      [MyStrings.Goodbye]: 'Au revoir'
    },
    [LanguageCodes.ES]: {
      [MyStrings.Welcome]: 'Bienvenido', 
      [MyStrings.Goodbye]: 'Adiós'
    }
  }
};

const result = i18n.registerComponent(registration);
if (!result.isValid) {
  console.log('Missing translations:', result.missingKeys);
  // Shows exactly which string keys are missing for which languages
}
```

#### Flexible Language Support

Components can support different subsets of system languages:

```typescript
// Component A supports EN, FR, ES
const componentA = {
  component: { id: 'comp-a', name: 'Component A', stringKeys: ['hello'] },
  strings: {
    'en-US': { hello: 'Hello' },
    'fr': { hello: 'Bonjour' },
    'es': { hello: 'Hola' }
  }
};

// Component B only supports EN and DE (added later)
const componentB = {
  component: { id: 'comp-b', name: 'Component B', stringKeys: ['save'] },
  strings: {
    'en-US': { save: 'Save' },
    'de': { save: 'Speichern' }
  }
};

// Both components can coexist - missing translations use fallback
i18n.registerComponent(componentA); // ✓ Complete
i18n.registerComponent(componentB); // ⚠ Missing FR, ES - uses fallback

// Usage automatically handles fallbacks
i18n.translate('comp-b', 'save', {}, 'fr'); // Returns 'Save' (en-US fallback)
```

#### Dynamic Language Addition

```typescript
import { createLanguageDefinition } from '@digitaldefiance/i18n-lib';

// Add new language to system
const germanLang = createLanguageDefinition('de', 'Deutsch', 'de');
i18n.registerLanguage(germanLang);

// New component registrations now require German translations
const newRegistration = {
  component: { id: 'new-comp', name: 'New Component', stringKeys: ['test'] },
  strings: {
    'en-US': { test: 'Test' },
    'fr': { test: 'Test' },
    'es': { test: 'Prueba' }
    // Missing 'de' - validation will flag this
  }
};

const result = i18n.registerComponent(newRegistration);
console.log(result.missingKeys); // Shows missing German translations
```

#### Validation and Error Handling

```typescript
// Comprehensive validation
const globalValidation = i18n.validateAllComponents();
if (!globalValidation.isValid) {
  console.error('Validation errors:', globalValidation.errors);
  console.warn('Warnings:', globalValidation.warnings);
}

// Handle registration errors
try {
  i18n.registerComponent(incompleteRegistration);
} catch (error) {
  if (error instanceof RegistryError) {
    console.error(`Registry error: ${error.type}`, error.metadata);
  }
}

// Strict validation mode (rejects incomplete registrations)
const strictEngine = new PluginI18nEngine(languages, {
  validation: {
    requireCompleteStrings: true,
    allowPartialRegistration: false,
    fallbackLanguageId: 'en-US'
  }
});
```

#### Multi-Instance Support

```typescript
// Create separate instances for different contexts
const adminI18n = PluginI18nEngine.createInstance('admin', languages);
const userI18n = PluginI18nEngine.createInstance('user', languages);

// Register different components for each
adminI18n.registerComponent(adminComponentRegistration);
userI18n.registerComponent(userComponentRegistration);
```

For complete documentation on the plugin architecture, see [PLUGIN_ARCHITECTURE.md](./PLUGIN_ARCHITECTURE.md).

## Advanced Features

### Translatable Errors

The `TranslatableGenericError` class provides a simple way to create errors with translated messages that work across any component:

```typescript
import { TranslatableGenericError, CoreStringKey, LanguageCodes } from '@digitaldefiance/i18n-lib';

// Define your error string keys
enum UserErrorKey {
  UserNotFound = 'userNotFound',
  InvalidCredentials = 'invalidCredentials',
  AccountLocked = 'accountLocked',
}

// Register your component with translations
const userErrorComponent = {
  id: 'user-errors',
  name: 'User Errors',
  stringKeys: Object.values(UserErrorKey)
};

const registration = {
  component: userErrorComponent,
  strings: {
    'en-US': {
      [UserErrorKey.UserNotFound]: 'User "{username}" not found',
      [UserErrorKey.InvalidCredentials]: 'Invalid credentials provided',
      [UserErrorKey.AccountLocked]: 'Account locked until {unlockTime}'
    },
    'fr': {
      [UserErrorKey.UserNotFound]: 'Utilisateur "{username}" introuvable',
      [UserErrorKey.InvalidCredentials]: 'Identifiants invalides fournis',
      [UserErrorKey.AccountLocked]: 'Compte verrouillé jusqu\'à {unlockTime}'
    }
  }
};

i18n.registerComponent(registration);

// Throw translatable errors
throw new TranslatableGenericError(
  'user-errors',
  UserErrorKey.UserNotFound,
  { username: 'john_doe' },
  'en-US',
  { userId: 123 }, // metadata
  'myapp' // engine instance key
);

// Use with explicit engine instance
const error = TranslatableGenericError.withEngine(
  i18n,
  'user-errors',
  UserErrorKey.InvalidCredentials,
  undefined,
  'fr'
);

// Retranslate errors dynamically
try {
  // ... code that throws TranslatableGenericError
} catch (error) {
  if (error instanceof TranslatableGenericError) {
    const localizedMessage = error.retranslate(userLanguage, 'myapp');
    sendToUser(localizedMessage);
  }
}

// Use with core strings
throw new TranslatableGenericError(
  'core',
  CoreStringKey.Error_AccessDenied,
  undefined,
  LanguageCodes.EN_US,
  { requestId: '12345' },
  'myapp'
);
```

**Key Features:**
- Works with any registered component and string keys
- Uses `safeTranslate` for consistent fallback behavior (`[componentId.stringKey]`)
- Stores error context: stringKey, componentId, language, variables, metadata
- Supports dynamic retranslation with `retranslate()` method
- Never throws during construction - always returns a valid error
- Compatible with both constructor and static factory methods

For complete documentation, see [TRANSLATABLE_ERROR_GUIDE.md](./TRANSLATABLE_ERROR_GUIDE.md).

### Enum Translation Registry

```typescript
enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending'
}

// Register enum translations (requires complete translations)
i18n.registerEnum(Status, {
  [MyLanguages.English]: {
    [Status.Active]: 'Active',
    [Status.Inactive]: 'Inactive',
    [Status.Pending]: 'Pending'
  },
  [MyLanguages.Spanish]: {
    [Status.Active]: 'Activo',
    [Status.Inactive]: 'Inactivo',
    [Status.Pending]: 'Pendiente'
  }
}, 'Status');

// Translate enum values
const statusText = i18n.translateEnum(Status, Status.Active, MyLanguages.Spanish);
// "Activo"
```

### Template Processing

```typescript
enum AppStrings {
  WelcomeMessage = 'welcomeMessage',
  UserGreetingTemplate = 'userGreetingTemplate'
}

const config: I18nConfig<AppStrings, MyLanguages> = {
  // ... other config
  enumName: 'AppStrings',
  enumObj: AppStrings,
  strings: {
    [MyLanguages.English]: {
      [AppStrings.WelcomeMessage]: 'Welcome to our app!',
      [AppStrings.UserGreetingTemplate]: 'Hello, {name}!'
    }
  }
};

const i18n = new I18nEngine(config);

// Use template processor
const message = i18n.t('{{AppStrings.WelcomeMessage}} {{AppStrings.UserGreetingTemplate}}', 
  MyLanguages.English, 
  { name: 'John' }
);
// "Welcome to our app! Hello, John!"
```

### Context Management

```typescript
import { createContext, setLanguage, setAdminLanguage, setContext } from '@digitaldefiance/i18n-lib';

// Create and manage context
const context = createContext(MyLanguages.English, 'user');

// Set different languages for user and admin contexts
setLanguage(context, MyLanguages.Spanish);
setAdminLanguage(context, MyLanguages.English);

// Switch between contexts
setContext(context, 'admin'); // Uses admin language
setContext(context, 'user');  // Uses user language

// Apply context to engine
i18n.context = context;
```

### Context Change Monitoring

```typescript
import { ContextManager } from '@digitaldefiance/i18n-lib';

interface AppContext {
  language: string;
  theme: string;
}

const manager = new ContextManager<AppContext>();

// Add listeners for context changes
manager.addListener((property, oldValue, newValue) => {
  console.log(`${property} changed from ${oldValue} to ${newValue}`);
});

// Create reactive context
const context = { language: 'en', theme: 'dark' };
const reactiveContext = manager.createProxy(context);

// Changes are automatically detected
reactiveContext.language = 'es'; // Triggers listener
```

### Currency Formatting

```typescript
import { getCurrencyFormat } from '@digitaldefiance/i18n-lib';

// Get currency formatting information
const usdFormat = getCurrencyFormat('en-US', 'USD');
// { symbol: '$', position: 'prefix', groupSeparator: ',', decimalSeparator: '.' }

const eurFormat = getCurrencyFormat('de-DE', 'EUR');
// { symbol: '€', position: 'postfix', groupSeparator: '.', decimalSeparator: ',' }
```

### Instance Management

```typescript
// Create named instances
const mainI18n = new I18nEngine(config, 'main');
const adminI18n = new I18nEngine(adminConfig, 'admin');

// Get instances by key
const instance = I18nEngine.getInstance('main');

// Clean up instances (useful for testing)
I18nEngine.clearInstances();
I18nEngine.removeInstance('main');
```

## Supported Languages

The library includes pre-built translations for 8 languages in the core component:

| Language Code | Display Name | ISO Code |
|--------------|--------------|----------|
| `en-US` | English (US) | en-US |
| `en-GB` | English (UK) | en-GB |
| `fr` | Français | fr |
| `es` | Español | es |
| `de` | Deutsch | de |
| `zh-CN` | 中文 (简体) | zh-CN |
| `ja` | 日本語 | ja |
| `uk` | Українська | uk |

### Language Code Constants

```typescript
import { LanguageCodes, LanguageDisplayNames, getCoreLanguageCodes } from '@digitaldefiance/i18n-lib';

// Use constants for type safety
const lang = LanguageCodes.FR; // 'fr'
const displayName = LanguageDisplayNames[LanguageCodes.FR]; // 'Français'

// Get all core language codes as array (for Mongoose enums, etc.)
const coreLanguageCodes = getCoreLanguageCodes();
// ['en-US', 'en-GB', 'fr', 'es', 'de', 'zh-CN', 'ja', 'uk']

// All available codes
const codes = {
  EN_US: 'en-US',
  EN_GB: 'en-GB',
  FR: 'fr',
  ES: 'es',
  DE: 'de',
  ZH_CN: 'zh-CN',
  JA: 'ja',
  UK: 'uk'
};
```

### Custom Language Codes

Extend core languages with custom ones while maintaining type safety:

```typescript
import { 
  CoreLanguageCode,
  getCoreLanguageDefinitions, 
  createLanguageDefinition,
  PluginI18nEngine
} from '@digitaldefiance/i18n-lib';

// Define custom language type extending core
type MyLanguageCode = CoreLanguageCode | 'pt-BR' | 'it';

// Create engine with extended languages
const engine = PluginI18nEngine.createInstance<MyLanguageCode>(
  'myapp',
  [
    ...getCoreLanguageDefinitions(),
    createLanguageDefinition('pt-BR', 'Português (Brasil)', 'pt-BR'),
    createLanguageDefinition('it', 'Italiano', 'it')
  ]
);

// Type-safe language usage
const lang1: MyLanguageCode = 'en-US'; // ✓ Core language
const lang2: MyLanguageCode = 'pt-BR'; // ✓ Custom language
const lang3: MyLanguageCode = 'invalid'; // ✗ Type error!
```

### Helper Functions for Mongoose Schemas

Extract language codes from the registry (single source of truth):

```typescript
import { PluginI18nEngine, getCoreLanguageCodes, LanguageCodes } from '@digitaldefiance/i18n-lib';
import { Schema } from 'mongoose';

// Static approach: Get core language codes as array
const coreLanguageCodes = getCoreLanguageCodes();
// ['en-US', 'en-GB', 'fr', 'es', 'de', 'zh-CN', 'ja', 'uk']

// Dynamic approach: Get from engine instance (includes custom languages)
const engine = PluginI18nEngine.getInstance<string>();
const languageIds = engine.getLanguageRegistry().getLanguageIds();
const isoCodes = engine.getLanguageRegistry().getLanguageCodes();

// Use in Mongoose schema
const userSchema = new Schema({
  language: {
    type: String,
    enum: coreLanguageCodes, // Static core languages
    default: LanguageCodes.EN_US
  },
  adminLanguage: {
    type: String,
    enum: languageIds, // Dynamic from registry
    default: LanguageCodes.EN_US
  }
});

// Get display names for validation messages
const displayNames = engine.getLanguageRegistry().getLanguageDisplayNames();
// { 'en-US': 'English (US)', 'fr': 'Français', ... }
```

## Core String Keys

The core component provides 40+ system strings organized by category:

### Common Strings
- `Common_Yes`, `Common_No`, `Common_Cancel`, `Common_OK`
- `Common_Save`, `Common_Delete`, `Common_Edit`, `Common_Create`, `Common_Update`
- `Common_Loading`, `Common_Error`, `Common_Success`, `Common_Warning`, `Common_Info`
- `Common_Disposed`

### Error Messages
- `Error_InvalidInput`, `Error_NetworkError`, `Error_NotFound`
- `Error_AccessDenied`, `Error_InternalServer`, `Error_ValidationFailed`
- `Error_RequiredField`, `Error_InvalidContextTemplate`
- `Error_MissingTranslationKeyTemplate`

### Registry Error Templates
- `Error_ComponentNotFoundTemplate`
- `Error_LanguageNotFoundTemplate`
- `Error_StringKeyNotFoundTemplate`
- `Error_IncompleteRegistrationTemplate`
- `Error_DuplicateComponentTemplate`
- `Error_DuplicateLanguageTemplate`
- `Error_ValidationFailedTemplate`

### System Messages
- `System_Welcome`, `System_Goodbye`, `System_PleaseWait`
- `System_ProcessingRequest`, `System_OperationComplete`
- `System_NoDataAvailable`

## API Reference

### Plugin Architecture API

#### PluginI18nEngine

**Constructor**

- `new PluginI18nEngine<TLanguages>(languages, config?)` - Create new plugin engine
- `PluginI18nEngine.createInstance<TLanguages>(key, languages, config?)` - Create named instance
- `PluginI18nEngine.getInstance<TLanguages>(key?)` - Get existing instance (throws error if not found)

**Component Management**

- `registerComponent<TStringKeys>(registration)` - Register component with translations
- `updateComponentStrings<TStringKeys>(componentId, strings)` - Update existing component strings
- `getComponents()` - Get all registered components
- `hasComponent(componentId)` - Check if component exists

**Translation Methods**

- `translate<TStringKeys>(componentId, stringKey, variables?, language?)` - Translate component string
- `safeTranslate(componentId, stringKey, variables?, language?)` - Safe translate with fallback
- `getTranslationDetails<TStringKeys>(componentId, stringKey, variables?, language?)` - Get detailed translation response

**Language Management**

- `registerLanguage(language)` - Register new language
- `registerLanguages(languages)` - Register multiple languages
- `getLanguages()` - Get all registered languages
- `hasLanguage(language)` - Check if language exists
- `setLanguage(language)` - Set current language
- `getLanguageByCode(code)` - Get language by ISO code
- `getMatchingLanguageCode(requestedCode?, userDefaultCode?)` - Get matching language code with fallback logic

**Validation**

- `validateAllComponents()` - Validate all registered components
- `getLanguageRegistry()` - Access language registry directly
- `getComponentRegistry()` - Access component registry directly

#### Core I18n Functions

- `createCoreI18nEngine(instanceKey?)` - Create engine with core components
- `getCoreTranslation(stringKey, variables?, language?, instanceKey?)` - Get core translation
- `safeCoreTranslation(stringKey, variables?, language?, instanceKey?)` - Safe core translation

#### Component Registration Types

```typescript
interface ComponentDefinition<TStringKeys extends string> {
  readonly id: string;
  readonly name: string;
  readonly stringKeys: readonly TStringKeys[];
}

interface ComponentRegistration<TStringKeys extends string, TLanguages extends string> {
  readonly component: ComponentDefinition<TStringKeys>;
  readonly strings: PartialComponentLanguageStrings<TStringKeys, TLanguages>;
}

interface LanguageDefinition {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly isDefault?: boolean;
}
```

### Legacy I18nEngine (Still Supported)

#### Constructor

- `new I18nEngine<TStringKey, TLanguage>(config, key?)` - Create new engine instance

#### Translation Methods

- `translate(key, vars?, language?, fallbackLanguage?)` - Translate string with optional variables
- `translateEnum(enumObj, value, language)` - Translate enum value
- `t(templateString, language?, ...vars)` - Process template string with `{{EnumName.EnumKey}}` patterns

#### Registration

- `registerEnum(enumObj, translations, enumName)` - Register enum translations

#### Language Management

- `getLanguageCode(language)` - Get language code for language
- `getLanguageFromCode(code)` - Get language from code
- `getAllLanguageCodes()` - Get all language codes
- `getAvailableLanguages()` - Get available languages
- `isLanguageAvailable(language)` - Check if language is available

#### Context Management

- `get context()` - Get current context
- `set context(context)` - Set context properties

#### Static Methods

- `getInstance(key?)` - Get instance by key
- `clearInstances()` - Clear all instances
- `removeInstance(key?)` - Remove specific instance

### Context Utilities

- `createContext(defaultLanguage, defaultContext)` - Create new context
- `setLanguage(context, language)` - Set user language
- `setAdminLanguage(context, language)` - Set admin language
- `setContext(context, contextType)` - Set context type

### ContextManager

- `addListener(listener)` - Add change listener
- `removeListener(listener)` - Remove change listener
- `createProxy(context)` - Create reactive context proxy

### Currency Utilities

- `getCurrencyFormat(locale, currencyCode)` - Get currency formatting info

### Type Utilities

- `createTranslations(translations)` - Helper for creating typed translations

## Type Definitions

### Core Types

```typescript
type EnumTranslation<T extends string | number> = {
  [K in T]: string;
};

type EnumLanguageTranslation<T extends string | number, TLanguage extends string> = Partial<{
  [L in TLanguage]: EnumTranslation<T>;
}>;

interface I18nConfig<TStringKey, TLanguage, TConstants?, TTranslationContext?> {
  stringNames: TStringKey[];
  strings: MasterStringsCollection<TStringKey, TLanguage>;
  defaultLanguage: TLanguage;
  defaultTranslationContext: TTranslationContext;
  defaultCurrencyCode: CurrencyCode;
  languageCodes: LanguageCodeCollection<TLanguage>;
  languages: TLanguage[];
  constants?: TConstants;
  enumName?: string;
  enumObj?: Record<string, TStringKey>;
  timezone: Timezone;
  adminTimezone: Timezone;
}
```

## Testing

The library includes comprehensive test coverage:

```bash
# Run tests
yarn test

# Run specific test suites
yarn test context-manager.spec.ts
yarn test enum-registry.spec.ts
yarn test i18n-engine.spec.ts
```

### Test Cleanup and Instance Management

For proper test isolation when using the plugin-based architecture, use the cleanup utilities:

```typescript
import { PluginI18nEngine, resetAllI18nEngines } from '@digitaldefiance/i18n-lib';

describe('My tests', () => {
  beforeEach(() => {
    // Clean up any existing instances before each test
    PluginI18nEngine.clearAllInstances();
  });

  afterEach(() => {
    // Or use the convenience function
    resetAllI18nEngines();
  });

  // Or use specific cleanup methods
  it('should manage instances', () => {
    const engine1 = PluginI18nEngine.createInstance('app1', [englishLang]);
    const engine2 = PluginI18nEngine.createInstance('app2', [frenchLang]);

    // Check if instances exist
    expect(PluginI18nEngine.hasInstance('app1')).toBe(true);
    expect(PluginI18nEngine.hasInstance('app2')).toBe(true);

    // Remove specific instance
    PluginI18nEngine.removeInstance('app1');
    expect(PluginI18nEngine.hasInstance('app1')).toBe(false);

    // Clear all instances and component registrations
    PluginI18nEngine.resetAll();
    expect(PluginI18nEngine.hasInstance('app2')).toBe(false);
  });
});
```

#### Available Cleanup Methods

- `PluginI18nEngine.clearAllInstances()` - Remove all engine instances
- `PluginI18nEngine.removeInstance(key?)` - Remove specific instance by key (returns boolean)
- `PluginI18nEngine.hasInstance(key?)` - Check if instance exists (returns boolean)
- `PluginI18nEngine.getInstance(key?)` - Get existing instance (throws RegistryError if not found)
- `PluginI18nEngine.resetAll()` - Clear instances and component registrations
- `resetAllI18nEngines()` - Convenience function that calls `resetAll()`

## Extensible Configuration

The library supports layered extension across multiple libraries using TypeScript module augmentation:

### Base Library Setup

```typescript
// In your base library
import { DefaultStringKey, DefaultLanguage } from '@digitaldefiance/i18n-lib';

enum MyLibStringKey {
  Feature_Save = 'feature_save',
  Feature_Load = 'feature_load',
}

// Extend the global configuration
declare global {
  namespace I18n {
    interface Config {
      StringKey: DefaultStringKey | MyLibStringKey;
    }
  }
}
```

### Extending Another Library

```typescript
// In a library that extends the base library
import { DefaultStringKey } from '@digitaldefiance/i18n-lib';
import { MyLibStringKey } from 'my-base-lib';

enum AdvancedStringKey {
  Advanced_Export = 'advanced_export',
  Advanced_Import = 'advanced_import',
}

// Extend with union types
declare global {
  namespace I18n {
    interface Config {
      StringKey: DefaultStringKey | MyLibStringKey | AdvancedStringKey;
    }
  }
}
```

### Final Application

```typescript
// In your final application
import { StringKey, Language, getI18nEngine } from 'my-extended-lib';

// All string keys from all layers are now available
const engine = getI18nEngine();
const translation = engine.translate('advanced_export' as StringKey);
```

### Default Configuration Helper

Use the default configuration helper for quick setup:

```typescript
import { getDefaultI18nEngine } from '@digitaldefiance/i18n-lib';

// Create engine with default configuration
const engine = getDefaultI18nEngine(
  { APP_NAME: 'MyApp' }, // constants
  new Timezone('America/New_York'), // user timezone
  new Timezone('UTC') // admin timezone
);
```

## Configuration Validation

The engine automatically validates configurations during construction to ensure completeness:

### Validation Rules

1. **All languages in `languageCodes` must have corresponding `strings` collections**
2. **All `stringNames` must be present in every language's string collection**
3. **The `defaultLanguage` must have a string collection**

### Localized Error Messages

Validation errors can be localized by including error message keys in your configuration:

```typescript
enum MyStrings {
  Welcome = 'welcome',
  // Error message keys
  Error_MissingStringCollectionTemplate = 'error_missing_string_collection_template',
  Error_MissingTranslationTemplate = 'error_missing_translation_template',
  Error_DefaultLanguageNoCollectionTemplate = 'error_default_language_no_collection_template'
}

const config: I18nConfig<MyStrings, MyLanguages> = {
  stringNames: Object.values(MyStrings),
  strings: {
    [MyLanguages.English]: {
      [MyStrings.Welcome]: 'Welcome!',
      [MyStrings.Error_MissingStringCollectionTemplate]: 'Missing translations for language: {language}',
      [MyStrings.Error_MissingTranslationTemplate]: 'Key \'{key}\' not found in {language}',
      [MyStrings.Error_DefaultLanguageNoCollectionTemplate]: 'Default language \'{language}\' has no translations'
    }
  },
  // ... rest of config
};
```

### Fallback Error Messages

If localized error messages aren't provided, the engine falls back to English templates:

- `Missing string collection for language: {language}`
- `Missing translation for key '{key}' in language '{language}'`
- `Default language '{language}' has no string collection`

## Error Handling

The library provides comprehensive error handling with localized error messages:

### Registry Errors

```typescript
import { RegistryError, RegistryErrorType } from '@digitaldefiance/i18n-lib';

try {
  engine.registerComponent(invalidRegistration);
} catch (error) {
  if (error instanceof RegistryError) {
    console.error(`Error type: ${error.type}`);
    console.error(`Metadata:`, error.metadata);
    
    switch (error.type) {
      case RegistryErrorType.ComponentNotFound:
        // Handle missing component
        break;
      case RegistryErrorType.DuplicateComponent:
        // Handle duplicate registration
        break;
      case RegistryErrorType.ValidationFailed:
        // Handle validation failure
        break;
    }
  }
}
```

**Error Types:**
- `ComponentNotFound`: Component ID not registered
- `LanguageNotFound`: Language not registered
- `StringKeyNotFound`: Translation key not found
- `IncompleteRegistration`: Missing translations detected
- `DuplicateComponent`: Component already registered
- `DuplicateLanguage`: Language already registered
- `ValidationFailed`: Validation check failed

### Context Errors

```typescript
import { ContextError, ContextErrorType } from '@digitaldefiance/i18n-lib';

try {
  const context = globalContext.getContext('invalid-key');
} catch (error) {
  if (error instanceof ContextError) {
    console.error(`Invalid context: ${error.contextKey}`);
  }
}
```

### Safe Translation

Use `safeTranslate` to prevent errors:

```typescript
// Regular translate throws on missing key
try {
  const text = engine.translate('component', 'missingKey');
} catch (error) {
  // Handle error
}

// Safe translate returns placeholder
const text = engine.safeTranslate('component', 'missingKey');
// Returns: "[component.missingKey]"
```

## Validation

### Component Validation

```typescript
// Validate during registration
const result = engine.registerComponent(registration);

if (!result.isValid) {
  console.error('Validation errors:', result.errors);
  console.warn('Missing keys:', result.missingKeys);
  
  result.missingKeys.forEach(missing => {
    console.log(`Missing: ${missing.stringKey} for ${missing.languageId} in ${missing.componentId}`);
  });
}
```

### Global Validation

```typescript
// Validate all components
const validation = engine.validateAllComponents();

if (!validation.isValid) {
  console.error('Errors:', validation.errors);
  console.warn('Warnings:', validation.warnings);
}

// Example output:
// Errors: ["Component 'user' missing strings for language 'de'"]
// Warnings: ["Component 'user' missing key 'greeting' for language 'fr'"]
```

### Validation Configuration

```typescript
import { ValidationConfig } from '@digitaldefiance/i18n-lib';

const strictConfig: ValidationConfig = {
  requireCompleteStrings: true,
  allowPartialRegistration: false,
  fallbackLanguageId: 'en-US'
};

const lenientConfig: ValidationConfig = {
  requireCompleteStrings: false,
  allowPartialRegistration: true,
  fallbackLanguageId: 'en-US'
};

const engine = new PluginI18nEngine(languages, {
  validation: strictConfig
});
```

## Best Practices

### Plugin Architecture (Recommended for New Projects)

1. **Use Component Registration**: Organize translations into logical components with `PluginI18nEngine`
2. **Define String Key Enums**: Always use TypeScript enums for string keys to ensure compile-time type safety
3. **Complete Component Translations**: Provide translations for all supported languages in each component
4. **Validate Registrations**: Check validation results and handle missing translations appropriately
5. **Use Core Components**: Start with `createCoreI18nEngine()` for built-in system strings
6. **Fallback Strategy**: Configure appropriate fallback languages for missing translations
7. **Component Isolation**: Keep related strings together in the same component
8. **Template Variables**: Use template strings with variables for dynamic content
9. **Multi-Instance Architecture**: Use named instances for different application contexts (admin, user, etc.)

### Legacy System (Still Supported)

1. **Complete Translations**: EnumTranslation requires all enum values to be translated
2. **Type Safety**: Use TypeScript enums for string keys and languages
3. **Context Separation**: Use different contexts for admin and user interfaces
4. **Instance Management**: Use named instances for different parts of your application
5. **Error Handling**: Handle missing translations gracefully with fallback languages
6. **Layered Extension**: Use union types when extending configurations across libraries
7. **Default Configuration**: Use `getDefaultI18nEngine()` for standard setups

### Migration Strategy

When migrating from legacy to plugin architecture:

```typescript
// Legacy approach
const legacy = new I18nEngine(config);
const text = legacy.translate(MyStrings.Welcome);

// New plugin approach  
const modern = createCoreI18nEngine();
modern.registerComponent(myComponentRegistration);
const text = modern.translate('my-component', MyStrings.Welcome);
```

Both systems can coexist in the same application during migration.

## Performance Considerations

### Instance Management

- Use named instances to isolate different application contexts
- Reuse instances rather than creating new ones
- Clean up instances in tests to prevent memory leaks

### Translation Caching

- Translations are stored in memory for fast access
- Component strings are validated once during registration
- Fallback translations are generated during registration, not at runtime

### Type Safety Overhead

- Compile-time type checking has zero runtime cost
- Generic types are erased during compilation
- Validation runs only during registration, not translation

## Security Considerations

### Zero-Knowledge Patterns

The library is designed to support zero-knowledge security patterns:

- No translation data is sent to external services
- All translations are stored locally
- No telemetry or analytics
- Suitable for sensitive applications

### Input Sanitization

Always sanitize user input before using in translations:

```typescript
import { replaceVariables } from '@digitaldefiance/i18n-lib';

// BAD: Direct user input
const message = engine.translate('component', 'template', {
  userInput: req.body.unsafeInput
});

// GOOD: Sanitized input
const message = engine.translate('component', 'template', {
  userInput: sanitize(req.body.unsafeInput)
});
```

### Error Message Exposure

Be careful not to expose sensitive information in error messages:

```typescript
// BAD: Exposes internal details
throw new TranslatableGenericError(
  'auth',
  'loginFailed',
  { password: user.password }, // Don't include sensitive data
  language
);

// GOOD: Safe error message
throw new TranslatableGenericError(
  'auth',
  'loginFailed',
  { username: user.username },
  language,
  { userId: user.id } // Metadata for logging only
);
```

## Mongoose Integration

### Schema Definition with Language Enums

```typescript
import { Schema, model } from 'mongoose';
import { LanguageCodes, getCoreLanguageCodes } from '@digitaldefiance/i18n-lib';

// Get core language codes from helper (single source of truth)
const supportedLanguages = getCoreLanguageCodes();
// ['en-US', 'en-GB', 'fr', 'es', 'de', 'zh-CN', 'ja', 'uk']

const userSchema = new Schema({
  language: {
    type: String,
    enum: supportedLanguages,
    default: LanguageCodes.EN_US,
    required: true
  },
  adminLanguage: {
    type: String,
    enum: supportedLanguages,
    default: LanguageCodes.EN_US
  }
});

export const User = model('User', userSchema);
```

### Dynamic Language Enum from Engine

```typescript
import { PluginI18nEngine } from '@digitaldefiance/i18n-lib';

// Get languages from engine instance
const engine = PluginI18nEngine.getInstance();
const registry = engine.getLanguageRegistry();

// Extract for Mongoose
const languageEnum = registry.getLanguageIds();
const defaultLanguage = registry.getDefaultLanguageId();

const contentSchema = new Schema({
  language: {
    type: String,
    enum: languageEnum,
    default: defaultLanguage
  }
});
```

### Validation with Display Names

```typescript
import { PluginI18nEngine } from '@digitaldefiance/i18n-lib';

const engine = PluginI18nEngine.getInstance();
const displayNames = engine.getLanguageRegistry().getLanguageDisplayNames();

const settingsSchema = new Schema({
  language: {
    type: String,
    enum: Object.keys(displayNames),
    validate: {
      validator: (v: string) => v in displayNames,
      message: (props) => {
        const validLanguages = Object.entries(displayNames)
          .map(([code, name]) => `${name} (${code})`)
          .join(', ');
        return `${props.value} is not a valid language. Valid options: ${validLanguages}`;
      }
    }
  }
});
```

## Integration Examples

### Express.js Middleware

```typescript
import { PluginI18nEngine, CoreLanguageCode } from '@digitaldefiance/i18n-lib';
import { Request, Response, NextFunction } from 'express';

const engine = PluginI18nEngine.getInstance<CoreLanguageCode>();

function i18nMiddleware(req: Request, res: Response, next: NextFunction) {
  // Get language from header, query, or cookie
  const language = (req.headers['accept-language'] || 
                   req.query.lang || 
                   req.cookies.language || 
                   'en-US') as CoreLanguageCode;
  
  // Set language for this request (type-safe)
  engine.setLanguage(language);
  
  // Add translation helper to response locals
  res.locals.t = (componentId: string, key: string, vars?: any) => {
    return engine.translate(componentId, key, vars, language);
  };
  
  next();
}

app.use(i18nMiddleware);
```

### React Integration

```typescript
import React, { createContext, useContext, useState } from 'react';
import { PluginI18nEngine, CoreLanguageCode, LanguageCodes } from '@digitaldefiance/i18n-lib';

const I18nContext = createContext<{
  engine: PluginI18nEngine<CoreLanguageCode>;
  language: CoreLanguageCode;
  setLanguage: (lang: CoreLanguageCode) => void;
} | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [engine] = useState(() => PluginI18nEngine.getInstance<CoreLanguageCode>());
  const [language, setLanguageState] = useState<CoreLanguageCode>(LanguageCodes.EN_US);
  
  const setLanguage = (lang: CoreLanguageCode) => {
    engine.setLanguage(lang);
    setLanguageState(lang);
  };
  
  return (
    <I18nContext.Provider value={{ engine, language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  
  const t = (componentId: string, key: string, vars?: any) => {
    return context.engine.translate(componentId, key, vars, context.language);
  };
  
  return { ...context, t };
}

// Usage in component
function MyComponent() {
  const { t, language, setLanguage } = useI18n();
  
  return (
    <div>
      <h1>{t('core', CoreStringKey.System_Welcome)}</h1>
      <button onClick={() => setLanguage('fr')}>
        Switch to French
      </button>
    </div>
  );
}
```

### Vue.js Plugin

```typescript
import { Plugin } from 'vue';
import { PluginI18nEngine, CoreLanguageCode } from '@digitaldefiance/i18n-lib';

const i18nPlugin: Plugin = {
  install(app, options) {
    const engine = PluginI18nEngine.getInstance<CoreLanguageCode>();
    
    app.config.globalProperties.$t = (
      componentId: string,
      key: string,
      vars?: any
    ) => {
      return engine.translate(componentId, key, vars);
    };
    
    app.config.globalProperties.$i18n = engine;
  }
};

export default i18nPlugin;

// Usage in component
// <template>
//   <div>{{ $t('core', 'System_Welcome') }}</div>
// </template>
```

## Troubleshooting

### Common Issues

**Issue: "Instance with key 'X' not found"**
```typescript
// Solution: Create instance before using
const engine = PluginI18nEngine.createInstance('myapp', languages);
// Or use default instance
const engine = PluginI18nEngine.getInstance(); // Uses 'default' key
```

**Issue: "Component 'X' not found"**
```typescript
// Solution: Register component before translating
engine.registerComponent(myComponentRegistration);
const text = engine.translate('my-component', 'key');
```

**Issue: "Language 'X' not found"**
```typescript
// Solution: Register language before using
engine.registerLanguage(createLanguageDefinition('fr', 'Français', 'fr'));
engine.setLanguage('fr');
```

**Issue: Missing translations in production**
```typescript
// Solution: Use validation to catch missing translations
const validation = engine.validateAllComponents();
if (!validation.isValid) {
  console.error('Missing translations:', validation.errors);
  // Fix translations before deploying
}
```

**Issue: Type errors with string keys**
```typescript
// Solution: Use enum values, not strings
enum MyKeys {
  Welcome = 'welcome'
}

// BAD
engine.translate('component', 'welcome'); // Type error

// GOOD
engine.translate('component', MyKeys.Welcome);
```

## License

MIT License - See LICENSE file for details

## Repository

Part of the [DigitalBurnbag](https://github.com/Digital-Defiance/DigitalBurnbag) project - a secure file sharing and automated protocol system with zero-knowledge encryption.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Development Setup

```bash
# Clone repository
git clone https://github.com/Digital-Defiance/DigitalBurnbag.git
cd DigitalBurnbag/packages/digitaldefiance-i18n-lib

# Install dependencies
yarn install

# Run tests
yarn test

# Build
yarn build
```

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/Digital-Defiance/DigitalBurnbag/issues
- Documentation: See README.md and inline code documentation
- Examples: See `examples/` directory in repository

## ChangeLog

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
  - Use `engine.getLanguageRegistry().getLanguageIds()` for runtime validation
  - Use `getCoreLanguageCodes()` for static arrays (Mongoose schemas, etc.)
  - Runtime validation via registry, not compile-time types
- **Added**: `getCoreLanguageCodes()` - Get core language codes as runtime array
- **Added**: `getCoreLanguageDefinitions()` - Get core language definitions
- **Philosophy**: Registry-based validation over hardcoded types
- **Benefit**: Maximum flexibility - add languages without code changes

### Version 1.2.5

- Sat Oct 25 2025 15:0100 GMT-0700 (Pacific Daylight Time)

#### Added
- **`createTranslationAdapter`** - Generic utility function to adapt `PluginI18nEngine` instances to the `TranslationEngine` interface, enabling seamless integration with error classes and other components expecting the simpler interface
  - Maintains full type safety with generic string key and language types
  - Provides graceful error handling with fallback to key strings
  - Zero overhead - direct delegation to underlying `PluginI18nEngine`
  - Comprehensive test coverage (19 tests)

#### Benefits
- Eliminates need for custom adapter implementations in consuming packages
- Standardizes translation engine integration across the monorepo
- Simplifies error class constructors that require translation engines

#### Migration
Packages using custom translation adapters can now replace them with:
```typescript
import { createTranslationAdapter } from '@digitaldefiance/i18n-lib';
const adapter = createTranslationAdapter(pluginEngine, 'component-id');
 
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
  - Corrected safeCoreTranslation fallback format to use 
    ```plaintext
    [CoreStringKey.${stringKey}]
    ```
  - Fixed import issues with DefaultInstanceKey
  **Added:**
    - New TranslatableGenericError class for generic translatable errors across any component
    - CoreI18nComponentId constant export
    - 130+ new tests for comprehensive coverage
    - Complete usage documentation
  **Changed:**
    - Standardized all fallback formats to use square brackets 
    ```plaintext
    [componentId.stringKey]
    ```
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
