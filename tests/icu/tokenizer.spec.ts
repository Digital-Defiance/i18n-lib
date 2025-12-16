/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { withConsoleMocks } from '@digitaldefiance/express-suite-test-utils';
import { Tokenizer, TokenType } from '../../src/icu/tokenizer';

describe('ICU Tokenizer', () => {
  it('should tokenize simple plural', async () => {
    await withConsoleMocks({ mute: true }, () => {
      const tokenizer = new Tokenizer(
        '{count, plural, one {# item} other {# items}}',
      );
      const tokens = tokenizer.tokenize();

      console.log(
        'Tokens:',
        tokens.map((t) => ({ type: t.type, value: t.value })),
      );

      expect(tokens[0].type).toBe(TokenType.OPEN_BRACE);
      expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1].value).toBe('count');
    });
  });
});
