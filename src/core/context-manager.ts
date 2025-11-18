/**
 * Interface representing the translation context for an I18nEngine instance.
 */
export interface Context {
  /** Current user-facing language code. */
  language: string;
  /** Current administrative language code. */
  adminLanguage: string;
  /** Active context space: 'admin' or 'user'. */
  currentSpace: 'admin' | 'user';
}

/**
 * ContextManager handles creation and management of per-instance translation contexts,
 * including separate user and admin languages and context switching.
 */
export class ContextManager {
  private contexts = new Map<string, Context>();

  /**
   * Creates a new context for a given instance key with a default language.
   *
   * @param instanceKey Unique identifier for the context instance.
   * @param defaultLanguage Language code to initialize both user and admin contexts.
   * @returns The newly created Context object.
   */
  create(instanceKey: string, defaultLanguage: string): Context {
    const context: Context = {
      language: defaultLanguage,
      adminLanguage: defaultLanguage,
      currentSpace: 'user',
    };
    this.contexts.set(instanceKey, context);
    return context;
  }

  /**
   * Retrieves the context for a given instance key.
   *
   * @param instanceKey Unique identifier for the context instance.
   * @returns The Context object associated with the key.
   * @throws {Error} If no context exists for the provided key.
   */
  get(instanceKey: string): Context {
    const context = this.contexts.get(instanceKey);
    if (!context) {
      throw new Error(`Context '${instanceKey}' not found`);
    }
    return context;
  }

  /**
   * Sets the user-facing language for the specified context.
   *
   * @param instanceKey Unique identifier for the context instance.
   * @param language New language code for user-facing translations.
   */
  setLanguage(instanceKey: string, language: string): void {
    const context = this.get(instanceKey);
    context.language = language;
  }

  /**
   * Sets the administrative language for the specified context.
   *
   * @param instanceKey Unique identifier for the context instance.
   * @param language New language code for administrative translations.
   */
  setAdminLanguage(instanceKey: string, language: string): void {
    const context = this.get(instanceKey);
    context.adminLanguage = language;
  }

  /**
   * Switches the active context space to 'admin'.
   *
   * @param instanceKey Unique identifier for the context instance.
   */
  switchToAdmin(instanceKey: string): void {
    const context = this.get(instanceKey);
    context.currentSpace = 'admin';
  }

  /**
   * Switches the active context space to 'user'.
   *
   * @param instanceKey Unique identifier for the context instance.
   */
  switchToUser(instanceKey: string): void {
    const context = this.get(instanceKey);
    context.currentSpace = 'user';
  }

  /**
   * Retrieves the currently active language based on the context space.
   *
   * @param instanceKey Unique identifier for the context instance.
   * @returns The active language code ('adminLanguage' or 'language').
   */
  getCurrentLanguage(instanceKey: string): string {
    const context = this.get(instanceKey);
    return context.currentSpace === 'admin'
      ? context.adminLanguage
      : context.language;
  }

  /**
   * Clears all stored contexts, removing all instance data.
   */
  clear(): void {
    this.contexts.clear();
  }
}
