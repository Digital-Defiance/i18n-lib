/**
 * Simplified context management
 */

export interface Context {
  language: string;
  adminLanguage: string;
  currentSpace: 'admin' | 'user';
}

export class ContextManager {
  private contexts = new Map<string, Context>();

  create(instanceKey: string, defaultLanguage: string): Context {
    const context: Context = {
      language: defaultLanguage,
      adminLanguage: defaultLanguage,
      currentSpace: 'user',
    };
    this.contexts.set(instanceKey, context);
    return context;
  }

  get(instanceKey: string): Context {
    const context = this.contexts.get(instanceKey);
    if (!context) {
      throw new Error(`Context '${instanceKey}' not found`);
    }
    return context;
  }

  setLanguage(instanceKey: string, language: string): void {
    const context = this.get(instanceKey);
    context.language = language;
  }

  setAdminLanguage(instanceKey: string, language: string): void {
    const context = this.get(instanceKey);
    context.adminLanguage = language;
  }

  switchToAdmin(instanceKey: string): void {
    const context = this.get(instanceKey);
    context.currentSpace = 'admin';
  }

  switchToUser(instanceKey: string): void {
    const context = this.get(instanceKey);
    context.currentSpace = 'user';
  }

  getCurrentLanguage(instanceKey: string): string {
    const context = this.get(instanceKey);
    return context.currentSpace === 'admin' ? context.adminLanguage : context.language;
  }

  clear(): void {
    this.contexts.clear();
  }
}
