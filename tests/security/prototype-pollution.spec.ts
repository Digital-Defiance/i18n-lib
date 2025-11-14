import { I18nBuilder } from '../../src/builders/i18n-builder';

describe('Security: Prototype Pollution', () => {
  let engine: any;

  beforeEach(() => {
    engine = I18nBuilder.create()
      .withLanguages([{ id: 'en-US', name: 'English', isDefault: true }])
      .isolated()
      .build();
    
    engine.register({
      id: 'test',
      strings: {
        'en-US': { greeting: 'Hello {name}' },
      },
    });
  });

  afterEach(() => {
    engine = null;
  });

  it('should reject __proto__ in variables from JSON', () => {
    const vars = JSON.parse('{"__proto__": {"polluted": true}}');
    expect(() => engine.t('Hello {name}', vars)).toThrow();
  });

  it('should reject constructor in variables from JSON', () => {
    const vars = JSON.parse('{"constructor": {"polluted": true}}');
    expect(() => engine.t('Hello {name}', vars)).toThrow();
  });

  it('should reject prototype in variables from JSON', () => {
    const vars = JSON.parse('{"prototype": {"polluted": true}}');
    expect(() => engine.t('Hello {name}', vars)).toThrow();
  });

  it('should not pollute Object.prototype via mergeConstants', () => {
    const constants = JSON.parse('{"__proto__": {"isAdmin": true}}');
    expect(() => engine.mergeConstants(constants)).toThrow();
    expect((({} as any).isAdmin)).toBeUndefined();
  });

  it('should not pollute Object.prototype via updateConstants', () => {
    const constants = JSON.parse('{"__proto__": {"isAdmin": true}}');
    expect(() => engine.updateConstants(constants)).toThrow();
    expect((({} as any).isAdmin)).toBeUndefined();
  });

  it('should filter dangerous keys from variables', () => {
    const vars = JSON.parse('{"name": "World", "__proto__": {"bad": true}}');
    expect(() => engine.t('Hello {name}', vars)).toThrow();
    expect((({} as any).bad)).toBeUndefined();
  });
});
