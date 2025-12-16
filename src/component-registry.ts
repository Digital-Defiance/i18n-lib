/**
 * Component registry for managing internationalization components and their string translations
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ComponentDefinition } from './component-definition';
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
import { ValidationResult } from './validation-result';

/**
 * Registry for managing components and their translations
 */
export class ComponentRegistry<TLanguages extends string> {
  private readonly components = new Map<string, ComponentDefinition<string>>();
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
   * Register a new component with its translations.
   * @param registration - Component registration payload.
   * @returns ValidationResult indicating success or errors.
   * @throws RegistryError if component is already registered or validation fails.
   */
  public registerComponent<TStringKeys extends string>(
    registration: ComponentRegistration<TStringKeys, TLanguages>,
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

    // Validate the registration
    const validationResult = this.validateComponentRegistration(registration);

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
    this.components.set(component.id, component);
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

    const registration: ComponentRegistration<TStringKeys, TLanguages> = {
      component: component as ComponentDefinition<TStringKeys>,
      strings,
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
        component as ComponentDefinition<TStringKeys>,
        updatedStrings,
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
  public getComponents(): ReadonlyArray<ComponentDefinition<string>> {
    return Array.from(this.components.values());
  }

  /**
   * Get a specific component by ID.
   * @param componentId - The ID of the component to retrieve.
   * @returns The ComponentDefinition or undefined if not found.
   */
  public getComponent<TStringKeys extends string>(
    componentId: string,
  ): ComponentDefinition<TStringKeys> | undefined {
    return this.components.get(componentId) as
      | ComponentDefinition<TStringKeys>
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
  private validateComponentRegistration<TStringKeys extends string>(
    registration: ComponentRegistration<TStringKeys, TLanguages>,
  ): ValidationResult {
    const { component, strings } = registration;
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
        for (const stringKey of component.stringKeys) {
          missingKeys.push({
            languageId,
            componentId: component.id,
            stringKey,
          });
        }
        continue;
      }

      // Check individual string keys
      for (const stringKey of component.stringKeys) {
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
  private completeStringsWithFallbacks<TStringKeys extends string>(
    component: ComponentDefinition<TStringKeys>,
    strings: PartialComponentLanguageStrings<TStringKeys, TLanguages>,
  ): ComponentLanguageStrings<TStringKeys, TLanguages> {
    const result: Partial<{
      [L in TLanguages]: ComponentStrings<TStringKeys>;
    }> = {};
    const fallbackLanguage = this.validationConfig
      .fallbackLanguageId as TLanguages;
    const fallbackStrings = strings[fallbackLanguage];

    // Ensure all languages have all required keys
    for (const languageId of this.registeredLanguages) {
      const existingLanguageStrings =
        strings[languageId] || ({} as PartialComponentStrings<TStringKeys>);
      const languageStrings: Partial<{ [K in TStringKeys]: string }> = {};

      for (const stringKey of component.stringKeys) {
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
}
