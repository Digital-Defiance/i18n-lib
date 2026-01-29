import { CoreStringKeys, CoreStringKeyValue } from '../core-string-key';

export const frenchStrings: Record<CoreStringKeyValue, string> = {
  // Common/General
  [CoreStringKeys.Common_Yes]: 'Oui',
  [CoreStringKeys.Common_No]: 'Non',
  [CoreStringKeys.Common_Cancel]: 'Annuler',
  [CoreStringKeys.Common_OK]: 'OK',
  [CoreStringKeys.Common_Save]: 'Enregistrer',
  [CoreStringKeys.Common_Delete]: 'Supprimer',
  [CoreStringKeys.Common_Edit]: 'Modifier',
  [CoreStringKeys.Common_Create]: 'Créer',
  [CoreStringKeys.Common_Update]: 'Mettre à jour',
  [CoreStringKeys.Common_Loading]: 'Chargement...',
  [CoreStringKeys.Common_Error]: 'Erreur',
  [CoreStringKeys.Common_Success]: 'Succès',
  [CoreStringKeys.Common_Warning]: 'Avertissement',
  [CoreStringKeys.Common_Info]: 'Information',
  [CoreStringKeys.Common_Disposed]: "L'objet a été disposé",
  [CoreStringKeys.Common_Test]: 'Test',

  // Error Messages
  [CoreStringKeys.Error_InvalidInput]: 'Entrée invalide fournie',
  [CoreStringKeys.Error_NetworkError]: 'Erreur de connexion réseau',
  [CoreStringKeys.Error_NotFound]: 'Ressource non trouvée',
  [CoreStringKeys.Error_AccessDenied]: 'Accès refusé',
  [CoreStringKeys.Error_InternalServer]: 'Erreur interne du serveur',
  [CoreStringKeys.Error_ValidationFailed]: 'Échec de la validation',
  [CoreStringKeys.Error_RequiredField]: 'Ce champ est obligatoire',
  [CoreStringKeys.Error_InvalidContext]: 'Contexte invalide',
  [CoreStringKeys.Error_InvalidContextTemplate]:
    'Contexte invalide : {contextKey}',
  [CoreStringKeys.Error_MissingTranslationKeyTemplate]:
    'Clé de traduction manquante : {stringKey}',
  [CoreStringKeys.Error_InvalidCurrencyCodeTemplate]:
    'Code de devise invalide : {value}',

  // Registry Error Templates
  [CoreStringKeys.Error_ComponentNotFoundTemplate]:
    'Composant "{componentId}" non trouvé',
  [CoreStringKeys.Error_LanguageNotFoundTemplate]:
    'Langue "{language}" non trouvée',
  [CoreStringKeys.Error_StringKeyNotFoundTemplate]:
    'Clé de chaîne "{stringKey}" non trouvée pour le composant "{componentId}"',
  [CoreStringKeys.Error_IncompleteRegistrationTemplate]:
    'Enregistrement incomplet pour le composant "{componentId}": {missingCount} chaînes manquantes',
  [CoreStringKeys.Error_DuplicateComponentTemplate]:
    'Le composant "{componentId}" est déjà enregistré',
  [CoreStringKeys.Error_DuplicateLanguageTemplate]:
    'La langue "{languageId}" est déjà enregistrée',
  [CoreStringKeys.Error_ValidationFailedTemplate]:
    'Échec de la validation pour le composant "{componentId}": {errorCount} erreurs',

  // System Messages
  [CoreStringKeys.System_Welcome]: 'Bienvenue',
  [CoreStringKeys.System_Goodbye]: 'Au revoir',
  [CoreStringKeys.System_PleaseWait]: 'Veuillez patienter...',
  [CoreStringKeys.System_ProcessingRequest]: 'Traitement de votre demande...',
  [CoreStringKeys.System_OperationComplete]: 'Opération terminée avec succès',
  [CoreStringKeys.System_NoDataAvailable]: 'Aucune donnée disponible',

  [CoreStringKeys.Error_InstanceAlreadyExistsTemplate]:
    "Instance avec clé '{key}' existe déjà",
  [CoreStringKeys.Error_InstanceNotFoundTemplate]:
    "Instance avec clé '{key}' introuvable",
  [CoreStringKeys.Error_MissingStringCollectionTemplate]:
    'Collection de chaînes manquante pour la langue: {language}',
  [CoreStringKeys.Error_MissingTranslationTemplate]:
    "Traduction manquante pour la clé '{key}' dans la langue '{language}'",
  [CoreStringKeys.Error_DefaultLanguageNoCollectionTemplate]:
    "La langue par défaut '{language}' n'a pas de collection de chaînes",
  [CoreStringKeys.Error_MissingTranslationKeyForTypeTemplate]:
    'Clé de traduction manquante pour le type: {type}',
};
