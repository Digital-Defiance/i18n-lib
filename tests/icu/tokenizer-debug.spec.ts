import { Tokenizer } from '../../src/icu/tokenizer';

import { Tokenizer } from '../../src/icu/tokenizer';

describe('Tokenizer Debug', () => {
  it('should tokenize nested plural in select', () => {
    const input = '{gender, select, male {{count, plural, one {# item} other {# items}}}}';  
    const tokenizer = new Tokenizer(input);
    const tokens = tokenizer.tokenize();
    
    console.log('\nInput:', input);
    console.log('\nTokens (first 30):');
    tokens.slice(0, 30).forEach((t, i) => {
      console.log(`${i}: ${t.type.padEnd(15)} "${t.value}" @${t.position}`);
    });
  });
});
