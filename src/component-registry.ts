/**
 * Component registry for managing internationalization components and their string translations
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  AnyBrandedEnum,
  BrandedEnumValue,
} from '@digitaldefiance/branded-enum';
import {
  ComponentDefinition,
  getComponentStringKeys,
} from './component-definition';
import { ComponentRegistration } from './component-registration';
import { RegistryError } from './registry-error';
import { RegistryErrorType } from './registry-error-type';
import { TranslationRequest } from './translation-request';
import { TranslationResponse } from './translation-response';
import {
  ComponentLanguageStrings,
  ComponentStrings,
  PartialComponentLanguageStrings,
  PartialComponentStrings,
} from './types';
import { isTemplate, replaceVariables } from './utils';
import { ValidationConfig } from './validation-config';
import { ValidationResult, CollisionWarning } from './validation-result';

/**
 * Registry for managing components and their translations
 */
export class ComponentRegistry<TLanguages extends string> {
  private readonly components = new Map<
    string,
    ComponentDefinition<AnyBrandedEnum>
  >();
  private readonly componentStrings = new Map<
    string,
    ComponentLanguageStrings<string, TLanguages>
  >();
  private readonly validationConfig: ValidationConfig;
  private readonly registeredLanguages: Set<TLanguages>;
  private readonly constants?: Record<string, any>;

  /**
   * Creates a new ComponentRegistry.
   * @param languages - Array of supported language codes.
   * @param validationConfig - Configuration for validation rules.
   * @param constants - Optional constants for variable replacement in templates.
   */
  constructor(
    languages: readonly TLanguages[],
    validationConfig: ValidationConfig,
    constants?: Record<string, any>,
  ) {
    this.registeredLanguages = new Set(languages);
    this.validationConfig = validationConfig;
    this.constants = constants;
  }

  /**
   * Update the set of registered languages (for dynamic language addition).
   * @param languages - Array of language codes to register.
   */
  public updateRegisteredLanguages(languages: readonly TLanguages[]): void {
    this.registeredLanguages.clear();
    languages.forEach((lang) => this.registeredLanguages.add(lang));
  }

  /**
   * Register a new component with its translations using branded string keys.
   *
   * @param registration - Component registration payload.
   * @returns ValidationResult indicating success or errors, including collision warnings.
   * @throws RegistryError if component is already registered or validation fails.
   */
  public registerComponent<TBrandedEnum extends AnyBrandedEnum>(
    registration: ComponentRegistration<TBrandedEnum, TLanguages>,
  ): ValidationResult {
    const { component, strings } = registration;

    // Check for duplicate component
    if (this.components.has(component.id)) {
      throw RegistryError.createSimple(
        RegistryErrorType.DuplicateComponent,
        `Component '${component.id}' is already registered`,
        { componentId: component.id },
      );
    }

    // Get string key values from branded enum
    const stringKeyValues = getComponentStringKeys(component);

    // Check for string key collisions with existing components
    const collisionWarnings = this.checkForCollisions(
      stringKeyValues,
      component.id,
    );

    // Validate the registration
    const validationResult = this.validateComponentRegistration(registration);

    // Add collision warnings to the result
    if (collisionWarnings.length > 0) {
      validationResult.collisionWarnings = collisionWarnings;
    }

    if (
      !validationResult.isValid &&
      !this.validationConfig.allowPartialRegistration
    ) {
      throw RegistryError.createSimple(
        RegistryErrorType.ValidationFailed,
        `Component registration validation failed: ${validationResult.errors.join(
          ', ',
        )}`,
        {
          componentId: component.id,
          missingKeys: validationResult.missingKeys,
          errors: validationResult.errors,
        },
      );
    }

    // Complete missing strings with fallbacks if partial registration is allowed
    const completeStrings = this.completeStringsWithFallbacks(
      component,
      strings,
    );

    // Register the component
    this.components.set(
      component.id,
      component as ComponentDefinition<AnyBrandedEnum>,
    );
    this.componentStrings.set(component.id, completeStrings);

    return validationResult;
  }

  /**
   * Update strings for an existing component.
   * @param componentId - The ID of the component to update.
   * @param strings - Partial strings to update.
   * @returns ValidationResult indicating success or errors.
   * @throws RegistryError if component is not found.
   */
  public updateComponentStrings<TStringKeys extends string>(
    componentId: string,
    strings: PartialComponentLanguageStrings<TStringKeys, TLanguages>,
  ): ValidationResult {
    const component = this.components.get(componentId);
    if (!component) {
      throw RegistryError.createSimple(
        RegistryErrorType.ComponentNotFound,
        `Component with ID '${componentId}' not found`,
        { componentId },
      );
    }

    // Create a synthetic registration for validation
    const registration: ComponentRegistration<
      typeof component.stringKeys,
      TLanguages
    > = {
      component,
      strings: strings as PartialComponentLanguageStrings<
        BrandedEnumValue<typeof component.stringKeys>,
        TLanguages
      >,
    };

    const validationResult = this.validateComponentRegistration(registration);

    if (
      validationResult.isValid ||
      this.validationConfig.allowPartialRegistration
    ) {
      const existingStrings =
        this.componentStrings.get(componentId) ||
        ({} as ComponentLanguageStrings<TStringKeys, TLanguages>);
      const updatedStrings = this.mergeStrings(existingStrings, strings);
      const completeStrings = this.completeStringsWithFallbacks(
        component,
        updatedStrings as PartialComponentLanguageStrings<
          BrandedEnumValue<typeof component.stringKeys>,
          TLanguages
        >,
      );

      this.componentStrings.set(componentId, completeStrings);
    }

    return validationResult;
  }

  /**
   * Get a translation for a specific component, string key, and language.
   * @param request - Translation request containing componentId, stringKey, language, and variables.
   * @returns TranslationResponse with the translated string and metadata.
   * @throws RegistryError if component, language, or string key is not found.
   */
  public getTranslation<TStringKeys extends string>(
    request: TranslationRequest<TStringKeys, TLanguages>,
  ): TranslationResponse {
    const { componentId, stringKey, language, variables } = request;

    // Check if component exists
    if (!this.components.has(componentId)) {
      throw RegistryError.createSimple(
        RegistryErrorType.ComponentNotFound,
        `Component '${componentId}' not found`,
        { componentId },
      );
    }

    const componentStrings = this.componentStrings.get(componentId);
    if (!componentStrings) {
      throw RegistryError.createSimple(
        RegistryErrorType.StringKeyNotFound,
        `No strings registered for component '${componentId}'`,
        { componentId },
      );
    }

    const targetLanguage =
      language || (this.validationConfig.fallbackLanguageId as TLanguages);
    let actualLanguage = targetLanguage;
    let wasFallback = false;

    // Try to get the string in the requested language
    let languageStrings = componentStrings[targetLanguage];

    // If not found and different from fallback, try fallback language
    if (
      !languageStrings &&
      targetLanguage !== this.validationConfig.fallbackLanguageId
    ) {
      languageStrings =
        componentStrings[
          this.validationConfig.fallbackLanguageId as TLanguages
        ];
      actualLanguage = this.validationConfig.fallbackLanguageId as TLanguages;
      wasFallback = true;
    }

    if (!languageStrings) {
      throw RegistryError.createSimple(
        RegistryErrorType.LanguageNotFound,
        `No strings found for language '${targetLanguage}' in component '${componentId}'`,
        { componentId, language: targetLanguage },
      );
    }

    const translation = languageStrings[stringKey];
    if (!translation) {
      throw RegistryError.createSimple(
        RegistryErrorType.StringKeyNotFound,
        `String key '${stringKey}' not found for component '${componentId}' in language '${actualLanguage}'`,
        { componentId, stringKey, language: actualLanguage },
      );
    }

    // Process variables if the string key indicates it's a template
    let processedTranslation: string = translation;
    if (isTemplate(stringKey)) {
      processedTranslation = replaceVariables(
        translation,
        variables,
        this.constants,
      );
    }

    return {
      translation: processedTranslation,
      actualLanguage,
      wasFallback,
    };
  }

  /**
   * Get all registered components.
   * @returns Array of all registered ComponentDefinition objects.
   */
  public getComponents(): ReadonlyArray<ComponentDefinition<AnyBrandedEnum>> {
    return Array.from(this.components.values());
  }

  /**
   * Get a specific component by ID.
   * @param componentId - The ID of the component to retrieve.
   * @returns The ComponentDefinition or undefined if not found.
   */
  public getComponent<TBrandedEnum extends AnyBrandedEnum>(
    componentId: string,
  ): ComponentDefinition<TBrandedEnum> | undefined {
    return this.components.get(componentId) as
      | ComponentDefinition<TBrandedEnum>
      | undefined;
  }

  /**
   * Check if a component is registered.
   * @param componentId - The ID of the component to check.
   * @returns True if the component is registered, false otherwise.
   */
  public hasComponent(componentId: string): boolean {
    return this.components.has(componentId);
  }

  /**
   * Get all strings for a component in all languages.
   * @param componentId - The ID of the component.
   * @returns ComponentLanguageStrings or undefined if not found.
   */
  public getComponentStrings<TStringKeys extends string>(
    componentId: string,
  ): ComponentLanguageStrings<TStringKeys, TLanguages> | undefined {
    return this.componentStrings.get(componentId) as
      | ComponentLanguageStrings<TStringKeys, TLanguages>
      | undefined;
  }

  /**
   * Validate a component registration.
   * @param registration - Component registration to validate.
   * @returns ValidationResult with details of missing keys and errors.
   */
  private validateComponentRegistration<TBrandedEnum extends AnyBrandedEnum>(
    registration: ComponentRegistration<TBrandedEnum, TLanguages>,
  ): ValidationResult {
    const { component, strings } = registration;
    const stringKeyValues = getComponentStringKeys(component);
    const missingKeys: Array<{
      languageId: string;
      componentId: string;
      stringKey: string;
    }> = [];
    const errors: string[] = [];

    // Check if all required string keys are provided for each language
    for (const languageId of this.registeredLanguages) {
      const languageStrings = strings[languageId];

      if (!languageStrings) {
        if (this.validationConfig.requireCompleteStrings) {
          errors.push(
            `Missing all strings for language '${languageId}' in component '${component.id}'`,
          );
        }
        // Add all missing keys for this language
        for (const stringKey of stringKeyValues) {
          missingKeys.push({
            languageId,
            componentId: component.id,
            stringKey,
          });
        }
        continue;
      }

      // Check individual string keys
      for (const stringKey of stringKeyValues) {
        if (!languageStrings[stringKey]) {
          missingKeys.push({
            languageId,
            componentId: component.id,
            stringKey,
          });

          if (this.validationConfig.requireCompleteStrings) {
            errors.push(
              `Missing string key '${stringKey}' for language '${languageId}' in component '${component.id}'`,
            );
          }
        }
      }
    }

    return {
      isValid: missingKeys.length === 0,
      missingKeys,
      errors,
    };
  }

  /**
   * Complete missing strings with fallbacks.
   * @param component - The component definition.
   * @param strings - Partial strings provided.
   * @returns Complete strings with fallbacks filled in.
   */
  private completeStringsWithFallbacks<TBrandedEnum extends AnyBrandedEnum>(
    component: ComponentDefinition<TBrandedEnum>,
    strings: PartialComponentLanguageStrings<
      BrandedEnumValue<TBrandedEnum>,
      TLanguages
    >,
  ): ComponentLanguageStrings<BrandedEnumValue<TBrandedEnum>, TLanguages> {
    type TStringKeys = BrandedEnumValue<TBrandedEnum>;
    const result: Partial<{
      [L in TLanguages]: ComponentStrings<TStringKeys>;
    }> = {};
    const fallbackLanguage = this.validationConfig
      .fallbackLanguageId as TLanguages;
    const fallbackStrings = strings[fallbackLanguage];
    const stringKeyValues = getComponentStringKeys(component);

    // Ensure all languages have all required keys
    for (const languageId of this.registeredLanguages) {
      const existingLanguageStrings =
        strings[languageId] || ({} as PartialComponentStrings<TStringKeys>);
      const languageStrings: Partial<{ [K in TStringKeys]: string }> = {};

      for (const stringKey of stringKeyValues) {
        if (existingLanguageStrings[stringKey]) {
          languageStrings[stringKey] = existingLanguageStrings[stringKey]!;
        } else if (fallbackStrings && fallbackStrings[stringKey]) {
          // Try to use fallback language
          languageStrings[stringKey] = fallbackStrings[stringKey]!;
        } else {
          // Last resort: use a placeholder
          languageStrings[stringKey] = `[${component.id}.${stringKey}]`;
        }
      }

      result[languageId] = languageStrings as ComponentStrings<TStringKeys>;
    }

    return result as ComponentLanguageStrings<TStringKeys, TLanguages>;
  }

  /**
   * Merge existing strings with new strings.
   * @param existing - Existing complete strings.
   * @param updates - Partial updates to apply.
   * @returns Merged partial strings.
   */
  private mergeStrings<TStringKeys extends string>(
    existing: ComponentLanguageStrings<TStringKeys, TLanguages>,
    updates: PartialComponentLanguageStrings<TStringKeys, TLanguages>,
  ): PartialComponentLanguageStrings<TStringKeys, TLanguages> {
    const result: { [L in TLanguages]?: PartialComponentStrings<TStringKeys> } =
      {};

    // Copy existing strings
    for (const [languageId, languageStrings] of Object.entries(existing) as [
      TLanguages,
      ComponentStrings<TStringKeys>,
    ][]) {
      result[languageId] = { ...languageStrings };
    }

    // Apply updates
    for (const [languageId, languageStrings] of Object.entries(updates) as [
      TLanguages,
      PartialComponentStrings<TStringKeys> | undefined,
    ][]) {
      if (languageStrings) {
        result[languageId] = {
          ...result[languageId],
          ...languageStrings,
        };
      }
    }

    return result;
  }

  /**
   * Clear all components and their strings (useful for testing).
   */
  public clearAllComponents(): void {
    this.components.clear();
    this.componentStrings.clear();
  }

  /**
   * Check for string key collisions with already registered components.
   *
   * @param stringKeys - The string keys to check for collisions
   * @param newComponentId - The ID of the component being registered
   * @returns Array of collision warnings
   */
  private checkForCollisions(
    stringKeys: readonly string[],
    newComponentId: string,
  ): CollisionWarning[] {
    const warnings: CollisionWarning[] = [];

    // Build a map of existing string keys to component IDs
    const existingKeyToComponents = new Map<string, string[]>();

    for (const [componentId, component] of this.components) {
      const keys = getComponentStringKeys(component);
      for (const key of keys) {
        const existing = existingKeyToComponents.get(key) || [];
        existing.push(componentId);
        existingKeyToComponents.set(key, existing);
      }
    }

    // Check the new component's keys for collisions
    for (const key of stringKeys) {
      const existingComponents = existingKeyToComponents.get(key);
      if (existingComponents && existingComponents.length > 0) {
        warnings.push({
          stringKey: key,
          componentIds: [...existingComponents, newComponentId],
          message:
            `String key '${key}' is already registered by component(s): ${existingComponents.join(', ')}. ` +
            `Consider using namespaced keys (e.g., '${newComponentId}.${key}') to avoid conflicts.`,
        });
      }
    }

    return warnings;
  }

  /**
   * Get all components that have a specific string key.
   * Useful for debugging collision issues.
   *
   * @param stringKey - The string key to look up
   * @returns Array of component IDs that have this key
   */
  public getComponentsWithKey(stringKey: string): string[] {
    const componentIds: string[] = [];

    for (const [componentId, component] of this.components) {
      const keys = getComponentStringKeys(component);
      if (keys.includes(stringKey)) {
        componentIds.push(componentId);
      }
    }

    return componentIds;
  }

  /**
   * Check all registered components for collisions.
   * Returns a report of all string keys that appear in multiple components.
   *
   * @returns Map of string keys to component IDs that share them
   */
  public getCollisionReport(): Map<string, string[]> {
    const keyToComponents = new Map<string, string[]>();

    // Collect all keys from all components
    for (const [componentId, component] of this.components) {
      const keys = getComponentStringKeys(component);
      for (const key of keys) {
        const existing = keyToComponents.get(key) || [];
        existing.push(componentId);
        keyToComponents.set(key, existing);
      }
    }

    // Filter to only collisions (more than one component)
    const collisions = new Map<string, string[]>();
    for (const [key, components] of keyToComponents) {
      if (components.length > 1) {
        collisions.set(key, components);
      }
    }

    return collisions;
  }
}
