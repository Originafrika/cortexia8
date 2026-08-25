# Cortexia — Plan de production

**Révision :** 25 août 2026

**Méthode :** Nature Way

**Autorité :** `docs/nature-way/00-founder-hq-board.md` et `docs/nature-way/01-seed-cortexia.md`

## État réel réconcilié

Le dépôt contient déjà une base plus avancée que ne le disait la version historique de ce document. Le **playground** appelle une fonction serveur de génération, résout les uploads, vérifie les crédits, persiste les runs, soumet les tâches au fournisseur et poll les résultats asynchrones. Les modèles texte disposent d’un chemin synchrone. Les paiements **FedaPay Mobile Money** et **Stripe Checkout** possèdent également des chemins serveur, une vérification fournisseur et un crédit idempotent du ledger. Les assets et les workflows ont des structures persistantes en base.

La production n’est toutefois pas considérée comme fermée. La preuve staging de bout en bout, la réconciliation réelle des callbacks, l’observabilité structurée et l’assainissement des alias de modèles restent à démontrer. L’ancienne route `/run-migration` est désormais une page inerte et ne doit plus être utilisée pour modifier la base.

| Domaine          | État                                                                                                | Source d’autorité                                            | Gap résiduel                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| Authentification | Implémentée avec session serveur et contrôles de rôle sur certaines surfaces                        | `src/lib/api/auth.ts`, routes d’authentification             | Tests ciblés et réduction des assertions de type                  |
| Catalogue        | Catalogue statique détaillé, prix et schémas d’entrée disponibles ; base seedée                     | `src/lib/models-data.ts`, `drizzle/0002_seed_models.sql`     | Réconciliation datée des endpoints actifs et des prix fournisseur |
| Génération       | Réelle pour le playground via KIE, avec débit et persistance                                        | `src/lib/api/generate.ts`, `src/routes/app.models.$slug.tsx` | Smoke test staging par catégorie et preuve de récupération        |
| Crédits          | Ledger et références d’usage/paiement idempotentes                                                  | `src/lib/credits.ts`, `drizzle/schema.ts`                    | Test d’intégration DB sous concurrence et replay                  |
| Mobile Money     | Création et vérification FedaPay côté serveur                                                       | `src/lib/api/payments.ts`                                    | Validation par pays, callback signé et preuve staging             |
| Carte            | Session Stripe et webhook signé sur corps brut                                                      | `src/lib/api/payments.ts`, `server/api/webhooks/stripe.ts`   | Replay staging, monitoring et procédure de réconciliation         |
| Stockage         | R2 optionnel avec fallback CDN documenté                                                            | `src/lib/storage/r2.ts`                                      | Confirmer le stockage durable en environnement de production      |
| Canvas / agents  | Canvas et application de plans présents ; sélection agent encore polluée par des alias non vérifiés | `src/lib/agent.ts`, `src/components/canvas/agent-panel.tsx`  | Lier l’agent au catalogue réel avant commercialisation            |
| Opérations       | Runbook et checklist de cutover présents                                                            | `PRODUCTION-RUNBOOK.md`, `LIVE-CUTOVER-CHECKLIST.md`         | Logger structuré, IDs de corrélation, CI et tests staging         |

## Milestone actif

**Fermer le premier ring de preuve :** un utilisateur authentifié recharge son compte par Mobile Money, exécute un modèle actif réel, reçoit un résultat ou une erreur récupérable, puis voit un solde et un historique cohérents. Le paiement carte doit être vérifié dans la même fenêtre, mais ne doit pas retarder la preuve Mobile Money dans le pays de lancement.

## Ordre d’exécution Nature Way

| Ring | Tranche verticale                      | Dépendances                                       | Définition de fini                                                                      | Statut                    |
| ---- | -------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------- |
| R0   | Fondation de sécurité et documentation | Migrations versionnées, runbook                   | Aucune mutation DB par route publique ; documents réconciliés ; typecheck/build passent | `in_progress`             |
| R1   | Génération unitaire réelle             | Auth, catalogue, crédits, KIE, stockage           | UI → serveur → fournisseur → résultat/erreur ; coût et solde vérifiables                | `partial`                 |
| R2   | Recharge Mobile Money                  | FedaPay, ledger, callback, change XOF/USD         | Paiement approuvé, refusé, montant discordant et replay prouvés                         | `partial`                 |
| R3   | Carte                                  | Stripe Checkout, webhook signé                    | Session créée, callback signé, crédit unique et réconciliation prouvés                  | `partial`                 |
| R4   | Catalogue fiable                       | Source modèle, endpoint, prix, état de fidélité   | Aucun alias commercial sans endpoint et prix vérifiés                                   | `blocked` par CX-ROOT-004 |
| R5   | Canvas agentique borné                 | Catalogue fiable, permissions, opérations graphes | Agent propose un plan valide, coût estimé, confirmation et exécution récupérable        | `deferred`                |
| R6   | Flows créatifs type Canva              | Tronc stable, assets, templates, quotas           | Un flow métier complet avec états, coûts et export vérifiés                             | `deferred`                |

## P0 immédiat réalisé dans ce ring

La route legacy `/run-migration` ne déclenche plus de migration. Elle affiche uniquement une page de désactivation. Les migrations de production restent celles de `drizzle/` exécutées par la procédure opérateur décrite dans `PRODUCTION-RUNBOOK.md` et `LIVE-CUTOVER-CHECKLIST.md`.

## Ce qui ne doit pas être fait maintenant

Il ne faut pas élargir le catalogue, ajouter une parité marketing avec Canva ou exposer davantage d’agents avant d’avoir fermé les preuves de paiement, de génération, de stockage et de réconciliation. Il ne faut pas non plus afficher comme capacités disponibles les alias qui ne disposent pas d’une correspondance contrôlée dans le catalogue et la base.

## Gates de validation

À chaque changement touchant l’authentification, les crédits, les paiements, les callbacks, le stockage ou le catalogue, exécuter au minimum :

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm exec tsc --noEmit
pnpm exec vite build
```

La validation complète doit ajouter un smoke test staging, une vérification des callbacks signés, un replay idempotent, une inspection du solde et une preuve de résultat utilisateur. Une capture d’écran seule ne prouve ni l’autorisation serveur ni la comptabilité.

## Références

[1]: docs/nature-way/00-founder-hq-board.md "Cortexia Founder HQ Board"
[2]: docs/nature-way/01-seed-cortexia.md "Cortexia Seed produit"
[3]: docs/nature-way/02-decision-ledger.md "Cortexia Decision Ledger"
[4]: src/lib/api/generate.ts "Cortexia generation server function"
[5]: src/lib/api/payments.ts "Cortexia payment server functions"
[6]: server/api/webhooks/stripe.ts "Cortexia Stripe webhook"
[7]: PRODUCTION-RUNBOOK.md "Cortexia production runbook"
[8]: LIVE-CUTOVER-CHECKLIST.md "Cortexia live cutover checklist"
