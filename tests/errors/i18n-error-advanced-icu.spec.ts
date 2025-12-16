/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

/**
 * Tests for advanced ICU MessageFormat features in I18nError
 * Tests number formatting, selectordinal, and nested messages
 */

import { I18nError, I18nErrorCode } from '../../src/errors/i18n-error';

describe('I18nError - Advanced ICU Features', () => {
  describe('validationThresholdExceeded - Number Formatting', () => {
    describe('Currency Formatting', () => {
      it('should format currency values in English (US)', () => {
        const error = I18nError.validationThresholdExceeded(
          'amount',
          1500.5,
          1000.0,
          'currency',
          'en-US',
        );

        expect(error.code).toBe(I18nErrorCode.VALIDATION_THRESHOLD_EXCEEDED);
        expect(error.message).toContain('amount');
        expect(error.message).toContain('$1,500.50');
        expect(error.message).toContain('$1,000.00');
        expect(error.metadata).toEqual({
          fieldName: 'amount',
          value: 1500.5,
          threshold: 1000.0,
          thresholdType: 'currency',
        });
      });

      it('should format currency values in French', () => {
        const error = I18nError.validationThresholdExceeded(
          'montant',
          1500.5,
          1000.0,
          'currency',
          'fr',
        );

        expect(error.code).toBe(I18nErrorCode.VALIDATION_THRESHOLD_EXCEEDED);
        expect(error.message).toContain('montant');
        // French currency formatting: 1 500,50 €
        expect(error.message).toMatch(/1[\s\u00A0]500[,.]50/);
      });

      it('should format currency values in German', () => {
        const error = I18nError.validationThresholdExceeded(
          'betrag',
          1500.5,
          1000.0,
          'currency',
          'de',
        );

        expect(error.code).toBe(I18nErrorCode.VALIDATION_THRESHOLD_EXCEEDED);
        expect(error.message).toContain('betrag');
        // German currency formatting: 1.500,50 €
        expect(error.message).toMatch(/1[.,]500[,.]50/);
      });
    });

    describe('Percent Formatting', () => {
      it('should format percent values in English', () => {
        const error = I18nError.validationThresholdExceeded(
          'successRate',
          0.95,
          0.9,
          'percent',
          'en-US',
        );

        expect(error.code).toBe(I18nErrorCode.VALIDATION_THRESHOLD_EXCEEDED);
        expect(error.message).toContain('successRate');
        expect(error.message).toContain('95%');
        expect(error.message).toContain('90%');
      });

      it('should format fractional percent values', () => {
        const error = I18nError.validationThresholdExceeded(
          'errorRate',
          0.0567,
          0.05,
          'percent',
          'en-US',
        );

        expect(error.message).toMatch(/5[.,]67%/);
        expect(error.message).toMatch(/5%/);
      });
    });

    describe('Integer Formatting', () => {
      it('should format large integer values with thousands separators', () => {
        const error = I18nError.validationThresholdExceeded(
          'fileSize',
          1500000,
          1000000,
          'integer',
          'en-US',
        );

        expect(error.code).toBe(I18nErrorCode.VALIDATION_THRESHOLD_EXCEEDED);
        expect(error.message).toContain('fileSize');
        expect(error.message).toContain('1,500,000');
        expect(error.message).toContain('1,000,000');
      });

      it('should format small integer values without separators', () => {
        const error = I18nError.validationThresholdExceeded(
          'count',
          150,
          100,
          'integer',
          'en-US',
        );

        expect(error.message).toContain('150');
        expect(error.message).toContain('100');
      });

      it('should default to integer formatting when type not specified', () => {
        const error = I18nError.validationThresholdExceeded(
          'items',
          1500,
          1000,
        );

        expect(error.message).toContain('1,500');
        expect(error.message).toContain('1,000');
        expect(error.metadata?.thresholdType).toBe('integer');
      });
    });
  });

  describe('operationStepFailed - SelectOrdinal Formatting', () => {
    it('should format 1st step', () => {
      const error = I18nError.operationStepFailed(
        1,
        'deployment',
        'network timeout',
        'en-US',
      );

      expect(error.code).toBe(I18nErrorCode.OPERATION_STEP_FAILED);
      expect(error.message).toContain('1st');
      expect(error.message).toContain('deployment');
      expect(error.message).toContain('network timeout');
      expect(error.metadata).toEqual({
        stepNumber: 1,
        operationName: 'deployment',
        reason: 'network timeout',
      });
    });

    it('should format 2nd step', () => {
      const error = I18nError.operationStepFailed(
        2,
        'validation',
        'schema mismatch',
        'en-US',
      );

      expect(error.message).toContain('2nd');
      expect(error.message).toContain('validation');
    });

    it('should format 3rd step', () => {
      const error = I18nError.operationStepFailed(
        3,
        'compilation',
        'syntax error',
        'en-US',
      );

      expect(error.message).toContain('3rd');
      expect(error.message).toContain('compilation');
    });

    it('should format 4th step', () => {
      const error = I18nError.operationStepFailed(
        4,
        'testing',
        'assertion failed',
        'en-US',
      );

      expect(error.message).toContain('4th');
      expect(error.message).toContain('testing');
    });

    it('should format 21st step', () => {
      const error = I18nError.operationStepFailed(
        21,
        'processing',
        'timeout',
        'en-US',
      );

      expect(error.message).toContain('21st');
    });

    it('should format 22nd step', () => {
      const error = I18nError.operationStepFailed(
        22,
        'optimization',
        'memory limit',
        'en-US',
      );

      expect(error.message).toContain('22nd');
    });

    it('should format 23rd step', () => {
      const error = I18nError.operationStepFailed(
        23,
        'finalization',
        'resource cleanup',
        'en-US',
      );

      expect(error.message).toContain('23rd');
    });

    it('should format 11th step (exception case)', () => {
      const error = I18nError.operationStepFailed(
        11,
        'initialization',
        'config error',
        'en-US',
      );

      expect(error.message).toContain('11th');
    });

    it('should format 100th step', () => {
      const error = I18nError.operationStepFailed(
        100,
        'final verification',
        'checksum mismatch',
        'en-US',
      );

      expect(error.message).toContain('100th');
    });

    it('should work with different languages', () => {
      const error = I18nError.operationStepFailed(
        1,
        'déploiement',
        'délai dépassé',
        'fr',
      );

      expect(error.message).toContain('déploiement');
      expect(error.message).toContain('délai dépassé');
    });
  });

  describe('rateLimitExceeded - Nested ICU Messages', () => {
    it('should format rate limit error with nested plural and number formatting', () => {
      const error = I18nError.rateLimitExceeded(150, 100, 60, 30, 'en-US');

      expect(error.code).toBe(I18nErrorCode.RATE_LIMIT_EXCEEDED);
      expect(error.message).toContain('150 requests');
      expect(error.message).toContain('100 requests');
      expect(error.message).toContain('60 seconds');
      expect(error.message).toContain('30 seconds');
      expect(error.metadata).toEqual({
        requestCount: 150,
        limit: 100,
        windowSeconds: 60,
        retryAfterSeconds: 30,
      });
    });

    it('should handle singular forms correctly', () => {
      const error = I18nError.rateLimitExceeded(1, 1, 1, 1, 'en-US');

      expect(error.message).toContain('1 request');
      expect(error.message).not.toContain('1 requests');
      expect(error.message).toContain('1 second');
    });

    it('should handle immediate retry (0 seconds)', () => {
      const error = I18nError.rateLimitExceeded(150, 100, 60, 0, 'en-US');

      expect(error.message).toContain('Retry immediately');
      expect(error.message).not.toContain('Retry after');
    });

    it('should format large numbers with separators', () => {
      const error = I18nError.rateLimitExceeded(1500, 1000, 3600, 300, 'en-US');

      expect(error.message).toContain('1,500');
      expect(error.message).toContain('1,000');
      expect(error.message).toContain('3,600');
      expect(error.message).toContain('300');
    });

    it('should work with different languages (French)', () => {
      const error = I18nError.rateLimitExceeded(150, 100, 60, 30, 'fr');

      expect(error.code).toBe(I18nErrorCode.RATE_LIMIT_EXCEEDED);
      expect(error.message).toBeTruthy();
    });
  });

  describe('nestedValidationError - 4-Level Nested Messages', () => {
    describe('Error Types', () => {
      it('should format type mismatch error', () => {
        const error = I18nError.nestedValidationError(
          'userProfile',
          'user.profile.settings.theme',
          1,
          'type',
          'high',
          'en-US',
        );

        expect(error.code).toBe(I18nErrorCode.NESTED_VALIDATION_ERROR);
        expect(error.message).toContain('userProfile');
        expect(error.message).toContain('user.profile.settings.theme');
        expect(error.message).toContain('Type mismatch');
        expect(error.message).toContain('Serious issue');
        expect(error.message).toContain('1 occurrence');
        expect(error.metadata).toEqual({
          componentId: 'userProfile',
          fieldPath: 'user.profile.settings.theme',
          errorCount: 1,
          errorType: 'type',
          severity: 'high',
        });
      });

      it('should format range error', () => {
        const error = I18nError.nestedValidationError(
          'config',
          'server.limits.maxConnections',
          3,
          'range',
          'medium',
          'en-US',
        );

        expect(error.message).toContain('Value out of range');
        expect(error.message).toContain('Moderate issue');
        expect(error.message).toContain('3 occurrences');
      });

      it('should format format error', () => {
        const error = I18nError.nestedValidationError(
          'api',
          'request.headers.contentType',
          2,
          'format',
          'low',
          'en-US',
        );

        expect(error.message).toContain('Invalid format');
        expect(error.message).toContain('Minor issue');
        expect(error.message).toContain('2 occurrences');
      });

      it('should format required field error', () => {
        const error = I18nError.nestedValidationError(
          'form',
          'contact.personal.email',
          1,
          'required',
          'critical',
          'en-US',
        );

        expect(error.message).toContain('Required field missing');
        expect(error.message).toContain('Critical issue');
        expect(error.message).toContain('1 occurrence');
      });
    });

    describe('Severity Levels', () => {
      it('should format low severity', () => {
        const error = I18nError.nestedValidationError(
          'ui',
          'theme.colors.accent',
          1,
          'format',
          'low',
          'en-US',
        );

        expect(error.message).toContain('Minor issue');
      });

      it('should format medium severity', () => {
        const error = I18nError.nestedValidationError(
          'ui',
          'theme.colors.accent',
          1,
          'format',
          'medium',
          'en-US',
        );

        expect(error.message).toContain('Moderate issue');
      });

      it('should format high severity', () => {
        const error = I18nError.nestedValidationError(
          'ui',
          'theme.colors.accent',
          1,
          'format',
          'high',
          'en-US',
        );

        expect(error.message).toContain('Serious issue');
      });

      it('should format critical severity', () => {
        const error = I18nError.nestedValidationError(
          'ui',
          'theme.colors.accent',
          1,
          'format',
          'critical',
          'en-US',
        );

        expect(error.message).toContain('Critical issue');
      });
    });

    describe('Plural Forms', () => {
      it('should use singular form for 1 occurrence', () => {
        const error = I18nError.nestedValidationError(
          'component',
          'path.to.field',
          1,
          'type',
          'medium',
          'en-US',
        );

        expect(error.message).toContain('1 occurrence');
        expect(error.message).not.toContain('occurrences');
      });

      it('should use plural form for multiple occurrences', () => {
        const error = I18nError.nestedValidationError(
          'component',
          'path.to.field',
          5,
          'type',
          'medium',
          'en-US',
        );

        expect(error.message).toContain('5 occurrences');
      });
    });

    describe('Complex Nested Paths', () => {
      it('should handle deeply nested paths', () => {
        const error = I18nError.nestedValidationError(
          'app',
          'config.database.pool.connections.max',
          2,
          'range',
          'high',
          'en-US',
        );

        expect(error.message).toContain('config.database.pool.connections.max');
        expect(error.metadata?.fieldPath).toBe(
          'config.database.pool.connections.max',
        );
      });

      it('should handle array-like paths', () => {
        const error = I18nError.nestedValidationError(
          'items',
          'users[0].profile.settings.notifications',
          3,
          'required',
          'critical',
          'en-US',
        );

        expect(error.message).toContain(
          'users[0].profile.settings.notifications',
        );
      });
    });

    describe('Multilingual Support', () => {
      it('should work with French', () => {
        const error = I18nError.nestedValidationError(
          'profil',
          'utilisateur.paramètres.thème',
          2,
          'type',
          'high',
          'fr',
        );

        expect(error.code).toBe(I18nErrorCode.NESTED_VALIDATION_ERROR);
        expect(error.message).toContain('profil');
        expect(error.message).toContain('utilisateur.paramètres.thème');
      });

      it('should work with Spanish', () => {
        const error = I18nError.nestedValidationError(
          'configuración',
          'servidor.límites.conexiones',
          3,
          'range',
          'medium',
          'es',
        );

        expect(error.message).toContain('configuración');
        expect(error.message).toContain('servidor.límites.conexiones');
      });
    });
  });

  describe('Advanced ICU Integration', () => {
    it('should combine all advanced features in error metadata', () => {
      const thresholdError = I18nError.validationThresholdExceeded(
        'price',
        1500,
        1000,
        'currency',
      );
      const stepError = I18nError.operationStepFailed(3, 'deploy', 'timeout');
      const rateLimitError = I18nError.rateLimitExceeded(150, 100, 60, 30);
      const nestedError = I18nError.nestedValidationError(
        'comp',
        'a.b.c',
        5,
        'type',
        'high',
      );

      expect(thresholdError.metadata).toHaveProperty(
        'thresholdType',
        'currency',
      );
      expect(stepError.metadata).toHaveProperty('stepNumber', 3);
      expect(rateLimitError.metadata).toHaveProperty('requestCount', 150);
      expect(nestedError.metadata).toHaveProperty('errorCount', 5);
    });

    it('should maintain backward compatibility with basic ICU methods', () => {
      const componentError = I18nError.componentNotFound('test');
      const validationError = I18nError.validationFailed(['error1', 'error2']);
      const pluralError = I18nError.pluralFormNotFound('few', 'ru', 'items', [
        'one',
        'other',
      ]);

      expect(componentError.code).toBe(I18nErrorCode.COMPONENT_NOT_FOUND);
      expect(validationError.code).toBe(I18nErrorCode.VALIDATION_FAILED);
      expect(pluralError.code).toBe(I18nErrorCode.PLURAL_FORM_NOT_FOUND);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should format API rate limit error realistically', () => {
      const error = I18nError.rateLimitExceeded(1000, 100, 3600, 300, 'en-US');

      expect(error.message).toMatch(/1,000 requests/);
      expect(error.message).toMatch(/100 requests per 3,600 seconds/);
      expect(error.message).toMatch(/Retry after 300 seconds/);
    });

    it('should format file size validation error realistically', () => {
      const error = I18nError.validationThresholdExceeded(
        'uploadSize',
        10485760,
        5242880,
        'integer',
        'en-US',
      );

      expect(error.message).toContain('10,485,760');
      expect(error.message).toContain('5,242,880');
    });

    it('should format multi-step pipeline failure realistically', () => {
      const error = I18nError.operationStepFailed(
        5,
        'CI/CD pipeline',
        'Docker build failed: insufficient disk space',
        'en-US',
      );

      expect(error.message).toContain('5th');
      expect(error.message).toContain('CI/CD pipeline');
      expect(error.message).toContain('Docker build failed');
    });

    it('should format complex nested validation error realistically', () => {
      const error = I18nError.nestedValidationError(
        'userRegistration',
        'user.profile.preferences.notifications.email.frequency',
        1,
        'range',
        'critical',
        'en-US',
      );

      expect(error.message).toContain('Critical issue');
      expect(error.message).toContain(
        'user.profile.preferences.notifications.email.frequency',
      );
      expect(error.message).toContain('Value out of range');
    });
  });
});
