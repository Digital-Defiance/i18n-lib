/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { createTemplateProcessor } from '../src/template';

enum TestEnum {
  Simple = 'simple',
  WithVar = 'withVar',
}

describe('template - Security', () => {
  let translateFn: jest.MockedFunction<any>;
  let processor: any;

  beforeEach(() => {
    translateFn = jest.fn();
    processor = createTemplateProcessor(TestEnum, translateFn, 'TestEnum');
  });

  describe('regex pattern limits', () => {
    it('should handle normal patterns', () => {
      translateFn.mockReturnValue('result');
      const result = processor('{{TestEnum.Simple}}');
      expect(result).toBe('result');
    });

    it('should not match excessively long enum keys', () => {
      const longKey = 'a'.repeat(100);
      const result = processor(`{{TestEnum.${longKey}}}`);
      expect(result).toBe(`{{TestEnum.${longKey}}}`);
      expect(translateFn).not.toHaveBeenCalled();
    });

    it('should not match excessively long variable names', () => {
      const longVar = 'a'.repeat(100);
      const result = processor(`{${longVar}}`);
      expect(result).toBe(`{${longVar}}`);
    });
  });

  describe('prototype pollution prevention', () => {
    it('should filter __proto__ from variables', () => {
      translateFn.mockReturnValue('result');
      const result = processor('{{TestEnum.Simple}}', undefined, {
        name: 'safe',
        __proto__: { bad: true },
      });
      expect(result).toBe('result');
      expect(({} as any).bad).toBeUndefined();
    });

    it('should filter constructor from variables', () => {
      translateFn.mockReturnValue('result');
      const result = processor('{{TestEnum.Simple}}', undefined, {
        name: 'safe',
        constructor: { bad: true },
      });
      expect(result).toBe('result');
    });

    it('should filter prototype from variables', () => {
      translateFn.mockReturnValue('result');
      const result = processor('{{TestEnum.Simple}}', undefined, {
        name: 'safe',
        prototype: { bad: true },
      });
      expect(result).toBe('result');
    });
  });

  describe('variable replacement', () => {
    it('should replace safe variables', () => {
      const result = processor('Hello {name}', undefined, { name: 'World' });
      expect(result).toBe('Hello World');
    });

    it('should handle multiple variable objects', () => {
      const result = processor('{a} {b}', undefined, { a: '1' }, { b: '2' });
      expect(result).toBe('1 2');
    });

    it('should merge variables safely', () => {
      const result = processor(
        '{x}',
        undefined,
        { x: 'first', __proto__: { bad: true } },
        { y: 'second' },
      );
      expect(result).toBe('first');
      expect(({} as any).bad).toBeUndefined();
    });
  });
});
