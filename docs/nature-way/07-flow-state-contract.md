# Cortexia — Flow / State Contract

**Date :** 25 août 2026  
**Structural path :** `product > trunk > payment-and-generation-flow`  
**Statut :** `ready_for_integration_proof`

## Parcours principal

Le parcours commence avec un utilisateur authentifié et un compte dont le solde est connu. L’utilisateur choisit un modèle actif, saisit ses paramètres, reçoit une estimation serveur-compatible, recharge si nécessaire, puis demande une génération. Le système réserve le coût, crée le run, soumet le job, attend le callback ou interroge son état, persiste le résultat et expose l’historique.

## Table des états

| Étape                  | État visible                                           | Autorité                                | Transition suivante                    | Échec et récupération                                                                         |
| ---------------------- | ------------------------------------------------------ | --------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| Session                | authentifiée / non authentifiée                        | Session serveur                         | Accès au catalogue ou redirection auth | Rejouer l’ouverture de session sans exposer de token dans l’URL                               |
| Solde                  | disponible / insuffisant / inconnu                     | `credits_ledger` + helper de solde      | Génération ou recharge                 | Recharger ; ne jamais simuler un solde côté client                                            |
| Ordre paiement         | non créé / pending / completed / failed / needs_review | `payment_transactions` + callback signé | Crédit ledger après vérification       | Retry avec même idempotency key ; revue opérateur en cas de mismatch                          |
| Préparation génération | formulaire valide / invalid                            | Serveur + schéma modèle                 | Réservation de coût                    | Corriger les champs ; pas de débit si validation échoue                                       |
| Soumission             | submitting / queued                                    | `run_node_executions`                   | Callback ou statut provider            | Si fournisseur non soumis : remboursement ; si soumis mais incertain : conserver la référence |
| Exécution              | running / succeeded / failed                           | Callback KIE rapproché                  | Asset, texte ou erreur                 | Polling borné, retry contrôlé, erreur lisible                                                 |
| Résultat               | asset / texte / indisponible                           | `assets` ou `text_result`               | Historique / réutilisation             | Fallback CDN marqué, téléchargement régénérable si autorisé                                   |

## Invariants

Un utilisateur ne peut lire ou modifier qu’un workflow, paiement, run, conversation ou asset qui lui appartient, sauf surface d’administration explicitement autorisée. Toute écriture financière possède une référence idempotente. Toute transition terminale est monotone : un paiement complété ne redevient pas pending, et une exécution réussie ne devient pas un succès différent à cause d’un callback rejoué.

Le prix final est recalculé côté serveur à partir de la ligne modèle active et de son unité. Les données de formulaire, les coûts affichés et les statuts client sont des entrées non fiables. Un modèle sans endpoint ou sans prix valide est indisponible, même si sa carte figure encore dans un écran de découverte.

## Autorisations

| Opération                | Utilisateur                             | Admin                         | Fournisseur externe                                        |
| ------------------------ | --------------------------------------- | ----------------------------- | ---------------------------------------------------------- |
| Voir catalogue public    | Oui, selon visibilité                   | Oui                           | Non                                                        |
| Générer                  | Oui avec session, solde et modèle actif | Oui selon rôle                | Non                                                        |
| Recharger                | Oui sur son compte                      | Revue uniquement              | Crée/rapporte l’état, jamais directement le solde Cortexia |
| Appliquer un plan canvas | Oui sur son workflow                    | Oui selon rôle                | Non                                                        |
| Finaliser un callback    | Non                                     | Non                           | Uniquement après signature, rapprochement et idempotence   |
| Modifier une migration   | Non par HTTP public                     | Opérateur hors route publique | Non                                                        |

## Confirmation et coût

Le dry-run ou l’estimation agentique ne débite rien. Une confirmation est requise au-delà du seuil configuré ou en mode `approve_each`. L’exécution réelle recalcule le total côté serveur ; le client ne peut pas remplacer l’estimation par un montant inférieur. Une annulation avant soumission doit laisser une trace et ne pas créer de débit ; après soumission, l’annulation dépend du fournisseur et doit être explicitement marquée comme non garantie.

## Preuves attendues

La preuve minimum consiste en un test réussi, un test de refus de paiement, un replay idempotent, un mismatch montant/devise, un solde avant/après, un run avec résultat, un run avec échec fournisseur et un contrôle d’accès sur un workflow d’un autre utilisateur. Les preuves doivent conserver environnement, identifiants non sensibles, date et gap résiduel.

## Références

[1]: ../../src/lib/api/generate.ts "Cortexia generation state transitions"
[2]: ../../src/lib/api/payments.ts "Cortexia payment state transitions"
[3]: ../../server/api/webhooks/kie.ts "Cortexia KIE callback verification"
[4]: ../../drizzle/schema.ts "Cortexia persistence and constraints"
[5]: 05-root-system.md "Cortexia Root System"
