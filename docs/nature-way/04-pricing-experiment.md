# Cortexia — Expérience de prix et de monétisation

**Date :** 25 août 2026  
**Milestone :** prouver la première transaction et la première génération avec une marge contrôlée  
**Statut :** `ready_for_staging`

## Principe

Le modèle initial doit privilégier un **portefeuille prépayé** : l’utilisateur achète des crédits, choisit un modèle ou un flow, voit le coût estimé avant exécution et ne paie pas un abonnement qui pourrait être disproportionné pour un usage irrégulier. Cette décision est réversible et compatible avec le compte unifié demandé. Les abonnements ne doivent être introduits qu’après observation d’une fréquence d’usage et d’un besoin d’équipe réels.

Le catalogue du dépôt applique actuellement un multiplicateur Cortexia de 1,26 sur certains coûts fournisseur et conserve les prix en USD de référence. Ce mécanisme doit devenir une règle explicitement contrôlée par modèle et par unité ; il ne doit pas être présenté comme “le meilleur prix” tant que les frais de paiement, le change, le stockage, les échecs et le support n’ont pas été mesurés dans le pays cible.

## Options viables

| Option                                 | Expérience utilisateur                                    | Avantage                                                                     | Risque / coût                                                                                | Décision                         |
| -------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------- |
| A. Portefeuille prépayé à l’usage      | Recharge Mobile Money ou carte, puis débit par génération | Simple, inclusif, compatible avec les usages irréguliers et le compte unifié | Revenu moins prévisible ; gestion des petits soldes et des remboursements                    | **Choisie pour le premier ring** |
| B. Abonnement avec crédits mensuels    | Paiement récurrent contre un quota et des avantages       | Prévisibilité du revenu et meilleure rétention si l’usage est régulier       | Plus difficile à expliquer en XOF ; risque d’expiration/perte de valeur ; support plus lourd | À tester après preuve d’usage    |
| C. Hybride portefeuille + plans équipe | Pay-as-you-go individuel, crédits et sièges pour équipes  | Conserve l’accès bas-friction et ouvre une offre B2B                         | Complexité du pricing, des quotas et des permissions                                         | Branche post-tronc               |

## Hypothèse à falsifier

Un créateur ou une petite équipe préfère acheter une petite quantité de crédits en Mobile Money, exécuter plusieurs modèles avec un prix visible et revenir parce que Cortexia réduit la friction de compte et de paiement. Cette hypothèse doit être testée sans confondre intérêt déclaré et usage payé.

## Expérience staging puis pilote

Le test staging doit couvrir un petit package en XOF, une transaction approuvée, une transaction refusée, un montant/currency mismatch, un replay du même callback, un échec de soumission fournisseur et un remboursement de la réserve. Le pilote externe doit rester limité à un pays et à une liste de modèles explicitement vérifiés.

Les métriques minimales sont le taux de paiement approuvé, le taux de callback non réconcilié, le délai entre paiement et crédit, le taux de génération réussie, la marge brute par unité après frais de paiement et stockage, le montant moyen rechargé, le solde inutilisé et le taux de retour à 7 jours. Les seuils seront définis dans le launch envelope après le premier échantillon, plutôt que supposés à partir d’un concurrent.

## Garde-fous de prix

Le serveur est l’autorité du prix. Avant soumission, il doit réserver le coût estimé ; en cas d’échec de soumission, il rembourse la réservation ; après paiement, un callback vérifié et idempotent crédite une seule référence ledger. Une page ou un client ne peut ni modifier le prix, ni créer un crédit, ni transformer un statut fournisseur non vérifié en succès.

## Références

[1]: ../src/lib/models-data.ts "Cortexia catalogue and price margin source"
[2]: ../src/lib/api/generate.ts "Cortexia generation debit and refund path"
[3]: ../src/lib/api/payments.ts "Cortexia FedaPay and Stripe payment paths"
[4]: ../server/api/webhooks/stripe.ts "Cortexia signed Stripe webhook"
[5]: 03-market-research.md "Cortexia market research notes"
