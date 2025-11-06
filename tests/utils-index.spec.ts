import { replaceVariables } from '../src/utils/string-utils';
import { CurrencyCode, getCurrencyFormat } from '../src/utils/currency';
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
