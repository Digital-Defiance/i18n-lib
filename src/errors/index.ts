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
