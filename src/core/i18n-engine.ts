/**
 * Main I18n Engine (no generics)
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// Note: This file uses 'any' for variable dictionaries which is appropriate for dynamic i18n substitution

import type {
  AnyBrandedEnum,
  BrandedEnumValue,
} from '@digitaldefiance/branded-enum';
import { CoreI18nComponentId } from '../core-component-id';
import { I18nError } from '../errors/i18n-error';
import {
  ComponentConfig,
  EngineConfig,
  II18nEngine,
  LanguageDefinition,
  ValidationResult,
} from '../interfaces';
import { CurrencyCode } from '../utils/currency';
import {
  createSafeObject,
  safeAssign,
  validateObjectKeys,
} from '../utils/safe-object';
import { Timezone } from '../utils/timezone';
import {
  validateComponentId,
  validateTemplateLength,
} from '../utils/validation';
import { ComponentStore } from './component-store';
import { ConstantsRegistry } from './constants-registry';
import type { ConstantsEntry } from './constants-registry';
import { ContextManager } from './context-manager';
import { EnumRegistry } from './enum-registry';
import { LanguageRegistry } from './language-registry';
import { StringKeyEnumRegistry } from './string-key-enum-registry';

/**
 * I18nEngine implements the II18nEngine interface, providing translation,
 * component registration, enum translation, and context management.
 */
export class I18nEngine implements II18nEngine {
  private static instances = new Map<string, I18nEngine>();
  private static defaultKey: string | null = null;
  private static readonly DEFAULT_KEY = 'default';
  private static readonly contextManager = new ContextManager();

  private readonly componentStore: ComponentStore;
  private readonly enumRegistry: EnumRegistry;
  private readonly stringKeyEnumRegistry: StringKeyEnumRegistry;
  private readonly constantsRegistry: ConstantsRegistry;
  private readonly instanceKey: string;
  private readonly config: Required<EngineConfig>;
  private readonly aliasToComponent = new Map<string, string>();
  private readonly componentKeyLookup = new Map<string, Map<string, string>>();
  private valueComponentLookupCache: Map<string, string> | null = null;

  /**
   * Constructs an I18nEngine instance, registering languages, setting defaults,
   * and optionally registering and setting this instance as default.
   *
   * @param languages - Array of language definitions to register.
   * @param config - Engine configuration options.
   * @param options - Optional creation options.
   * @param options.instanceKey - Key to identify this instance.
   * @param options.registerInstance - Whether to add this instance to the registry.
   * @param options.setAsDefault - Whether to set this instance as the default.
   * @throws {I18nError} If an instance with the same key already exists.
   */
  constructor(
    languages: readonly LanguageDefinition[],
    config: EngineConfig = {},
    options?: {
      instanceKey?: string;
      registerInstance?: boolean;
      setAsDefault?: boolean;
    },
  ) {
    // Register languages
    for (const lang of languages) {
      if (!LanguageRegistry.has(lang.id)) {
        LanguageRegistry.register(lang);
      }
    }

    // Set defaults
    const defaultLang = languages.find((l) => l.isDefault) || languages[0];
    this.config = {
      defaultLanguage: config.defaultLanguage || defaultLang.id,
      fallbackLanguage: config.fallbackLanguage || defaultLang.id,
      constants: config.constants || {},
      validation: {
        requireCompleteStrings: false,
        allowPartialRegistration: true,
        ...config.validation,
      },
    };

    this.componentStore = new ComponentStore(this.config.constants);
    this.enumRegistry = new EnumRegistry((key, vars) =>
      this.safeTranslate(CoreI18nComponentId, key, vars),
    );
    this.stringKeyEnumRegistry = new StringKeyEnumRegistry();
    this.constantsRegistry = new ConstantsRegistry();
    this.instanceKey = options?.instanceKey || I18nEngine.DEFAULT_KEY;

    // Register initial constants from config into the registry
    if (
      this.config.constants &&
      Object.keys(this.config.constants).length > 0
    ) {
      this.constantsRegistry.register('__engine__', this.config.constants);
    }

    // Create context
    I18nEngine.contextManager.create(
      this.instanceKey,
      this.config.defaultLanguage,
    );

    // Register instance
    if (options?.registerInstance !== false) {
      if (I18nEngine.instances.has(this.instanceKey)) {
        throw I18nError.instanceExists(this.instanceKey);
      }
      I18nEngine.instances.set(this.instanceKey, this);

      if (options?.setAsDefault !== false || !I18nEngine.defaultKey) {
        I18nEngine.defaultKey = this.instanceKey;
      }
    }
  }

  /**
   * Registers a translation component configuration.
   * @param config - Component configuration object.
   * @returns ValidationResult containing any warnings or errors.
   */
  register(config: ComponentConfig): ValidationResult {
    validateComponentId(config.id);
    this.registerComponentMetadata(config);
    const result = this.componentStore.register(config);
    this.invalidateValueComponentLookupCache();
    return result;
  }

  /**
   * Registers a component if not already registered.
   * @param config - Component configuration object.
   * @returns ValidationResult containing any warnings or errors.
   */
  registerIfNotExists(config: ComponentConfig): ValidationResult {
    if (this.hasComponent(config.id)) {
      return { isValid: true, errors: [], warnings: [] };
    }
    return this.register(config);
  }

  /**
   * Internal: Builds metadata lookup maps from component config.
   * @param config - Component configuration object.
   */
  private registerComponentMetadata(config: ComponentConfig): void {
    const componentId = config.id;
    const aliases = config.aliases || [];
    // These properties may exist on extended config types
    // Use type-safe property access with index signature
    const configWithOptional = config as ComponentConfig & {
      enumName?: string;
      enumObject?: Record<string, any>;
    };
    const enumName = configWithOptional.enumName;
    const enumObject = configWithOptional.enumObject;

    const aliasSet = new Set<string>();
    if (componentId) aliasSet.add(componentId);
    if (enumName) aliasSet.add(enumName);
    aliases.forEach((alias) => {
      if (alias) aliasSet.add(alias);
    });

    aliasSet.forEach((alias) => {
      const trimmed = alias.trim();
      if (trimmed.length > 0) {
        this.aliasToComponent.set(trimmed, componentId);
      }
    });

    if (!this.componentKeyLookup.has(componentId)) {
      this.componentKeyLookup.set(componentId, new Map<string, string>());
    }
    const keyMap = this.componentKeyLookup.get(componentId)!;

    const addKeyVariant = (aliasKey: string, canonicalKey: string) => {
      if (!aliasKey || !canonicalKey) return;
      keyMap.set(aliasKey, canonicalKey);
      const normalized = this.normalizeLegacyKey(aliasKey);
      if (normalized && normalized !== aliasKey) {
        keyMap.set(normalized, canonicalKey);
      }
    };

    // Get string keys from the strings object
    const firstLang = Object.keys(config.strings)[0];
    if (firstLang) {
      Object.keys(config.strings[firstLang]).forEach((key: string) => {
        addKeyVariant(key, key);
      });
    }

    if (enumObject) {
      Object.entries(enumObject).forEach(([enumKey, enumValue]) => {
        if (typeof enumValue === 'string') {
          addKeyVariant(enumKey, enumValue);
        }
      });
    }
  }

  /**
   * Invalidates the value-to-component lookup cache.
   * Called after component registration so new keys are discoverable.
   */
  private invalidateValueComponentLookupCache(): void {
    this.valueComponentLookupCache = null;
  }

  /**
   * Builds a cache mapping string key values to component IDs
   * by scanning all registered components.
   */
  private buildValueComponentLookupCache(): Map<string, string> {
    const cache = new Map<string, string>();
    for (const component of this.componentStore.getAll()) {
      const firstLang = Object.keys(component.strings)[0];
      if (firstLang) {
        for (const key of Object.keys(component.strings[firstLang])) {
          if (!cache.has(key)) {
            cache.set(key, component.id);
          }
        }
      }
    }
    return cache;
  }

  /**
   * Resolves a string key value to its component ID, falling back to
   * scanning registered components when the branded enum registry fails
   * (e.g., due to bundler Symbol mismatch in browser environments).
   * @param stringKeyValue - The string key value to resolve.
   * @returns The component ID that owns this string key.
   * @throws {I18nError} If the key is not found in any registered component.
   */
  private resolveComponentIdWithFallback(stringKeyValue: string): string {
    // Try registry first
    const registryResult =
      this.stringKeyEnumRegistry.safeResolveComponentId(stringKeyValue);
    if (registryResult !== null) {
      return registryResult;
    }

    // Fallback: scan components via cache
    if (!this.valueComponentLookupCache) {
      this.valueComponentLookupCache = this.buildValueComponentLookupCache();
    }

    const fallbackResult = this.valueComponentLookupCache.get(stringKeyValue);
    if (fallbackResult) {
      return fallbackResult;
    }

    throw I18nError.stringKeyNotRegistered(stringKeyValue);
  }

  /**
   * Internal: Normalizes legacy keys into snake_case lowercased.
   * @param rawKey - The raw key string to normalize.
   * @returns Normalized key or null if empty.
   */
  private normalizeLegacyKey(rawKey: string): string | null {
    if (!rawKey) return null;
    const normalized = rawKey
      .replace(/[-\s]+/g, '_')
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/__+/g, '_')
      .toLowerCase();
    return normalized.length > 0 ? normalized : null;
  }

  /**
   * Internal: Resolves the component prefix and key to actual IDs.
   * @param prefix - Component or enum alias.
   * @param rawKey - Raw translation key.
   * @returns Object containing resolved componentId and stringKey.
   */
  private resolveComponentAndKey(
    prefix: string,
    rawKey: string,
  ): { componentId: string; stringKey: string } {
    const componentId = this.aliasToComponent.get(prefix) ?? prefix;
    const keyLookup = this.componentKeyLookup.get(componentId);

    if (!keyLookup) {
      return { componentId, stringKey: rawKey };
    }

    const directMatch = keyLookup.get(rawKey);
    if (directMatch) {
      return { componentId, stringKey: directMatch };
    }

    const normalized = this.normalizeLegacyKey(rawKey);
    if (normalized) {
      const normalizedMatch = keyLookup.get(normalized);
      if (normalizedMatch) {
        return { componentId, stringKey: normalizedMatch };
      }
    }

    return { componentId, stringKey: rawKey };
  }

  /**
   * Updates translation strings for a component.
   * @param componentId - ID of the component to update.
   * @param strings - Language-keyed string records.
   * @returns ValidationResult containing any warnings or errors.
   */
  updateStrings(
    componentId: string,
    strings: Record<string, Record<string, string>>,
  ): ValidationResult {
    return this.componentStore.update(componentId, strings);
  }

  /**
   * Checks if a component is registered.
   * @param componentId - ID of the component.
   * @returns True if the component exists.
   */
  hasComponent(componentId: string): boolean {
    return this.componentStore.has(componentId);
  }

  /**
   * Retrieves all registered component configs.
   * @returns Array of ComponentConfig.
   */
  getComponents(): readonly ComponentConfig[] {
    return this.componentStore.getAll();
  }

  /**
   * Translates a key for a component in a given or current language.
   * @param componentId - ID of the component.
   * @param key - Translation key.
   * @param variables - Optional variables for template.
   * @param language - Language code to translate into.
   * @returns Translated string.
   */
  translate(
    componentId: string,
    key: string,
    variables?: Record<string, any>,
    language?: string,
  ): string {
    const lang =
      language ||
      I18nEngine.contextManager.getCurrentLanguage(this.instanceKey);
    const combinedVars = this.buildCombinedVariables(variables);
    return this.componentStore.translate(componentId, key, combinedVars, lang);
  }

  /**
   * Safely translates a key, returning a placeholder for missing translations.
   * @param componentId - ID of the component.
   * @param key - Translation key.
   * @param variables - Optional variables for template.
   * @param language - Language code to translate into.
   * @returns Safe translated string.
   */
  safeTranslate(
    componentId: string,
    key: string,
    variables?: Record<string, any>,
    language?: string,
  ): string {
    const lang =
      language ||
      I18nEngine.contextManager.getCurrentLanguage(this.instanceKey);
    const combinedVars = this.buildCombinedVariables(variables);
    return this.componentStore.safeTranslate(
      componentId,
      key,
      combinedVars,
      lang,
    );
  }

  /**
   * Processes a translation template, replacing component and variable placeholders.
   * @param template - Template string containing {{component.key}} and {variable}.
   * @param variables - Optional variables for substitution.
   * @param language - Language code to translate into.
   * @returns Processed template string.
   * @throws {I18nError} If template length exceeds limits.
   */
  t(
    template: string,
    variables?: Record<string, any>,
    language?: string,
  ): string {
    validateTemplateLength(template);
    const lang =
      language ||
      I18nEngine.contextManager.getCurrentLanguage(this.instanceKey);

    // Build combined variables: constants + context + provided (provided overrides all)
    const combinedVars = this.buildCombinedVariables(variables);

    // Replace {{component.key}} or {{EnumName.key}} patterns with alias support
    // Limited pattern to prevent ReDoS: max 100 chars between braces
    let result = template.replace(
      /\{\{([^}]{1,100})\}\}/g,
      (match, pattern) => {
        const parts = pattern.split('.');
        if (parts.length === 2) {
          const [rawPrefix, rawKey] = parts;
          const prefix = rawPrefix.trim();
          const key = rawKey.trim();

          // Always pass combined variables to translations
          // The translation will use them if the string has placeholders
          // Resolve aliases and enum names to actual component IDs
          const { componentId, stringKey } = this.resolveComponentAndKey(
            prefix,
            key,
          );
          return this.safeTranslate(componentId, stringKey, combinedVars, lang);
        }
        return match;
      },
    );

    // Replace {variable} patterns with combined variables
    // Limited pattern to prevent ReDoS: max 50 chars for variable names
    result = result.replace(/\{(\w{1,50})\}/g, (match, varName) => {
      return combinedVars[varName] !== undefined
        ? String(combinedVars[varName])
        : match;
    });

    return result;
  }

  /**
   * Internal: Combines constants, context, and provided variables for translation.
   * @param variables - Optional overrides for context and constants.
   * @returns Combined variables record.
   */
  private buildCombinedVariables(
    variables?: Record<string, any>,
  ): Record<string, any> {
    if (variables) {
      validateObjectKeys(variables);
    }
    const combined: Record<string, any> = createSafeObject();

    // 1. Start with constants from config
    if (this.config.constants) {
      // Extract values from any wrapper objects in constants
      for (const [key, value] of Object.entries(this.config.constants)) {
        combined[key] = this.extractValue(value);
      }
    }

    // 2. Add context variables (timezone, currency, language, etc.)
    // GlobalActiveContext is optional and may not be available in all environments
    try {
      // Check if GlobalActiveContext is available in global scope
      const GlobalActiveContext = (globalThis as Record<string, any>)
        .GlobalActiveContext as
        | {
            getInstance?: () => { context?: Record<string, any> } | undefined;
          }
        | undefined;

      if (
        GlobalActiveContext &&
        typeof GlobalActiveContext.getInstance === 'function'
      ) {
        const instance = GlobalActiveContext.getInstance();
        const context = instance?.context;
        if (context) {
          // Add context variables
          combined['language'] = context.language;
          combined['adminLanguage'] = context.adminLanguage;
          combined['currentContext'] = context.currentContext;

          if (context.currencyCode) {
            // Extract value from CurrencyCode object
            const currencyValue = this.extractValue(context.currencyCode);
            combined['currencyCode'] = currencyValue;
            combined['currency'] = currencyValue;
          }

          if (context.timezone) {
            // Extract value from Timezone object
            const timezoneValue = this.extractValue(context.timezone);
            combined['timezone'] = timezoneValue;
            combined['userTimezone'] = timezoneValue;
          }

          if (context.adminTimezone) {
            // Extract value from Timezone object
            combined['adminTimezone'] = this.extractValue(
              context.adminTimezone,
            );
          }
        }
      }
    } catch (_error) {
      // GlobalActiveContext not available or not initialized - continue without context vars
    }

    // 3. Override with provided variables (highest priority)
    // Also extract values from any CurrencyCode or Timezone objects
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        if (!['__proto__', 'constructor', 'prototype'].includes(key)) {
          combined[key] = this.extractValue(value);
        }
      }
    }

    return combined;
  }

  /**
   * Internal: Extracts primitive or object 'value' fields, handling CurrencyCode and Timezone.
   * @param value - Value or wrapper object.
   * @returns Extracted primitive value.
   */
  private extractValue(value: unknown): unknown {
    if (value instanceof CurrencyCode) return value.value;
    if (value instanceof Timezone) return value.value;
    if (
      value &&
      typeof value === 'object' &&
      'value' in value &&
      typeof (value as Record<string, any>).value !== 'function'
    ) {
      return (value as Record<string, any>).value;
    }
    // Return as-is for primitives and other objects
    return value;
  }

  /**
   * Registers a language in the global LanguageRegistry.
   * @param language - LanguageDefinition to register.
   */
  registerLanguage(language: LanguageDefinition): void {
    LanguageRegistry.register(language);
  }

  /**
   * Sets the current translation language for this instance.
   * @param language - Language code to set.
   * @throws {I18nError} If the language is not registered.
   */
  setLanguage(language: string): void {
    if (!LanguageRegistry.has(language)) {
      throw I18nError.languageNotFound(language);
    }
    I18nEngine.contextManager.setLanguage(this.instanceKey, language);
  }

  /**
   * Sets the current admin translation language for this instance.
   * @param language - Language code to set.
   * @throws {I18nError} If the language is not registered.
   */
  setAdminLanguage(language: string): void {
    if (!LanguageRegistry.has(language)) {
      throw I18nError.languageNotFound(language);
    }
    I18nEngine.contextManager.setAdminLanguage(this.instanceKey, language);
  }

  /**
   * Retrieves all registered languages.
   * @returns Array of LanguageDefinition.
   */
  getLanguages(): readonly LanguageDefinition[] {
    return LanguageRegistry.getAll();
  }

  /**
   * Checks if a language is registered in the global registry.
   * @param language - Language code to check.
   * @returns True if the language exists.
   */
  hasLanguage(language: string): boolean {
    return LanguageRegistry.has(language);
  }

  /**
   * Merges new constants into the engine-level constants pool.
   * These are registered under the '__engine__' component ID in the registry.
   * @param constants - Key-value constants to merge.
   */
  mergeConstants(constants: Record<string, unknown>): void {
    validateObjectKeys(constants);
    safeAssign(this.config.constants, constants);
    this.constantsRegistry.update('__engine__', constants);
    this.syncConstantsToStore();
  }

  /**
   * Replaces engine-level constants and syncs to the component store.
   * @deprecated Use registerConstants/updateConstants with componentId instead.
   * @param constants - New constants record.
   */
  replaceConstants(constants: Record<string, unknown>): void {
    validateObjectKeys(constants);
    this.config.constants = constants;
    // Full replacement — wipes old keys, sets new ones
    this.constantsRegistry.replace('__engine__', constants);
    this.syncConstantsToStore();
  }

  /**
   * Switches translation context to admin.
   */
  switchToAdmin(): void {
    I18nEngine.contextManager.switchToAdmin(this.instanceKey);
  }

  /**
   * Switches translation context to user.
   */
  switchToUser(): void {
    I18nEngine.contextManager.switchToUser(this.instanceKey);
  }

  /**
   * Retrieves the current language for this instance.
   * @returns Current language code.
   */
  getCurrentLanguage(): string {
    return I18nEngine.contextManager.getCurrentLanguage(this.instanceKey);
  }

  /**
   * Registers an enum for translation.
   *
   * Supports both traditional TypeScript enums and branded enums from
   * `@digitaldefiance/branded-enum`. For branded enums, the `enumName` parameter
   * is optional and will be automatically inferred from the branded enum's
   * component ID.
   *
   * ## Name Resolution
   *
   * The enum name is resolved in the following order:
   * 1. Explicit `enumName` parameter (if provided)
   * 2. Component ID from branded enum (if branded)
   * 3. `'UnknownEnum'` (fallback for traditional enums without name)
   *
   * ## Translation Structure
   *
   * The `translations` object should map language codes to objects that map
   * enum values to their translated strings:
   *
   * ```typescript
   * {
   *   'en': { 'value1': 'Translation 1', 'value2': 'Translation 2' },
   *   'es': { 'value1': 'Traducción 1', 'value2': 'Traducción 2' },
   * }
   * ```
   *
   * @template TEnum - The enum value type (string or number)
   * @param enumObj - Enum object to register (traditional or branded)
   * @param translations - Language keyed translations for enum values
   * @param enumName - Name to identify the enum (optional for branded enums)
   * @returns The registered translations object.
   *
   * @example Traditional enum (name required)
   * ```typescript
   * enum Status { Active = 'active', Inactive = 'inactive' }
   *
   * engine.registerEnum(Status, {
   *   en: { active: 'Active', inactive: 'Inactive' },
   *   es: { active: 'Activo', inactive: 'Inactivo' },
   * }, 'Status');
   * ```
   *
   * @example Branded enum (name inferred)
   * ```typescript
   * const Status = createBrandedEnum('status', { Active: 'active', Inactive: 'inactive' });
   *
   * // Name 'status' is automatically inferred from the branded enum
   * engine.registerEnum(Status, {
   *   en: { active: 'Active', inactive: 'Inactive' },
   * });
   * ```
   *
   * @example Branded enum with explicit name override
   * ```typescript
   * const Status = createBrandedEnum('status', { Active: 'active' });
   *
   * // Override the inferred name with a custom name
   * engine.registerEnum(Status, {
   *   en: { active: 'Active' },
   * }, 'UserStatus');
   * ```
   *
   * @see {@link translateEnum} - Translate registered enum values
   * @see {@link hasEnum} - Check if an enum is registered
   */
  registerEnum<TEnum extends string | number>(
    enumObj:
      | Record<string, TEnum>
      | AnyBrandedEnum
      | { [key: string]: string | number },
    translations: Record<string, Record<TEnum | string, string>>,
    enumName?: string,
  ): Record<string, Record<TEnum, string>> {
    return this.enumRegistry.register(
      enumObj,
      translations,
      enumName,
    ) as Record<string, Record<TEnum, string>>;
  }

  /**
   * Translates an enum value for the current or specified language.
   *
   * Supports both traditional enum values and branded enum values. The method
   * performs multiple lookup strategies to find the correct translation:
   *
   * ## Lookup Strategy
   *
   * 1. **Direct value lookup**: Try the string representation of the value
   * 2. **Numeric enum reverse mapping**: For numeric enums, find the string key
   * 3. **Branded enum key lookup**: For branded enums, find the enum key name
   *
   * ## Language Resolution
   *
   * If no language is specified, the current language from the engine's
   * context manager is used.
   *
   * @template TEnum - The enum value type (string or number)
   * @param enumObj - Enum object (traditional or branded)
   * @param value - Enum value to translate
   * @param language - Optional language code (defaults to current language)
   * @returns Translated enum string
   * @throws {I18nError} If the enum, language, or value is not found
   *
   * @example Basic translation
   * ```typescript
   * const Status = createBrandedEnum('status', { Active: 'active' });
   * engine.registerEnum(Status, { en: { active: 'Active' }, es: { active: 'Activo' } });
   *
   * engine.translateEnum(Status, Status.Active);       // Uses current language
   * engine.translateEnum(Status, Status.Active, 'es'); // 'Activo'
   * ```
   *
   * @example With traditional enum
   * ```typescript
   * enum Priority { High = 'high', Low = 'low' }
   * engine.registerEnum(Priority, { en: { high: 'High', low: 'Low' } }, 'Priority');
   *
   * engine.translateEnum(Priority, Priority.High, 'en'); // 'High'
   * ```
   *
   * @see {@link registerEnum} - Register enums for translation
   * @see {@link hasEnum} - Check if an enum is registered
   */
  translateEnum<TEnum extends string | number>(
    enumObj: Record<string, TEnum> | AnyBrandedEnum,
    value: TEnum | BrandedEnumValue<AnyBrandedEnum>,
    language?: string,
  ): string {
    const lang = language || this.getCurrentLanguage();
    return this.enumRegistry.translate(enumObj, value, lang);
  }

  /**
   * Checks if an enum is registered.
   *
   * Works with both traditional and branded enums. Uses object reference
   * equality to check registration status.
   *
   * @param enumObj - Enum object to check
   * @returns `true` if the enum is registered, `false` otherwise
   *
   * @example
   * ```typescript
   * const Status = createBrandedEnum('status', { Active: 'active' });
   *
   * engine.hasEnum(Status); // false (not registered yet)
   * engine.registerEnum(Status, { en: { active: 'Active' } });
   * engine.hasEnum(Status); // true
   * ```
   *
   * @see {@link registerEnum} - Register enums for translation
   * @see {@link translateEnum} - Translate registered enum values
   */
  hasEnum(enumObj: object): boolean {
    return this.enumRegistry.has(enumObj);
  }

  /**
   * Registers a branded string key enum for automatic component ID resolution.
   *
   * This method enables direct translation of string key values without requiring
   * per-component wrapper functions. Once registered, the engine can automatically
   * resolve the component ID from any string key value belonging to the enum.
   *
   * ## Registration Behavior
   *
   * - Extracts the component ID from the branded enum's metadata
   * - Stores a reference to the enum for later lookup
   * - Idempotent: re-registering the same enum returns the same component ID
   * - Skips re-registration if another enum with the same component ID exists
   *
   * ## Validation
   *
   * The method validates that the provided object is a branded enum created
   * with `createI18nStringKeys` or `createBrandedEnum`. Non-branded objects
   * will cause an error to be thrown.
   *
   * @param stringKeyEnum - Branded enum created by createI18nStringKeys
   * @param componentId - Optional explicit component ID (escape hatch for cross-module scenarios)
   * @returns The extracted or provided component ID
   * @throws {I18nError} If not a valid branded enum and no fallback succeeds (INVALID_STRING_KEY_ENUM)
   *
   * @example Basic registration
   * ```typescript
   * const UserKeys = createI18nStringKeys('user', {
   *   Welcome: 'user.welcome',
   *   Goodbye: 'user.goodbye',
   * } as const);
   *
   * const componentId = engine.registerStringKeyEnum(UserKeys);
   * console.log(componentId); // 'user'
   * ```
   *
   * @example Explicit componentId escape hatch
   * ```typescript
   * engine.registerStringKeyEnum(plainObj, 'user'); // 'user'
   * ```
   *
   * @example Idempotent registration
   * ```typescript
   * engine.registerStringKeyEnum(UserKeys); // 'user'
   * engine.registerStringKeyEnum(UserKeys); // 'user' (same result, no duplicate)
   * ```
   *
   * @see {@link translateStringKey} - Translate registered string key values
   * @see {@link hasStringKeyEnum} - Check if an enum is registered
   */
  registerStringKeyEnum(
    stringKeyEnum: AnyBrandedEnum,
    componentId?: string,
  ): string {
    return this.stringKeyEnumRegistry.register(stringKeyEnum, componentId);
  }

  /**
   * Translates a branded string key value directly.
   *
   * This method automatically resolves the component ID from the branded string
   * key value and calls the underlying `translate` method. It eliminates the need
   * for per-component wrapper functions.
   *
   * ## Resolution Process
   *
   * 1. Resolves the component ID from the string key value using the registry
   * 2. Calls `translate(componentId, stringKeyValue, variables, language)`
   * 3. Returns the translated string
   *
   * ## Prerequisites
   *
   * The branded enum containing the string key value must be registered via
   * {@link registerStringKeyEnum} before calling this method.
   *
   * @template E - The branded enum type
   * @param stringKeyValue - Branded string key value to translate
   * @param variables - Optional variables for template substitution
   * @param language - Optional language code (defaults to current language)
   * @returns Translated string
   * @throws {I18nError} If the string key is not registered (STRING_KEY_NOT_REGISTERED)
   * @throws {I18nError} If the translation key is not found (KEY_NOT_FOUND)
   *
   * @example Basic translation
   * ```typescript
   * const UserKeys = createI18nStringKeys('user', { Welcome: 'user.welcome' });
   * engine.registerStringKeyEnum(UserKeys);
   *
   * engine.translateStringKey(UserKeys.Welcome); // 'Welcome!'
   * ```
   *
   * @example With variables
   * ```typescript
   * engine.translateStringKey(UserKeys.Greeting, { name: 'John' }); // 'Hello, John!'
   * ```
   *
   * @example With explicit language
   * ```typescript
   * engine.translateStringKey(UserKeys.Welcome, undefined, 'es'); // '¡Bienvenido!'
   * ```
   *
   * @see {@link registerStringKeyEnum} - Register enums for translation
   * @see {@link safeTranslateStringKey} - Safe version that returns placeholder on failure
   */
  translateStringKey<E extends AnyBrandedEnum>(
    stringKeyValue: BrandedEnumValue<E>,
    variables?: Record<string, unknown>,
    language?: string,
  ): string {
    const componentId = this.resolveComponentIdWithFallback(
      stringKeyValue as string,
    );
    return this.translate(
      componentId,
      stringKeyValue as string,
      variables,
      language,
    );
  }

  /**
   * Safely translates a branded string key value.
   *
   * Returns a placeholder string on failure instead of throwing an exception.
   * This is useful for UI code where a missing translation should not crash
   * the application.
   *
   * ## Placeholder Format
   *
   * - If component ID is resolved: `[componentId.stringKeyValue]`
   * - If component ID cannot be resolved: `[unknown.stringKeyValue]`
   *
   * @template E - The branded enum type
   * @param stringKeyValue - Branded string key value to translate
   * @param variables - Optional variables for template substitution
   * @param language - Optional language code (defaults to current language)
   * @returns Translated string or placeholder on failure
   *
   * @example Safe translation
   * ```typescript
   * engine.safeTranslateStringKey(UserKeys.Welcome); // 'Welcome!' or '[user.user.welcome]'
   * ```
   *
   * @see {@link translateStringKey} - Throwing version
   * @see {@link registerStringKeyEnum} - Register enums for translation
   */
  safeTranslateStringKey<E extends AnyBrandedEnum>(
    stringKeyValue: BrandedEnumValue<E>,
    variables?: Record<string, unknown>,
    language?: string,
  ): string {
    try {
      const componentId = this.resolveComponentIdWithFallback(
        stringKeyValue as string,
      );
      return this.safeTranslate(
        componentId,
        stringKeyValue as string,
        variables,
        language,
      );
    } catch {
      return `[unknown.${String(stringKeyValue)}]`;
    }
  }

  /**
   * Checks if a branded string key enum is registered.
   *
   * Uses object reference equality to check registration status.
   *
   * @param stringKeyEnum - The branded enum to check
   * @returns `true` if the enum is registered, `false` otherwise
   *
   * @example
   * ```typescript
   * engine.hasStringKeyEnum(UserKeys); // false (not registered yet)
   * engine.registerStringKeyEnum(UserKeys);
   * engine.hasStringKeyEnum(UserKeys); // true
   * ```
   *
   * @see {@link registerStringKeyEnum} - Register enums
   * @see {@link getStringKeyEnums} - Get all registered enums
   */
  hasStringKeyEnum(stringKeyEnum: AnyBrandedEnum): boolean {
    return this.stringKeyEnumRegistry.has(stringKeyEnum);
  }

  /**
   * Gets all registered string key enums with their component IDs.
   *
   * Returns a readonly array of entries containing the enum reference
   * and its associated component ID.
   *
   * @returns Readonly array of objects with enumObj and componentId
   *
   * @example
   * ```typescript
   * engine.registerStringKeyEnum(UserKeys);
   * engine.registerStringKeyEnum(AdminKeys);
   *
   * const enums = engine.getStringKeyEnums();
   * // [
   * //   { enumObj: UserKeys, componentId: 'user' },
   * //   { enumObj: AdminKeys, componentId: 'admin' }
   * // ]
   * ```
   *
   * @see {@link registerStringKeyEnum} - Register enums
   * @see {@link hasStringKeyEnum} - Check if an enum is registered
   */
  getStringKeyEnums(): readonly {
    enumObj: AnyBrandedEnum;
    componentId: string;
  }[] {
    return this.stringKeyEnumRegistry.getAll();
  }

  // =========================================================================
  // Constants Registration
  // =========================================================================

  /**
   * Registers constants for a component.
   *
   * Constants are available as template variables in all translations
   * (e.g., `{appName}` in a translation string). Registration is idempotent
   * per component ID. Conflicts (same key, different value, different component)
   * throw an error.
   *
   * @param componentId - The component registering these constants
   * @param constants - Key-value pairs to register
   * @throws {I18nError} If a key conflict is detected (CONSTANT_CONFLICT)
   *
   * @example
   * ```typescript
   * engine.registerConstants('my-app', { appName: 'MyApp', supportEmail: 'help@example.com' });
   * // Now {appName} and {supportEmail} are available in all translations
   * ```
   */
  registerConstants(
    componentId: string,
    constants: Record<string, unknown>,
  ): void {
    this.constantsRegistry.register(componentId, constants);
    this.syncConstantsToStore();
  }

  /**
   * Updates constants for a component, merging new values into existing ones.
   *
   * This is the runtime override mechanism. A library registers defaults via
   * `registerConstants`, and the app overrides specific keys (like `Site`)
   * via `updateConstants` once the real values are known.
   *
   * @param componentId - The component updating these constants
   * @param constants - Key-value pairs to merge (overrides existing keys)
   *
   * @example
   * ```typescript
   * // Library registers defaults
   * engine.registerConstants('suite-core', { Site: 'New Site' });
   * // App overrides at runtime
   * engine.updateConstants('suite-core', { Site: 'My Real Site' });
   * ```
   */
  updateConstants(
    componentId: string,
    constants: Record<string, unknown>,
  ): void {
    this.constantsRegistry.update(componentId, constants);
    this.syncConstantsToStore();
  }

  /**
   * Checks if constants are registered for a component.
   */
  hasConstants(componentId: string): boolean {
    return this.constantsRegistry.has(componentId);
  }

  /**
   * Gets the constants registered for a specific component.
   */
  getConstants(
    componentId: string,
  ): Readonly<Record<string, unknown>> | undefined {
    return this.constantsRegistry.get(componentId);
  }

  /**
   * Gets all registered constants entries with their component IDs.
   */
  getAllConstants(): readonly ConstantsEntry[] {
    return this.constantsRegistry.getAll();
  }

  /**
   * Resolves which component owns a given constant key.
   * Returns null if the key is not registered.
   */
  resolveConstantOwner(key: string): string | null {
    return this.constantsRegistry.resolveOwner(key);
  }

  /**
   * Syncs the merged constants from the registry into the component store
   * so they're available during template variable replacement.
   */
  private syncConstantsToStore(): void {
    const merged = this.constantsRegistry.getMerged();
    const combined: Record<string, unknown> = {
      ...this.config.constants,
      ...merged,
    };
    this.componentStore.setConstants(combined);
  }

  /**
   * Validates all registered components for missing translations or warnings.
   * @returns ValidationResult containing errors and warnings.
   */
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const component of this.componentStore.getAll()) {
      const result = this.componentStore.register(component);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Creates a new engine instance with the given key, languages, and config.
   * @param key - Unique key for the new instance.
   * @param languages - Array of language definitions to register.
   * @param config - Optional engine configuration.
   * @returns Newly created I18nEngine instance.
   */
  static createInstance(
    key: string,
    languages: readonly LanguageDefinition[],
    config?: EngineConfig,
  ): I18nEngine {
    return new I18nEngine(languages, config, {
      instanceKey: key,
      registerInstance: true,
      setAsDefault: false,
    });
  }

  /**
   * Registers or retrieves an existing engine instance by key.
   * @param key - Unique key for the instance.
   * @param languages - Array of language definitions.
   * @param config - Optional engine configuration.
   * @returns Existing or newly created I18nEngine instance.
   */
  static registerIfNotExists(
    key: string,
    languages: readonly LanguageDefinition[],
    config?: EngineConfig,
  ): I18nEngine {
    if (I18nEngine.hasInstance(key)) {
      return I18nEngine.getInstance(key);
    }
    return I18nEngine.createInstance(key, languages, config);
  }

  /**
   * Retrieves an engine instance by key or default if none provided.
   * @param key - Optional instance key.
   * @returns I18nEngine instance.
   * @throws {I18nError} If instance not found.
   */
  static getInstance(key?: string): I18nEngine {
    const instanceKey = key || I18nEngine.defaultKey || I18nEngine.DEFAULT_KEY;
    const instance = I18nEngine.instances.get(instanceKey);
    if (!instance) {
      throw I18nError.instanceNotFound(instanceKey);
    }
    return instance;
  }

  /**
   * Checks if an engine instance exists.
   * @param key - Optional instance key.
   * @returns True if instance exists.
   */
  static hasInstance(key?: string): boolean {
    const instanceKey = key || I18nEngine.DEFAULT_KEY;
    return I18nEngine.instances.has(instanceKey);
  }

  /**
   * Removes an engine instance by key.
   * @param key - Optional instance key.
   * @returns True if the instance was removed.
   */
  static removeInstance(key?: string): boolean {
    const instanceKey = key || I18nEngine.DEFAULT_KEY;
    const removed = I18nEngine.instances.delete(instanceKey);
    if (removed && I18nEngine.defaultKey === instanceKey) {
      I18nEngine.defaultKey = null;
    }
    return removed;
  }

  /**
   * Resets all engine instances and clears global registries.
   */
  static resetAll(): void {
    // Clear string key enum registries and constants registries for each instance before clearing instances
    for (const instance of I18nEngine.instances.values()) {
      instance.stringKeyEnumRegistry.clear();
      instance.constantsRegistry.clear();
    }
    I18nEngine.instances.clear();
    I18nEngine.defaultKey = null;
    I18nEngine.contextManager.clear();
    LanguageRegistry.clear();
  }
}
