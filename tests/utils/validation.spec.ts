import { 
  validateTemplateLength, 
  validateKeyLength, 
  validateComponentId, 
  validateLanguageCode,
  LIMITS 
} from '../../src/utils/validation';

describe('validation', () => {
  describe('LIMITS', () => {
    it('should define all limits', () => {
      expect(LIMITS.MAX_TEMPLATE_LENGTH).toBe(10000);
      expect(LIMITS.MAX_KEY_LENGTH).toBe(200);
      expect(LIMITS.MAX_COMPONENT_ID_LENGTH).toBe(100);
      expect(LIMITS.MAX_LANGUAGE_CODE_LENGTH).toBe(10);
      expect(LIMITS.MAX_NESTING_DEPTH).toBe(10);
    });
  });

  describe('validateTemplateLength', () => {
    it('should accept normal templates', () => {
      expect(() => validateTemplateLength('Hello {name}')).not.toThrow();
    });

    it('should accept max length', () => {
      const max = 'a'.repeat(10000);
      expect(() => validateTemplateLength(max)).not.toThrow();
    });

    it('should reject over max', () => {
      const tooLong = 'a'.repeat(10001);
      expect(() => validateTemplateLength(tooLong)).toThrow(/maximum length/i);
    });

    it('should accept empty string', () => {
      expect(() => validateTemplateLength('')).not.toThrow();
    });
  });

  describe('validateKeyLength', () => {
    it('should accept normal keys', () => {
      expect(() => validateKeyLength('greeting')).not.toThrow();
    });

    it('should accept max length', () => {
      const max = 'a'.repeat(200);
      expect(() => validateKeyLength(max)).not.toThrow();
    });

    it('should reject over max', () => {
      const tooLong = 'a'.repeat(201);
      expect(() => validateKeyLength(tooLong)).toThrow(/maximum length/i);
    });
  });

  describe('validateComponentId', () => {
    it('should accept alphanumeric', () => {
      expect(() => validateComponentId('test123')).not.toThrow();
    });

    it('should accept hyphens', () => {
      expect(() => validateComponentId('test-component')).not.toThrow();
    });

    it('should accept underscores', () => {
      expect(() => validateComponentId('test_component')).not.toThrow();
    });

    it('should reject dots', () => {
      expect(() => validateComponentId('test.component')).toThrow(/invalid characters/i);
    });

    it('should reject slashes', () => {
      expect(() => validateComponentId('test/component')).toThrow(/invalid characters/i);
    });

    it('should reject path traversal', () => {
      expect(() => validateComponentId('../../../etc/passwd')).toThrow(/invalid characters/i);
    });

    it('should reject special chars', () => {
      expect(() => validateComponentId('test<script>')).toThrow(/invalid characters/i);
    });

    it('should reject over max length', () => {
      const tooLong = 'a'.repeat(101);
      expect(() => validateComponentId(tooLong)).toThrow(/maximum length/i);
    });
  });

  describe('validateLanguageCode', () => {
    it('should accept en-US', () => {
      expect(() => validateLanguageCode('en-US')).not.toThrow();
    });

    it('should accept fr-FR', () => {
      expect(() => validateLanguageCode('fr-FR')).not.toThrow();
    });

    it('should accept two-letter codes', () => {
      expect(() => validateLanguageCode('en')).not.toThrow();
    });

    it('should reject invalid format', () => {
      expect(() => validateLanguageCode('english')).toThrow(/invalid.*format/i);
    });

    it('should reject wrong case', () => {
      expect(() => validateLanguageCode('EN-us')).toThrow(/invalid.*format/i);
    });

    it('should reject too long', () => {
      expect(() => validateLanguageCode('en-US-extra')).toThrow(/maximum length/i);
    });
  });
});
