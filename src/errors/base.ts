/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
/**
 * Base error exports that don't depend on core modules
 * These can be imported without triggering core module initialization
 */

export * from './enhanced-error-base';
export * from './handleable';
export * from './simple-typed-error';
