# Observations publiques de production — 26 août 2026

## Portée

Vérification en lecture seule de `https://cortexia.originafrika.online` et `https://cortexia.originafrika.online/app`. Aucun compte n’a été créé, aucune donnée personnelle n’a été saisie, aucun paiement n’a été lancé et aucune génération n’a été soumise.

## Observations

| Surface           | Observation                                                                                                                                                         | Niveau de preuve                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Accueil `/`       | La page répond en HTTPS et affiche le titre `Cortexia — Un accès. Tous les modèles.`                                                                                | Observée publiquement                                                             |
| Positionnement    | La page annonce un accès unifié, une facturation à l’usage, zéro abonnement et un paiement à l’usage.                                                               | Copie marketing publique ; promesse commerciale non auditée                       |
| Entrées publiques | `Ouvrir l'app`, `Commencer à créer`, `Voir le catalogue` et `Sign in` sont visibles.                                                                                | Observée publiquement                                                             |
| Catalogue         | La page affiche des catégories texte, image, vidéo, musique et voix, ainsi que des prix publics en USD et plusieurs modèles nommés.                                 | Observée publiquement ; fidélité fournisseur non prouvée par cette lecture seule  |
| Simulateur        | Un panier de référence affiche des quantités et un total mensuel à l’usage, comparé à des abonnements classiques.                                                   | Observée publiquement ; marge et exactitude des coûts non auditées                |
| `/app`            | La route répond avec le titre `Cortexia — App`, mais le rendu navigateur reste blanc et aucun élément interactif n’est détecté dans cette session non authentifiée. | Observée publiquement ; cause à diagnostiquer sans conclure à un incident serveur |

## Conséquence Founder HQ

L’existence d’une URL de production accessible ferme le constat “aucune URL staging disponible”, mais ne ferme pas le gate de preuve. La prochaine action doit être une vérification authentifiée et contrôlée sur l’environnement approprié, avec confirmation explicite avant tout paiement ou génération. La page publique prouve l’accessibilité et la surface marketing ; elle ne prouve ni l’idempotence des paiements, ni le ledger, ni la génération réelle, ni le flow agentique du canvas.

## Sources

[1]: https://cortexia.originafrika.online/ "Cortexia public home"
[2]: https://cortexia.originafrika.online/app "Cortexia app route"

## Observations complémentaires

| Surface              | Observation                                                                                                                                                                                           | Niveau de preuve                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `/app/models`        | La route répond en HTTPS avec le titre `Cortexia — Models Catalog`, mais le rendu navigateur reste blanc et aucun élément interactif n’est détecté dans cette session non authentifiée.               | Observée publiquement ; cause à diagnostiquer |
| `/auth/sign-in`      | La page de connexion se rend correctement et expose des champs Email, Mot de passe, ainsi que les actions Se connecter et Créer un compte.                                                            | Observée publiquement                         |
| GET `/api/v1/models` | La requête publique a retourné HTTP 404 dans cette instance ; cela ne prouve pas l’absence d’un endpoint interne ou protégé, mais signale une divergence à vérifier avec la route réellement publiée. | Observation HTTP en lecture seule             |

Ces observations ne constituent pas une preuve de paiement, de génération ou d’agent canvas. Elles établissent seulement que le domaine répond, que la connexion est accessible et que les routes privées/catalogue doivent être vérifiées avec une session autorisée avant de déclarer le produit prêt pour un pilote public.
