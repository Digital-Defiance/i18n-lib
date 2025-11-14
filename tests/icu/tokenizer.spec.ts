import { Tokenizer, TokenType } from '../../src/icu/tokenizer';

describe('ICU Tokenizer', () => {
  it('should tokenize simple plural', () => {
    const tokenizer = new Tokenizer('{count, plural, one {# item} other {# items}}');
    const tokens = tokenizer.tokenize();
    
    console.log('Tokens:', tokens.map(t => ({ type: t.type, value: t.value })));
    
    expect(tokens[0].type).toBe(TokenType.OPEN_BRACE);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].value).toBe('count');
  });
});
