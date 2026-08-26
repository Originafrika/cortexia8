# Cortexia — Developer Smoke Test

**Date :** 26 août 2026  
**Commande :** `pnpm smoke:developer`  
**Script :** `scripts/smoke-test-developer.sh`

## Objet

Ce smoke test vérifie que la surface Developer Platform est réellement publiée et que les contrats non destructifs de l’API sont respectés. Le mode par défaut ne crée pas de compte, ne crée pas de clé, ne recharge aucun crédit et ne soumet aucune génération fournisseur.

Le script vérifie d’abord les routes publiques, puis attend éventuellement une clé exportée dans la variable d’environnement locale `CORTEXIA_API_KEY`. Il ne journalise jamais la valeur de cette clé. Avec une clé, il contrôle le catalogue vérifié et le solde de crédits. Le mode `--live-generation` est séparé et refuse de s’exécuter sans la valeur de confirmation exacte `CORTEXIA_LIVE_CONFIRMATION=I_UNDERSTAND_THIS_CHARGES`.

## Préconditions transactionnelles

Les actions suivantes doivent être exécutées avec un compte de test dédié et une confirmation explicite avant toute dépense : création d’une clé nommée `smoke-test-app`, recharge exacte de **1 USD**, test d’un modèle vérifié dans le playground et génération API réelle. Une recharge crée une transaction de paiement et une écriture de crédit ; une génération consomme le prix du modèle et peut déclencher un fournisseur externe.

Le script ne tente pas de saisir une session personnelle ni de contourner un écran de connexion. La clé doit être copiée dans un terminal côté serveur ou local sécurisé, jamais dans une application cliente ou un fichier versionné. Après le test, la clé doit être révoquée et le résultat d’un appel ultérieur doit être HTTP 401.

## Séquence opérateur

| Étape | Action                                                   | Effet                          | Preuve attendue                                                                            |
| ----: | -------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ |
|     1 | Ouvrir le domaine et se connecter avec le compte de test | Session privée                 | `/app/developers` se rend sans écran blanc                                                 |
|     2 | Créer `smoke-test-app` avec `generate:*`                 | Mutation de clé                | Secret visible une seule fois ; préfixe et statut actifs dans la liste                     |
|     3 | Recharger 1 USD via le rail choisi                       | Dépense réelle                 | Paiement approuvé, balance augmentée, une ligne `purchase` idempotente                     |
|     4 | Ouvrir `/app/models` puis un modèle vérifié              | Aucune dépense si aucun submit | Toutes les catégories vérifiées visibles ; prix, slug, paramètres et playground rendus     |
|     5 | Exporter la clé et lancer `pnpm smoke:developer`         | Lecture API                    | `/v1/models` renvoie uniquement des modèles vérifiés et `/v1/credits` un montant numérique |
|     6 | Soumettre une génération minimale si confirmée           | Dépense du coût affiché        | Réponse `processing`, polling, résultat ou échec récupérable et ledger `usage`             |
|     7 | Révoquer la clé                                          | Mutation de sécurité           | La même clé reçoit HTTP 401 après révocation                                               |

## Exécution sûre

```bash
pnpm smoke:developer
```

Pour un compte déjà authentifié et une clé conservée uniquement dans le shell :

```bash
CORTEXIA_API_KEY='cx_live_...' pnpm smoke:developer
```

Pour une génération réellement facturée, uniquement après confirmation explicite du propriétaire du compte :

```bash
CORTEXIA_API_KEY='cx_live_...' \
CORTEXIA_MODEL='model-slug-verifie' \
CORTEXIA_LIVE_CONFIRMATION='I_UNDERSTAND_THIS_CHARGES' \
pnpm smoke:developer -- --live-generation
```

Cette dernière commande ne doit jamais être exécutée dans une CI générale. Elle doit être lancée une seule fois, depuis un environnement contrôlé, avec un modèle vérifié et un compte dont le solde est suffisant.

## Résultats observés le 26 août 2026

Avant le montage des Server Routes TanStack Start, le domaine de production répondait HTTP 200 sur les pages publiques mais `/v1/models` et `/v1/generate` répondaient HTTP 404. Le script a donc correctement signalé un échec de release API, sans tenter de paiement ni de génération.

Les wrappers locaux ont ensuite été ajoutés pour monter les handlers h3 existants sous `/v1/models`, `/v1/generate`, `/v1/credits` et `/v1/generations/:id`. Le test local non authentifié répond maintenant HTTP 401 sur ces quatre contrats, ce qui prouve le routage et le garde d’authentification ; cela ne prouve pas encore une session, un paiement ou une génération fournisseur en production.
