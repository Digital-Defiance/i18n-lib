/**
 * Context change management for i18n systems
 */
export type ContextChangeListener<T = any> = (
  property: string,
  oldValue: T,
  newValue: T,
) => void;

/**
 * Manages context changes and notifies listeners.
 */
export class ContextManager<TContext extends Record<string, any>> {
  protected listeners: ContextChangeListener[] = [];

  /**
   * Adds a listener to be notified of context changes.
   * @param listener - The listener function to add
   */
  public addListener(listener: ContextChangeListener): void {
    this.listeners.push(listener);
  }

  /**
   * Removes a listener from the notification list.
   * @param listener - The listener function to remove
   */
  public removeListener(listener: ContextChangeListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notifies all listeners of a context change.
   * @param property - The property that changed
   * @param oldValue - The old value of the property
   * @param newValue - The new value of the property
   */
  public notifyChange<K extends keyof TContext>(
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

  /**
   * Creates a proxy for the given context to automatically notify listeners on changes.
   * @param context - The context object to proxy
   * @returns A proxied version of the context object
   */
  public createProxy(context: TContext): TContext {
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
