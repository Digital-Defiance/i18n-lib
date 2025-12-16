/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
/**
 * Error exports
 *
 * This barrel export is split into separate files to avoid circular dependencies:
 * - base.ts: Base error classes without core dependencies
 * - translatable-exports.ts: Errors that use lazy initialization with core modules
 *
 * Import from specific files when possible to minimize module loading.
 */

// Re-export from base (no core dependencies)
export * from './base';

// Re-export from translatable (uses lazy initialization)
export * from './translatable-exports';
