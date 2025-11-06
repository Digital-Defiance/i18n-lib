import { I18nError, I18nErrorCode } from '../src/errors/i18n-error';

describe('I18nError coverage', () => {
  describe('static factory methods', () => {
    it('should create validationFailed error', () => {
      const errors = ['error1', 'error2'];
      const error = I18nError.validationFailed(errors);

      expect(error.code).toBe(I18nErrorCode.VALIDATION_FAILED);
      expect(error.message).toContain('error1');
      expect(error.message).toContain('error2');
      expect(error.metadata?.errors).toEqual(errors);
    });

    it('should create instanceNotFound error', () => {
      const error = I18nError.instanceNotFound('test-key');

      expect(error.code).toBe(I18nErrorCode.INSTANCE_NOT_FOUND);
      expect(error.message).toContain('test-key');
      expect(error.metadata?.key).toBe('test-key');
    });

    it('should create instanceExists error', () => {
      const error = I18nError.instanceExists('existing-key');

      expect(error.code).toBe(I18nErrorCode.INSTANCE_EXISTS);
      expect(error.message).toContain('existing-key');
      expect(error.metadata?.key).toBe('existing-key');
    });

    it('should create invalidContext error', () => {
      const error = I18nError.invalidContext('bad-context');

      expect(error.code).toBe(I18nErrorCode.INVALID_CONTEXT);
      expect(error.message).toContain('bad-context');
      expect(error.metadata?.contextKey).toBe('bad-context');
    });
  });

  describe('error properties', () => {
    it('should have correct prototype', () => {
      const error = I18nError.invalidConfig('test');
      expect(error instanceof I18nError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should have name property', () => {
      const error = I18nError.invalidConfig('test');
      expect(error.name).toBe('I18nError');
    });
  });
});
