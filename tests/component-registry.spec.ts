import { ComponentRegistration } from '../src/component-registration';
import { ComponentRegistry } from '../src/component-registry';
import { RegistryError } from '../src/registry-error';
import { ValidationConfig } from '../src/validation-config';

enum TestStringKey {
  Hello = 'hello',
  Goodbye = 'goodbye',
  Template = 'template',
}

const validationConfig: ValidationConfig = {
  requireCompleteStrings: false,
  allowPartialRegistration: true,
  fallbackLanguageId: 'en',
};

describe('ComponentRegistry', () => {
  let registry: ComponentRegistry<'en' | 'fr'>;

  beforeEach(() => {
    registry = new ComponentRegistry(['en', 'fr'], validationConfig);
  });

  it('should register a component', () => {
    const registration: ComponentRegistration<TestStringKey, 'en' | 'fr'> = {
      component: {
        id: 'test',
        name: 'Test Component',
        stringKeys: [TestStringKey.Hello],
      },
      strings: {
        en: { [TestStringKey.Hello]: 'Hello' },
        fr: { [TestStringKey.Hello]: 'Bonjour' },
      },
    };

    const result = registry.registerComponent(registration);
    expect(result.isValid).toBe(true);
    expect(registry.hasComponent('test')).toBe(true);
  });

  it('should throw on duplicate component', () => {
    const registration: ComponentRegistration<TestStringKey, 'en' | 'fr'> = {
      component: {
        id: 'test',
        name: 'Test',
        stringKeys: [TestStringKey.Hello],
      },
      strings: { en: { [TestStringKey.Hello]: 'Hello' } },
    };

    registry.registerComponent(registration);
    expect(() => registry.registerComponent(registration)).toThrow(
      RegistryError,
    );
  });

  it('should get translation', () => {
    const registration: ComponentRegistration<TestStringKey, 'en' | 'fr'> = {
      component: {
        id: 'test',
        name: 'Test',
        stringKeys: [TestStringKey.Hello],
      },
      strings: {
        en: { [TestStringKey.Hello]: 'Hello' },
        fr: { [TestStringKey.Hello]: 'Bonjour' },
      },
    };

    registry.registerComponent(registration);
    const response = registry.getTranslation({
      componentId: 'test',
      stringKey: TestStringKey.Hello,
      language: 'en',
    });

    expect(response.translation).toBe('Hello');
    expect(response.actualLanguage).toBe('en');
    expect(response.wasFallback).toBe(false);
  });

  it('should use fallback language', () => {
    const registration: ComponentRegistration<TestStringKey, 'en' | 'fr'> = {
      component: {
        id: 'test',
        name: 'Test',
        stringKeys: [TestStringKey.Hello],
      },
      strings: { en: { [TestStringKey.Hello]: 'Hello' } },
    };

    registry.registerComponent(registration);
    const response = registry.getTranslation({
      componentId: 'test',
      stringKey: TestStringKey.Hello,
      language: 'fr',
    });

    expect(response.translation).toBe('Hello');
    expect(response.actualLanguage).toBe('fr');
    expect(response.wasFallback).toBe(false);
  });

  it('should replace variables in template', () => {
    const registration: ComponentRegistration<TestStringKey, 'en' | 'fr'> = {
      component: {
        id: 'test',
        name: 'Test',
        stringKeys: [TestStringKey.Template],
      },
      strings: { en: { [TestStringKey.Template]: 'Hello {name}' } },
    };

    registry.registerComponent(registration);
    const response = registry.getTranslation({
      componentId: 'test',
      stringKey: TestStringKey.Template,
      language: 'en',
      variables: { name: 'World' },
    });

    expect(response.translation).toBe('Hello World');
  });

  it('should replace constants in template', () => {
    const constants = { Site: 'MyApp.com' };
    const registryWithConstants = new ComponentRegistry(['en'], validationConfig, constants);
    
    const registration: ComponentRegistration<TestStringKey, 'en'> = {
      component: {
        id: 'test',
        name: 'Test',
        stringKeys: [TestStringKey.Template],
      },
      strings: { en: { [TestStringKey.Template]: 'Welcome to {Site}' } },
    };

    registryWithConstants.registerComponent(registration);
    const response = registryWithConstants.getTranslation({
      componentId: 'test',
      stringKey: TestStringKey.Template,
      language: 'en',
    });

    expect(response.translation).toBe('Welcome to MyApp.com');
  });

  it('should prioritize variables over constants', () => {
    const constants = { name: 'Constant' };
    const registryWithConstants = new ComponentRegistry(['en'], validationConfig, constants);
    
    const registration: ComponentRegistration<TestStringKey, 'en'> = {
      component: {
        id: 'test',
        name: 'Test',
        stringKeys: [TestStringKey.Template],
      },
      strings: { en: { [TestStringKey.Template]: 'Hello {name}' } },
    };

    registryWithConstants.registerComponent(registration);
    const response = registryWithConstants.getTranslation({
      componentId: 'test',
      stringKey: TestStringKey.Template,
      language: 'en',
      variables: { name: 'Variable' },
    });

    expect(response.translation).toBe('Hello Variable');
  });

  it('should update component strings', () => {
    const registration: ComponentRegistration<TestStringKey, 'en' | 'fr'> = {
      component: {
        id: 'test',
        name: 'Test',
        stringKeys: [TestStringKey.Hello],
      },
      strings: { en: { [TestStringKey.Hello]: 'Hello' } },
    };

    registry.registerComponent(registration);
    registry.updateComponentStrings('test', {
      en: { [TestStringKey.Hello]: 'Hi' },
    });

    const response = registry.getTranslation({
      componentId: 'test',
      stringKey: TestStringKey.Hello,
      language: 'en',
    });

    expect(response.translation).toBe('Hi');
  });

  it('should throw when component not found', () => {
    expect(() =>
      registry.getTranslation({
        componentId: 'nonexistent',
        stringKey: TestStringKey.Hello,
        language: 'en',
      }),
    ).toThrow(RegistryError);
  });

  it('should get all components', () => {
    const registration: ComponentRegistration<TestStringKey, 'en' | 'fr'> = {
      component: {
        id: 'test',
        name: 'Test',
        stringKeys: [TestStringKey.Hello],
      },
      strings: { en: { [TestStringKey.Hello]: 'Hello' } },
    };

    registry.registerComponent(registration);
    const components = registry.getComponents();
    expect(components).toHaveLength(1);
    expect(components[0].id).toBe('test');
  });

  it('should clear all components', () => {
    const registration: ComponentRegistration<TestStringKey, 'en' | 'fr'> = {
      component: {
        id: 'test',
        name: 'Test',
        stringKeys: [TestStringKey.Hello],
      },
      strings: { en: { [TestStringKey.Hello]: 'Hello' } },
    };

    registry.registerComponent(registration);
    registry.clearAllComponents();
    expect(registry.hasComponent('test')).toBe(false);
  });
});
