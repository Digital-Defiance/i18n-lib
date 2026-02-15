/**
 * Factory function that creates a complete i18n setup from a config object.
 * Replaces ~200 lines of boilerplate per consumer.
 */

import type {
  AnyBrandedEnum,
  BrandedEnumValue,
} from '@digitaldefiance/branded-enum';
import { I18nEngine } from './core/i18n-engine';
import {
  createCoreComponentRegistration,
  createDefaultLanguages,
} from './core-i18n';
import { GlobalActiveContext } from './global-active-context';
import type { IActiveContext } from './interfaces/active-context.interface';
import type { II18nConstants } from './interfaces/i18n-constants.interface';
import type { I18nSetupConfig } from './interfaces/i18n-setup-config.interface';
import type { I18nSetupResult } from './interfaces/i18n-setup-result.interface';
import { LanguageCodes } from './language-codes';
import type { LanguageContextSpace } from './types';

export function createI18nSetup<TStringKeyEnum extends AnyBrandedEnum>(
  config: I18nSetupConfig & { readonly stringKeyEnum: TStringKeyEnum },
): I18nSetupResult<TStringKeyEnum> {
  const instanceKey = config.instanceKey ?? 'default';
  const defaultLanguage = config.defaultLanguage ?? LanguageCodes.EN_US;

  // 1. Create or reuse engine
  const engine = I18nEngine.registerIfNotExists(
    instanceKey,
    createDefaultLanguages(),
    {
      defaultLanguage,
      // Note: constants are NOT passed to the engine config here.
      // They are registered via the constants registry after library
      // components, so the app's values always override library defaults.
    },
  );

  // 2. Register core component
  const coreReg = createCoreComponentRegistration();
  engine.registerIfNotExists({
    id: coreReg.component.id,
    strings: coreReg.strings as Record<string, Record<string, string>>,
  });

  // 3. Register library components (with their default constants)
  if (config.libraryComponents) {
    for (const pkg of config.libraryComponents) {
      engine.registerIfNotExists(pkg.config);
      if (pkg.stringKeyEnum && !engine.hasStringKeyEnum(pkg.stringKeyEnum)) {
        engine.registerStringKeyEnum(pkg.stringKeyEnum, pkg.config.id);
      }
      if (pkg.constants && !engine.hasConstants(pkg.config.id)) {
        engine.registerConstants(pkg.config.id, pkg.constants);
      }
    }
  }

  // 4. Register app component
  engine.registerIfNotExists({
    id: config.componentId,
    strings: config.strings,
    aliases: config.aliases ? [...config.aliases] : undefined,
  });

  if (!engine.hasStringKeyEnum(config.stringKeyEnum)) {
    engine.registerStringKeyEnum(config.stringKeyEnum);
  }

  // 4b. Register app-level constants as overrides.
  // Uses updateConstants so the app's values (e.g. real Site name) always
  // win over library defaults, regardless of initialization order.
  if (config.constants) {
    engine.updateConstants(config.componentId, config.constants);
  }

  // 5. Initialize GlobalActiveContext
  const globalContext = GlobalActiveContext.getInstance<
    string,
    IActiveContext<string>
  >();
  try {
    globalContext.getContext(config.componentId);
  } catch {
    globalContext.createContext(
      defaultLanguage,
      defaultLanguage,
      config.componentId,
    );
  }

  // 6. Build and return result
  const getActiveContext = () => globalContext.getContext(config.componentId);

  const translate = (
    key: BrandedEnumValue<TStringKeyEnum>,
    variables?: Record<string, string | number>,
    language?: string,
    context?: LanguageContextSpace,
  ): string => {
    const activeCtx = getActiveContext();
    const activeContext = context ?? activeCtx.currentContext;
    const lang =
      language ??
      (activeContext === 'admin'
        ? activeCtx.adminLanguage
        : activeCtx.language);
    return engine.translateStringKey(key, variables, lang);
  };

  const safeTranslate = (
    key: BrandedEnumValue<TStringKeyEnum>,
    variables?: Record<string, string | number>,
    language?: string,
    context?: LanguageContextSpace,
  ): string => {
    const activeCtx = getActiveContext();
    const activeContext = context ?? activeCtx.currentContext;
    const lang =
      language ??
      (activeContext === 'admin'
        ? activeCtx.adminLanguage
        : activeCtx.language);
    return engine.safeTranslateStringKey(key, variables, lang);
  };

  return {
    engine,
    translate,
    safeTranslate,
    get context() {
      return getActiveContext();
    },
    setLanguage: (language: string) =>
      globalContext.setUserLanguage(language, config.componentId),
    setAdminLanguage: (language: string) =>
      globalContext.setAdminLanguage(language, config.componentId),
    setContext: (ctx: LanguageContextSpace) =>
      globalContext.setLanguageContextSpace(ctx, config.componentId),
    getLanguage: () => getActiveContext().language,
    getAdminLanguage: () => getActiveContext().adminLanguage,
    registerConstants: <T extends II18nConstants>(
      componentId: string,
      constants: T,
    ) => engine.registerConstants(componentId, constants),
    updateConstants: <T extends II18nConstants>(
      componentId: string,
      constants: T,
    ) => engine.updateConstants(componentId, constants),
    reset: () => {
      I18nEngine.removeInstance(instanceKey);
    },
  };
}
