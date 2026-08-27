# Diagnostic des journaux de production — création de clé API

**Date d’inspection :** 27 août 2026 00:20 UTC environ  
**Projet :** Cortexia / dépôt `Originafrika/cortexia8`  
**Environnement :** Vercel Production  
**Statut :** diagnostic partiel, cause runtime historique non récupérable

## Périmètre confirmé

Le connecteur Vercel connecté expose l’équipe **ORIGIN**, plan **Hobby**, et le projet Vercel `cortexia`, lié au dépôt GitHub `Originafrika/cortexia8`. Le dernier déploiement de production découvert est `dpl_5h3Fy5iQwc6Tm6WCz2qvJEHVA4yn`, à l’état `READY`, construit depuis le commit `a0c6fca` (`docs: record developer smoke result`).

## Résultats des journaux

| Vérification                                               | Résultat                                  | Interprétation                                                           |
| ---------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| Erreurs runtime groupées sur 7 jours                       | Aucune erreur runtime trouvée             | Aucun cluster d’erreur conservé dans l’agrégat Vercel pour cette fenêtre |
| Recherche `createApiKey` sur le déploiement actif, 7 jours | Aucun log retourné                        | La requête historique n’est plus disponible dans les journaux conservés  |
| Recherche `createApiKey` sur la dernière heure             | Aucun log retourné                        | Aucune nouvelle tentative n’a été lancée pendant l’inspection            |
| Journaux de build, erreurs uniquement                      | `Build Completed in /vercel/output [27s]` | La version active a bien compilé ; pas d’erreur de build observée        |

Vercel a explicitement indiqué que la fenêtre demandée dépassait la rétention du plan Hobby et que les journaux runtime disponibles sont limités à une fenêtre courte, annoncée comme **1 heure** dans la réponse de consultation. La tentative de création de clé ayant eu lieu lors de la session précédente, son erreur exacte n’est donc plus récupérable depuis Vercel sans nouvel événement observable.

## Corrélation avec le code

Le chemin serveur qui devait produire le log est `src/lib/api/api-keys.ts`, dans `createApiKey`. Il résout d’abord la session via `getRequestContext`, génère le secret en mémoire, puis exécute une insertion SQL dans `api_keys`. Toute exception non-HTTP est convertie en erreur HTTP 500 générique côté application.

Le schéma initial `drizzle/0001_full_schema.sql` crée `api_keys` sans colonnes `name` et `prefix`. La migration `drizzle/0007_add_api_key_name_prefix.sql` ajoute ces deux colonnes. Le code actif insère explicitement `name` et `prefix`. Une migration de production absente ou incomplète serait donc compatible avec le symptôme observé, mais **elle n’est pas prouvée par les journaux disponibles**. Une résolution de session nulle ou un échec de connexion/permission SQL sont également possibles, et ne peuvent pas être départagés sans le log de l’invocation concernée.

## Conclusion opérationnelle

La seule conclusion précise permise par les preuves est la suivante : **le build du déploiement actif est sain, mais l’erreur runtime de la tentative historique a expiré de la rétention Vercel ; son origine exacte ne peut plus être identifiée rétroactivement depuis les logs.** Le diagnostic nécessite une nouvelle observation instrumentée et non destructive, ou un accès à un export de logs conservé ailleurs.

Aucune nouvelle création de clé, recharge ou génération n’a été lancée pendant cette inspection. Pour une prochaine tentative de diagnostic, il faut d’abord ajouter une référence de corrélation non sensible et journaliser uniquement le type d’étape et le code SQL normalisé, jamais le token de session, la clé brute, le hash ou les données personnelles. Ensuite, une seule tentative contrôlée pourra être effectuée avec surveillance Vercel dans la fenêtre de rétention.

## Nouvelle tentative du 27 août 2026

Une nouvelle tentative unique a été lancée depuis `https://cortexia.originafrika.online/app/developers` avec le nom `smoke-live-log-20260827`. L’interface a de nouveau affiché « Échec de la création de la clé API ».

La recherche immédiate des logs Vercel sur le projet connecté n’a retourné aucune ligne, y compris sans filtre de texte. L’inspection du projet Vercel a alors établi le point de routage critique : le projet `cortexia` de l’équipe ORIGIN est marqué `live: false`, ses domaines sont uniquement `cortexia-iota.vercel.app`, `cortexia-origin-d6fb.vercel.app` et `cortexia-git-main-origin-d6fb.vercel.app`, et **`cortexia.originafrika.online` n’est pas attaché à ce projet**.

La tentative effectuée sur le domaine personnalisé ne peut donc pas avoir produit de logs dans le nouveau projet Vercel inspecté. Le message d’erreur observé provient du projet actuellement associé au domaine personnalisé — vraisemblablement l’ancien déploiement — ou d’une autre cible de routage. L’origine exacte de l’échec SQL/session n’est pas encore capturée ; l’origine exacte de l’absence de logs est, elle, confirmée : **le domaine de test et le projet Vercel connecté ne sont pas la même cible**.

Aucune clé n’a été révélée ou confirmée comme créée. Aucun paiement, aucune génération et aucune modification de domaine n’ont été effectués.
