const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../../tsconfig.base.json');

// Suppress TypeScript ESLint deprecation warnings
const originalWarn = process.emitWarning;
process.emitWarning = function(warning, type, code) {
  if (
    typeof warning === 'string' &&
    warning.includes('The \'argument\' property is deprecated on TSImportType nodes')
  ) {
    return;
  }
  originalWarn.call(process, warning, type, code);
};

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          ...require('./tsconfig.spec.json').compilerOptions,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    '^lru-cache$': '<rootDir>/__mocks__/lru-cache.js',
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/../../',
    }),
  },
};