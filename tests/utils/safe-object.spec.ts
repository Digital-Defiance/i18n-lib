import { createSafeObject, isDangerousKey, safeAssign, validateObjectKeys } from '../../src/utils/safe-object';

describe('safe-object', () => {
  describe('isDangerousKey', () => {
    it('should identify __proto__', () => {
      expect(isDangerousKey('__proto__')).toBe(true);
    });

    it('should identify constructor', () => {
      expect(isDangerousKey('constructor')).toBe(true);
    });

    it('should identify prototype', () => {
      expect(isDangerousKey('prototype')).toBe(true);
    });

    it('should allow safe keys', () => {
      expect(isDangerousKey('name')).toBe(false);
      expect(isDangerousKey('value')).toBe(false);
    });
  });

  describe('createSafeObject', () => {
    it('should create object without prototype', () => {
      const obj = createSafeObject();
      expect(Object.getPrototypeOf(obj)).toBeNull();
    });

    it('should not inherit Object.prototype methods', () => {
      const obj = createSafeObject();
      expect(obj.toString).toBeUndefined();
      expect(obj.hasOwnProperty).toBeUndefined();
    });
  });

  describe('safeAssign', () => {
    it('should assign safe keys', () => {
      const target = {};
      safeAssign(target, { name: 'test', value: 123 });
      expect(target).toEqual({ name: 'test', value: 123 });
    });

    it('should filter __proto__', () => {
      const target = {};
      safeAssign(target, { name: 'test', '__proto__': { polluted: true } });
      expect(target).toEqual({ name: 'test' });
      expect((({} as any).polluted)).toBeUndefined();
    });

    it('should filter constructor', () => {
      const target = {};
      safeAssign(target, { name: 'test', 'constructor': { polluted: true } });
      expect(target).toEqual({ name: 'test' });
    });

    it('should handle multiple sources', () => {
      const target = {};
      safeAssign(target, { a: 1 }, { b: 2 }, { c: 3 });
      expect(target).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should handle undefined sources', () => {
      const target = {};
      safeAssign(target, { a: 1 }, undefined, { b: 2 });
      expect(target).toEqual({ a: 1, b: 2 });
    });
  });

  describe('validateObjectKeys', () => {
    it('should pass for safe objects', () => {
      expect(() => validateObjectKeys({ name: 'test' })).not.toThrow();
    });

    it('should throw for __proto__ from JSON', () => {
      const obj = JSON.parse('{"__proto__": {}}');
      expect(() => validateObjectKeys(obj)).toThrow(/dangerous key/i);
    });

    it('should throw for constructor from JSON', () => {
      const obj = JSON.parse('{"constructor": {}}');
      expect(() => validateObjectKeys(obj)).toThrow(/dangerous key/i);
    });

    it('should throw for prototype from JSON', () => {
      const obj = JSON.parse('{"prototype": {}}');
      expect(() => validateObjectKeys(obj)).toThrow(/dangerous key/i);
    });

    it('should handle null', () => {
      expect(() => validateObjectKeys(null as any)).not.toThrow();
    });

    it('should handle non-objects', () => {
      expect(() => validateObjectKeys('string' as any)).not.toThrow();
    });
  });
});
