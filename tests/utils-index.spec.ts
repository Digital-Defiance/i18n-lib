/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-empty-object-type, import/order, prettier/prettier */

import { CurrencyCode, getCurrencyFormat } from '../src/utils/currency';
import { replaceVariables } from '../src/utils/string-utils';
import { Timezone, isValidTimezone } from '../src/utils/timezone';

describe('utils/index', () => {
  it('should export string-utils', () => {
    expect(replaceVariables).toBeDefined();
  });

  it('should export currency', () => {
    expect(CurrencyCode).toBeDefined();
    expect(getCurrencyFormat).toBeDefined();
  });

  it('should export timezone', () => {
    expect(Timezone).toBeDefined();
    expect(isValidTimezone).toBeDefined();
  });
});
