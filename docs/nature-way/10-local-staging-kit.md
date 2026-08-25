# Cortexia — Local Staging Kit

**Date :** 25 août 2026  
**Statut :** `prepared_locally`  
**Objectif :** permettre la configuration ultérieure d’un staging sans déposer de secrets dans Git

## Usage

Le fichier `.env.staging.example` est uniquement un **gabarit de noms et de formes**. Il ne contient aucun secret exploitable et ne doit jamais être rempli puis commité. Les valeurs réelles doivent être ajoutées dans le gestionnaire de secrets du déploiement choisi, puis injectées au runtime du serveur.

Le staging doit avoir une URL distincte de la production, une base de données isolée ou un schéma explicitement dédié, des clés de test fournisseur séparées et un bucket de stockage non public par défaut. Le callback KIE doit cibler l’URL staging ; FedaPay et Stripe doivent être configurés en mode test lorsque ces environnements le permettent.

## Variables et propriétaire

| Variable                                                               | Usage                                         |                         Secret ? | Vérification locale                     |
| ---------------------------------------------------------------------- | --------------------------------------------- | -------------------------------: | --------------------------------------- |
| `APP_URL`                                                              | Construction des callbacks et liens de retour | Non, mais environnement sensible | Doit être l’URL staging HTTPS           |
| `DATABASE_URL`                                                         | Base persistante                              |                              Oui | Base isolée et migrations appliquées    |
| `KIE_API_KEY`                                                          | Soumission et lecture des tâches IA           |                              Oui | Clé staging fournisseur                 |
| `KIE_WEBHOOK_HMAC_KEY`                                                 | Vérification callback KIE                     |                              Oui | Même secret configuré côté fournisseur  |
| `FEDAPAY_SECRET_KEY`                                                   | Création/vérification Mobile Money            |                              Oui | Clé test du compte cible                |
| `FEDAPAY_WEBHOOK_SECRET`                                               | Vérification callback FedaPay                 |                              Oui | Secret correspondant au webhook staging |
| `VITE_FEDAPAY_PUBLIC_KEY`                                              | Initialisation checkout côté navigateur       | Non critique, mais environnement | Clé publique test uniquement            |
| `STRIPE_SECRET_KEY`                                                    | Checkout et API Stripe                        |                              Oui | Clé test Stripe                         |
| `STRIPE_WEBHOOK_SECRET`                                                | Vérification callback Stripe                  |                              Oui | Secret du endpoint staging              |
| `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Persistance des assets                        |         Oui sauf endpoint/bucket | Bucket staging, accès minimal           |

## Ordre de configuration

La configuration doit suivre cet ordre : créer la base staging ; appliquer les migrations versionnées ; créer le bucket et ses permissions minimales ; enregistrer l’URL de callback KIE, FedaPay et Stripe ; ajouter les secrets au gestionnaire de déploiement ; déployer ; exécuter les endpoints de santé et le test de lecture catalogue ; seulement ensuite lancer les scénarios de paiement et de génération.

Aucun secret ne doit être copié dans les issues, logs, screenshots, pièces jointes ou fichiers de preuve. Les journaux doivent conserver uniquement des références tronquées, des identifiants de run et des statuts nécessaires à la réconciliation.

## Gate local avant configuration distante

Le dépôt est prêt localement si `pnpm check:release` passe, si `.env.staging.example` ne contient que des placeholders, si `git diff --check` passe et si aucune variable réelle n’est présente dans Git. Le dépôt ne doit pas prétendre que le staging est réussi tant que les preuves fournisseur du `Proof Record` ne sont pas ajoutées.

## Références

[1]: ../../PRODUCTION-RUNBOOK.md "Cortexia production runbook"
[2]: 08-proof-record.md "Cortexia proof record"
[3]: 09-launch-envelope.md "Cortexia launch envelope"
[4]: ../../src/lib/storage/r2.ts "Cortexia storage configuration"
