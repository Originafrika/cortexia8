# Cortexia — Founder HQ Board

**Date de revue :** 25 août 2026  
**Milestone actif :** rendre le tronc génération + crédits + paiement vérifiable en staging  
**Gate primaire :** Nature Way — Root System / Trunk / Heartwood  
**Cadence proposée :** revue hebdomadaire, revue événementielle après incident paiement, callback ou échec fournisseur  
**Propriétaire :** Business Owner — Cortexia

| Domaine              | Vérité actuelle                                                                                                                                                                                              | Autorité / enregistrement                                                                                                    | Gate ou statut                                                        | Owner                        | Prochaine action                                                              | Capacité / risque                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Milestone actif      | Génération réelle et paiements existent déjà dans le dépôt ; la preuve staging complète reste à fermer                                                                                                       | `docs/nature-way/01-seed-cortexia.md`, `PRODUCTION-RUNBOOK.md`                                                               | `in_progress`                                                         | Business Owner + Engineering | Fermer les tests staging de paiement et génération                            | Un seul tronc actif ; ne pas ouvrir de nouvelles branches avant preuve                      |
| Preuve produit       | Playground, débit de crédits, KIE et Stripe/FedaPay sont implémentés ; l’agent du canvas propose et applique déjà des plans bornés sur les modèles vérifiés ; adoption et disponibilité réelle non prouvées  | `docs/nature-way/08-proof-record.md`, `src/components/canvas/agent-panel.tsx`, `src/lib/agent.ts`, `src/lib/api/generate.ts` | Code local vérifié, staging à confirmer ; agentique = priorité rang 2 | Engineering                  | Exécuter le tronc staging, puis prouver un workflow agentique de bout en bout | L’agent reste borné : modèles vérifiés, confirmation, application serveur                   |
| Client / commercial  | Vision claire : créateurs, agences, développeurs ; signal d’usage réel non fourni                                                                                                                            | Seed produit                                                                                                                 | `unproven`                                                            | Business Owner               | Obtenir 5 parcours observés auprès de créateurs ciblés                        | Ne pas annoncer une économie ou une supériorité prix sans benchmark daté                    |
| Capital / runway     | Non instruit dans cette revue                                                                                                                                                                                | Aucun dossier de levée ouvert                                                                                                | `deferred`                                                            | Business Owner               | Aucun avant preuve du tronc                                                   | Ne pas consommer la capacité produit pour une narrative d’investissement prématurée         |
| Opportunités         | Aucune opportunité externe qualifiée dans le dépôt inspecté                                                                                                                                                  | Tracker d’opportunités à créer si nécessaire                                                                                 | `deferred`                                                            | Business Owner               | Revenir seulement si une opportunité change le milestone                      | Toute intégration partenaire doit passer par une carte d’opportunité et un coût de capacité |
| Release / opérations | Runbook, checklist, callbacks et enveloppe de lancement documentés ; route de migration web inerte ; aucune variable staging n’est disponible dans cette session                                             | `PRODUCTION-RUNBOOK.md`, `LIVE-CUTOVER-CHECKLIST.md`, `docs/nature-way/09-launch-envelope.md`                                | `blocked` pour release publique et smoke test fournisseur             | Engineering                  | Configurer un staging isolé avec secrets hors dépôt, puis exécuter la matrice | Risques : callbacks inline, variables d’environnement, réconciliation fournisseur           |
| Décisions            | Le compte unifié conserve un ledger unique ; Mobile Money précède la carte ; les alias non vérifiés ne sont pas commercialisés ; le canvas agentique est la prochaine branche après le gate staging du tronc | `docs/nature-way/01-seed-cortexia.md`, `docs/nature-way/02-decision-ledger.md`                                               | À revoir après staging                                                | Business Owner + Engineering | Préparer le protocole de preuve agentique sans élargir les permissions        | Coût, confirmation, propriété workflow, erreurs partielles et modèle vérifié                |

## Revue hebdomadaire

La revue doit confirmer que le milestone actif n’a pas dérivé vers “tous les modèles” ou “tous les flows”. Elle doit vérifier la qualité des preuves plutôt que le volume de pages livrées, rapprocher le paiement fournisseur de la ligne `credits_ledger`, inspecter les états d’échec et de récupération, puis enregistrer une décision **keep / change / pause / stop** avec un propriétaire et une condition de réexamen.

La décision de cette revue est : **keep** le tronc génération + crédits + paiement, **prioriser** la fonctionnalité agentique bornée du canvas comme branche de rang 2, **pause** les agents autonomes non bornés, l’expansion Canva et le catalogue de modèles non vérifiés, puis **revoir** après un smoke test staging complet.

## Prochaine action minimale

Conserver les migrations versionnées comme seule voie opérateur, garder les gates locaux verts, puis configurer un environnement staging isolé. Après fermeture du tronc, exécuter la preuve agentique : lecture du graphe, proposition bornée, estimation de coût, confirmation, application DB et synchronisation du canvas.

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
- `docs/nature-way/11-founder-hq-review-2026-08-25.md`
