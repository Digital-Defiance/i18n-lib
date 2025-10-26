# Type-Safe Extension Example

This example demonstrates how to extend the i18n library with custom languages and components while maintaining full type safety.

## Step 1: Define Extended Language Type

```typescript
import { 
  CoreLanguageCode, 
  getCoreLanguageDefinitions, 
  createLanguageDefinition,
  PluginI18nEngine
} from '@digitaldefiance/i18n-lib';

// Extend core languages with your custom languages
type MyAppLanguages = CoreLanguageCode | 'pt-BR' | 'it' | 'ar';
```

## Step 2: Create Engine with Extended Languages

```typescript
const myAppLanguages = [
  ...getCoreLanguageDefinitions(), // Core: en-US, en-GB, fr, es, de, zh-CN, ja, uk
  createLanguageDefinition('pt-BR', 'Português (Brasil)', 'pt-BR'),
  createLanguageDefinition('it', 'Italiano', 'it'),
  createLanguageDefinition('ar', 'العربية', 'ar')
];

const engine = PluginI18nEngine.createInstance<MyAppLanguages>(
  'myapp',
  myAppLanguages
);
```

## Step 3: Define Custom Component

```typescript
import { ComponentDefinition, ComponentRegistration } from '@digitaldefiance/i18n-lib';

// Define string keys
enum ProductKeys {
  ProductName = 'productName',
  AddToCart = 'addToCart',
  PriceTemplate = 'priceTemplate',
  OutOfStock = 'outOfStock'
}

// Define component
const productComponent: ComponentDefinition<ProductKeys> = {
  id: 'product',
  name: 'Product Component',
  stringKeys: Object.values(ProductKeys)
};
```

## Step 4: Register Component with Type-Safe Translations

```typescript
// TypeScript enforces that all languages have all keys
const productRegistration: ComponentRegistration<ProductKeys, MyAppLanguages> = {
  component: productComponent,
  strings: {
    // Core languages
    'en-US': {
      [ProductKeys.ProductName]: 'Product Name',
      [ProductKeys.AddToCart]: 'Add to Cart',
      [ProductKeys.PriceTemplate]: 'Price: ${price}',
      [ProductKeys.OutOfStock]: 'Out of Stock'
    },
    'fr': {
      [ProductKeys.ProductName]: 'Nom du produit',
      [ProductKeys.AddToCart]: 'Ajouter au panier',
      [ProductKeys.PriceTemplate]: 'Prix : {price} €',
      [ProductKeys.OutOfStock]: 'Rupture de stock'
    },
    // Custom languages
    'pt-BR': {
      [ProductKeys.ProductName]: 'Nome do Produto',
      [ProductKeys.AddToCart]: 'Adicionar ao Carrinho',
      [ProductKeys.PriceTemplate]: 'Preço: R$ {price}',
      [ProductKeys.OutOfStock]: 'Fora de Estoque'
    },
    'it': {
      [ProductKeys.ProductName]: 'Nome del Prodotto',
      [ProductKeys.AddToCart]: 'Aggiungi al Carrello',
      [ProductKeys.PriceTemplate]: 'Prezzo: € {price}',
      [ProductKeys.OutOfStock]: 'Esaurito'
    },
    'ar': {
      [ProductKeys.ProductName]: 'اسم المنتج',
      [ProductKeys.AddToCart]: 'أضف إلى السلة',
      [ProductKeys.PriceTemplate]: 'السعر: {price}',
      [ProductKeys.OutOfStock]: 'غير متوفر'
    }
    // TypeScript will error if any language is missing!
  }
};

// Register component
const result = engine.registerComponent(productRegistration);
if (!result.isValid) {
  console.error('Missing translations:', result.missingKeys);
}
```

## Step 5: Type-Safe Usage

```typescript
// All parameters are type-checked
const productName = engine.translate(
  'product',
  ProductKeys.ProductName, // ✓ Must be valid ProductKeys
  undefined,
  'pt-BR' // ✓ Must be valid MyAppLanguages
);

// Invalid usage caught at compile time
engine.translate(
  'product',
  'invalidKey', // ✗ Type error!
  undefined,
  'invalid-lang' // ✗ Type error!
);

// Set language with type safety
engine.setLanguage('it'); // ✓
engine.setLanguage('invalid'); // ✗ Type error!
```

## Step 6: Type-Safe Error Classes

```typescript
import { PluginTypedError, CompleteReasonMap } from '@digitaldefiance/i18n-lib';

enum ProductErrorType {
  NotFound = 'notFound',
  OutOfStock = 'outOfStock',
  InvalidQuantity = 'invalidQuantity'
}

enum ProductErrorKeys {
  NotFoundMessage = 'notFoundMessage',
  OutOfStockMessage = 'outOfStockMessage',
  InvalidQuantityMessage = 'invalidQuantityMessage'
}

const productErrorMap: CompleteReasonMap<typeof ProductErrorType, ProductErrorKeys> = {
  [ProductErrorType.NotFound]: ProductErrorKeys.NotFoundMessage,
  [ProductErrorType.OutOfStock]: ProductErrorKeys.OutOfStockMessage,
  [ProductErrorType.InvalidQuantity]: ProductErrorKeys.InvalidQuantityMessage
};

class ProductError extends PluginTypedError<
  typeof ProductErrorType,
  ProductErrorKeys,
  MyAppLanguages // ✓ Type-safe language parameter
> {
  constructor(
    engine: PluginI18nEngine<MyAppLanguages>,
    type: ProductErrorType,
    language?: MyAppLanguages,
    vars?: Record<string, string | number>
  ) {
    super(engine, 'product-errors', type, productErrorMap, language, vars);
  }
}

// Usage
throw new ProductError(
  engine,
  ProductErrorType.NotFound,
  'pt-BR', // ✓ Type-checked
  { productId: '12345' }
);
```

## Step 7: Mongoose Schema Integration

```typescript
import { Schema } from 'mongoose';

// Get language codes from engine (runtime)
const supportedLanguages = engine.getLanguageRegistry().getLanguageIds();
// ['en-US', 'en-GB', 'fr', 'es', 'de', 'zh-CN', 'ja', 'uk', 'pt-BR', 'it', 'ar']

const userSchema = new Schema({
  preferredLanguage: {
    type: String,
    enum: supportedLanguages, // Runtime array from registry
    default: 'en-US',
    required: true
  }
});

// Type-safe validation
function validateLanguage(lang: string): lang is MyAppLanguages {
  return supportedLanguages.includes(lang);
}
```

## Benefits

1. **Compile-Time Safety**: TypeScript catches invalid languages and keys
2. **Runtime Flexibility**: Registry manages languages dynamically
3. **No Duplication**: Single source of truth (LanguageCodes + registry)
4. **Extensible**: Easy to add languages and components
5. **Maintainable**: Type errors guide you to fix missing translations
6. **Scalable**: Works for any number of languages and components

## Type Safety Guarantees

- ✓ Invalid language codes rejected at compile time
- ✓ Invalid string keys rejected at compile time
- ✓ Missing translations detected during registration
- ✓ Type-safe error classes with language parameters
- ✓ IDE autocomplete for all languages and keys
- ✓ Refactoring safety (rename detection)
