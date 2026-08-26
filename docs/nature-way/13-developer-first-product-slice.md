# Cortexia — Developer-first Product Slice

**Date de cadrage :** 26 août 2026  
**Autorité :** Nature Way / Founder HQ  
**Statut :** `in_progress`

## Décision de recentrage

Cortexia doit prioriser le développeur comme premier client économique. La promesse n’est plus seulement de donner au grand public une interface simple pour générer un contenu ; elle consiste à fournir une **couche d’accès unifiée aux modèles IA**, avec un compte Cortexia, une recharge prépayée, une clé API et un playground pour vérifier chaque modèle avant intégration.

Le compte reste crédité en argent d’usage exprimé en USD dans le ledger Cortexia. Le minimum produit est de **1 USD**. Aucun plafond Cortexia n’est défini à ce stade ; les limites opérationnelles éventuelles des prestataires de paiement, de la conformité ou du risque devront être traitées comme des règles séparées et documentées, pas comme un plafond caché dans l’interface.

## Les deux surfaces produit

| Surface                | Acteur principal                              | Promesse                                                                                                              | Priorité | Limite actuelle                                                                                                      |
| ---------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------: | -------------------------------------------------------------------------------------------------------------------- |
| **Developer Platform** | Développeur, agence technique, équipe produit | Créer une clé, recharger le compte, explorer les modèles, tester un appel puis intégrer Cortexia dans son application |    **1** | Une clé couvre les permissions choisies ; le solde appartient au compte et les modèles exposés doivent être vérifiés |
| **Creative Workspace** | Créateur grand public                         | Décrire une intention et obtenir une création via un canvas de nœuds ou un agent qui orchestre le travail             |        2 | Canvas agentique borné après preuve du tronc ; agents autonomes non bornés et parité Canva différés                  |

La deuxième surface ne doit pas être supprimée. Elle devient une **branche séparée** qui héritera plus tard du compte, du ledger et du catalogue vérifié de la Developer Platform. Elle ne doit pas imposer ses concepts de canvas et d’agent au premier parcours développeur.

## Parcours prioritaire développeur

Le parcours de référence est : **inscription → accès à l’espace développeur → création d’une clé nommée pour une application → révélation unique de la clé → recharge Mobile Money ou carte d’au moins 1 USD → sélection d’un modèle vérifié → test dans le playground individuel → copie d’un exemple cURL/JavaScript/Python → appel depuis l’application du développeur → suivi des crédits et de l’usage**.

Le nom saisi lors de la création est le premier niveau de liaison entre une clé et une application. Une évolution ultérieure pourra ajouter un registre d’applications avec environnement, domaine autorisé, webhook de statut, quotas et rotation sans modifier le ledger ni le format d’authentification.

## Contrat clé API

Une clé est générée côté serveur sous la forme `cx_live_...`, révélée une seule fois, puis stockée uniquement sous forme de hash avec un préfixe affichable. Elle est rattachée à l’utilisateur authentifié qui l’a créée et peut être révoquée. La clé ne doit jamais apparaître dans les logs, les bundles navigateur, les fixtures ou les captures de preuve.

Le scope par défaut est `generate:*`, ce qui donne accès à tous les modèles vérifiés publiés par Cortexia. Les scopes catégoriels (`generate:image`, `generate:video`, `generate:audio`, `generate:text`, `generate:music`) sont des restrictions facultatives. L’API doit appliquer le scope côté serveur après résolution du modèle et retourner une erreur d’autorisation sans débiter le compte lorsqu’il ne correspond pas.

## Contrat crédits et paiements

Le portefeuille est attaché au compte, pas à une clé individuelle. Une recharge Mobile Money ou carte crée une transaction idempotente et une écriture `purchase` dans `credits_ledger`. Chaque génération crée une écriture `usage` avec une référence unique. Une clé révoquée, un compte insuffisant, un prix absent ou un modèle non vérifié ne doit pas provoquer de débit.

Le minimum Cortexia est 1 USD. L’absence de plafond Cortexia ne signifie pas que chaque prestataire accepte un montant sans limite : les plafonds techniques, réglementaires ou antifraude d’un rail doivent retourner une erreur explicite et être journalisés comme une contrainte du prestataire.

## Contrat playground modèle

Le catalogue développeur doit exposer toutes les catégories de modèles **vérifiés** : texte, image, vidéo, audio, voix et musique. Chaque fiche doit présenter le slug d’API, le fournisseur, l’unité de facturation, le prix Cortexia, les paramètres attendus, les limites connues et un bouton de test dans le playground individuel.

Le playground utilise la session Cortexia et permet de tester un modèle sans copier une clé API. Il ne doit pas masquer le coût estimé, l’état de la requête, le résultat, l’échec, la reprise et l’historique. Le code d’intégration doit appeler la même surface `/v1` que le développeur utilisera, avec une clé placée côté serveur de son application.

## Définition de done du premier slice

| Gate                   | Résultat requis                                                                                                              | Preuve                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Accès développeur      | Tout compte authentifié peut atteindre son espace API ; les routes privées redirigent les visiteurs non authentifiés         | Browser smoke authentifié                    |
| Création et révocation | Une clé est créée, le secret n’est révélé qu’une fois, le hash est persistant et la révocation invalide immédiatement la clé | Test serveur + replay négatif                |
| Accès API              | Une clé active authentifie `/v1/models` et `/v1/generate`; une clé inactive ou mal formée est refusée                        | Test HTTP authentifié                        |
| Scope                  | `generate:*` couvre les modèles vérifiés ; un scope catégoriel refuse les catégories différentes avant débit                 | Test de contrat                              |
| Crédit minimum         | Une recharge de 1 USD est acceptée au niveau Cortexia ; aucun plafond produit durcodé n’est imposé                           | Test serveur/UI                              |
| Playground             | Un développeur peut ouvrir chaque catégorie vérifiée et voir le coût, les paramètres, le résultat ou l’erreur                | Browser smoke par catégorie                  |
| Sécurité               | Les prix, permissions, modèles et débits sont autoritatifs côté serveur                                                      | Revue de code + test négatif                 |
| Production             | L’URL publiée rend les surfaces attendues ; toute route blanche ou 404 est expliquée avant annonce                           | Vérification publique puis session autorisée |

## Non-objectifs de cette tranche

Cette tranche ne livre pas encore le registre formel d’applications, les domaines allowlistés, les quotas par clé, la facturation mensuelle, les équipes et rôles, le SDK officiel, les agents autonomes, le canvas infini ou une parité complète avec Canva. Elle ne transforme pas non plus l’API en promesse d’accès à un modèle non vérifié.

## Références internes

[1]: ../../drizzle/schema.ts "Cortexia API key, models, payments and credits schema"
[2]: ../../src/routes/app.developers.tsx "Cortexia developer portal"
[3]: ../../src/lib/api/api-keys.ts "Cortexia API key lifecycle"
[4]: ../../server/api/v1/generate.ts "Cortexia public generation API"
[5]: ../../server/api/v1/models/index.ts "Cortexia public models API"
[6]: 01-seed-cortexia.md "Cortexia product Seed"
[7]: 08-proof-record.md "Cortexia Proof Record"
[8]: 12-production-public-observations-2026-08-26.md "Cortexia public production observations"
