# Cortexia — Seed produit

**Date de cadrage :** 25 août 2026  
**Autorité :** Nature Way / Founder HQ  
**Propriétaire :** Business Owner — Cortexia  
**Statut :** `in_progress`

## Vision compressée

Cortexia devient la **couche d’accès unifiée aux modèles IA pour les développeurs** : une équipe crée un compte, recharge un portefeuille prépayé, génère une clé API, teste un modèle dans le playground puis branche cette clé à son application. La différenciation ne repose pas sur la promesse abstraite de “tous les modèles”, mais sur une API fiable, des prix transparents, un catalogue vérifié et des paiements adaptés aux usages africains, avec **Mobile Money d’abord**, carte ensuite. Le workspace créatif grand public, son canvas infini et son agent restent une branche séparée construite sur ce socle.

> **Principe de produit :** ne pas vendre un catalogue de fournisseurs ; vendre un résultat créatif ou intellectuel qui traverse plusieurs modèles sans changer de compte, d’interface ou de logique de facturation.

## Problème prioritaire

Les créateurs, agences, équipes marketing et développeurs doivent actuellement multiplier les comptes, abonnements, interfaces et méthodes de paiement pour comparer les modèles image, vidéo, audio et texte. Cette fragmentation augmente le coût, ralentit l’itération et rend difficile le contrôle de la dépense. En Afrique francophone et dans les marchés où la carte n’est pas le moyen de paiement dominant, elle exclut en plus une partie des utilisateurs avant même la première génération.

## Acteurs cibles

| Acteur                            | Besoin principal                                                        | Première preuve attendue                                                        |
| --------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Développeur individuel            | Tester rapidement un modèle et brancher Cortexia à son produit          | Une clé API, une recharge de 1 USD, une requête et un résultat vérifiable       |
| Équipe produit / agence technique | Comparer plusieurs modèles et suivre le coût d’un service en production | Une clé nommée pour une application, un workflow d’appels et un ledger traçable |
| Créateur grand public             | Utiliser plus tard un workspace simple sans connaître les API           | Une création réussie depuis le playground ou le futur canvas agentique          |
| Opérateur Cortexia                | Surveiller modèles, clés, paiements, marges et incidents                | Un journal d’exécution et de réconciliation exploitable                         |

## Tronc critique du MVP

Le parcours prioritaire est : **inscription → accès développeur → création d’une clé API nommée pour une application → révélation unique → recharge Mobile Money d’au moins 1 USD → sélection d’un modèle vérifié → test dans le playground → copie du snippet → appel depuis l’application → suivi du solde et du coût**. La future surface grand public — prompt simple, canvas infini et chat agentique — est une branche importante, mais ne doit pas masquer ce tronc développeur.

## Priorités de livraison

| Rang | Priorité                                                                    | Condition d’entrée                       | Preuve attendue                                                                                                            |
| ---: | --------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
|    1 | **Developer Platform : accès authentifié, clés API, crédits et génération** | Toujours actif                           | Un compte authentifié crée une clé, recharge au moins 1 USD, appelle un modèle vérifié et obtient un résultat API traçable |
|    2 | **Playground développeur et catalogue vérifié multi-catégories**            | Clé API et ledger du compte fonctionnels | Chaque modèle vérifié expose slug, paramètres, prix, test, résultat/erreur et snippet d’intégration                        |
|    3 | Scopes, liaison formelle d’applications et paiement carte                   | Tronc développeur fermé en Mobile Money  | Permissions effectives, application nommée, révocation et checkout/webhook idempotents                                     |
|    4 | Workspace grand public : prompt simple, canvas infini et agentique          | Developer Platform et playground prouvés | Création accessible sans connaître les API, orchestration bornée et coût transparent                                       |
|    5 | SDK, plans équipe, quotas et routage avancé                                 | Usage récurrent et marges mesurées       | Adoption développeur, marge par unité et capacité opérateur                                                                |

L’agentique grand public reste une capacité stratégique, mais elle n’est plus la prochaine branche immédiate : elle vient après la Developer Platform, le playground multi-catégories, les paiements et les scopes. Sa première version restera bornée au canvas actuel, aux modèles vérifiés, aux opérations `ADD_NODE`, `CONNECT_NODES`, `UPDATE_NODE` et `REMOVE_NODE`, avec confirmation et application serveur.

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

Le premier ring ne cherche pas à livrer simultanément tous les modèles frontier, une parité complète avec Canva, des agents autonomes non bornés, une place de marché ouverte, des abonnements complexes, une application mobile native ou une couverture de paiement mondiale. Le workspace grand public est une branche de rang 4, après la Developer Platform, le playground et les paiements/scopes. Le canvas infini et le chat agentique pourront être construits sur le compte, le ledger et le catalogue vérifié sans devenir une dépendance du premier parcours développeur.

## Échec à ne pas expédier

Cortexia ne doit pas afficher un modèle, un prix ou un résultat qui n’est pas réellement supporté par la chaîne d’exécution. Un paiement approuvé ne doit jamais créditer deux fois, et un échec fournisseur ne doit pas laisser un débit définitif sans état de remboursement ou de revue.

## Définition de “production-ready” pour Cortexia

Pour ce ring, “production-ready” signifie que les contrats de données, les permissions, les prix, les paiements, les callbacks, les états de génération, la persistance des assets, l’observabilité minimale, le rollback et les tests de réconciliation sont cohérents en environnement de staging. Cela ne signifie pas que Cortexia a déjà prouvé l’adoption, la rentabilité, la disponibilité mondiale ou la qualité de chaque modèle du marché.

## Décisions à prendre plus tard, sans bloquer le tronc

Le catalogue de modèles doit progressivement passer d’un registre statique à une source contrôlée des capacités réellement disponibles. Le futur routage agentique devra s’appuyer sur ce catalogue vérifié plutôt que sur des alias de modèles non vérifiés ; le canvas agentique sera construit après la preuve de la Developer Platform, avec une application serveur et des permissions bornées. L’expansion vers les cartes et les autres rails de paiement doit conserver le même ledger autoritatif et la même règle d’idempotence.

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
