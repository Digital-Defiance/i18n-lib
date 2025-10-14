import {
  buildReasonMap,
  isTemplate,
  replaceVariables,
  toStringKey,
  toStringKeyFromEnum,
} from '../src/utils';

describe('utils', () => {
  describe('replaceVariables', () => {
    it('should replace variables', () => {
      const result = replaceVariables('Hello {name}!', { name: 'John' });
      expect(result).toBe('Hello John!');
    });

    it('should replace constants', () => {
      const result = replaceVariables('Welcome to {SITE}!', undefined, {
        SITE: 'MyApp',
      });
      expect(result).toBe('Welcome to MyApp!');
    });

    it('should leave unreplaced variables', () => {
      const result = replaceVariables('Hello {name}!', {});
      expect(result).toBe('Hello {name}!');
    });

    it('should handle multiple variables', () => {
      const result = replaceVariables(
        'Hello {name}, you have {count} messages',
        { name: 'John', count: 5 },
      );
      expect(result).toBe('Hello John, you have 5 messages');
    });

    it('should handle mixed variables and constants', () => {
      const result = replaceVariables(
        'User {name} on {SITE}',
        { name: 'John' },
        { SITE: 'MyApp' },
      );
      expect(result).toBe('User John on MyApp');
    });
  });

  describe('isTemplate', () => {
    it('should identify templates', () => {
      expect(isTemplate('userGreetingTemplate')).toBe(true);
      expect(isTemplate('GREETING_TEMPLATE')).toBe(true);
      expect(isTemplate('simple')).toBe(false);
    });

    it('should handle case variations', () => {
      expect(isTemplate('Template')).toBe(true);
      expect(isTemplate('template')).toBe(true);
      expect(isTemplate('TEMPLATE')).toBe(true);
      expect(isTemplate('myTemplate')).toBe(true);
      expect(isTemplate('MyTEMPLATE')).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(isTemplate('')).toBe(false);
      expect(isTemplate('templateX')).toBe(false);
      expect(isTemplate('Xtemplate')).toBe(true);
      expect(isTemplate('template_suffix')).toBe(false);
    });
  });

  describe('replaceVariables edge cases', () => {
    it('should handle empty string', () => {
      const result = replaceVariables('', { name: 'John' });
      expect(result).toBe('');
    });

    it('should handle string without variables', () => {
      const result = replaceVariables('Hello World', { name: 'John' });
      expect(result).toBe('Hello World');
    });

    it('should handle undefined variables and constants', () => {
      const result = replaceVariables('Hello {name}!');
      expect(result).toBe('Hello {name}!');
    });

    it('should handle empty variables object', () => {
      const result = replaceVariables('Hello {name}!', {});
      expect(result).toBe('Hello {name}!');
    });

    it('should handle null and undefined values', () => {
      const result = replaceVariables('Hello {name}!', { name: null as any });
      expect(result).toBe('Hello null!');
    });

    it('should handle numeric values', () => {
      const result = replaceVariables('You have {count} items', { count: 0 });
      expect(result).toBe('You have 0 items');
    });

    it('should handle boolean values', () => {
      const result = replaceVariables('Status: {active}', {
        active: true as any,
      });
      expect(result).toBe('Status: true');
    });

    it('should prioritize variables over constants', () => {
      const result = replaceVariables(
        'Hello {name}!',
        { name: 'John' },
        { name: 'Jane' },
      );
      expect(result).toBe('Hello John!');
    });

    it('should handle malformed variable syntax', () => {
      const result = replaceVariables('Hello {name} and {incomplete', {
        name: 'John',
      });
      expect(result).toBe('Hello John and {incomplete');
    });

    it('should handle nested braces', () => {
      const result = replaceVariables('Hello {{name}}!', { name: 'John' });
      expect(result).toBe('Hello {{name}}!'); // Nested braces are not replaced
    });

    it('should handle special characters in variable names', () => {
      const result = replaceVariables('Hello {user_name}!', {
        user_name: 'John',
      });
      expect(result).toBe('Hello John!');
    });

    it('should handle multiple occurrences of same variable', () => {
      const result = replaceVariables('Hello {name}, goodbye {name}!', {
        name: 'John',
      });
      expect(result).toBe('Hello John, goodbye John!');
    });

    it('should handle complex constants object', () => {
      const constants = {
        SITE: 'MyApp',
        VERSION: '1.0.0',
        nested: { value: 'test' },
      };
      const result = replaceVariables(
        'Welcome to {SITE} v{VERSION}',
        undefined,
        constants,
      );
      expect(result).toBe('Welcome to MyApp v1.0.0');
    });

    it('should convert non-string input to string', () => {
      const result = replaceVariables(
        { toString: () => 'Hello {name}!' } as any,
        { name: 'John' },
      );
      expect(typeof result).toBe('string');
      expect(result).toBe('Hello John!');
    });

    it('should handle object input that returns [object Object]', () => {
      const result = replaceVariables({} as any, { name: 'John' });
      expect(typeof result).toBe('string');
      expect(result).toBe('[object Object]');
    });

    it('should handle object variables by converting to string', () => {
      const objectVar = { toString: () => 'CustomObject' };
      const result = replaceVariables('Hello {obj}!', {
        obj: objectVar as any,
      });
      expect(typeof result).toBe('string');
      expect(result).toBe('Hello CustomObject!');
    });

    it('should handle object variables without custom toString', () => {
      const objectVar = { prop: 'value' };
      const result = replaceVariables('Hello {obj}!', {
        obj: objectVar as any,
      });
      expect(typeof result).toBe('string');
      expect(result).toBe('Hello [object Object]!');
    });

    it('should handle array variables', () => {
      const arrayVar = ['item1', 'item2'];
      const result = replaceVariables('Items: {items}', {
        items: arrayVar as any,
      });
      expect(typeof result).toBe('string');
      expect(result).toBe('Items: item1,item2');
    });

    it('should handle function variables', () => {
      const funcVar = () => 'function result';
      const result = replaceVariables('Result: {func}', {
        func: funcVar as any,
      });
      expect(typeof result).toBe('string');
      expect(result).toContain('function');
    });

    it('should always return string type regardless of input', () => {
      const inputs = [
        'normal string',
        123 as any,
        true as any,
        null as any,
        undefined as any,
        {} as any,
        [] as any,
        (() => {}) as any,
      ];

      inputs.forEach((input) => {
        const result = replaceVariables(input, { name: 'test' });
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('toStringKey', () => {
    it('should join single part', () => {
      expect(toStringKey('test')).toBe('test');
    });

    it('should join multiple parts with underscores', () => {
      expect(toStringKey('part1', 'part2', 'part3')).toBe('part1_part2_part3');
    });

    it('should handle empty parts', () => {
      expect(toStringKey('', 'test', '')).toBe('_test_');
    });
  });

  describe('toStringKeyFromEnum', () => {
    enum TestEnum {
      VALUE1 = 'val1',
      VALUE2 = 'val2',
    }

    it('should create key from enum value with parts', () => {
      expect(toStringKeyFromEnum(TestEnum.VALUE1, 'prefix', 'suffix')).toBe(
        'prefix_suffix_val1',
      );
    });

    it('should create key from enum value without parts', () => {
      expect(toStringKeyFromEnum(TestEnum.VALUE2)).toBe('val2');
    });

    it('should handle empty parts', () => {
      expect(toStringKeyFromEnum(TestEnum.VALUE1, '', 'test')).toBe(
        '_test_val1',
      );
    });
  });

  describe('buildReasonMap', () => {
    enum TestEnum {
      REASON1 = 'reason1',
      REASON2 = 'reason2',
      REASON3 = 'reason3',
    }

    it('should build reason map with prefixes', () => {
      const result = buildReasonMap(TestEnum, ['error', 'message']);
      expect(result).toEqual({
        reason1: 'error_message_reason1',
        reason2: 'error_message_reason2',
        reason3: 'error_message_reason3',
      });
    });

    it('should build reason map without prefixes', () => {
      const result = buildReasonMap(TestEnum);
      expect(result).toEqual({
        reason1: 'reason1',
        reason2: 'reason2',
        reason3: 'reason3',
      });
    });

    it('should handle single prefix', () => {
      const result = buildReasonMap(TestEnum, ['prefix']);
      expect(result).toEqual({
        reason1: 'prefix_reason1',
        reason2: 'prefix_reason2',
        reason3: 'prefix_reason3',
      });
    });

    it('should handle empty enum', () => {
      const EmptyEnum = {} as Record<string, string>;
      const result = buildReasonMap(EmptyEnum, ['prefix']);
      expect(result).toEqual({});
    });

    it('should append Template suffix without underscore for specified keys', () => {
      const templateKeys = new Set([TestEnum.REASON2]);
      const result = buildReasonMap(TestEnum, ['Error', 'Test'], templateKeys);
      expect(result).toEqual({
        reason1: 'Error_Test_reason1',
        reason2: 'Error_Test_reason2Template',
        reason3: 'Error_Test_reason3',
      });
    });

    it('should handle template keys with single prefix', () => {
      const templateKeys = new Set([TestEnum.REASON1, TestEnum.REASON3]);
      const result = buildReasonMap(TestEnum, ['Prefix'], templateKeys);
      expect(result).toEqual({
        reason1: 'Prefix_reason1Template',
        reason2: 'Prefix_reason2',
        reason3: 'Prefix_reason3Template',
      });
    });
  });
});
