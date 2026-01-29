import { CoreStringKeys, CoreStringKeyValue } from '../core-string-key';

export const germanStrings: Record<CoreStringKeyValue, string> = {
  // Common/General
  [CoreStringKeys.Common_Yes]: 'Ja',
  [CoreStringKeys.Common_No]: 'Nein',
  [CoreStringKeys.Common_Cancel]: 'Abbrechen',
  [CoreStringKeys.Common_OK]: 'OK',
  [CoreStringKeys.Common_Save]: 'Speichern',
  [CoreStringKeys.Common_Delete]: 'Löschen',
  [CoreStringKeys.Common_Edit]: 'Bearbeiten',
  [CoreStringKeys.Common_Create]: 'Erstellen',
  [CoreStringKeys.Common_Update]: 'Aktualisieren',
  [CoreStringKeys.Common_Loading]: 'Lädt...',
  [CoreStringKeys.Common_Error]: 'Fehler',
  [CoreStringKeys.Common_Success]: 'Erfolg',
  [CoreStringKeys.Common_Warning]: 'Warnung',
  [CoreStringKeys.Common_Info]: 'Information',
  [CoreStringKeys.Common_Disposed]: 'Objekt wurde freigegeben',
  [CoreStringKeys.Common_Test]: 'Test',

  // Error Messages
  [CoreStringKeys.Error_InvalidInput]: 'Ungültige Eingabe bereitgestellt',
  [CoreStringKeys.Error_NetworkError]: 'Netzwerkverbindungsfehler',
  [CoreStringKeys.Error_NotFound]: 'Ressource nicht gefunden',
  [CoreStringKeys.Error_AccessDenied]: 'Zugriff verweigert',
  [CoreStringKeys.Error_InternalServer]: 'Interner Serverfehler',
  [CoreStringKeys.Error_ValidationFailed]: 'Validierung fehlgeschlagen',
  [CoreStringKeys.Error_RequiredField]: 'Dieses Feld ist erforderlich',
  [CoreStringKeys.Error_InvalidContext]: 'Ungültiger Kontext',
  [CoreStringKeys.Error_InvalidContextTemplate]:
    'Ungültiger Kontext: {contextKey}',
  [CoreStringKeys.Error_MissingTranslationKeyTemplate]:
    'Fehlender Übersetzungsschlüssel: {stringKey}',
  [CoreStringKeys.Error_InvalidCurrencyCodeTemplate]:
    'Ungültiger Währungscode: {value}',

  // Registry Error Templates
  [CoreStringKeys.Error_ComponentNotFoundTemplate]:
    'Komponente "{componentId}" nicht gefunden',
  [CoreStringKeys.Error_LanguageNotFoundTemplate]:
    'Sprache "{language}" nicht gefunden',
  [CoreStringKeys.Error_StringKeyNotFoundTemplate]:
    'String-Schlüssel "{stringKey}" für Komponente "{componentId}" nicht gefunden',
  [CoreStringKeys.Error_IncompleteRegistrationTemplate]:
    'Unvollständige Registrierung für Komponente "{componentId}": {missingCount} Strings fehlen',
  [CoreStringKeys.Error_DuplicateComponentTemplate]:
    'Komponente "{componentId}" ist bereits registriert',
  [CoreStringKeys.Error_DuplicateLanguageTemplate]:
    'Sprache "{languageId}" ist bereits registriert',
  [CoreStringKeys.Error_ValidationFailedTemplate]:
    'Validierung für Komponente "{componentId}" fehlgeschlagen: {errorCount} Fehler',

  // System Messages
  [CoreStringKeys.System_Welcome]: 'Willkommen',
  [CoreStringKeys.System_Goodbye]: 'Auf Wiedersehen',
  [CoreStringKeys.System_PleaseWait]: 'Bitte warten...',
  [CoreStringKeys.System_ProcessingRequest]: 'Ihre Anfrage wird bearbeitet...',
  [CoreStringKeys.System_OperationComplete]:
    'Vorgang erfolgreich abgeschlossen',
  [CoreStringKeys.System_NoDataAvailable]: 'Keine Daten verfügbar',

  [CoreStringKeys.Error_InstanceAlreadyExistsTemplate]:
    "Instanz mit Schlüssel '{key}' existiert bereits",
  [CoreStringKeys.Error_InstanceNotFoundTemplate]:
    "Instanz mit Schlüssel '{key}' nicht gefunden",
  [CoreStringKeys.Error_MissingStringCollectionTemplate]:
    'Fehlende String-Sammlung für Sprache: {language}',
  [CoreStringKeys.Error_MissingTranslationTemplate]:
    "Fehlende Übersetzung für Schlüssel '{key}' in Sprache '{language}'",
  [CoreStringKeys.Error_DefaultLanguageNoCollectionTemplate]:
    "Standardsprache '{language}' hat keine String-Sammlung",
  [CoreStringKeys.Error_MissingTranslationKeyForTypeTemplate]:
    'Fehlender Übersetzungsschlüssel für Typ: {type}',
};
