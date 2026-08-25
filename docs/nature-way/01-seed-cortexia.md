# Cortexia — Seed produit

**Date de cadrage :** 25 août 2026  
**Autorité :** Nature Way / Founder HQ  
**Propriétaire :** Business Owner — Cortexia  
**Statut :** `in_progress`

## Vision compressée

Cortexia devient le **compte de travail unifié pour la création et l’intelligence artificielle** : un utilisateur paie une seule fois, choisit le meilleur modèle ou laisse Cortexia router la tâche, puis retrouve ses générations, crédits, conversations et workflows dans un même espace. La différenciation ne repose pas sur la promesse abstraite de “tous les modèles”, mais sur une expérience fiable, transparente sur les coûts et adaptée aux usages africains, avec **Mobile Money d’abord**, carte ensuite, et un accès progressif aux flows de canvas et d’agents.

> **Principe de produit :** ne pas vendre un catalogue de fournisseurs ; vendre un résultat créatif ou intellectuel qui traverse plusieurs modèles sans changer de compte, d’interface ou de logique de facturation.

## Problème prioritaire

Les créateurs, agences, équipes marketing et développeurs doivent actuellement multiplier les comptes, abonnements, interfaces et méthodes de paiement pour comparer les modèles image, vidéo, audio et texte. Cette fragmentation augmente le coût, ralentit l’itération et rend difficile le contrôle de la dépense. En Afrique francophone et dans les marchés où la carte n’est pas le moyen de paiement dominant, elle exclut en plus une partie des utilisateurs avant même la première génération.

## Acteurs cibles

| Acteur                    | Besoin principal                                            | Première preuve attendue                                |
| ------------------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| Créateur individuel       | Générer vite avec un prix visible et un paiement accessible | Une génération réussie après recharge Mobile Money      |
| Agence / équipe marketing | Comparer des modèles et réutiliser des workflows            | Un workflow sauvegardé et rejoué avec un coût traçable  |
| Développeur               | Appeler Cortexia par API avec une facturation prévisible    | Une clé API, une requête et un résultat vérifiable      |
| Opérateur Cortexia        | Surveiller modèles, paiements, marges et incidents          | Un journal d’exécution et de réconciliation exploitable |

## Tronc critique du MVP

Le parcours prioritaire est : **inscription → recharge Mobile Money → choix d’un modèle réel → saisie d’un prompt → génération → résultat conservé dans l’historique → solde et coût visibles**. Le paiement par carte, le chat multi-modèles, le canvas agentique et les flows de type Canva sont des branches importantes, mais ne doivent pas masquer ce tronc.

## Promesse du premier ring

Cortexia doit permettre à un utilisateur authentifié, dans un pays couvert par le prestataire de paiement, de créditer son compte en XOF via Mobile Money, d’exécuter un modèle actif du catalogue, de recevoir un résultat réel ou un état d’échec récupérable, et de voir une comptabilité cohérente entre le paiement, le ledger de crédits, la génération et l’asset produit.

## Critères de succès

| Critère                  |                                                                   Seuil du premier ring | Classe de preuve requise             |
| ------------------------ | --------------------------------------------------------------------------------------: | ------------------------------------ |
| Génération du playground |                                Parcours UI → serveur → fournisseur → résultat ou erreur | Observée en staging                  |
| Paiement Mobile Money    |                              Une transaction approuvée crédite une seule fois le ledger | Intégration staging + replay négatif |
| Paiement carte           |                      Checkout créé sans exposer de secret ; webhook signé et idempotent | Intégration staging                  |
| Prix et solde            |               Le prix affiché et le débit serveur utilisent la même source autoritative | Test de contrat                      |
| Sécurité                 |      Aucune route publique ne peut exécuter une migration ou créditer sans vérification | Test négatif + revue de code         |
| Support opérateur        | Chaque échec de paiement/génération possède une référence et une voie de réconciliation | Runbook vérifié                      |

## Non-objectifs immédiats

Le premier ring ne cherche pas à livrer simultanément tous les modèles frontier, une parité complète avec Canva, des agents autonomes non bornés, une place de marché ouverte, des abonnements complexes, une application mobile native ou une couverture de paiement mondiale. Ces sujets restent dans la vision, mais seront ouverts comme branches seulement après preuve du tronc et des marges unitaires.

## Échec à ne pas expédier

Cortexia ne doit pas afficher un modèle, un prix ou un résultat qui n’est pas réellement supporté par la chaîne d’exécution. Un paiement approuvé ne doit jamais créditer deux fois, et un échec fournisseur ne doit pas laisser un débit définitif sans état de remboursement ou de revue.

## Définition de “production-ready” pour Cortexia

Pour ce ring, “production-ready” signifie que les contrats de données, les permissions, les prix, les paiements, les callbacks, les états de génération, la persistance des assets, l’observabilité minimale, le rollback et les tests de réconciliation sont cohérents en environnement de staging. Cela ne signifie pas que Cortexia a déjà prouvé l’adoption, la rentabilité, la disponibilité mondiale ou la qualité de chaque modèle du marché.

## Décisions à prendre plus tard, sans bloquer le tronc

Le catalogue de modèles doit progressivement passer d’un registre statique à une source contrôlée des capacités réellement disponibles. Le routage agentique devra ensuite s’appuyer sur ce catalogue plutôt que sur des alias de modèles non vérifiés. L’expansion vers les cartes et les autres rails de paiement doit conserver le même ledger autoritatif et la même règle d’idempotence.

## Références internes

- `src/lib/api/generate.ts` — génération réelle, réservation de crédits, persistance et soumission fournisseur.
- `src/lib/api/payments.ts` — création et vérification FedaPay, création Stripe et idempotence.
- `server/api/webhooks/stripe.ts` — vérification du webhook Stripe sur corps brut.
- `src/routes/app.models.$slug.tsx` — parcours playground et polling des résultats.
- `PRODUCTION-RUNBOOK.md` — variables, migrations, callbacks et réconciliation.

## Références

Ce document s’appuie sur l’état du dépôt Cortexia au commit inspecté le 25 août 2026 ; les chemins cités ci-dessus constituent les sources d’autorité internes pour les affirmations techniques.

[1]: ../../src/lib/api/generate.ts "Cortexia generation server function"
[2]: ../../src/lib/api/payments.ts "Cortexia payment server functions"
[3]: ../../server/api/webhooks/stripe.ts "Cortexia Stripe webhook"
[4]: ../../src/routes/app.models.$slug.tsx "Cortexia playground route"
[5]: ../../PRODUCTION-RUNBOOK.md "Cortexia production runbook"
