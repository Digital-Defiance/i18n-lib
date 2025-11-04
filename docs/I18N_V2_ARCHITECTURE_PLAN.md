# @digitaldefiance/i18n-lib 2.0 Architecture Plan

## Executive Summary

Refactor i18n-lib to achieve 40-50% complexity reduction while maintaining flexible language support through runtime validation instead of compile-time generics.

**Key Principle**: Language flexibility through registry-based validation, not generic type parameters.

---

## Core Philosophy

### Keep: Language Flexibility
- Users can support any subset of languages
- Add/remove languages at runtime
- Custom language codes beyond core set
- **Solution**: Registry-based validation (already partially implemented)

### Remove: Generic Type Complexity
- `PluginI18nEngine<TLanguages>` → `PluginI18nEngine`
- Language validation moves from compile-time to runtime
- Registry is single source of truth

---

## Phase 1: Core Simplifications

### 1.1 Remove Legacy I18nEngine
**Impact**: -30% codebase, -100% maintenance burden

```typescript
// REMOVE: i18n-engine.ts (entire file)
// REMOVE: All legacy exports and documentation
// KEEP: Migration guide for 6 months
```

**Breaking Change**: Yes - users must migrate to PluginI18nEngine

### 1.2 Eliminate Language Generic
**Impact**: -50% generic complexity

```typescript
// Before
class PluginI18nEngine<TLanguages extends string> { }

// After
class PluginI18nEngine {
  // Language validation via LanguageRegistry (runtime)
}
```

**Rationale**: 
- `LanguageRegistry` already provides runtime validation
- Type safety doesn't prevent runtime language mismatches
- Simpler API, same flexibility

### 1.3 Fluent Configuration Builder
**Impact**: -60% configuration complexity

```typescript
// Before
new PluginI18nEngine(languages, config, options)

// After
I18nEngine.builder()
  .languages(languages)
  .defaultLanguage('en-US')
  .currency('USD')
  .timezone('UTC')
  .build()
```

---

## Phase 2: Context Consolidation

### 2.1 Single Context System
**Impact**: -40% context code

**Remove**:
- `IActiveContext` interface duplication
- `ContextManager` (over-engineered)
- Separate admin/user context complexity

**Keep**:
- `GlobalActiveContext` as single source
- Per-instance isolation
- Language space switching (admin/user)

```typescript
// Simplified context
interface Context {
  language: string;
  adminLanguage: string;
  currentSpace: 'admin' | 'user';
  currency: string;
  timezone: string;
}
```

### 2.2 Context API Simplification

```typescript
// Before
updateContext(updates: Partial<IActiveContext<TLanguages>>)

// After
setLanguage(lang: string)
setAdminLanguage(lang: string)
switchToAdmin()
switchToUser()
```

---

## Phase 3: Component System Refinement

### 3.1 Streamline Registration
**Impact**: -30% registration code

```typescript
// Simplified registration
interface ComponentConfig {
  id: string;
  strings: Record<string, Record<string, string>>;
  aliases?: string[];
}

engine.register({
  id: 'auth',
  strings: {
    'en-US': { login: 'Login', logout: 'Logout' },
    'fr': { login: 'Connexion', logout: 'Déconnexion' }
  },
  aliases: ['AuthComponent']
});
```

**Remove**:
- `ComponentDefinition` + `ComponentRegistration` split
- `enumName`, `enumObject` fields
- Generic type parameters on registration

### 3.2 Remove Enum Translation System
**Impact**: -20% codebase

**Rationale**:
- Enums are just strings
- Can be translated through regular component system
- Separate enum registry is over-engineering

```typescript
// Instead of special enum system
enum Status { Active = 'active', Inactive = 'inactive' }
engine.registerEnum(Status, translations, 'Status')

// Use regular strings
engine.register({
  id: 'status',
  strings: {
    'en-US': { active: 'Active', inactive: 'Inactive' }
  }
});
```

---

## Phase 4: Error System Consolidation

### 4.1 Single Error Class
**Impact**: -60% error code

**Remove**:
- `RegistryError` + `RegistryErrorType`
- `ContextError` + `ContextErrorType`
- `TranslatableGenericError`
- `TypedError` / `TypedHandleable` hierarchies

**Replace with**:
```typescript
class I18nError extends Error {
  constructor(
    public code: string,
    message: string,
    public metadata?: Record<string, any>
  ) {
    super(message);
  }
}

// Usage
throw new I18nError('COMPONENT_NOT_FOUND', 'Component "auth" not found', { id: 'auth' });
```

### 4.2 Error Codes as Constants

```typescript
export const ErrorCodes = {
  COMPONENT_NOT_FOUND: 'COMPONENT_NOT_FOUND',
  LANGUAGE_NOT_FOUND: 'LANGUAGE_NOT_FOUND',
  TRANSLATION_MISSING: 'TRANSLATION_MISSING',
  INVALID_CONFIG: 'INVALID_CONFIG',
} as const;
```

---

## Phase 5: Template System Simplification

### 5.1 Single Template Pattern
**Impact**: -40% template code

**Keep**: `{{component.key}}` and `{variable}`
**Remove**: Enum patterns, legacy patterns, constants injection

```typescript
// Supported patterns
engine.t('{{auth.welcome}} {name}!', { name: 'John' })
// "Welcome John!"

// Remove support for
// {{EnumName.EnumKey}} - use regular component keys
// Constants injection - pass as variables
```

### 5.2 Simplified Template API

```typescript
// Before
t(str: string, language?: TLanguages, ...otherVars: Record<string, string | number>[])

// After
t(template: string, variables?: Record<string, any>, language?: string)
```

---

## Phase 6: Scope Reduction

### 6.1 Remove Currency Features
**Impact**: -10% codebase

**Remove**:
- `CurrencyCode` class
- `getCurrencyFormat` function
- `currency-code.ts`, `currency-format.ts`, `currency.ts`

**Rationale**: Out of scope for i18n library

### 6.2 Remove Timezone Features
**Impact**: -5% codebase

**Remove**:
- `Timezone` class
- `isValidTimezone` function
- `timezone.ts`

**Rationale**: Out of scope for i18n library

**Migration**: Users can use `Intl.DateTimeFormat` or moment-timezone directly

---

## Phase 7: Static Registry Cleanup

### 7.1 Consolidate Registries

**Keep**:
- `LanguageRegistry` (static, global)
- Component storage (per-instance)

**Remove**:
- `EnumRegistry` (per-instance) - use component system
- Separate instance registry complexity

### 7.2 Simplified Language Registry

```typescript
class LanguageRegistry {
  static register(id: string, name: string, code: string, isDefault?: boolean)
  static has(id: string): boolean
  static get(id: string): Language
  static getAll(): Language[]
  static getDefault(): Language
  static clear() // testing only
}
```

---

## Phase 8: API Modernization

### 8.1 Fluent Translation API

```typescript
// Current
engine.translate('component', 'key', vars, lang)

// Proposed
engine.translate('component.key', vars, lang)
// or
engine.component('auth').translate('login', vars, lang)
```

### 8.2 Chainable Instance Configuration

```typescript
engine
  .setLanguage('fr')
  .switchToAdmin()
  .setTimezone('Europe/Paris')
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Remove legacy I18nEngine
- Eliminate language generic
- Create fluent builder

### Phase 2: Context (Week 1)
- Consolidate context system
- Simplify context API

### Phase 3: Components (Week 2)
- Streamline registration
- Remove enum system

### Phase 4: Errors (Week 2)
- Single error class
- Error code constants

### Phase 5: Templates (Week 3)
- Simplify template patterns
- Clean template API

### Phase 6: Scope (Week 3)
- Remove currency features
- Remove timezone features

### Phase 7: Registry (Week 4)
- Consolidate registries
- Simplify language registry

### Phase 8: Polish (Week 4)
- Fluent APIs
- Documentation
- Migration guide

---

## Success Metrics

### Quantitative
- **40-50% code reduction** (target: 2000 → 1200 lines)
- **87% generic reduction** (TLanguages removed from public API)
- **60% error code reduction** (5 error types → 1)
- **30% API surface reduction** (fewer methods, clearer purpose)

### Qualitative
- Simpler mental model
- Easier to learn
- Faster to use
- Better IDE support
- Clearer documentation

---

## Breaking Changes Summary

1. **Legacy I18nEngine removed** - migrate to PluginI18nEngine
2. **No language generic** - `PluginI18nEngine<TLang>` → `PluginI18nEngine`
3. **Constructor replaced** - use `I18nEngine.builder()`
4. **Enum system removed** - use regular component strings
5. **Error types consolidated** - single `I18nError` class
6. **Currency/timezone removed** - use standard libraries
7. **Template patterns reduced** - only `{{component.key}}` and `{var}`
8. **Context API changed** - specific methods instead of `updateContext`

---

## Migration Strategy

### 6-Month Deprecation Period
- v1.x continues with deprecation warnings
- v2.0 removes deprecated features
- Comprehensive migration guide

### Codemod Support
```bash
npx @digitaldefiance/i18n-migrate
```

Automatically converts:
- Legacy I18nEngine → PluginI18nEngine
- Generic type parameters → runtime validation
- Old constructor → builder pattern
- Enum registrations → component strings
- Error handling → new error class

---

## Language Flexibility Preserved

### Runtime Validation Model

```typescript
// Users can still support any languages
I18nEngine.builder()
  .languages([
    { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
    { id: 'custom-lang', name: 'Custom', code: 'x-custom' }
  ])
  .build();

// Add languages dynamically
engine.addLanguage({ id: 'pt-BR', name: 'Portuguese', code: 'pt-BR' });

// Registry validates at runtime
engine.setLanguage('pt-BR'); // ✓ Validated
engine.setLanguage('invalid'); // ✗ Throws I18nError
```

### Type Safety Through Registry

```typescript
// Type-safe language IDs (optional)
type AppLanguages = 'en-US' | 'fr' | 'es';

// But validation happens at runtime via registry
const lang: AppLanguages = 'fr';
engine.setLanguage(lang); // Registry validates
```

**Key Insight**: Type safety is nice, but runtime validation is required anyway. Simplify types, strengthen runtime checks.

---

## Comparison to Express Suite Refactor

| Feature | Express Suite 2.0 | i18n-lib 2.0 |
|---------|------------------|--------------|
| Generic reduction | 87.5% (8→1) | 100% (1→0) |
| Service container | ✓ Centralized DI | ✓ Registry pattern |
| Fluent builders | ✓ Multiple builders | ✓ Single builder |
| Error consolidation | ✓ Response builder | ✓ Single error class |
| Complexity reduction | 50% | 40-50% target |
| Breaking changes | Major (2.0) | Major (2.0) |

---

## Next Steps

1. **Review & Approve** this architecture plan
2. **Create detailed specs** for each phase
3. **Build Phase 1** (foundation)
4. **Iterate** through remaining phases
5. **Document** migration path

---

## Questions for Review

1. Is removing language generic acceptable with runtime validation?
2. Should we keep currency/timezone or remove entirely?
3. Is 6-month deprecation period sufficient?
4. Any features we're removing that are critical?

---

**Status**: Draft for Review
**Version**: 1.0
**Date**: 2025
**Author**: Architecture Review
