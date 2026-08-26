# Cortexia — Founder HQ Board

**Date de revue :** 25 août 2026  
**Milestone actif :** rendre le tronc génération + crédits + paiement vérifiable en staging  
**Gate primaire :** Nature Way — Root System / Trunk / Heartwood  
**Cadence proposée :** revue hebdomadaire, revue événementielle après incident paiement, callback ou échec fournisseur  
**Propriétaire :** Business Owner — Cortexia

| Domaine              | Vérité actuelle                                                                                                                                                                                              | Autorité / enregistrement                                                                                                                                            | Gate ou statut                                             | Owner                        | Prochaine action                                                                   | Capacité / risque                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Milestone actif      | L’instance de production répond sur `cortexia.originafrika.online` ; la preuve de bout en bout du tronc et de l’agent canvas reste à fermer                                                                  | `docs/nature-way/01-seed-cortexia.md`, `docs/nature-way/12-production-public-observations-2026-08-26.md`                                                             | `in_progress`                                              | Business Owner + Engineering | Vérifier une session autorisée et diagnostiquer les routes `/app` et `/app/models` | Ne pas assimiler accessibilité publique et production-ready                                          |
| Preuve produit       | Le domaine public répond et la connexion se rend ; `/app` et `/app/models` restent blancs dans une session non authentifiée ; le tronc et l’agent canvas ne sont pas encore prouvés sur cette instance       | `docs/nature-way/08-proof-record.md`, `docs/nature-way/12-production-public-observations-2026-08-26.md`, `src/components/canvas/agent-panel.tsx`, `src/lib/agent.ts` | Accessible publiquement, preuve fonctionnelle à confirmer  | Engineering                  | Vérifier après connexion sans lancer de paiement ni génération                     | Rendre visible l’écart entre surface marketing et preuve produit                                     |
| Client / commercial  | Vision claire : créateurs, agences, développeurs ; signal d’usage réel non fourni                                                                                                                            | Seed produit                                                                                                                                                         | `unproven`                                                 | Business Owner               | Obtenir 5 parcours observés auprès de créateurs ciblés                             | Ne pas annoncer une économie ou une supériorité prix sans benchmark daté                             |
| Capital / runway     | Non instruit dans cette revue                                                                                                                                                                                | Aucun dossier de levée ouvert                                                                                                                                        | `deferred`                                                 | Business Owner               | Aucun avant preuve du tronc                                                        | Ne pas consommer la capacité produit pour une narrative d’investissement prématurée                  |
| Opportunités         | Aucune opportunité externe qualifiée dans le dépôt inspecté                                                                                                                                                  | Tracker d’opportunités à créer si nécessaire                                                                                                                         | `deferred`                                                 | Business Owner               | Revenir seulement si une opportunité change le milestone                           | Toute intégration partenaire doit passer par une carte d’opportunité et un coût de capacité          |
| Release / opérations | Production publique accessible en lecture seule ; `/app` et `/app/models` répondent mais rendent blanc sans session ; aucun paiement ou appel fournisseur n’a été lancé                                      | `PRODUCTION-RUNBOOK.md`, `LIVE-CUTOVER-CHECKLIST.md`, `docs/nature-way/09-launch-envelope.md`, `docs/nature-way/12-production-public-observations-2026-08-26.md`     | `blocked` pour preuve de release et smoke test fournisseur | Engineering                  | Diagnostiquer le rendu authentifié puis exécuter la matrice contrôlée              | Risques : déploiement différent du commit, routes privées blanches, callbacks inline, réconciliation |
| Décisions            | Le compte unifié conserve un ledger unique ; Mobile Money précède la carte ; les alias non vérifiés ne sont pas commercialisés ; le canvas agentique est la prochaine branche après le gate staging du tronc | `docs/nature-way/01-seed-cortexia.md`, `docs/nature-way/02-decision-ledger.md`                                                                                       | À revoir après staging                                     | Business Owner + Engineering | Préparer le protocole de preuve agentique sans élargir les permissions             | Coût, confirmation, propriété workflow, erreurs partielles et modèle vérifié                         |

## Revue hebdomadaire

La revue doit confirmer que le milestone actif n’a pas dérivé vers “tous les modèles” ou “tous les flows”. Elle doit vérifier la qualité des preuves plutôt que le volume de pages livrées, rapprocher le paiement fournisseur de la ligne `credits_ledger`, inspecter les états d’échec et de récupération, puis enregistrer une décision **keep / change / pause / stop** avec un propriétaire et une condition de réexamen.

La décision de cette revue est : **keep** le tronc génération + crédits + paiement, **prioriser** la fonctionnalité agentique bornée du canvas comme branche de rang 2, **pause** les agents autonomes non bornés, l’expansion Canva et le catalogue de modèles non vérifiés, puis **revoir** après un smoke test staging complet.

## Prochaine action minimale

Conserver les migrations versionnées comme seule voie opérateur et garder les gates locaux verts. Prochaine action : vérifier une session autorisée sur la production et diagnostiquer les routes blanches sans mutation ; ensuite seulement exécuter la preuve contrôlée du tronc, puis du canvas agentique.

## Références internes

- `docs/nature-way/01-seed-cortexia.md`
- `docs/nature-way/02-decision-ledger.md`
- `PRODUCTION-RUNBOOK.md`
- `LIVE-CUTOVER-CHECKLIST.md`
- `POST-LAUNCH-BACKLOG.md`
- `docs/nature-way/12-production-public-observations-2026-08-26.md`
- `docs/nature-way/03-market-research.md`
- `docs/nature-way/04-pricing-experiment.md`
- `docs/nature-way/08-proof-record.md`
- `docs/nature-way/09-launch-envelope.md`
- `docs/nature-way/11-founder-hq-review-2026-08-25.md`
