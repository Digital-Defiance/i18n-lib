# ICU MessageFormat Guide

Complete guide to using ICU MessageFormat in the i18n library.

---

## Quick Start

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
```

---

## Syntax Reference

### Variables
```
{name}                    → Simple substitution
{count, number}           → Number formatting
{price, number, currency} → Currency formatting
{date, date, short}       → Date formatting
```

### Plural
```
{count, plural,
  zero {no items}
  one {# item}
  two {# items}
  few {# items}
  many {# items}
  other {# items}
}
```

### Select
```
{gender, select,
  male {He}
  female {She}
  other {They}
}
```

### SelectOrdinal
```
{place, selectordinal,
  one {#st}
  two {#nd}
  few {#rd}
  other {#th}
}
```

---

## API Reference

### formatICUMessage()
```typescript
formatICUMessage(
  message: string,
  values: Record<string, any>,
  locale?: string
): string
```

### isICUMessage()
```typescript
isICUMessage(message: string): boolean
```

### parseICUMessage()
```typescript
parseICUMessage(message: string): MessageNode
```

### validateICUMessage()
```typescript
validateICUMessage(message: string, options?: ValidationOptions): void
```

---

## Examples

### E-commerce
```typescript
formatICUMessage(
  '{name} ordered {count, plural, one {# item} other {# items}} for {price, number, currency}',
  { name: 'Alice', count: 3, price: 99.99 },
  'en-US'
);
// → "Alice ordered 3 items for $99.99"
```

### Notifications
```typescript
formatICUMessage(
  '{sender} sent you {count, plural, one {a message} other {# messages}}',
  { sender: 'Bob', count: 5 }
);
// → "Bob sent you 5 messages"
```

### Nested
```typescript
formatICUMessage(
  '{gender, select, male {He has} female {She has}} {count, plural, one {# item} other {# items}}',
  { gender: 'female', count: 2 }
);
// → "She has 2 items"
```

---

## Multilingual Support

### Russian (4 forms)
```typescript
formatICUMessage(
  '{count, plural, one {# товар} few {# товара} many {# товаров} other {# товаров}}',
  { count: 2 },
  'ru'
);
// → "2 товара"
```

### Arabic (6 forms)
```typescript
formatICUMessage(
  '{count, plural, zero {لا عناصر} one {عنصر واحد} two {عنصران} few {# عناصر} many {# عنصر} other {# عنصر}}',
  { count: 0 },
  'ar'
);
// → "لا عناصر"
```

---

## Advanced Usage

### Runtime Class
```typescript
import { Runtime } from '@digitaldefiance/i18n-lib';

const runtime = new Runtime();
runtime.format(message, values, { locale: 'en-US' });
```

### Custom Formatters
```typescript
import { FormatterRegistry } from '@digitaldefiance/i18n-lib';

const registry = new FormatterRegistry();
registry.register('custom', {
  format: (value, style, context) => `custom: ${value}`
});
```

### Validation Options
```typescript
validateICUMessage(message, {
  requireOtherCase: false,
  maxDepth: 20
});
```

---

## Best Practices

1. **Always provide 'other' case** for plural/select
2. **Use # placeholder** in plural messages
3. **Keep nesting shallow** (max 3-4 levels)
4. **Test with multiple locales**
5. **Cache messages** when possible

---

## Supported Languages

37 languages with CLDR plural rules:
- English, French, Spanish, German, Italian, Portuguese
- Russian, Ukrainian, Polish, Czech
- Arabic, Hebrew, Hindi
- Japanese, Chinese, Korean
- And 24 more...

---

## Performance

- Messages cached after first parse
- <1ms per format operation
- Efficient for production use
- Memory-efficient caching

---

## Migration

### From Simple Strings
```typescript
// Before
`Hello ${name}`

// After
formatICUMessage('Hello {name}', { name })
```

### From Template Literals
```typescript
// Before
`${count} ${count === 1 ? 'item' : 'items'}`

// After
formatICUMessage('{count, plural, one {# item} other {# items}}', { count })
```

---

## Troubleshooting

### Missing 'other' case
```
ValidationError: Plural 'count' must have an 'other' case
```
Solution: Add `other {# items}` to your plural

### Invalid syntax
```
ParseError: Expected IDENTIFIER but got EOF
```
Solution: Check for unclosed braces

### NaN in output
Solution: Ensure numeric values are numbers, not strings

---

## Resources

- [Unicode ICU Specification](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [CLDR Plural Rules](https://cldr.unicode.org/index/cldr-spec/plural-rules)
- [FormatJS Documentation](https://formatjs.io/docs/core-concepts/icu-syntax/)
