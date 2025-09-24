# @digitaldefiance/i18n-lib

A comprehensive TypeScript internationalization library with enum translation support, template processing, and context management.

## Features

- **Type-Safe Translations**: Full TypeScript support with generic types for strings and languages
- **Configuration Validation**: Automatic validation ensures all languages have complete string collections
- **Localized Error Messages**: Error messages can be translated using the engine's own translation system
- **Enum Translation Registry**: Translate enum values with complete type safety
- **Template Processing**: Advanced template system with `{{EnumName.EnumKey}}` patterns and variable replacement
- **Context Management**: Admin vs user translation contexts with automatic language switching
- **Singleton Pattern**: Efficient instance management with named instances
- **Currency Formatting**: Built-in currency formatting utilities with locale support
- **Fallback System**: Graceful degradation when translations are missing
- **Extensible Configuration**: Module augmentation support for layered library extension
- **Zero Dependencies**: Lightweight with no external dependencies

## Installation

```bash
npm install @digitaldefiance/i18n-lib
```

## Quick Start

```typescript
import { I18nEngine, I18nConfig, createContext, CurrencyCode, Timezone } from '@digitaldefiance/i18n-lib';

// Define your enums
enum MyStrings {
  Welcome = 'welcome',
  UserGreetingTemplate = 'userGreetingTemplate'
}

enum MyLanguages {
  English = 'English',
  Spanish = 'Spanish'
}

// Configure the engine
const config: I18nConfig<MyStrings, MyLanguages> = {
  stringNames: Object.values(MyStrings),
  strings: {
    [MyLanguages.English]: {
      [MyStrings.Welcome]: 'Welcome!',
      [MyStrings.UserGreetingTemplate]: 'Hello, {name}!'
    },
    [MyLanguages.Spanish]: {
      [MyStrings.Welcome]: '¡Bienvenido!',
      [MyStrings.UserGreetingTemplate]: '¡Hola, {name}!'
    }
  },
  defaultLanguage: MyLanguages.English,
  defaultTranslationContext: 'user',
  defaultCurrencyCode: new CurrencyCode('USD'),
  languageCodes: {
    [MyLanguages.English]: 'en',
    [MyLanguages.Spanish]: 'es'
  },
  languages: Object.values(MyLanguages),
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
i18n.context = { language: MyLanguages.Spanish };
const spanishGreeting = i18n.translate(MyStrings.UserGreetingTemplate, { name: 'Juan' });
// "¡Hola, Juan!"
```

## Advanced Features

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

## API Reference

### I18nEngine

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

## Best Practices

1. **Complete Translations**: EnumTranslation requires all enum values to be translated
2. **Type Safety**: Use TypeScript enums for string keys and languages
3. **Context Separation**: Use different contexts for admin and user interfaces
4. **Instance Management**: Use named instances for different parts of your application
5. **Error Handling**: Handle missing translations gracefully with fallback languages
6. **Layered Extension**: Use union types when extending configurations across libraries
7. **Default Configuration**: Use `getDefaultI18nEngine()` for standard setups

## License

MIT

## Repository

Part of the DigitalBurnbag project - a secure file sharing and automated protocol system.