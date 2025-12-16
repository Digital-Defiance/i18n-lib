import { CoreStringKey } from '../core-string-key';

export const frenchStrings: Record<CoreStringKey, string> = {
  // Common/General
  [CoreStringKey.Common_Yes]: 'Oui',
  [CoreStringKey.Common_No]: 'Non',
  [CoreStringKey.Common_Cancel]: 'Annuler',
  [CoreStringKey.Common_OK]: 'OK',
  [CoreStringKey.Common_Save]: 'Enregistrer',
  [CoreStringKey.Common_Delete]: 'Supprimer',
  [CoreStringKey.Common_Edit]: 'Modifier',
  [CoreStringKey.Common_Create]: 'Créer',
  [CoreStringKey.Common_Update]: 'Mettre à jour',
  [CoreStringKey.Common_Loading]: 'Chargement...',
  [CoreStringKey.Common_Error]: 'Erreur',
  [CoreStringKey.Common_Success]: 'Succès',
  [CoreStringKey.Common_Warning]: 'Avertissement',
  [CoreStringKey.Common_Info]: 'Information',
  [CoreStringKey.Common_Disposed]: "L'objet a été disposé",
  [CoreStringKey.Common_Test]: 'Test',

  // Error Messages
  [CoreStringKey.Error_InvalidInput]: 'Entrée invalide fournie',
  [CoreStringKey.Error_NetworkError]: 'Erreur de connexion réseau',
  [CoreStringKey.Error_NotFound]: 'Ressource non trouvée',
  [CoreStringKey.Error_AccessDenied]: 'Accès refusé',
  [CoreStringKey.Error_InternalServer]: 'Erreur interne du serveur',
  [CoreStringKey.Error_ValidationFailed]: 'Échec de la validation',
  [CoreStringKey.Error_RequiredField]: 'Ce champ est obligatoire',
  [CoreStringKey.Error_InvalidContext]: 'Contexte invalide',
  [CoreStringKey.Error_InvalidContextTemplate]:
    'Contexte invalide : {contextKey}',
  [CoreStringKey.Error_MissingTranslationKeyTemplate]:
    'Clé de traduction manquante : {stringKey}',
  [CoreStringKey.Error_InvalidCurrencyCodeTemplate]:
    'Code de devise invalide : {value}',

  // Registry Error Templates
  [CoreStringKey.Error_ComponentNotFoundTemplate]:
    'Composant "{componentId}" non trouvé',
  [CoreStringKey.Error_LanguageNotFoundTemplate]:
    'Langue "{language}" non trouvée',
  [CoreStringKey.Error_StringKeyNotFoundTemplate]:
    'Clé de chaîne "{stringKey}" non trouvée pour le composant "{componentId}"',
  [CoreStringKey.Error_IncompleteRegistrationTemplate]:
    'Enregistrement incomplet pour le composant "{componentId}": {missingCount} chaînes manquantes',
  [CoreStringKey.Error_DuplicateComponentTemplate]:
    'Le composant "{componentId}" est déjà enregistré',
  [CoreStringKey.Error_DuplicateLanguageTemplate]:
    'La langue "{languageId}" est déjà enregistrée',
  [CoreStringKey.Error_ValidationFailedTemplate]:
    'Échec de la validation pour le composant "{componentId}": {errorCount} erreurs',

  // System Messages
  [CoreStringKey.System_Welcome]: 'Bienvenue',
  [CoreStringKey.System_Goodbye]: 'Au revoir',
  [CoreStringKey.System_PleaseWait]: 'Veuillez patienter...',
  [CoreStringKey.System_ProcessingRequest]: 'Traitement de votre demande...',
  [CoreStringKey.System_OperationComplete]: 'Opération terminée avec succès',
  [CoreStringKey.System_NoDataAvailable]: 'Aucune donnée disponible',

  [CoreStringKey.Error_InstanceAlreadyExistsTemplate]:
    "Instance avec clé '{key}' existe déjà",
  [CoreStringKey.Error_InstanceNotFoundTemplate]:
    "Instance avec clé '{key}' introuvable",
  [CoreStringKey.Error_MissingStringCollectionTemplate]:
    'Collection de chaînes manquante pour la langue: {language}',
  [CoreStringKey.Error_MissingTranslationTemplate]:
    "Traduction manquante pour la clé '{key}' dans la langue '{language}'",
  [CoreStringKey.Error_DefaultLanguageNoCollectionTemplate]:
    "La langue par défaut '{language}' n'a pas de collection de chaînes",
  [CoreStringKey.Error_MissingTranslationKeyForTypeTemplate]:
    'Clé de traduction manquante pour le type: {type}',
};
