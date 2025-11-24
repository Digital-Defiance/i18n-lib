/**
 * Circular Dependency Detection Test
 *
 * This test uses madge to detect circular dependencies in the i18n-lib package.
 * It ensures that the module dependency graph remains acyclic, preventing
 * initialization issues and maintaining clean architecture.
 *
 * Requirements: 6.4, 6.5
 */

import madge from 'madge';
import * as path from 'path';

describe('Circular Dependencies', () => {
  it('should have zero circular dependencies', async () => {
    // Path to the source directory
    const srcPath = path.resolve(__dirname, '../src');

    // Run madge analysis
    const result = await madge(srcPath, {
      fileExtensions: ['ts'],
      excludeRegExp: ['\\.spec\\.ts$', '\\.test\\.ts$'],
      tsConfig: path.resolve(__dirname, '../tsconfig.lib.json'),
    });

    // Get circular dependencies
    const circular = result.circular();

    // Log the circular dependencies for debugging
    if (circular.length > 0) {
      console.error('\n❌ Circular dependencies detected:');
      circular.forEach((cycle: string[], index: number) => {
        console.error(`\nCycle ${index + 1}:`);
        console.error(cycle.join(' → '));
      });
      console.error(`\nTotal cycles: ${circular.length}\n`);
    }

    // Assert no circular dependencies
    expect(circular).toHaveLength(0);
  }, 30000); // 30 second timeout for madge analysis
});
