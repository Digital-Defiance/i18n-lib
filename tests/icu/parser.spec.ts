import { parse, ParseError } from '../../src/icu/parser';
import { NodeType } from '../../src/icu/ast';

describe('ICU MessageFormat Parser', () => {
  describe('Simple messages', () => {
    it('should parse plain text', () => {
      const ast = parse('Hello world');
      expect(ast.type).toBe(NodeType.MESSAGE);
      expect(ast.elements).toHaveLength(1);
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'Hello world' });
    });

    it('should parse empty string', () => {
      const ast = parse('');
      expect(ast.type).toBe(NodeType.MESSAGE);
      expect(ast.elements).toHaveLength(0);
    });

    it('should parse text with spaces', () => {
      const ast = parse('  Hello   world  ');
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: '  Hello   world  ' });
    });

    it('should parse text with special characters', () => {
      const ast = parse('Hello! How are you?');
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'Hello! How are you?' });
    });

    it('should parse text with numbers', () => {
      const ast = parse('You have 123 messages');
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'You have 123 messages' });
    });

    it('should parse text with punctuation', () => {
      const ast = parse('Hello, world! How are you?');
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'Hello, world! How are you?' });
    });

    it('should parse text with newlines', () => {
      const ast = parse('Line 1\nLine 2');
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'Line 1\nLine 2' });
    });

    it('should parse text with tabs', () => {
      const ast = parse('Column1\tColumn2');
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'Column1\tColumn2' });
    });
  });

  describe('Simple arguments', () => {
    it('should parse simple argument', () => {
      const ast = parse('Hello {name}');
      expect(ast.elements).toHaveLength(2);
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'Hello ' });
      expect(ast.elements[1]).toEqual({ type: NodeType.ARGUMENT, name: 'name' });
    });

    it('should parse multiple arguments', () => {
      const ast = parse('{greeting} {name}');
      expect(ast.elements).toHaveLength(3);
      expect(ast.elements[0]).toEqual({ type: NodeType.ARGUMENT, name: 'greeting' });
      expect(ast.elements[1]).toEqual({ type: NodeType.LITERAL, value: ' ' });
      expect(ast.elements[2]).toEqual({ type: NodeType.ARGUMENT, name: 'name' });
    });

    it('should parse argument at start', () => {
      const ast = parse('{name} is here');
      expect(ast.elements[0]).toEqual({ type: NodeType.ARGUMENT, name: 'name' });
    });

    it('should parse argument at end', () => {
      const ast = parse('Hello {name}');
      expect(ast.elements[1]).toEqual({ type: NodeType.ARGUMENT, name: 'name' });
    });

    it('should parse argument with underscores', () => {
      const ast = parse('{user_name}');
      expect(ast.elements[0]).toEqual({ type: NodeType.ARGUMENT, name: 'user_name' });
    });

    it('should parse argument with numbers', () => {
      const ast = parse('{user123}');
      expect(ast.elements[0]).toEqual({ type: NodeType.ARGUMENT, name: 'user123' });
    });

    it('should parse consecutive arguments', () => {
      const ast = parse('{first}{second}');
      expect(ast.elements).toHaveLength(2);
      expect(ast.elements[0]).toEqual({ type: NodeType.ARGUMENT, name: 'first' });
      expect(ast.elements[1]).toEqual({ type: NodeType.ARGUMENT, name: 'second' });
    });
  });

  describe('Formatted arguments', () => {
    it('should parse number format', () => {
      const ast = parse('{count, number}');
      expect(ast.elements[0]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'count',
        format: 'number',
      });
    });

    it('should parse date format', () => {
      const ast = parse('{today, date}');
      expect(ast.elements[0]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'today',
        format: 'date',
      });
    });

    it('should parse time format', () => {
      const ast = parse('{now, time}');
      expect(ast.elements[0]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'now',
        format: 'time',
      });
    });

    it('should parse format with style', () => {
      const ast = parse('{count, number, integer}');
      expect(ast.elements[0]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'count',
        format: 'number',
        style: 'integer',
      });
    });

    it('should parse date with style', () => {
      const ast = parse('{date, date, short}');
      expect(ast.elements[0]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'date',
        format: 'date',
        style: 'short',
      });
    });

    it('should parse currency format', () => {
      const ast = parse('{price, number, currency}');
      expect(ast.elements[0]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'price',
        format: 'number',
        style: 'currency',
      });
    });

    it('should parse percent format', () => {
      const ast = parse('{ratio, number, percent}');
      expect(ast.elements[0]).toEqual({
        type: NodeType.ARGUMENT,
        name: 'ratio',
        format: 'number',
        style: 'percent',
      });
    });
  });

  describe('Plural messages', () => {
    it('should parse simple plural', () => {
      const ast = parse('{count, plural, one {# item} other {# items}}');
      expect(ast.elements[0].type).toBe(NodeType.PLURAL);
      const plural = ast.elements[0] as any;
      expect(plural.name).toBe('count');
      expect(plural.cases.one).toBeDefined();
      expect(plural.cases.other).toBeDefined();
    });

    it('should parse plural with all forms', () => {
      const ast = parse('{count, plural, zero {no items} one {# item} two {# items} few {# items} many {# items} other {# items}}');
      const plural = ast.elements[0] as any;
      expect(plural.cases.zero).toBeDefined();
      expect(plural.cases.one).toBeDefined();
      expect(plural.cases.two).toBeDefined();
      expect(plural.cases.few).toBeDefined();
      expect(plural.cases.many).toBeDefined();
      expect(plural.cases.other).toBeDefined();
    });

    it('should parse plural with # placeholder', () => {
      const ast = parse('{count, plural, one {# item} other {# items}}');
      const plural = ast.elements[0] as any;
      expect(plural.cases.one.elements[0]).toEqual({ type: NodeType.LITERAL, value: '#' });
      expect(plural.cases.one.elements[1]).toEqual({ type: NodeType.LITERAL, value: ' item' });
    });

    it('should parse plural with text before #', () => {
      const ast = parse('{count, plural, one {You have # item} other {You have # items}}');
      const plural = ast.elements[0] as any;
      expect(plural.cases.one.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'You have ' });
      expect(plural.cases.one.elements[1]).toEqual({ type: NodeType.LITERAL, value: '#' });
    });

    it('should parse plural with text after #', () => {
      const ast = parse('{count, plural, one {# item left} other {# items left}}');
      const plural = ast.elements[0] as any;
      expect(plural.cases.one.elements[0]).toEqual({ type: NodeType.LITERAL, value: '#' });
      expect(plural.cases.one.elements[1]).toEqual({ type: NodeType.LITERAL, value: ' item left' });
    });

    it('should parse plural without #', () => {
      const ast = parse('{count, plural, one {one item} other {many items}}');
      const plural = ast.elements[0] as any;
      expect(plural.cases.one.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'one item' });
    });
  });

  describe('Select messages', () => {
    it('should parse simple select', () => {
      const ast = parse('{gender, select, male {He} female {She} other {They}}');
      expect(ast.elements[0].type).toBe(NodeType.SELECT);
      const select = ast.elements[0] as any;
      expect(select.name).toBe('gender');
      expect(select.cases.male).toBeDefined();
      expect(select.cases.female).toBeDefined();
      expect(select.cases.other).toBeDefined();
    });

    it('should parse select with longer text', () => {
      const ast = parse('{gender, select, male {He is here} female {She is here} other {They are here}}');
      const select = ast.elements[0] as any;
      expect(select.cases.male.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'He is here' });
    });

    it('should parse select with multiple cases', () => {
      const ast = parse('{status, select, active {Active} inactive {Inactive} pending {Pending} other {Unknown}}');
      const select = ast.elements[0] as any;
      expect(select.cases.active).toBeDefined();
      expect(select.cases.inactive).toBeDefined();
      expect(select.cases.pending).toBeDefined();
      expect(select.cases.other).toBeDefined();
    });
  });

  describe('SelectOrdinal messages', () => {
    it('should parse selectordinal', () => {
      const ast = parse('{place, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}');
      expect(ast.elements[0].type).toBe(NodeType.SELECTORDINAL);
      const ordinal = ast.elements[0] as any;
      expect(ordinal.name).toBe('place');
      expect(ordinal.cases.one).toBeDefined();
      expect(ordinal.cases.two).toBeDefined();
      expect(ordinal.cases.few).toBeDefined();
      expect(ordinal.cases.other).toBeDefined();
    });

    it('should parse selectordinal with text', () => {
      const ast = parse('{place, selectordinal, one {#st place} two {#nd place} other {#th place}}');
      const ordinal = ast.elements[0] as any;
      expect(ordinal.cases.one.elements[1]).toEqual({ type: NodeType.LITERAL, value: 'st place' });
    });
  });

  describe('Nested messages', () => {
    it('should parse nested plural in select', () => {
      const ast = parse('{gender, select, male {{count, plural, one {He has # item} other {He has # items}}} female {{count, plural, one {She has # item} other {She has # items}}}}');
      const select = ast.elements[0] as any;
      expect(select.type).toBe(NodeType.SELECT);
      expect(select.cases.male.elements[0].type).toBe(NodeType.PLURAL);
    });

    it('should parse nested select in plural', () => {
      const ast = parse('{count, plural, one {{gender, select, male {He} female {She}}} other {{gender, select, male {They} female {They}}}}');
      const plural = ast.elements[0] as any;
      expect(plural.type).toBe(NodeType.PLURAL);
      expect(plural.cases.one.elements[0].type).toBe(NodeType.SELECT);
    });
  });

  describe('Escape sequences', () => {
    it('should parse escaped open brace', () => {
      const ast = parse("'{Hello}");
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: '{' });
      expect(ast.elements[1]).toEqual({ type: NodeType.LITERAL, value: 'Hello}' });
    });

    it('should parse escaped close brace', () => {
      const ast = parse("Hello'}");
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'Hello' });
      expect(ast.elements[1]).toEqual({ type: NodeType.LITERAL, value: '}' });
    });
  });

  describe('Error handling', () => {
    it('should throw on unclosed brace', () => {
      expect(() => parse('{name')).toThrow(ParseError);
    });

    it('should throw on missing argument name', () => {
      expect(() => parse('{}')).toThrow(ParseError);
    });

    it('should throw on invalid format', () => {
      expect(() => parse('{name, }')).toThrow(ParseError);
    });

    it('should throw on unclosed plural', () => {
      expect(() => parse('{count, plural, one {item}')).toThrow(ParseError);
    });

    it('should throw on missing plural case', () => {
      expect(() => parse('{count, plural, }')).toThrow(ParseError);
    });
  });

  describe('Complex real-world messages', () => {
    it('should parse message with text and arguments', () => {
      const ast = parse('Hello {name}, you have {count} messages');
      expect(ast.elements).toHaveLength(5);
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'Hello ' });
      expect(ast.elements[1]).toEqual({ type: NodeType.ARGUMENT, name: 'name' });
      expect(ast.elements[2]).toEqual({ type: NodeType.LITERAL, value: ', you have ' });
      expect(ast.elements[3]).toEqual({ type: NodeType.ARGUMENT, name: 'count' });
      expect(ast.elements[4]).toEqual({ type: NodeType.LITERAL, value: ' messages' });
    });

    it('should parse message with plural and text', () => {
      const ast = parse('You have {count, plural, one {# message} other {# messages}} from {sender}');
      expect(ast.elements).toHaveLength(4);
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'You have ' });
      expect(ast.elements[1].type).toBe(NodeType.PLURAL);
      expect(ast.elements[2]).toEqual({ type: NodeType.LITERAL, value: ' from ' });
      expect(ast.elements[3]).toEqual({ type: NodeType.ARGUMENT, name: 'sender' });
    });

    it('should parse complex nested message', () => {
      const ast = parse('{gender, select, male {He sent you {count, plural, one {# message} other {# messages}}} female {She sent you {count, plural, one {# message} other {# messages}}}}');
      expect(ast.elements[0].type).toBe(NodeType.SELECT);
    });
  });
});
