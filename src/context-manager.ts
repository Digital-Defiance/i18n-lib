/**
 * Context change management for i18n systems
 */

export type ContextChangeListener<T = any> = (
  property: string,
  oldValue: T,
  newValue: T,
) => void;

export class ContextManager<TContext extends Record<string, any>> {
  private listeners: ContextChangeListener[] = [];

  addListener(listener: ContextChangeListener): void {
    this.listeners.push(listener);
  }

  removeListener(listener: ContextChangeListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  notifyChange<K extends keyof TContext>(
    property: K,
    oldValue: TContext[K],
    newValue: TContext[K],
  ): void {
    this.listeners.forEach((listener) => {
      try {
        listener(property as string, oldValue, newValue);
      } catch (error) {
        console.error('Error in context change listener:', error);
      }
    });
  }

  createProxy(context: TContext): TContext {
    const manager = this;
    return new Proxy(context, {
      set(target, property, value) {
        const oldValue = target[property as keyof TContext];
        target[property as keyof TContext] = value;
        manager.notifyChange(property as keyof TContext, oldValue, value);
        return true;
      },
    });
  }
}
