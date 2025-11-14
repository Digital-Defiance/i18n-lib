import { parse, ParseError } from '../../src/icu/parser';
import { NodeType } from '../../src/icu/ast';

describe('ICU MessageFormat Parser - Comprehensive Tests', () => {
  describe('Real-world messages', () => {
    it('should parse email notification with multiple variables', () => {
      const ast = parse('{sender} sent you {count, plural, one {a message} other {# messages}} at {time, time, short}');
      expect(ast.elements).toHaveLength(5);
      expect(ast.elements[0]).toEqual({ type: NodeType.ARGUMENT, name: 'sender' });
      expect(ast.elements[2].type).toBe(NodeType.PLURAL);
      expect(ast.elements[4]).toEqual({ type: NodeType.ARGUMENT, name: 'time', format: 'time', style: 'short' });
    });

    it('should parse shopping cart message', () => {
      const ast = parse('Your cart has {itemCount, plural, zero {no items} one {# item} other {# items}} totaling {total, number, currency}');
      expect(ast.elements).toHaveLength(4);
      const plural = ast.elements[1] as any;
      expect(plural.cases.zero).toBeDefined();
      expect(plural.cases.one).toBeDefined();
      expect(plural.cases.other).toBeDefined();
    });

    it('should parse deeply nested gender and plural', () => {
      const ast = parse('{gender, select, male {{count, plural, one {He has # item} other {He has # items}}} female {{count, plural, one {She has # item} other {She has # items}}} other {{count, plural, one {They have # item} other {They have # items}}}}');
      const select = ast.elements[0] as any;
      expect(select.type).toBe(NodeType.SELECT);
      expect(select.cases.male.elements[0].type).toBe(NodeType.PLURAL);
      expect(select.cases.female.elements[0].type).toBe(NodeType.PLURAL);
      expect(select.cases.other.elements[0].type).toBe(NodeType.PLURAL);
    });

    it('should parse triple nesting: select > plural > select', () => {
      const ast = parse('{userGender, select, male {{itemCount, plural, one {{itemGender, select, male {his item} female {her item}}} other {{itemGender, select, male {his items} female {her items}}}}} female {{itemCount, plural, one {{itemGender, select, male {his item} female {her item}}} other {{itemGender, select, male {his items} female {her items}}}}}}');
      const outerSelect = ast.elements[0] as any;
      expect(outerSelect.type).toBe(NodeType.SELECT);
      const plural = outerSelect.cases.male.elements[0] as any;
      expect(plural.type).toBe(NodeType.PLURAL);
      const innerSelect = plural.cases.one.elements[0] as any;
      expect(innerSelect.type).toBe(NodeType.SELECT);
    });
  });

  describe('Edge cases with numbers', () => {
    it('should parse plural with zero category', () => {
      const ast = parse('{count, plural, zero {no items} one {one item} other {# items}}');
      const plural = ast.elements[0] as any;
      expect(plural.cases.zero).toBeDefined();
      expect(plural.cases.one).toBeDefined();
      expect(plural.cases.other).toBeDefined();
    });

    it('should parse selectordinal with two category', () => {
      const ast = parse('{place, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}');
      const ordinal = ast.elements[0] as any;
      expect(ordinal.type).toBe(NodeType.SELECTORDINAL);
      expect(ordinal.cases.one).toBeDefined();
      expect(ordinal.cases.two).toBeDefined();
    });

    it('should parse plural with many categories', () => {
      const ast = parse('{count, plural, zero {none} one {# item} two {# items} few {# items} many {# items} other {# items}}');
      const plural = ast.elements[0] as any;
      expect(plural.cases.zero).toBeDefined();
      expect(plural.cases.one).toBeDefined();
      expect(plural.cases.two).toBeDefined();
      expect(plural.cases.few).toBeDefined();
      expect(plural.cases.many).toBeDefined();
      expect(plural.cases.other).toBeDefined();
    });
  });

  describe('Complex formatting', () => {
    it('should parse multiple date/time formats', () => {
      const ast = parse('Event on {date, date, long} at {time, time, short} in {timezone}');
      expect(ast.elements).toHaveLength(6);
      expect(ast.elements[1]).toEqual({ type: NodeType.ARGUMENT, name: 'date', format: 'date', style: 'long' });
      expect(ast.elements[3]).toEqual({ type: NodeType.ARGUMENT, name: 'time', format: 'time', style: 'short' });
      expect(ast.elements[5]).toEqual({ type: NodeType.ARGUMENT, name: 'timezone' });
    });

    it('should parse number with various styles', () => {
      const ast = parse('Price: {price, number, currency}, Discount: {discount, number, percent}, Items: {count, number, integer}');
      expect(ast.elements).toHaveLength(6);
      expect(ast.elements[1]).toEqual({ type: NodeType.ARGUMENT, name: 'price', format: 'number', style: 'currency' });
      expect(ast.elements[3]).toEqual({ type: NodeType.ARGUMENT, name: 'discount', format: 'number', style: 'percent' });
      expect(ast.elements[5]).toEqual({ type: NodeType.ARGUMENT, name: 'count', format: 'number', style: 'integer' });
    });
  });

  describe('Messages with special characters', () => {
    it('should parse message with punctuation', () => {
      const ast = parse('Hello, {name}! How are you? I have {count} items.');
      expect(ast.elements).toHaveLength(5);
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'Hello, ' });
      expect(ast.elements[2]).toEqual({ type: NodeType.LITERAL, value: '! How are you? I have ' });
      expect(ast.elements[4]).toEqual({ type: NodeType.LITERAL, value: ' items.' });
    });

    it('should parse message with quotes and apostrophes', () => {
      const ast = parse("It's {name}'s birthday!");
      expect(ast.elements).toHaveLength(3);
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: "It's " });
      expect(ast.elements[2]).toEqual({ type: NodeType.LITERAL, value: "'s birthday!" });
    });

    it('should parse message with numbers in text', () => {
      const ast = parse('You have 123 items and {count} more');
      expect(ast.elements).toHaveLength(3);
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'You have 123 items and ' });
    });

    it('should parse message with escaped open brace', () => {
      const ast = parse("Use '{' for opening");
      expect(ast.elements).toHaveLength(3);
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'Use ' });
      expect(ast.elements[1]).toEqual({ type: NodeType.LITERAL, value: '{' });
      expect(ast.elements[2]).toEqual({ type: NodeType.LITERAL, value: "' for opening" });
    });
  });

  describe('Select with various cases', () => {
    it('should parse select with many cases', () => {
      const ast = parse('{status, select, pending {Pending} approved {Approved} rejected {Rejected} cancelled {Cancelled} completed {Completed} other {Unknown}}');
      const select = ast.elements[0] as any;
      expect(select.type).toBe(NodeType.SELECT);
      expect(Object.keys(select.cases)).toHaveLength(6);
      expect(select.cases.pending).toBeDefined();
      expect(select.cases.approved).toBeDefined();
      expect(select.cases.rejected).toBeDefined();
      expect(select.cases.cancelled).toBeDefined();
      expect(select.cases.completed).toBeDefined();
      expect(select.cases.other).toBeDefined();
    });

    it('should parse select with underscores and numbers', () => {
      const ast = parse('{user_type_123, select, admin_1 {Admin} user_2 {User} guest_3 {Guest} other {Unknown}}');
      const select = ast.elements[0] as any;
      expect(select.name).toBe('user_type_123');
      expect(select.cases.admin_1).toBeDefined();
      expect(select.cases.user_2).toBeDefined();
      expect(select.cases.guest_3).toBeDefined();
    });
  });

  describe('Plural with all CLDR categories', () => {
    it('should parse plural with all six categories', () => {
      const ast = parse('{count, plural, zero {no items} one {# item} two {# items} few {# items} many {# items} other {# items}}');
      const plural = ast.elements[0] as any;
      expect(plural.type).toBe(NodeType.PLURAL);
      expect(plural.cases.zero).toBeDefined();
      expect(plural.cases.one).toBeDefined();
      expect(plural.cases.two).toBeDefined();
      expect(plural.cases.few).toBeDefined();
      expect(plural.cases.many).toBeDefined();
      expect(plural.cases.other).toBeDefined();
    });

    it('should parse selectordinal with all categories', () => {
      const ast = parse('{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}');
      const ordinal = ast.elements[0] as any;
      expect(ordinal.type).toBe(NodeType.SELECTORDINAL);
      expect(ordinal.cases.one).toBeDefined();
      expect(ordinal.cases.two).toBeDefined();
      expect(ordinal.cases.few).toBeDefined();
      expect(ordinal.cases.other).toBeDefined();
    });
  });

  describe('Whitespace handling', () => {
    it('should handle extra whitespace in format', () => {
      const ast = parse('{  count  ,  plural  ,  one  {  item  }  other  {  items  }  }');
      const plural = ast.elements[0] as any;
      expect(plural.type).toBe(NodeType.PLURAL);
      expect(plural.name).toBe('count');
      expect(plural.cases.one).toBeDefined();
      expect(plural.cases.other).toBeDefined();
    });

    it('should preserve whitespace in message content', () => {
      const ast = parse('{count, plural, one {  item  } other {  items  }}');
      const plural = ast.elements[0] as any;
      expect(plural.cases.one.elements[0].value).toBe('  item  ');
      expect(plural.cases.other.elements[0].value).toBe('  items  ');
    });

    it('should handle newlines in message', () => {
      const ast = parse('Line 1\nLine 2\n{name}\nLine 3');
      expect(ast.elements).toHaveLength(3);
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'Line 1\nLine 2\n' });
      expect(ast.elements[2]).toEqual({ type: NodeType.LITERAL, value: '\nLine 3' });
    });
  });

  describe('Consecutive and mixed constructs', () => {
    it('should parse multiple consecutive arguments', () => {
      const ast = parse('{first}{second}{third}');
      expect(ast.elements).toHaveLength(3);
      expect(ast.elements[0]).toEqual({ type: NodeType.ARGUMENT, name: 'first' });
      expect(ast.elements[1]).toEqual({ type: NodeType.ARGUMENT, name: 'second' });
      expect(ast.elements[2]).toEqual({ type: NodeType.ARGUMENT, name: 'third' });
    });

    it('should parse mixed arguments and plurals', () => {
      const ast = parse('{user} has {count, plural, one {# item} other {# items}} and {points} points');
      expect(ast.elements).toHaveLength(6);
      expect(ast.elements[0]).toEqual({ type: NodeType.ARGUMENT, name: 'user' });
      expect(ast.elements[1]).toEqual({ type: NodeType.LITERAL, value: ' has ' });
      expect(ast.elements[2].type).toBe(NodeType.PLURAL);
      expect(ast.elements[3]).toEqual({ type: NodeType.LITERAL, value: ' and ' });
      expect(ast.elements[4]).toEqual({ type: NodeType.ARGUMENT, name: 'points' });
      expect(ast.elements[5]).toEqual({ type: NodeType.LITERAL, value: ' points' });
    });

    it('should parse multiple plurals in one message', () => {
      const ast = parse('{apples, plural, one {# apple} other {# apples}} and {oranges, plural, one {# orange} other {# oranges}}');
      expect(ast.elements).toHaveLength(3);
      expect(ast.elements[0].type).toBe(NodeType.PLURAL);
      expect(ast.elements[1]).toEqual({ type: NodeType.LITERAL, value: ' and ' });
      expect(ast.elements[2].type).toBe(NodeType.PLURAL);
    });
  });

  describe('Hash placeholder variations', () => {
    it('should parse # at different positions', () => {
      const ast = parse('{count, plural, one {# item total} other {Total: # items}}');
      const plural = ast.elements[0] as any;
      expect(plural.cases.one.elements[0]).toEqual({ type: NodeType.LITERAL, value: '#' });
      expect(plural.cases.one.elements[1]).toEqual({ type: NodeType.LITERAL, value: ' item total' });
      expect(plural.cases.other.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'Total: ' });
      expect(plural.cases.other.elements[1]).toEqual({ type: NodeType.LITERAL, value: '#' });
    });

    it('should parse multiple # in one case', () => {
      const ast = parse('{count, plural, one {# of # items} other {# of # items}}');
      const plural = ast.elements[0] as any;
      expect(plural.cases.one.elements).toHaveLength(4);
      expect(plural.cases.one.elements[0]).toEqual({ type: NodeType.LITERAL, value: '#' });
      expect(plural.cases.one.elements[1]).toEqual({ type: NodeType.LITERAL, value: ' of ' });
      expect(plural.cases.one.elements[2]).toEqual({ type: NodeType.LITERAL, value: '#' });
      expect(plural.cases.one.elements[3]).toEqual({ type: NodeType.LITERAL, value: ' items' });
    });
  });

  describe('Error cases', () => {
    it('should throw on unmatched opening brace', () => {
      expect(() => parse('{name')).toThrow(ParseError);
      expect(() => parse('Hello {name')).toThrow(ParseError);
    });

    it('should handle closing brace in text', () => {
      // Closing brace outside of format is treated as text
      const ast = parse('Hello}');
      expect(ast.elements[0]).toEqual({ type: NodeType.LITERAL, value: 'Hello}' });
    });

    it('should throw on empty argument', () => {
      expect(() => parse('{}')).toThrow(ParseError);
    });

    it('should throw on invalid format', () => {
      expect(() => parse('{name, }')).toThrow(ParseError);
      expect(() => parse('{name, , }')).toThrow(ParseError);
    });

    it('should throw on incomplete plural', () => {
      expect(() => parse('{count, plural}')).toThrow(ParseError);
      expect(() => parse('{count, plural, }')).toThrow(ParseError);
      expect(() => parse('{count, plural, one}')).toThrow(ParseError);
      expect(() => parse('{count, plural, one {}')).toThrow(ParseError);
    });

    it('should throw on incomplete select', () => {
      expect(() => parse('{gender, select}')).toThrow(ParseError);
      expect(() => parse('{gender, select, male}')).toThrow(ParseError);
      expect(() => parse('{gender, select, male {}')).toThrow(ParseError);
    });

    it('should throw on nested unmatched braces', () => {
      expect(() => parse('{gender, select, male {{count, plural, one {item}}')).toThrow(ParseError);
      expect(() => parse('{gender, select, male {{count, plural, one {item}}}')).toThrow(ParseError);
    });
  });
});
