/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { I18nBuilder } from '../src/builders/i18n-builder';

describe('I18nBuilder coverage', () => {
  afterEach(() => {
    // Clean up any registered instances
    const { I18nEngine } = require('../src/core/i18n-engine');
    I18nEngine.resetAll();
  });

  describe('builder methods', () => {
    it('should throw when building without languages', () => {
      const builder = I18nBuilder.create();
      expect(() => builder.build()).toThrow(
        'At least one language must be provided',
      );
    });

    it('should build with isolated instance', () => {
      const builder = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .isolated();

      const engine = builder.build();
      expect(engine).toBeDefined();
    });

    it('should build with asDefault', () => {
      const builder = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .asDefault();

      const engine = builder.build();
      expect(engine).toBeDefined();
    });

    it('should build with all configuration options', () => {
      const builder = I18nBuilder.create()
        .withLanguages([
          { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
        ])
        .withDefaultLanguage('en-US')
        .withFallbackLanguage('en-US')
        .withConstants({ APP_NAME: 'Test' })
        .withValidation({ strict: true })
        .withInstanceKey('test-key')
        .withRegisterInstance(true)
        .withSetAsDefault(false);

      const engine = builder.build();
      expect(engine).toBeDefined();
    });
  });
});
