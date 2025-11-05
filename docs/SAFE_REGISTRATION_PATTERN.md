# Safe Component Registration Pattern

## Problem

When reusing existing i18n engine instances (especially the 'default' instance), components may already be registered. Attempting to register them again causes "Component already registered" errors.

## Solution

Both `I18nEngine` and `PluginI18nEngine` now provide safe registration methods that check for existing components before registering:

### I18nEngine (2.x API)

```typescript
// Old pattern (error-prone)
if (!i18nEngine.hasComponent('myComponent')) {
  i18nEngine.register(componentConfig);
}

// New pattern (recommended)
i18nEngine.registerIfNotExists(componentConfig);
```

### PluginI18nEngine (1.x API)

```typescript
// Old pattern (error-prone)
if (!engine.hasComponent('myComponent')) {
  engine.registerComponent(componentRegistration);
}

// New pattern (recommended)
engine.registerComponentIfNotExists(componentRegistration);
```

## Benefits

1. **Cleaner Code**: Single method call instead of if-check + register
2. **Consistent Pattern**: Same approach across both engine versions
3. **No Errors**: Safe to call multiple times, even if component exists
4. **Validation**: Still returns ValidationResult for checking warnings

## Example Usage

```typescript
import { I18nEngine, createCoreComponentConfig } from '@digitaldefiance/i18n-lib';
import { createEciesComponentConfig } from '@digitaldefiance/ecies-lib';

// Get or create engine
const engine = I18nEngine.hasInstance('default')
  ? I18nEngine.getInstance('default')
  : I18nEngine.createInstance('default', languages);

// Safe registration - no errors if already registered
engine.registerIfNotExists(createCoreComponentConfig());
engine.registerIfNotExists(createEciesComponentConfig());

const result = engine.registerIfNotExists({
  id: 'myApp',
  strings: myAppStrings,
});

if (!result.isValid) {
  console.warn('Registration warnings:', result.warnings);
}
```

## Return Value

Both methods return a `ValidationResult`:

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

- If component already exists: `{ isValid: true, errors: [], warnings: [] }`
- If registration succeeds: Normal validation result
- If registration fails: Validation errors included

## When to Use

Use these methods whenever:
- Reusing an existing engine instance
- Module may be loaded multiple times
- Unsure if component is already registered
- Want to avoid try-catch blocks for duplicate registration

## Implementation

The pattern is simple:

```typescript
registerIfNotExists(config: ComponentConfig): ValidationResult {
  if (this.hasComponent(config.id)) {
    return { isValid: true, errors: [], warnings: [] };
  }
  return this.register(config);
}
```

This encapsulates the check-before-register pattern into a single, reusable method.
