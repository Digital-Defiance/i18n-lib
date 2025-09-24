"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const context_manager_1 = require("../src/context-manager");
describe('ContextManager', () => {
    let manager;
    let mockListener;
    beforeEach(() => {
        manager = new context_manager_1.ContextManager();
        mockListener = jest.fn();
    });
    describe('addListener', () => {
        it('should add a listener', () => {
            manager.addListener(mockListener);
            const context = { language: 'en', theme: 'dark', userId: 1 };
            manager.notifyChange('language', 'en', 'es');
            expect(mockListener).toHaveBeenCalledWith('language', 'en', 'es');
        });
        it('should add multiple listeners', () => {
            const listener2 = jest.fn();
            manager.addListener(mockListener);
            manager.addListener(listener2);
            manager.notifyChange('theme', 'dark', 'light');
            expect(mockListener).toHaveBeenCalledWith('theme', 'dark', 'light');
            expect(listener2).toHaveBeenCalledWith('theme', 'dark', 'light');
        });
    });
    describe('removeListener', () => {
        it('should remove a listener', () => {
            manager.addListener(mockListener);
            manager.removeListener(mockListener);
            manager.notifyChange('language', 'en', 'es');
            expect(mockListener).not.toHaveBeenCalled();
        });
        it('should handle removing non-existent listener', () => {
            expect(() => manager.removeListener(mockListener)).not.toThrow();
        });
        it('should only remove the specified listener', () => {
            const listener2 = jest.fn();
            manager.addListener(mockListener);
            manager.addListener(listener2);
            manager.removeListener(mockListener);
            manager.notifyChange('theme', 'dark', 'light');
            expect(mockListener).not.toHaveBeenCalled();
            expect(listener2).toHaveBeenCalledWith('theme', 'dark', 'light');
        });
    });
    describe('notifyChange', () => {
        it('should notify all listeners of changes', () => {
            const listener2 = jest.fn();
            manager.addListener(mockListener);
            manager.addListener(listener2);
            manager.notifyChange('userId', 1, 2);
            expect(mockListener).toHaveBeenCalledWith('userId', 1, 2);
            expect(listener2).toHaveBeenCalledWith('userId', 1, 2);
        });
        it('should handle listener errors gracefully', () => {
            const errorListener = jest.fn().mockImplementation(() => {
                throw new Error('Listener error');
            });
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            manager.addListener(errorListener);
            manager.addListener(mockListener);
            manager.notifyChange('language', 'en', 'es');
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error in context change listener:', expect.any(Error));
            expect(mockListener).toHaveBeenCalledWith('language', 'en', 'es');
            consoleErrorSpy.mockRestore();
        });
    });
    describe('createProxy', () => {
        it('should create a proxy that notifies on property changes', () => {
            manager.addListener(mockListener);
            const context = { language: 'en', theme: 'dark', userId: 1 };
            const proxy = manager.createProxy(context);
            proxy.language = 'es';
            expect(mockListener).toHaveBeenCalledWith('language', 'en', 'es');
            expect(proxy.language).toBe('es');
        });
        it('should handle multiple property changes', () => {
            manager.addListener(mockListener);
            const context = { language: 'en', theme: 'dark', userId: 1 };
            const proxy = manager.createProxy(context);
            proxy.language = 'es';
            proxy.theme = 'light';
            proxy.userId = 2;
            expect(mockListener).toHaveBeenCalledTimes(3);
            expect(mockListener).toHaveBeenNthCalledWith(1, 'language', 'en', 'es');
            expect(mockListener).toHaveBeenNthCalledWith(2, 'theme', 'dark', 'light');
            expect(mockListener).toHaveBeenNthCalledWith(3, 'userId', 1, 2);
        });
        it('should work with no listeners', () => {
            const context = { language: 'en', theme: 'dark', userId: 1 };
            const proxy = manager.createProxy(context);
            expect(() => {
                proxy.language = 'es';
            }).not.toThrow();
            expect(proxy.language).toBe('es');
        });
    });
});
