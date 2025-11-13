# Adding Custom Languages to Pluralization

## Quick Start (5 minutes)

### Step 1: Create Your Plural Rule Function

```typescript
import { PluralRuleFunction, PluralCategory } from '@digitaldefiance/i18n-lib';

// Example: Italian (same as English)
export const pluralRuleItalian: PluralRuleFunction = (n: number): PluralCategory => {
  if (n === 1) return 'one';
  return 'other';
};
```

### Step 2: Register It

```typescript
import { LANGUAGE_PLURAL_RULES, LANGUAGE_PLURAL_FORMS } from '@digitaldefiance/i18n-lib';

// Add to the rules map
LANGUAGE_PLURAL_RULES['it'] = pluralRuleItalian;

// Define required forms
LANGUAGE_PLURAL_FORMS['it'] = {
  required: ['one', 'other'],
  optional: ['zero']
};
```

### Step 3: Use It

```typescript
engine.register({
  component: { id: 'app', stringKeys: ['items'] },
  strings: {
    'it': {
      items: {
        one: '1 elemento',
        other: '{count} elementi'
      }
    }
  }
});

engine.t('app.items', { count: 5 }); // "5 elementi"
```

## Common Patterns

### Pattern 1: Same as English (Most Common)

```typescript
// Italian, Portuguese, Dutch, Swedish, Norwegian, Danish, Finnish, Greek
export const pluralRuleSimple: PluralRuleFunction = (n: number): PluralCategory => {
  if (n === 1) return 'one';
  return 'other';
};
```

### Pattern 2: No Plural Distinction

```typescript
// Turkish, Korean, Vietnamese, Thai, Indonesian, Malay, Chinese, Japanese
export const pluralRuleNone: PluralRuleFunction = (n: number): PluralCategory => {
  return 'other';
};
```

### Pattern 3: French-style (0 and 1 both "one")

```typescript
// French, Brazilian Portuguese
export const pluralRuleFrenchStyle: PluralRuleFunction = (n: number): PluralCategory => {
  if (n === 0 || n === 1) return 'one';
  return 'other';
};
```

### Pattern 4: Slavic-style (one/few/many)

```typescript
// Russian, Ukrainian, Belarusian, Serbian, Croatian
export const pluralRuleSlavic: PluralRuleFunction = (n: number): PluralCategory => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  
  if (mod10 === 1 && mod100 !== 11) return 'one';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
  return 'many';
};
```

## Advanced: Complex Rules

### Hebrew (he)

```typescript
export const pluralRuleHebrew: PluralRuleFunction = (n: number): PluralCategory => {
  if (n === 1) return 'one';
  if (n === 2) return 'two';
  if (n > 10 && n % 10 === 0) return 'many';
  return 'other';
};

LANGUAGE_PLURAL_FORMS['he'] = {
  required: ['one', 'two', 'many', 'other'],
  optional: []
};
```

### Hindi (hi)

```typescript
export const pluralRuleHindi: PluralRuleFunction = (n: number): PluralCategory => {
  if (n === 0 || n === 1) return 'one';
  return 'other';
};

LANGUAGE_PLURAL_FORMS['hi'] = {
  required: ['one', 'other'],
  optional: []
};
```

## Helper: Reuse Existing Rules

```typescript
import { pluralRuleEnglish, pluralRuleJapanese } from '@digitaldefiance/i18n-lib';

// Italian uses same rule as English
LANGUAGE_PLURAL_RULES['it'] = pluralRuleEnglish;
LANGUAGE_PLURAL_FORMS['it'] = { required: ['one', 'other'], optional: ['zero'] };

// Korean uses same rule as Japanese
LANGUAGE_PLURAL_RULES['ko'] = pluralRuleJapanese;
LANGUAGE_PLURAL_FORMS['ko'] = { required: ['other'], optional: [] };
```

## Testing Your Rule

```typescript
import { getPluralCategory } from '@digitaldefiance/i18n-lib';

// Test your language
console.log(getPluralCategory('it', 1));  // "one"
console.log(getPluralCategory('it', 2));  // "other"
console.log(getPluralCategory('it', 0));  // "other"
```

## CLDR Reference

For accurate plural rules, consult the Unicode CLDR:
- **CLDR Plural Rules**: https://cldr.unicode.org/index/cldr-spec/plural-rules
- **Language Plural Rules**: https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html

## Built-in Languages (19)

You can reuse these rules for similar languages:

| Language | Code | Forms | Reuse For |
|----------|------|-------|-----------|
| English | en | one, other | Italian, Portuguese, Dutch, Swedish, etc. |
| Russian | ru | one, few, many | Ukrainian, Belarusian, Serbian, Croatian |
| Arabic | ar | zero, one, two, few, many, other | - |
| Polish | pl | one, few, many, other | - |
| French | fr | one, other | Brazilian Portuguese |
| Japanese | ja | other | Korean, Chinese, Vietnamese, Thai, Turkish |
| German | de | one, other | - |
| Scottish Gaelic | gd | one, two, few, other | - |
| Welsh | cy | zero, one, two, few, many, other | - |
| Breton | br | one, two, few, many, other | - |
| Slovenian | sl | one, two, few, other | - |
| Czech | cs | one, few, many, other | Slovak |
| Lithuanian | lt | one, few, many, other | - |
| Latvian | lv | zero, one, other | - |
| Irish | ga | one, two, few, many, other | - |
| Romanian | ro | one, few, other | Moldovan |

## Complete Example: Adding Italian

```typescript
// 1. Import types
import { 
  PluralRuleFunction, 
  PluralCategory,
  LANGUAGE_PLURAL_RULES,
  LANGUAGE_PLURAL_FORMS,
  pluralRuleEnglish // Reuse English rule
} from '@digitaldefiance/i18n-lib';

// 2. Register the language (reusing English rule)
LANGUAGE_PLURAL_RULES['it'] = pluralRuleEnglish;
LANGUAGE_PLURAL_FORMS['it'] = {
  required: ['one', 'other'],
  optional: ['zero']
};

// 3. Use in your app
const engine = I18nEngine.createInstance('myapp', [
  { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
  { id: 'it', name: 'Italiano', code: 'it' }
]);

engine.register({
  component: { id: 'cart', stringKeys: ['items'] },
  strings: {
    'en-US': {
      items: {
        one: '1 item',
        other: '{count} items'
      }
    },
    'it': {
      items: {
        one: '1 elemento',
        other: '{count} elementi'
      }
    }
  }
});

// Test it
engine.setLanguage('it');
console.log(engine.t('cart.items', { count: 1 }));  // "1 elemento"
console.log(engine.t('cart.items', { count: 5 }));  // "5 elementi"
```

## Need Help?

1. Check if your language is similar to an existing one
2. Consult CLDR documentation for the exact rules
3. Write tests to verify your rule works correctly
4. Submit a PR to add it to the library!
