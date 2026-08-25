# Cortexia — Founder HQ Board

**Date de revue :** 25 août 2026  
**Milestone actif :** rendre le tronc génération + crédits + paiement vérifiable en staging  
**Gate primaire :** Nature Way — Root System / Trunk / Heartwood  
**Cadence proposée :** revue hebdomadaire, revue événementielle après incident paiement, callback ou échec fournisseur  
**Propriétaire :** Business Owner — Cortexia

| Domaine              | Vérité actuelle                                                                                                                                                                              | Autorité / enregistrement                                                                                                     | Gate ou statut                                            | Owner                        | Prochaine action                                                              | Capacité / risque                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Milestone actif      | Génération réelle et paiements existent déjà dans le dépôt ; la preuve staging complète reste à fermer                                                                                       | `docs/nature-way/01-seed-cortexia.md`, `PRODUCTION-RUNBOOK.md`                                                                | `in_progress`                                             | Business Owner + Engineering | Fermer les tests staging de paiement et génération                            | Un seul tronc actif ; ne pas ouvrir de nouvelles branches avant preuve                      |
| Preuve produit       | Playground, débit de crédits, KIE et Stripe/FedaPay sont implémentés ; l’agent et l’API publique ne proposent plus que les entrées vérifiées ; adoption et disponibilité réelle non prouvées | `docs/nature-way/08-proof-record.md`, `src/routes/app.models.$slug.tsx`, `src/lib/api/generate.ts`, `src/lib/api/payments.ts` | Code local vérifié, staging à confirmer                   | Engineering                  | Exécuter un smoke test de bout en bout avec données bornées                   | Les anciens documents historiques ne doivent plus guider le périmètre                       |
| Client / commercial  | Vision claire : créateurs, agences, développeurs ; signal d’usage réel non fourni                                                                                                            | Seed produit                                                                                                                  | `unproven`                                                | Business Owner               | Obtenir 5 parcours observés auprès de créateurs ciblés                        | Ne pas annoncer une économie ou une supériorité prix sans benchmark daté                    |
| Capital / runway     | Non instruit dans cette revue                                                                                                                                                                | Aucun dossier de levée ouvert                                                                                                 | `deferred`                                                | Business Owner               | Aucun avant preuve du tronc                                                   | Ne pas consommer la capacité produit pour une narrative d’investissement prématurée         |
| Opportunités         | Aucune opportunité externe qualifiée dans le dépôt inspecté                                                                                                                                  | Tracker d’opportunités à créer si nécessaire                                                                                  | `deferred`                                                | Business Owner               | Revenir seulement si une opportunité change le milestone                      | Toute intégration partenaire doit passer par une carte d’opportunité et un coût de capacité |
| Release / opérations | Runbook, checklist, callbacks et enveloppe de lancement documentés ; route de migration web inerte ; aucune variable staging n’est disponible dans cette session                             | `PRODUCTION-RUNBOOK.md`, `LIVE-CUTOVER-CHECKLIST.md`, `docs/nature-way/09-launch-envelope.md`                                 | `blocked` pour release publique et smoke test fournisseur | Engineering                  | Configurer un staging isolé avec secrets hors dépôt, puis exécuter la matrice | Risques : callbacks inline, variables d’environnement, réconciliation fournisseur           |
| Décisions            | Le compte unifié doit conserver un ledger unique ; le premier rail prioritaire est Mobile Money, puis carte ; les alias de modèles non vérifiés ne doivent pas être commercialisés           | `docs/nature-way/02-decision-ledger.md`                                                                                       | À revoir après staging                                    | Business Owner + Engineering | Valider le provider Mobile Money cible par pays et les coûts nets             | Prix, change XOF/USD, marge et disponibilité fournisseur sont sensibles au marché           |

## Revue hebdomadaire

La revue doit confirmer que le milestone actif n’a pas dérivé vers “tous les modèles” ou “tous les flows”. Elle doit vérifier la qualité des preuves plutôt que le volume de pages livrées, rapprocher le paiement fournisseur de la ligne `credits_ledger`, inspecter les états d’échec et de récupération, puis enregistrer une décision **keep / change / pause / stop** avec un propriétaire et une condition de réexamen.

La décision de cette revue est : **keep** le tronc génération + crédits + paiement, **pause** l’expansion Canva/agents et le catalogue de modèles non vérifiés, **change** la documentation et le chemin de migration legacy, puis **revoir** après un smoke test staging complet.

## Prochaine action minimale

Conserver les migrations versionnées comme seule voie opérateur, garder les gates locaux verts, puis configurer un environnement staging isolé avec `DATABASE_URL`, `APP_URL`, les secrets KIE/FedaPay/Stripe et, si activé, R2. La matrice de paiements et de génération pourra alors être exécutée sans exposer de secret dans le dépôt.

## Références internes

- `docs/nature-way/01-seed-cortexia.md`
- `docs/nature-way/02-decision-ledger.md`
- `PRODUCTION-RUNBOOK.md`
- `LIVE-CUTOVER-CHECKLIST.md`
- `POST-LAUNCH-BACKLOG.md`
- `docs/nature-way/03-market-research.md`
- `docs/nature-way/04-pricing-experiment.md`
- `docs/nature-way/08-proof-record.md`
- `docs/nature-way/09-launch-envelope.md`
