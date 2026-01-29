# Branded Enum Migration Guide

This guide explains how to migrate from traditional TypeScript enums to branded enums for i18n string keys, enabling runtime identification and collision detection.

## Why Migrate?

Traditional TypeScript enums are erased at compile time, making it impossible to:
- Determine which component a string key belongs to at runtime
- Detect key collisions between components
- Route translations to the correct handler when keys overlap

**Branded enums solve these problems** by embedding metadata that enables runtime identification while maintaining zero overhead (values remain raw strings).

## Quick Start

### Before (Legacy Enum)

```typescript
// my-component-keys.ts
export enum MyComponentKeys {
  Welcome = 'my.welcome',
  Goodbye = 'my.goodbye',
}
```

### After (Branded Enum)

```typescript
// my-component-keys.ts
import { createI18nStringKeys } from '@digitaldefiance/i18n-lib';

export const MyComponentKeys = createI18nStringKeys('my-component', {
  Welcome: 'my.welcome',
  Goodbye: 'my.goodbye',
} as const);

// Optional: Export the value type for type annotations
export type MyComponentKeyValue = import('@digitaldefiance/i18n-lib').BrandedStringKeyValue<typeof MyComponentKeys>;
```

## Migration Steps

### Step 1: Add the Import

```typescript
import { createI18nStringKeys, BrandedStringKeyValue } from '@digitaldefiance/i18n-lib';
```

### Step 2: Convert Enum to Branded Enum

**Option A: Direct Conversion (Recommended for new code)**

```typescript
// Before
export enum UserKeys {
  Login = 'user.login',
  Logout = 'user.logout',
  Profile = 'user.profile',
}

// After
export const UserKeys = createI18nStringKeys('user-component', {
  Login: 'user.login',
  Logout: 'user.logout',
  Profile: 'user.profile',
} as const);
```

**Option B: Gradual Migration (Keep both for backward compatibility)**

```typescript
import { createI18nStringKeysFromEnum } from '@digitaldefiance/i18n-lib';

// Keep legacy enum for backward compatibility
/** @deprecated Use BrandedUserKeys instead */
export enum UserKeys {
  Login = 'user.login',
  Logout = 'user.logout',
}

// Create branded version from legacy enum
export const BrandedUserKeys = createI18nStringKeysFromEnum('user-component', UserKeys);
```

### Step 3: Update Type Annotations

```typescript
// Before
function translate(key: UserKeys): string { ... }

// After
type UserKeyValue = BrandedStringKeyValue<typeof UserKeys>;
function translate(key: UserKeyValue): string { ... }
```

### Step 4: Update Component Registration

**Before (Legacy):**

```typescript
engine.registerComponent({
  component: {
    id: 'user-component',
    name: 'User Component',
    stringKeys: Object.values(UserKeys),
  },
  strings: { ... },
});
```

**After (Branded):**

```typescript
engine.registerBrandedComponent({
  component: {
    id: 'user-component',
    name: 'User Component',
    brandedStringKeys: UserKeys,
  },
  strings: { ... },
});
```

## Using Runtime Features

### Collision Detection

```typescript
import { checkStringKeyCollisions, enumIntersect } from '@digitaldefiance/i18n-lib';

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
// ['i18n:user-component']

// Resolve to a single component (null if ambiguous)
const componentId = resolveStringKeyComponent('user.login');
// 'user-component'
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
import { mergeI18nStringKeys } from '@digitaldefiance/i18n-lib';

// Create a combined key set for the entire app
const AllKeys = mergeI18nStringKeys('all-keys',
  CoreStringKeys,
  UserKeys,
  AdminKeys,
);

// Use for comprehensive validation
const allValues = getStringKeyValues(AllKeys);
```

## Best Practices

### 1. Use Namespaced Key Values

```typescript
// ✅ Good - namespaced values prevent collisions
const UserKeys = createI18nStringKeys('user', {
  Welcome: 'user.welcome',
  Settings: 'user.settings',
} as const);

// ❌ Bad - generic values may collide
const UserKeys = createI18nStringKeys('user', {
  Welcome: 'welcome',
  Settings: 'settings',
} as const);
```

### 2. Use Consistent Component IDs

```typescript
// The component ID should match across:
// 1. createI18nStringKeys first argument
// 2. ComponentDefinition.id
// 3. Any aliases in registration

const COMPONENT_ID = 'user-management';

const UserKeys = createI18nStringKeys(COMPONENT_ID, { ... });

engine.registerBrandedComponent({
  component: {
    id: COMPONENT_ID,  // Same ID
    name: 'User Management',
    brandedStringKeys: UserKeys,
  },
  strings: { ... },
});
```

### 3. Export Types for External Use

```typescript
// my-keys.ts
export const MyKeys = createI18nStringKeys('my-component', { ... } as const);
export type MyKeyValue = BrandedStringKeyValue<typeof MyKeys>;

// consumer.ts
import { MyKeys, MyKeyValue } from './my-keys';

function process(key: MyKeyValue) { ... }
```

### 4. Check for Collisions During Development

```typescript
// In your app initialization or tests
if (process.env.NODE_ENV === 'development') {
  const collisions = engine.getCollisionReport();
  if (collisions.size > 0) {
    console.warn('⚠️ String key collisions detected!');
    for (const [key, components] of collisions) {
      console.warn(`  "${key}" in: ${components.join(', ')}`);
    }
  }
}
```

## API Reference

### Factory Functions

| Function | Description |
|----------|-------------|
| `createI18nStringKeys(componentId, keys)` | Create a branded enum for i18n keys |
| `createI18nStringKeysFromEnum(componentId, enum)` | Convert legacy enum to branded enum |
| `mergeI18nStringKeys(newId, ...enums)` | Merge multiple branded enums |

### Query Functions

| Function | Description |
|----------|-------------|
| `findStringKeySources(key)` | Find components containing a key |
| `resolveStringKeyComponent(key)` | Resolve key to single component |
| `getStringKeysByComponentId(id)` | Get enum by component ID |
| `getRegisteredI18nComponents()` | List all registered components |
| `getStringKeyValues(enum)` | Get all values from enum |

### Validation Functions

| Function | Description |
|----------|-------------|
| `isValidStringKey(value, enum)` | Type guard for key validation |
| `checkStringKeyCollisions(...enums)` | Check enums for collisions |

### Types

| Type | Description |
|------|-------------|
| `BrandedStringKeys<T>` | Alias for branded enum type |
| `BrandedStringKeyValue<E>` | Extract value union from enum |

## Troubleshooting

### "Enum ID already registered" Error

Each branded enum must have a unique ID. If you see this error:
- Check for duplicate `createI18nStringKeys` calls with the same ID
- Ensure tests clean up between runs
- Use unique IDs per component

### Type Errors After Migration

Ensure you're using `as const` when creating branded enums:

```typescript
// ✅ Correct - literal types preserved
const Keys = createI18nStringKeys('id', { A: 'a' } as const);

// ❌ Wrong - types widened to string
const Keys = createI18nStringKeys('id', { A: 'a' });
```

### Keys Not Found in Registry

Branded enums are registered when created. Ensure:
1. The enum is imported/executed before querying
2. You're using the correct component ID (with or without `i18n:` prefix)

```typescript
// findStringKeySources returns IDs with 'i18n:' prefix
const sources = findStringKeySources('key'); // ['i18n:my-component']

// resolveStringKeyComponent returns ID without prefix
const id = resolveStringKeyComponent('key'); // 'my-component'
```
