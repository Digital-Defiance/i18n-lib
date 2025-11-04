# i18n-lib v2.0 Refactor Status

## Overview

This document tracks the progress of the v2.0 refactor based on the architecture plan in `I18N_V2_ARCHITECTURE_PLAN.md`.

## Completed

### ✅ Phase 1: Foundation (Partial)

1. **Architecture Plan** - `I18N_V2_ARCHITECTURE_PLAN.md`
   - Complete refactor strategy
   - 8 phases defined
   - Success metrics established

2. **Migration Guide** - `MIGRATION_V2.md`
   - Comprehensive migration documentation
   - Breaking changes documented
   - Code examples for all changes

3. **Fluent Builder** - `src/i18n-builder.ts`
   - New `I18nBuilder` class
   - Fluent API for configuration
   - Cleaner than constructor

4. **Unified Error Class** - `src/i18n-error.ts`
   - Single `I18nError` class
   - `I18nErrorCode` constants
   - Static factory methods
   - Replaces 5+ error types

## Remaining Work

### Phase 1: Foundation (Remaining)

- [ ] Remove `i18n-engine.ts` (legacy engine)
- [ ] Remove generic `<TLanguages>` from `PluginI18nEngine`
- [ ] Update `ComponentRegistry` to remove generics
- [ ] Update all type definitions
- [ ] Update exports in `index.ts`

### Phase 2: Context Consolidation

- [ ] Simplify `GlobalActiveContext`
- [ ] Remove `ContextManager` (over-engineered)
- [ ] Create specific context methods:
  - `setLanguage(lang: string)`
  - `setAdminLanguage(lang: string)`
  - `switchToAdmin()`
  - `switchToUser()`
- [ ] Remove `IActiveContext` generic parameter
- [ ] Update context tests

### Phase 3: Component System

- [ ] Simplify `ComponentRegistration` interface
- [ ] Remove `enumName`, `enumObject` fields
- [ ] Remove `ComponentDefinition` + `ComponentRegistration` split
- [ ] Create unified `ComponentConfig` interface
- [ ] Update registration tests

### Phase 4: Error System

- [ ] Replace all `RegistryError` with `I18nError`
- [ ] Replace all `ContextError` with `I18nError`
- [ ] Remove `registry-error.ts`
- [ ] Remove `registry-error-type.ts`
- [ ] Remove `context-error.ts`
- [ ] Remove `context-error-type.ts`
- [ ] Update all error handling in codebase
- [ ] Update error tests

### Phase 5: Template System

- [ ] Remove enum pattern support from templates
- [ ] Remove constants injection (pass as variables)
- [ ] Simplify `t()` method signature
- [ ] Update template tests

### Phase 6: Scope Reduction

- [ ] Remove `currency-code.ts`
- [ ] Remove `currency-format.ts`
- [ ] Remove `currency.ts`
- [ ] Remove `timezone.ts`
- [ ] Remove from `RegistryConfig`
- [ ] Update configuration tests
- [ ] Add migration notes for Intl API usage

### Phase 7: Registry Cleanup

- [ ] Remove `EnumRegistry` class
- [ ] Remove `enum-registry.ts`
- [ ] Simplify `LanguageRegistry` API
- [ ] Remove enum-related methods from `PluginI18nEngine`
- [ ] Update registry tests

### Phase 8: API Modernization

- [ ] Add `translate('component.key')` shorthand
- [ ] Add `component('id').translate()` method
- [ ] Make methods chainable where appropriate
- [ ] Update API documentation

### Testing

- [ ] Update all existing tests for new APIs
- [ ] Add tests for `I18nBuilder`
- [ ] Add tests for `I18nError`
- [ ] Add tests for simplified context API
- [ ] Add tests for new translation shortcuts
- [ ] Ensure 100% test coverage maintained

### Documentation

- [ ] Update README.md with v2.0 changes
- [ ] Add migration guide section to README
- [ ] Update all code examples
- [ ] Update API reference
- [ ] Update quick start guide
- [ ] Remove deprecated feature documentation
- [ ] Add v2.0 benefits section

## Implementation Strategy

Given the scope, here's the recommended approach:

### Option 1: Incremental (Recommended)
1. Create v2 branch
2. Implement phases 1-8 sequentially
3. Keep v1.x in main for 6 months
4. Merge v2 when complete and tested
5. Publish as major version

### Option 2: Parallel Development
1. Create `@digitaldefiance/i18n-lib-v2` package
2. Develop v2 alongside v1
3. Allow gradual migration
4. Deprecate v1 after 6 months
5. Rename v2 to main package

### Option 3: Big Bang (Not Recommended)
1. Implement all changes at once
2. High risk of bugs
3. Difficult to test incrementally
4. Hard to roll back

## Estimated Effort

Based on express-suite refactor (12 hours for 12 phases):

- **Phase 1**: 2 hours (foundation)
- **Phase 2**: 1.5 hours (context)
- **Phase 3**: 1.5 hours (components)
- **Phase 4**: 2 hours (errors)
- **Phase 5**: 1 hour (templates)
- **Phase 6**: 1 hour (scope reduction)
- **Phase 7**: 1.5 hours (registry)
- **Phase 8**: 1.5 hours (API polish)
- **Testing**: 4 hours (comprehensive)
- **Documentation**: 3 hours (README, guides)

**Total**: ~19 hours

## Files to Modify

### Remove (15 files)
- `i18n-engine.ts` (legacy)
- `currency-code.ts`
- `currency-format.ts`
- `currency.ts`
- `timezone.ts`
- `enum-registry.ts`
- `registry-error.ts`
- `registry-error-type.ts`
- `context-error.ts`
- `context-error-type.ts`
- `context-manager.ts`
- `i18n-config.ts` (legacy)
- `i18n-context.ts` (legacy)
- `default-config.ts` (legacy)
- `translatable.ts` (legacy)

### Modify (20 files)
- `plugin-i18n-engine.ts` (remove generics)
- `component-registry.ts` (remove generics)
- `language-registry.ts` (simplify)
- `global-active-context.ts` (simplify)
- `component-definition.ts` (simplify)
- `component-registration.ts` (simplify)
- `registry-config.ts` (remove currency/timezone)
- `template.ts` (simplify patterns)
- `types.ts` (update type definitions)
- `utils.ts` (update utilities)
- `validation-config.ts` (update)
- `validation-result.ts` (update)
- `translation-request.ts` (remove generic)
- `translation-response.ts` (update)
- `core-i18n.ts` (update for new API)
- `core-string-key.ts` (update)
- `language-codes.ts` (update)
- `language-definition.ts` (update)
- `index.ts` (update exports)
- `README.md` (major update)

### Add (3 files)
- `i18n-builder.ts` ✅ (created)
- `i18n-error.ts` ✅ (created)
- `MIGRATION_V2.md` ✅ (created)

## Testing Strategy

### Unit Tests
- Test each modified file independently
- Maintain 100% coverage
- Add tests for new features
- Update tests for changed APIs

### Integration Tests
- Test component registration flow
- Test translation with fallbacks
- Test language switching
- Test error handling
- Test builder pattern

### E2E Tests
- Test real-world usage scenarios
- Test migration paths
- Test backward compatibility (where applicable)

### Performance Tests
- Benchmark translation speed
- Measure bundle size reduction
- Compare memory usage

## Success Criteria

- [ ] All tests passing
- [ ] 100% test coverage maintained
- [ ] 40-50% code reduction achieved
- [ ] Bundle size reduced by 30%+
- [ ] Documentation complete
- [ ] Migration guide tested
- [ ] No runtime performance regression
- [ ] Backward compatibility for non-breaking features

## Risks & Mitigation

### Risk: Breaking existing users
**Mitigation**: 
- Comprehensive migration guide
- 6-month deprecation period
- Clear communication

### Risk: Bugs in refactored code
**Mitigation**:
- Incremental implementation
- Extensive testing
- Beta release period
- Community feedback

### Risk: Missing edge cases
**Mitigation**:
- Review all existing tests
- Add new edge case tests
- Real-world testing
- Gradual rollout

## Next Steps

1. **Review & Approve** this status document
2. **Choose implementation strategy** (recommend Option 1)
3. **Create v2 branch** from main
4. **Implement Phase 1** (foundation)
5. **Test Phase 1** thoroughly
6. **Continue with remaining phases**
7. **Beta release** for community testing
8. **Final release** as v2.0.0

## Notes

- This refactor follows the same pattern as express-suite 2.0
- Focus on simplicity and maintainability
- Preserve language flexibility (key requirement)
- Runtime validation over compile-time types
- Clear migration path for users

## Questions for Review

1. Approve incremental implementation strategy?
2. Approve 6-month deprecation period for v1.x?
3. Approve removal of currency/timezone features?
4. Approve removal of enum translation system?
5. Any additional features to preserve?

---

**Status**: Planning Complete, Implementation Ready
**Last Updated**: 2025
**Next Review**: After Phase 1 completion
