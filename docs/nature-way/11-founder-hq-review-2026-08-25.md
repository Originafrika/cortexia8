# Cortexia — Founder HQ Review Snapshot

**Date :** 25 août 2026  
**Branche :** `main`  
**Commit observé :** `29b309b`
**Statut :** `local_ready_external_blocked`

## Revue

Le dépôt Cortexia est propre et synchronisé avec `origin/main`. Le tronc actif reste la vérification du parcours **compte unifié → crédits → paiement Mobile Money/carte → génération vérifiée**. Aucun nouveau périmètre Canva, agent autonome ou catalogue non réconcilié ne doit consommer de capacité avant la fermeture de ce gate.

Les preuves locales restent vertes : quatre fichiers de tests et onze tests réussis, typecheck validé, build validé, formatage contrôlé et template staging vérifié comme contenant uniquement des placeholders. Le dernier verrou serveur empêche aussi la génération web sur un modèle non vérifié lorsqu’un client contourne l’interface. L’application du plan agentique recalcule désormais les modèles et les coûts depuis la base, refuse les entrées non vérifiées et conserve l’application transactionnelle du graphe. Le runner canvas bloque également les nœuds non vérifiés déjà présents dans un workflow avant toute soumission fournisseur.

## Décision de la revue

| Question Founder HQ       | Réponse actuelle                                                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Milestone actif           | Rendre le tronc paiement + ledger + génération vérifiée prouvable en staging                                            |
| Gate unique               | Exécuter la matrice staging FedaPay, Stripe, KIE, DB et stockage                                                        |
| Evidence d’avance         | `docs/nature-way/08-proof-record.md`, `PRODUCTION-RUNBOOK.md`, `pnpm check:release`                                     |
| Evidence d’arrêt          | Toutes les variables staging sont absentes de cette session ; aucun smoke test fournisseur ne peut être prétendu réussi |
| Capacité                  | **Keep** le tronc ; **pause** Canva/agents autonomes/catalogue non vérifié                                              |
| Prochaine action minimale | Configurer les secrets dans le gestionnaire du staging, sans les commiter ni les envoyer dans le chat                   |
| Owner                     | Business Owner + Engineering / Operations                                                                               |

## Revue de dépendances

Aucune opportunité externe, levée de fonds ou engagement partenaire n’est actif dans le board. Ces pistes restent différées afin de protéger la preuve produit. La pièce jointe fournie pendant la revue précédente était vide et n’a donc pas modifié les décisions.

## Condition de réouverture

Réouvrir le périmètre seulement après un `Proof Record` staging contenant au minimum un paiement Mobile Money approuvé et rejoué, un paiement carte en mode test, une génération vérifiée réussie, une génération échouée avec remboursement, une réconciliation d’un callback manqué et un workflow agentique validé sur un graphe réel. Une anomalie de double crédit ou de débit orphelin impose une pause et une revue du ledger.

## Références

[1]: 00-founder-hq-board.md "Cortexia Founder HQ Board"
[2]: 08-proof-record.md "Cortexia Proof Record"
[3]: 09-launch-envelope.md "Cortexia Launch Envelope"
[4]: 10-local-staging-kit.md "Cortexia Local Staging Kit"
[5]: ../../PRODUCTION-RUNBOOK.md "Cortexia Production Runbook"
