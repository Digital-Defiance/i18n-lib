# Pluralization Usage Guide

## Quick Answer: Works Everywhere! ✅

Pluralization works in **all translation methods**:
- ✅ `engine.translate(componentId, key, { count }, language)`
- ✅ `engine.safeTranslate(componentId, key, { count }, language)`
- ✅ `engine.t(template, { count }, language)`

## Basic Usage

### 1. Register Component with Plural Forms

```typescript
import { I18nEngine } from '@digitaldefiance/i18n-lib';

const engine = I18nEngine.createInstance('myapp', [
  { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
  { id: 'ru', name: 'Russian', code: 'ru' }
]);

engine.register({
  id: 'cart',
  strings: {
    'en-US': {
      items: {
        one: '1 item',
        other: '{count} items'
      }
    },
    'ru': {
      items: {
        one: '{count} товар',
        few: '{count} товара',
        many: '{count} товаров'
      }
    }
  }
});
```

### 2. Use with translate()

```typescript
// English
engine.translate('cart', 'items', { count: 1 }, 'en-US');   // "1 item"
engine.translate('cart', 'items', { count: 5 }, 'en-US');   // "5 items"

// Russian - automatically picks correct form
engine.translate('cart', 'items', { count: 1 }, 'ru');   // "1 товар"
engine.translate('cart', 'items', { count: 2 }, 'ru');   // "2 товара"
engine.translate('cart', 'items', { count: 5 }, 'ru');   // "5 товаров"
engine.translate('cart', 'items', { count: 21 }, 'ru');  // "21 товар"
```

### 3. Use with t() Template Function

```typescript
// Template with plural reference
engine.t('You have {{cart.items}}', { count: 5 }, 'en-US');
// "You have 5 items"

engine.t('You have {{cart.items}}', { count: 1 }, 'en-US');
// "You have 1 item"

// Works in Russian too
engine.t('У вас {{cart.items}}', { count: 5 }, 'ru');
// "У вас 5 товаров"
```

### 4. Use with safeTranslate()

```typescript
// Never throws - returns fallback on error
engine.safeTranslate('cart', 'items', { count: 5 }, 'en-US');
// "5 items"

engine.safeTranslate('cart', 'missing', { count: 5 }, 'en-US');
// "[cart.missing]" (fallback)
```

## Complex Examples

### Arabic (6 Forms)

```typescript
engine.register({
  id: 'notifications',
  strings: {
    'ar': {
      messages: {
        zero: 'لا رسائل',
        one: 'رسالة واحدة',
        two: 'رسالتان',
        few: '{count} رسائل',
        many: '{count} رسالة',
        other: '{count} رسالة'
      }
    }
  }
});

engine.translate('notifications', 'messages', { count: 0 }, 'ar');   // "لا رسائل"
engine.translate('notifications', 'messages', { count: 1 }, 'ar');   // "رسالة واحدة"
engine.translate('notifications', 'messages', { count: 2 }, 'ar');   // "رسالتان"
engine.translate('notifications', 'messages', { count: 5 }, 'ar');   // "5 رسائل"
engine.translate('notifications', 'messages', { count: 15 }, 'ar');  // "15 رسالة"
engine.translate('notifications', 'messages', { count: 100 }, 'ar'); // "100 رسالة"
```

### Mixed Plural and Non-Plural

```typescript
engine.register({
  id: 'shop',
  strings: {
    'en-US': {
      title: 'Shopping Cart',
      items: {
        one: '1 item',
        other: '{count} items'
      },
      total: 'Total: ${amount}',
      checkout: 'Checkout'
    }
  }
});

// All work together
engine.translate('shop', 'title');                           // "Shopping Cart"
engine.translate('shop', 'items', { count: 5 });            // "5 items"
engine.translate('shop', 'total', { amount: '99.99' });     // "Total: $99.99"
engine.translate('shop', 'checkout');                        // "Checkout"
```

### Template with Multiple Plurals

```typescript
engine.register({
  id: 'summary',
  strings: {
    'en-US': {
      items: { one: '1 item', other: '{count} items' },
      users: { one: '1 user', other: '{count} users' }
    }
  }
});

engine.t(
  'Cart has {{summary.items}} from {{summary.users}}',
  { count: 5, userCount: 2 },
  'en-US'
);
// "Cart has 5 items from 2 users"
```

## Automatic Features

### 1. Count Detection
The library automatically detects the `count` variable and uses it for plural resolution:

```typescript
// Automatically uses count=5 to pick "other" form
engine.translate('cart', 'items', { count: 5 });
```

### 2. Language-Specific Rules
Each language's plural rules are applied automatically:

```typescript
// English: 1 = one, everything else = other
engine.translate('cart', 'items', { count: 1 }, 'en-US');  // "one" form
engine.translate('cart', 'items', { count: 2 }, 'en-US');  // "other" form

// Russian: 1/21/31 = one, 2-4/22-24 = few, 5-20/25-30 = many
engine.translate('cart', 'items', { count: 1 }, 'ru');   // "one" form
engine.translate('cart', 'items', { count: 2 }, 'ru');   // "few" form
engine.translate('cart', 'items', { count: 5 }, 'ru');   // "many" form
engine.translate('cart', 'items', { count: 21 }, 'ru');  // "one" form
```

### 3. Fallback Logic
If a specific plural form is missing, the library falls back gracefully:

```typescript
// Only "one" and "other" defined
engine.register({
  id: 'test',
  strings: {
    'ru': {
      items: {
        one: '1 товар',
        other: 'товары'
      }
    }
  }
});

// Missing "few" and "many" forms - falls back to "other"
engine.translate('test', 'items', { count: 2 }, 'ru');  // "товары"
engine.translate('test', 'items', { count: 5 }, 'ru');  // "товары"
```

### 4. Backward Compatibility
Simple strings still work exactly as before:

```typescript
engine.register({
  id: 'app',
  strings: {
    'en-US': {
      title: 'My App',                    // Simple string
      items: { one: '1', other: '{count}' }  // Plural string
    }
  }
});

engine.translate('app', 'title');              // "My App" ✅
engine.translate('app', 'items', { count: 5 }); // "5" ✅
```

## Edge Cases

### No Count Provided
Uses "other" form or first available:

```typescript
engine.translate('cart', 'items', {});  // Uses "other" form
```

### Fractional Numbers
Uses absolute value for plural rules:

```typescript
engine.translate('cart', 'items', { count: 1.5 });  // "1.5 items" (uses "other")
```

### Negative Numbers
Uses absolute value for plural rules, keeps sign in output:

```typescript
engine.translate('cart', 'items', { count: -1 });  // "-1 item" (uses "one")
engine.translate('cart', 'items', { count: -5 });  // "-5 items" (uses "other")
```

### Zero
Depends on language rules:

```typescript
// English: 0 uses "other"
engine.translate('cart', 'items', { count: 0 }, 'en-US');  // "0 items"

// French: 0 uses "one"
engine.translate('cart', 'items', { count: 0 }, 'fr');     // Uses "one" form

// Arabic: 0 uses "zero" (if defined)
engine.translate('cart', 'items', { count: 0 }, 'ar');     // Uses "zero" form
```

## Best Practices

### 1. Always Include "other" Form
This is the universal fallback:

```typescript
// ✅ Good
items: {
  one: '1 item',
  other: '{count} items'  // Always include this
}

// ❌ Bad
items: {
  one: '1 item'
  // Missing "other" - will fallback to "one" for all counts
}
```

### 2. Use {count} Variable
Include the count in your translations:

```typescript
// ✅ Good
items: {
  one: '1 item',
  other: '{count} items'  // Shows the actual count
}

// ⚠️ Okay but less informative
items: {
  one: 'One item',
  other: 'Multiple items'  // Doesn't show count
}
```

### 3. Test All Forms
Make sure to test each plural form for your language:

```typescript
// Russian has 3 forms - test all of them
expect(engine.translate('cart', 'items', { count: 1 }, 'ru')).toBe('1 товар');
expect(engine.translate('cart', 'items', { count: 2 }, 'ru')).toBe('2 товара');
expect(engine.translate('cart', 'items', { count: 5 }, 'ru')).toBe('5 товаров');
```

## Summary

✅ **Works in all methods**: `translate()`, `safeTranslate()`, `t()`  
✅ **Automatic detection**: Just pass `{ count }` variable  
✅ **37 languages supported**: Including complex systems  
✅ **Intelligent fallback**: Graceful degradation  
✅ **Backward compatible**: Simple strings still work  
✅ **Type-safe**: Full TypeScript support  

**No configuration needed - it just works!** 🎉
