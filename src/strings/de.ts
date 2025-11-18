import { CoreStringKey } from '../core-string-key';

export const germanStrings: Record<CoreStringKey, string> = {
      // Common/General
      [CoreStringKey.Common_Yes]: 'Ja',
      [CoreStringKey.Common_No]: 'Nein',
      [CoreStringKey.Common_Cancel]: 'Abbrechen',
      [CoreStringKey.Common_OK]: 'OK',
      [CoreStringKey.Common_Save]: 'Speichern',
      [CoreStringKey.Common_Delete]: 'Löschen',
      [CoreStringKey.Common_Edit]: 'Bearbeiten',
      [CoreStringKey.Common_Create]: 'Erstellen',
      [CoreStringKey.Common_Update]: 'Aktualisieren',
      [CoreStringKey.Common_Loading]: 'Lädt...',
      [CoreStringKey.Common_Error]: 'Fehler',
      [CoreStringKey.Common_Success]: 'Erfolg',
      [CoreStringKey.Common_Warning]: 'Warnung',
      [CoreStringKey.Common_Info]: 'Information',
      [CoreStringKey.Common_Disposed]: 'Objekt wurde freigegeben',
      [CoreStringKey.Common_Test]: 'Test',

      // Error Messages
      [CoreStringKey.Error_InvalidInput]: 'Ungültige Eingabe bereitgestellt',
      [CoreStringKey.Error_NetworkError]: 'Netzwerkverbindungsfehler',
      [CoreStringKey.Error_NotFound]: 'Ressource nicht gefunden',
      [CoreStringKey.Error_AccessDenied]: 'Zugriff verweigert',
      [CoreStringKey.Error_InternalServer]: 'Interner Serverfehler',
      [CoreStringKey.Error_ValidationFailed]: 'Validierung fehlgeschlagen',
      [CoreStringKey.Error_RequiredField]: 'Dieses Feld ist erforderlich',
      [CoreStringKey.Error_InvalidContext]: 'Ungültiger Kontext',
      [CoreStringKey.Error_InvalidContextTemplate]:
        'Ungültiger Kontext: {contextKey}',
      [CoreStringKey.Error_MissingTranslationKeyTemplate]:
        'Fehlender Übersetzungsschlüssel: {stringKey}',
      [CoreStringKey.Error_InvalidCurrencyCodeTemplate]: 'Ungültiger Währungscode: {value}',

      // Registry Error Templates
      [CoreStringKey.Error_ComponentNotFoundTemplate]:
        'Komponente "{componentId}" nicht gefunden',
      [CoreStringKey.Error_LanguageNotFoundTemplate]:
        'Sprache "{language}" nicht gefunden',
      [CoreStringKey.Error_StringKeyNotFoundTemplate]:
        'String-Schlüssel "{stringKey}" für Komponente "{componentId}" nicht gefunden',
      [CoreStringKey.Error_IncompleteRegistrationTemplate]:
        'Unvollständige Registrierung für Komponente "{componentId}": {missingCount} Strings fehlen',
      [CoreStringKey.Error_DuplicateComponentTemplate]:
        'Komponente "{componentId}" ist bereits registriert',
      [CoreStringKey.Error_DuplicateLanguageTemplate]:
        'Sprache "{languageId}" ist bereits registriert',
      [CoreStringKey.Error_ValidationFailedTemplate]:
        'Validierung für Komponente "{componentId}" fehlgeschlagen: {errorCount} Fehler',

      // System Messages
      [CoreStringKey.System_Welcome]: 'Willkommen',
      [CoreStringKey.System_Goodbye]: 'Auf Wiedersehen',
      [CoreStringKey.System_PleaseWait]: 'Bitte warten...',
      [CoreStringKey.System_ProcessingRequest]:
        'Ihre Anfrage wird bearbeitet...',
      [CoreStringKey.System_OperationComplete]:
        'Vorgang erfolgreich abgeschlossen',
      [CoreStringKey.System_NoDataAvailable]: 'Keine Daten verfügbar',

      [CoreStringKey.Error_InstanceAlreadyExistsTemplate]:
        "Instanz mit Schlüssel '{key}' existiert bereits",
      [CoreStringKey.Error_InstanceNotFoundTemplate]:
        "Instanz mit Schlüssel '{key}' nicht gefunden",
      [CoreStringKey.Error_MissingStringCollectionTemplate]:
        'Fehlende String-Sammlung für Sprache: {language}',
      [CoreStringKey.Error_MissingTranslationTemplate]:
        "Fehlende Übersetzung für Schlüssel '{key}' in Sprache '{language}'",
      [CoreStringKey.Error_DefaultLanguageNoCollectionTemplate]:
        "Standardsprache '{language}' hat keine String-Sammlung",
      [CoreStringKey.Error_MissingTranslationKeyForTypeTemplate]:
        'Fehlender Übersetzungsschlüssel für Typ: {type}',
    };