/**
 * Engine configuration interface
 */

export interface EngineConfig {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  constants?: Record<string, any>;
  validation?: {
    requireCompleteStrings?: boolean;
    allowPartialRegistration?: boolean;
  };
}
