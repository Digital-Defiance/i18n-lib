/**
 * Constants Registry for structured, namespaced constant registration.
 *
 * Mirrors the StringKeyEnumRegistry pattern: each component can register
 * its own constants with an associated component ID. Constants are merged
 * into a flat lookup for template variable replacement, with conflict
 * detection when two components try to register the same constant key
 * with different values.
 */

import { I18nError } from '../errors/i18n-error';
import { validateObjectKeys } from '../utils/safe-object';

/**
 * Entry representing a registered constants set and its owning component.
 */
export interface ConstantsEntry {
  /** The component that registered these constants */
  readonly componentId: string;
  /** The constants record */
  readonly constants: Readonly<Record<string, unknown>>;
}

/**
 * Registry that manages per-component constants with conflict detection
 * and a merged flat lookup for the translation pipeline.
 */
export class ConstantsRegistry {
  /** Component ID → constants record */
  private readonly entries = new Map<string, Record<string, unknown>>();

  /** Reverse lookup: constant key → owning component ID (first registrant wins) */
  private readonly keyOwnership = new Map<string, string>();

  /** Cached merged constants (invalidated on registration) */
  private mergedCache: Record<string, unknown> | null = null;

  /**
   * Registers constants for a component.
   *
   * If the component already has constants registered, this is a no-op
   * (idempotent by component ID). If a different component has already
   * registered a constant with the same key but a different value, an
   * error is thrown to surface the conflict early.
   *
   * @param componentId - The component registering these constants
   * @param constants - Key-value pairs to register
   * @throws {I18nError} If a key conflict is detected with a different value
   */
  register(componentId: string, constants: Record<string, unknown>): void {
    // Idempotent: skip if already registered for this component
    if (this.entries.has(componentId)) {
      return;
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
  update(componentId: string, constants: Record<string, unknown>): void {
    validateObjectKeys(constants);

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
  replace(componentId: string, constants: Record<string, unknown>): void {
    validateObjectKeys(constants);

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
  get(componentId: string): Readonly<Record<string, unknown>> | undefined {
    return this.entries.get(componentId);
  }

  /**
   * Returns all registered entries.
   */
  getAll(): readonly ConstantsEntry[] {
    const result: ConstantsEntry[] = [];
    for (const [componentId, constants] of this.entries) {
      result.push({ componentId, constants });
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
  getMerged(): Readonly<Record<string, unknown>> {
    if (this.mergedCache !== null) {
      return this.mergedCache;
    }

    const merged: Record<string, unknown> = Object.create(null) as Record<
      string,
      unknown
    >;

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
    this.mergedCache = null;
  }

  /**
   * Detects conflicts: same key registered by a different component
   * with a different value.
   */
  private detectConflicts(
    componentId: string,
    constants: Record<string, unknown>,
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
}
