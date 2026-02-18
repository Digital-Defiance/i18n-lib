/**
 * Constants Registry for structured, namespaced constant registration.
 *
 * Mirrors the StringKeyEnumRegistry pattern: each component can register
 * its own constants with an associated component ID. Constants are merged
 * into a flat lookup for template variable replacement, with conflict
 * detection when two components try to register the same constant key
 * with different values.
 */

import { safeParseInterface } from '@digitaldefiance/branded-interface';
import type { BrandedInterfaceDefinition } from '@digitaldefiance/branded-interface';
import { I18nError } from '../errors/i18n-error';
import type { II18nConstants } from '../interfaces/i18n-constants.interface';
import { validateObjectKeys } from '../utils/safe-object';

/**
 * Entry representing a registered constants set and its owning component.
 */
export interface ConstantsEntry {
  /** The component that registered these constants */
  readonly componentId: string;
  /** The constants record */
  readonly constants: Readonly<II18nConstants>;
  /** Optional branded interface schema for validation */
  readonly schema?: BrandedInterfaceDefinition;
}

/**
 * Registry that manages per-component constants with conflict detection
 * and a merged flat lookup for the translation pipeline.
 */
export class ConstantsRegistry {
  /** Component ID → constants record */
  private readonly entries = new Map<string, II18nConstants>();

  /** Reverse lookup: constant key → owning component ID (first registrant wins) */
  private readonly keyOwnership = new Map<string, string>();

  /** Cached merged constants (invalidated on registration) */
  private mergedCache: II18nConstants | null = null;

  /** Component ID → branded interface schema (stored alongside constants) */
  private readonly schemas = new Map<
    string,
    BrandedInterfaceDefinition<Record<string, unknown>>
  >();

  /** Schemas registered without constants (for deferred validation) */
  private readonly deferredSchemas = new Map<
    string,
    BrandedInterfaceDefinition<Record<string, unknown>>
  >();

  /**
   * Registers constants for a component.
   *
   * If the component already has constants registered, this is a no-op
   * (idempotent by component ID). If a different component has already
   * registered a constant with the same key but a different value, an
   * error is thrown to surface the conflict early.
   *
   * When a branded interface schema is provided, the constants are validated
   * against it before storing. On validation failure, an I18nError is thrown
   * with field-level errors.
   *
   * @param componentId - The component registering these constants
   * @param constants - Key-value pairs to register
   * @param schema - Optional branded interface definition for validation
   * @throws {I18nError} If a key conflict is detected with a different value
   * @throws {I18nError} If schema validation fails (CONSTANTS_SCHEMA_VALIDATION_FAILED)
   */
  register<T extends II18nConstants>(
    componentId: string,
    constants: T,
    schema?: BrandedInterfaceDefinition<T>,
  ): void {
    // Idempotent: skip if already registered for this component
    if (this.entries.has(componentId)) {
      return;
    }

    // Resolve schema: explicit parameter takes priority, then deferred schema
    const effectiveSchema = schema ?? this.deferredSchemas.get(componentId);

    // Validate against schema if one is available
    if (effectiveSchema) {
      this.validateAgainstSchema(
        componentId,
        constants,
        effectiveSchema as BrandedInterfaceDefinition<Record<string, unknown>>,
      );
      // Clear deferred schema since we've now validated
      this.deferredSchemas.delete(componentId);
      // Store the schema for future update/replace validation
      this.schemas.set(
        componentId,
        effectiveSchema as BrandedInterfaceDefinition<Record<string, unknown>>,
      );
    }

    validateObjectKeys(constants);
    this.detectConflicts(componentId, constants);

    // Store entry and ownership
    this.entries.set(componentId, { ...constants });
    for (const key of Object.keys(constants)) {
      if (!this.keyOwnership.has(key)) {
        this.keyOwnership.set(key, componentId);
      }
    }

    this.mergedCache = null;
  }

  /**
   * Registers a deferred schema for a component that doesn't have constants yet.
   * The schema will be applied when constants are later registered via register().
   *
   * @param componentId - The component to associate the schema with
   * @param schema - The branded interface definition
   */
  registerDeferredSchema(
    componentId: string,
    schema: BrandedInterfaceDefinition,
  ): void {
    this.deferredSchemas.set(componentId, schema);
  }

  /**
   * Checks if constants are registered for a component.
   */
  has(componentId: string): boolean {
    return this.entries.has(componentId);
  }

  /**
   * Updates constants for a component, merging new values into existing ones.
   *
   * Unlike `register`, this is NOT idempotent — it always merges the provided
   * constants into the component's existing set (or creates a new entry).
   * This is the mechanism for runtime overrides: a library registers defaults
   * via `register`, and the app overrides specific keys via `update`.
   *
   * Conflict detection is skipped for keys already owned by this component.
   * For keys owned by other components, the ownership is transferred to
   * this component (the updater wins).
   *
   * @param componentId - The component updating these constants
   * @param constants - Key-value pairs to merge
   */
  update<T extends II18nConstants>(componentId: string, constants: T): void {
    validateObjectKeys(constants);

    // Validate against stored schema if one exists
    const storedSchema =
      this.schemas.get(componentId) ?? this.deferredSchemas.get(componentId);
    if (storedSchema) {
      const existing = this.entries.get(componentId) ?? {};
      const merged = { ...existing, ...constants };
      this.validateAgainstSchema(componentId, merged, storedSchema);
    }

    const existing = this.entries.get(componentId) ?? {};
    const merged = { ...existing, ...constants };
    this.entries.set(componentId, merged);

    // Update ownership — the updater takes ownership of these keys
    for (const key of Object.keys(constants)) {
      this.keyOwnership.set(key, componentId);
    }

    this.mergedCache = null;
  }

  /**
   * Fully replaces constants for a component, removing old keys.
   *
   * Unlike `update` (which merges), this wipes the component's existing
   * constants and sets the new ones. Ownership of old keys that are no
   * longer present is released.
   *
   * @param componentId - The component replacing its constants
   * @param constants - The new complete set of constants
   */
  replace<T extends II18nConstants>(componentId: string, constants: T): void {
    validateObjectKeys(constants);

    // Validate against stored schema if one exists
    const storedSchema =
      this.schemas.get(componentId) ?? this.deferredSchemas.get(componentId);
    if (storedSchema) {
      this.validateAgainstSchema(componentId, constants, storedSchema);
    }

    // Remove ownership of old keys belonging to this component
    const oldEntry = this.entries.get(componentId);
    if (oldEntry) {
      for (const key of Object.keys(oldEntry)) {
        if (this.keyOwnership.get(key) === componentId) {
          this.keyOwnership.delete(key);
        }
      }
    }

    // Set new entry and ownership
    this.entries.set(componentId, { ...constants });
    for (const key of Object.keys(constants)) {
      this.keyOwnership.set(key, componentId);
    }

    this.mergedCache = null;
  }

  /**
   * Gets the constants registered for a specific component.
   * Returns undefined if the component has no registered constants.
   */
  get(componentId: string): Readonly<II18nConstants> | undefined {
    return this.entries.get(componentId);
  }

  /**
   * Returns all registered entries.
   */
  getAll(): readonly ConstantsEntry[] {
    const result: ConstantsEntry[] = [];
    for (const [componentId, constants] of this.entries) {
      const schema = this.schemas.get(componentId);
      result.push({ componentId, constants, ...(schema ? { schema } : {}) });
    }
    return result;
  }

  /**
   * Returns a merged flat record of all registered constants.
   *
   * When multiple components have the same key, the owning component's
   * value wins (ownership is tracked via register/update/replace).
   *
   * The result is cached and invalidated when constants change.
   */
  getMerged(): Readonly<II18nConstants> {
    if (this.mergedCache !== null) {
      return this.mergedCache;
    }

    const merged: II18nConstants = Object.create(null) as II18nConstants;

    // First pass: collect all keys from all components
    for (const [componentId, constants] of this.entries) {
      for (const [key, value] of Object.entries(constants)) {
        // The owner's value wins; non-owners only fill gaps
        const owner = this.keyOwnership.get(key);
        if (owner === componentId || !(key in merged)) {
          merged[key] = value;
        }
      }
    }

    this.mergedCache = merged;
    return merged;
  }

  /**
   * Resolves which component owns a given constant key.
   * Returns null if the key is not registered.
   */
  resolveOwner(key: string): string | null {
    return this.keyOwnership.get(key) ?? null;
  }

  /**
   * Clears all registrations.
   */
  clear(): void {
    this.entries.clear();
    this.keyOwnership.clear();
    this.schemas.clear();
    this.deferredSchemas.clear();
    this.mergedCache = null;
  }

  /**
   * Detects conflicts: same key registered by a different component
   * with a different value.
   */
  private detectConflicts(
    componentId: string,
    constants: II18nConstants,
  ): void {
    for (const [key, value] of Object.entries(constants)) {
      const owner = this.keyOwnership.get(key);
      if (owner !== undefined && owner !== componentId) {
        const existingValue = this.entries.get(owner)?.[key];
        if (existingValue !== value) {
          throw I18nError.constantConflict(key, componentId, owner);
        }
      }
    }
  }

  /**
   * Validates constants against a branded interface schema.
   * Throws I18nError with field-level errors on validation failure.
   */
  private validateAgainstSchema<T extends Record<string, unknown>>(
    componentId: string,
    constants: II18nConstants,
    schema: BrandedInterfaceDefinition<T>,
  ): void {
    const result = safeParseInterface(constants, schema);
    if (!result.success) {
      throw I18nError.constantsSchemaValidationFailed(
        componentId,
        result.error.interfaceId,
        result.error.fieldErrors ?? [],
        result.error.message,
      );
    }
  }
}
