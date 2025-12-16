/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { withConsoleMocks } from '@digitaldefiance/express-suite-test-utils';
import { Tokenizer } from '../../src/icu/tokenizer';

describe('Tokenizer Debug', () => {
  it('should tokenize nested plural in select', async () => {
    await withConsoleMocks({ mute: true }, () => {
      const input =
        '{gender, select, male {{count, plural, one {# item} other {# items}}}}';
      const tokenizer = new Tokenizer(input);
      const tokens = tokenizer.tokenize();

      console.log('\nInput:', input);
      console.log('\nTokens (first 30):');
      tokens.slice(0, 30).forEach((t, i) => {
        console.log(`${i}: ${t.type.padEnd(15)} "${t.value}" @${t.position}`);
      });
    });
  });
});
