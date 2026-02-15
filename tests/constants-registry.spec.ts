/**
 * Tests for the ConstantsRegistry and the constants registration system
 * on I18nEngine and createI18nSetup.
 */
import { I18nEngine, I18nBuilder, ConstantsRegistry } from '../src';
import { createI18nStringKeys } from '../src/branded-string-key';
import { createI18nSetup } from '../src/create-i18n-setup';
import type { I18nComponentPackage } from '../src/interfaces/i18n-component-package.interface';

beforeEach(() => {
  I18nEngine.resetAll();
});

describe('ConstantsRegistry', () => {
  let registry: ConstantsRegistry;

  beforeEach(() => {
    registry = new ConstantsRegistry();
  });

  it('should register constants for a component', () => {
    registry.register('my-lib', { Site: 'MySite', Version: '1.0' });
    expect(registry.has('my-lib')).toBe(true);
    expect(registry.get('my-lib')).toEqual({ Site: 'MySite', Version: '1.0' });
  });

  it('should be idempotent on register', () => {
    registry.register('my-lib', { Site: 'First' });
    registry.register('my-lib', { Site: 'Second' });
    expect(registry.get('my-lib')).toEqual({ Site: 'First' });
  });

  it('should detect conflicts between components', () => {
    registry.register('lib-a', { Site: 'SiteA' });
    expect(() => registry.register('lib-b', { Site: 'SiteB' })).toThrow(
      /conflict/i,
    );
  });

  it('should allow same key with same value from different components', () => {
    registry.register('lib-a', { Site: 'Same' });
    expect(() => registry.register('lib-b', { Site: 'Same' })).not.toThrow();
  });

  it('should merge constants via getMerged', () => {
    registry.register('lib-a', { Site: 'MySite' });
    registry.register('lib-b', { Version: '2.0' });
    const merged = registry.getMerged();
    expect(merged).toEqual({ Site: 'MySite', Version: '2.0' });
  });

  it('should resolve ownership', () => {
    registry.register('lib-a', { Site: 'MySite' });
    expect(registry.resolveOwner('Site')).toBe('lib-a');
    expect(registry.resolveOwner('Unknown')).toBeNull();
  });

  it('should update constants by merging', () => {
    registry.register('my-lib', { Site: 'Old', Version: '1.0' });
    registry.update('my-lib', { Site: 'New' });
    expect(registry.get('my-lib')).toEqual({ Site: 'New', Version: '1.0' });
  });

  it('should update constants for unregistered component', () => {
    registry.update('new-lib', { Site: 'Fresh' });
    expect(registry.has('new-lib')).toBe(true);
    expect(registry.get('new-lib')).toEqual({ Site: 'Fresh' });
  });

  it('should transfer ownership on update', () => {
    registry.register('lib-a', { Site: 'Old' });
    expect(registry.resolveOwner('Site')).toBe('lib-a');
    registry.update('lib-b', { Site: 'Override' });
    expect(registry.resolveOwner('Site')).toBe('lib-b');
  });

  it('should replace constants fully', () => {
    registry.register('my-lib', { Site: 'Old', Version: '1.0' });
    registry.replace('my-lib', { NewKey: 'NewVal' });
    expect(registry.get('my-lib')).toEqual({ NewKey: 'NewVal' });
    expect(registry.resolveOwner('Site')).toBeNull();
    expect(registry.resolveOwner('NewKey')).toBe('my-lib');
  });

  it('should return all entries', () => {
    registry.register('a', { x: 1 });
    registry.register('b', { y: 2 });
    const all = registry.getAll();
    expect(all).toHaveLength(2);
    expect(all.map((e) => e.componentId).sort()).toEqual(['a', 'b']);
  });

  it('should clear all registrations', () => {
    registry.register('a', { x: 1 });
    registry.clear();
    expect(registry.has('a')).toBe(false);
    expect(registry.getAll()).toHaveLength(0);
  });
});

describe('I18nEngine constants registration', () => {
  it('should register and use constants in translations', () => {
    const engine = I18nBuilder.create()
      .withLanguages([
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ])
      .build();

    engine.register({
      id: 'app',
      strings: { 'en-US': { greeting: 'Welcome to {Site}' } },
    });

    engine.registerConstants('app', { Site: 'TestSite' });
    expect(engine.translate('app', 'greeting')).toBe('Welcome to TestSite');
  });

  it('should allow updateConstants to override library defaults', () => {
    const engine = I18nBuilder.create()
      .withLanguages([
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ])
      .build();

    engine.register({
      id: 'app',
      strings: { 'en-US': { title: '{Site} - {SiteTagline}' } },
    });

    // Library registers defaults
    engine.registerConstants('suite-core', {
      Site: 'New Site',
      SiteTagline: 'Default Tagline',
    });
    expect(engine.translate('app', 'title')).toBe('New Site - Default Tagline');

    // App overrides at runtime
    engine.updateConstants('suite-core', {
      Site: 'My Real Site',
      SiteTagline: 'Real Tagline',
    });
    expect(engine.translate('app', 'title')).toBe(
      'My Real Site - Real Tagline',
    );
  });

  it('should report hasConstants correctly', () => {
    const engine = I18nBuilder.create()
      .withLanguages([
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ])
      .build();

    expect(engine.hasConstants('my-comp')).toBe(false);
    engine.registerConstants('my-comp', { key: 'val' });
    expect(engine.hasConstants('my-comp')).toBe(true);
  });

  it('should resolve constant ownership', () => {
    const engine = I18nBuilder.create()
      .withLanguages([
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ])
      .build();

    engine.registerConstants('lib-a', { Site: 'A' });
    expect(engine.resolveConstantOwner('Site')).toBe('lib-a');
    expect(engine.resolveConstantOwner('Unknown')).toBeNull();
  });

  it('should return all registered constants', () => {
    const engine = I18nBuilder.create()
      .withLanguages([
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ])
      .build();

    engine.registerConstants('a', { x: 1 });
    engine.registerConstants('b', { y: 2 });
    const all = engine.getAllConstants();
    const componentIds = all.map((e) => e.componentId);
    expect(componentIds).toContain('a');
    expect(componentIds).toContain('b');
  });
});

describe('createI18nSetup constants flow', () => {
  it('should register library component constants', () => {
    const LibKeys = createI18nStringKeys('test-lib', {
      Greeting: 'test-lib.greeting',
    } as const);

    const libPkg: I18nComponentPackage = {
      config: {
        id: 'test-lib',
        strings: { 'en-US': { 'test-lib.greeting': 'Hello from {Site}' } },
      },
      stringKeyEnum: LibKeys,
      constants: { Site: 'LibDefault', LibVersion: '1.0' },
    };

    const AppKeys = createI18nStringKeys('test-app', {
      Welcome: 'test-app.welcome',
    } as const);

    const result = createI18nSetup({
      componentId: 'test-app',
      stringKeyEnum: AppKeys,
      strings: { 'en-US': { 'test-app.welcome': 'Welcome to {Site}' } },
      instanceKey: 'constants-flow-test',
      libraryComponents: [libPkg],
      constants: { Site: 'RealSite', AppSpecific: 'yes' },
    });

    // App constants should override library defaults
    expect(result.translate(AppKeys.Welcome)).toBe('Welcome to RealSite');
    // Library template should also get the app's override
    expect(result.engine.translateStringKey(LibKeys.Greeting)).toBe(
      'Hello from RealSite',
    );

    result.reset();
  });

  it('should work when library has no constants', () => {
    const LibKeys = createI18nStringKeys('no-const-lib', {
      Msg: 'no-const-lib.msg',
    } as const);

    const libPkg: I18nComponentPackage = {
      config: {
        id: 'no-const-lib',
        strings: { 'en-US': { 'no-const-lib.msg': 'Static message' } },
      },
      stringKeyEnum: LibKeys,
    };

    const AppKeys = createI18nStringKeys('no-const-app', {
      Hello: 'no-const-app.hello',
    } as const);

    const result = createI18nSetup({
      componentId: 'no-const-app',
      stringKeyEnum: AppKeys,
      strings: { 'en-US': { 'no-const-app.hello': 'Hi' } },
      instanceKey: 'no-const-test',
      libraryComponents: [libPkg],
    });

    expect(result.translate(AppKeys.Hello)).toBe('Hi');
    result.reset();
  });

  it('should expose registerConstants and updateConstants on result', () => {
    const AppKeys = createI18nStringKeys('dynamic-app', {
      Title: 'dynamic-app.title',
    } as const);

    const result = createI18nSetup({
      componentId: 'dynamic-app',
      stringKeyEnum: AppKeys,
      strings: { 'en-US': { 'dynamic-app.title': '{Site} Dashboard' } },
      instanceKey: 'dynamic-const-test',
    });

    // No constants yet — template variable stays unreplaced
    expect(result.translate(AppKeys.Title)).toBe('{Site} Dashboard');

    // Register constants dynamically
    result.registerConstants('dynamic-app', { Site: 'DynSite' });
    expect(result.translate(AppKeys.Title)).toBe('DynSite Dashboard');

    // Update to override
    result.updateConstants('dynamic-app', { Site: 'UpdatedSite' });
    expect(result.translate(AppKeys.Title)).toBe('UpdatedSite Dashboard');

    result.reset();
  });
});

describe('II18nConstants interface acceptance', () => {
  beforeEach(() => {
    I18nEngine.resetAll();
  });

  it('should accept an interface-typed constants object (not just plain objects)', () => {
    // Simulates what consuming packages do: define an interface extending II18nConstants
    interface IMyAppConstants extends II18nConstants {
      Site: string;
      Version: number;
    }

    const constants: IMyAppConstants = { Site: 'TestApp', Version: 42 };

    const engine = I18nBuilder.create()
      .withLanguages([
        { id: 'en-US', name: 'English', code: 'en-US', isDefault: true },
      ])
      .build();

    engine.register({
      id: 'typed-app',
      strings: { 'en-US': { greeting: 'Welcome to {Site} v{Version}' } },
    });

    // This must compile — II18nConstants has an index signature so interfaces extending it work
    engine.registerConstants<IMyAppConstants>('typed-app', constants);
    expect(engine.translate('typed-app', 'greeting')).toBe(
      'Welcome to TestApp v42',
    );
  });

  it('should accept constants via createI18nSetup with typed interface', () => {
    interface ILibConstants extends II18nConstants {
      LibName: string;
      LibVersion: string;
    }

    const LibKeys = createI18nStringKeys('typed-lib', {
      Info: 'typed-lib.info',
    } as const);

    const libConstants: ILibConstants = {
      LibName: 'TypedLib',
      LibVersion: '2.0',
    };

    const libPkg: I18nComponentPackage = {
      config: {
        id: 'typed-lib',
        strings: {
          'en-US': { 'typed-lib.info': '{LibName} v{LibVersion}' },
        },
      },
      stringKeyEnum: LibKeys,
      constants: libConstants,
    };

    const AppKeys = createI18nStringKeys('typed-consumer', {
      Msg: 'typed-consumer.msg',
    } as const);

    const result = createI18nSetup({
      componentId: 'typed-consumer',
      stringKeyEnum: AppKeys,
      strings: { 'en-US': { 'typed-consumer.msg': 'Using {LibName}' } },
      instanceKey: 'typed-interface-test',
      libraryComponents: [libPkg],
    });

    expect(result.engine.translateStringKey(LibKeys.Info)).toBe(
      'TypedLib v2.0',
    );
    expect(result.translate(AppKeys.Msg)).toBe('Using TypedLib');

    result.reset();
  });
});
