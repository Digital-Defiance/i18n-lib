# @digitaldefiance/i18n-lib

A comprehensive TypeScript internationalization library with enum translation support, template processing, and context management.

## Features

- **Type-Safe Translations**: Full TypeScript support with generic types for strings and languages
- **Enum Translation Registry**: Translate enum values with complete type safety
- **Template Processing**: Advanced template system with `{{EnumName.EnumKey}}` patterns and variable replacement
- **Context Management**: Admin vs user translation contexts with automatic language switching
- **Singleton Pattern**: Efficient instance management with named instances
- **Currency Formatting**: Built-in currency formatting utilities with locale support
- **Fallback System**: Graceful degradation when translations are missing
- **Zero Dependencies**: Lightweight with no external dependencies

## Installation

```bash
npm install @digitaldefiance/i18n-lib
```

## Quick Start

```typescript
import { I18nEngine, I18nConfig, createContext } from '@digitaldefiance/i18n-lib';

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
  defaultContext: 'user',
  languageCodes: {
    [MyLanguages.English]: 'en',
    [MyLanguages.Spanish]: 'es'
  },
  languages: Object.values(MyLanguages)
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
- `t(templateString, language?, ...vars)` - Process template with enum patterns

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

interface I18nConfig<TStringKey, TLanguage, TConstants?, TContext?> {
  stringNames: TStringKey[];
  strings: MasterStringsCollection<TStringKey, TLanguage>;
  defaultLanguage: TLanguage;
  defaultContext: TContext;
  languageCodes: LanguageCodeCollection<TLanguage>;
  languages: TLanguage[];
  constants?: TConstants;
  enumName?: string;
  enumObj?: Record<string, TStringKey>;
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

## Best Practices

1. **Complete Translations**: EnumTranslation requires all enum values to be translated
2. **Type Safety**: Use TypeScript enums for string keys and languages
3. **Context Separation**: Use different contexts for admin and user interfaces
4. **Instance Management**: Use named instances for different parts of your application
5. **Error Handling**: Handle missing translations gracefully with fallback languages

## License

MIT

## Repository

Part of the DigitalBurnbag project - a secure file sharing and automated protocol system.