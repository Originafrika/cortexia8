# Cortexia — Launch Envelope

**Version :** 0.1  
**Statut :** `not_ready_for_external_exposure`  
**Milestone :** pilote limité du tronc recharge Mobile Money → génération vérifiée

## Résultat recherché

Démontrer qu’un petit groupe de créateurs peut recharger son compte en XOF, exécuter un modèle vérifié et retrouver un résultat avec un coût compréhensible, sans double crédit ni débit orphelin. Le pilote vise la preuve de parcours et de fiabilité, pas une revendication de supériorité générale sur tous les fournisseurs.

## Exposition initiale

L’exposition doit rester limitée à un pays supporté et à une liste courte de modèles `fidele`. Le nombre d’utilisateurs, les packages de crédits, les modèles actifs et les moyens de paiement doivent être configurables par l’équipe opératrice. Le catalogue non réconcilié, les agents autonomes et les flows multi-étapes restent masqués du pilote.

## Signaux de succès et garde-fous

| Type      | Signal                   | Mesure                                               | Règle                                                                  |
| --------- | ------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| Succès    | Parcours complet         | Paiement approuvé → crédit → génération → résultat   | Étendre seulement après plusieurs parcours observés sans divergence    |
| Succès    | Compréhension du prix    | Utilisateur voit estimation et débit final cohérents | Corriger le pricing si une différence non explicable apparaît          |
| Garde-fou | Double crédit            | Comparaison callbacks/references et `credits_ledger` | Pause immédiate si une approbation produit plus d’un crédit            |
| Garde-fou | Débit orphelin           | Runs échoués vs refunds ledger                       | Pause si une soumission échouée conserve un débit sans état de revue   |
| Garde-fou | Taux d’échec fournisseur | Runs terminalement échoués / runs soumis             | Revoir modèle/provider avant d’élargir si le seuil convenu est dépassé |
| Garde-fou | Callback non vérifié     | Callbacks rejetés / callbacks reçus                  | Ne jamais désactiver la signature ; corriger secret ou contrat         |

Les seuils numériques doivent être fixés avec les premières données staging et le propriétaire du pilote. Aucune valeur par défaut ne doit être présentée comme un benchmark de marché.

## Séquence de rollout

Le déploiement commence par staging, puis un pilote interne, puis un petit groupe externe. Chaque étape possède une fenêtre d’observation et une revue explicite. Une étape ne s’étend pas automatiquement au simple motif que le build passe ; elle exige les preuves de paiement, génération, état terminal et réconciliation.

## Rollback

En cas de violation d’un garde-fou, désactiver les nouveaux paiements ou modèles via configuration contrôlée, arrêter l’exposition à de nouveaux utilisateurs, conserver les transactions et runs pour réconciliation, puis revenir au dernier commit déployé connu comme stable. Ne pas supprimer les lignes financières ni modifier les soldes à la main. Toute correction de crédit passe par le ledger et une procédure approuvée.

## Communication et ownership

Le propriétaire de décision est le Business Owner Cortexia avec un owner engineering pour le ledger, les callbacks et la génération. Le support doit disposer d’une référence de paiement et d’une référence de run pour chaque incident. L’équipe ne doit pas communiquer “tous les modèles disponibles” ou “moins cher” tant que le périmètre, le coût et la date de mesure ne sont pas définis.

## Références

[1]: 08-proof-record.md "Cortexia proof record"
[2]: 05-root-system.md "Cortexia Root System"
[3]: ../../PRODUCTION-RUNBOOK.md "Cortexia operations runbook"
[4]: ../../LIVE-CUTOVER-CHECKLIST.md "Cortexia cutover checklist"
