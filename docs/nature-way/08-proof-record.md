# Cortexia — Proof Record

**Période :** 25 août 2026  
**Commit de référence :** `a437785`  
**Statut :** `partial`

## Preuves observées

| Proof ID | Critère                                                                               | Méthode                                                                                                                                                                                            | Environnement                        | Résultat                                                                                      | Classe   | Gap résiduel                                                                            |
| -------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| PR-001   | Le dépôt installe et compile après retrait de la migration web                        | `pnpm install --frozen-lockfile`, `pnpm exec tsc --noEmit`, `pnpm exec vite build`                                                                                                                 | Sandbox locale                       | Réussi ; build Nitro/Vercel généré                                                            | Observée | Pas de déploiement live vérifié                                                         |
| PR-002   | Les tests déterministes existants restent verts                                       | `pnpm test`                                                                                                                                                                                        | Sandbox locale                       | 4 fichiers de tests, 11 tests réussis après le slice agentique                                | Observée | Pas de test DB staging concurrent                                                       |
| PR-003   | La route `/run-migration` ne possède plus d’opération DB                              | Revue de `src/routes/run-migration.tsx` et suppression de `src/lib/api/run-migration.ts`                                                                                                           | Dépôt Git                            | Page inerte ; aucune mutation                                                                 | Observée | Vérification HTTP sur domaine de production à faire                                     |
| PR-004   | Le sélecteur agentique n’expose que le catalogue fidèle                               | `src/lib/agent-models.test.ts` + filtrage serveur dans `src/lib/agent.ts`                                                                                                                          | Sandbox locale                       | Alias connus rejetés ; modèle par défaut sélectionnable                                       | Observée | Validation fournisseur datée de chaque entrée fidèle                                    |
| PR-005   | Le catalogue et l’API publique masquent les entrées non vérifiées                     | Filtrage UI, loader playground, `GET /v1/models`, `POST /v1/generate`                                                                                                                              | Revue de code + build                | Entrées `generique` non exposées aux utilisateurs publics                                     | Bounded  | Test HTTP authentifié et migration DB à exécuter                                        |
| PR-006   | Les paiements et la génération disposent de chemins serveur réels                     | Revue de `src/lib/api/generate.ts`, `src/lib/api/payments.ts`, callbacks KIE/FedaPay/Stripe                                                                                                        | Dépôt Git                            | Création, vérification, ledger, refunds et callbacks présents                                 | Bounded  | Smoke test avec sandbox fournisseurs non exécuté dans cette session                     |
| PR-007   | L’application agentique vérifie le catalogue et le coût côté serveur                  | `src/lib/api/agent-apply.ts` charge les modèles actifs par slug, exige `fidelity_status = 'fidele'`, recalcule le coût depuis `cortexia_price_usd` et applique les opérations dans une transaction | Revue de code + `pnpm check:release` | Le contournement par slug non vérifié et le prix client ne suffisent plus à appliquer un plan | Bounded  | Test DB staging d’un plan valide, d’un slug non vérifié et d’un rollback transactionnel |
| PR-008   | Le runner canvas refuse aussi les modèles non vérifiés déjà présents dans un workflow | `src/lib/api/canvas-run.ts` marque le nœud en échec avant soumission fournisseur lorsque `fidelity_status !== 'fidele'`                                                                            | Revue de code + `pnpm check:release` | Un ancien workflow ne peut pas contourner le nouveau filtre agentique                         | Bounded  | Test DB staging d’un workflow avec nœud vérifié puis nœud non vérifié                   |

## Vérification d’environnement

Aucune variable de staging n’est disponible dans cette session : `APP_URL`, `DATABASE_URL`, `KIE_API_KEY`, `KIE_WEBHOOK_HMAC_KEY`, les secrets FedaPay, les secrets Stripe et les variables R2 ont été contrôlées uniquement par présence et sont toutes absentes. Aucun secret n’a été imprimé ni ajouté au dépôt. Cette observation confirme un **blocage d’environnement**, pas un échec de l’implémentation locale.

## Tests encore requis avant exposition externe

Le premier ring reste bloqué pour une ouverture publique tant que l’équipe n’a pas exécuté sur un environnement staging isolé un paiement FedaPay approuvé, refusé, rejoué et discordant ; un paiement Stripe en mode test avec vérification de signature ; une génération média avec callback réussi ; une génération avec échec et remboursement ; une génération interrompue puis réconciliée par polling ; et un contrôle d’accès sur un workflow d’un autre utilisateur.

Chaque test staging doit enregistrer un identifiant de transaction ou de run non sensible, l’état avant/après, le nombre de lignes ledger créées, le statut final, le temps de callback et le gap éventuel. Les secrets, prompts sensibles et données personnelles ne doivent pas être copiés dans ce document.

## Conclusion de gate

Le ring de code et de documentation est **vérifié localement**, mais le ring de production est **bloqué par l’environnement staging manquant**. Le prochain propriétaire est l’équipe d’exploitation/engineering, qui doit configurer les variables définies dans `PRODUCTION-RUNBOOK.md`, puis exécuter la matrice staging. Tant que cette matrice n’est pas passée, la bonne décision est de conserver l’exposition publique fermée ou limitée à une liste pilote explicitement approuvée.

## Références

[1]: ../../package.json "Cortexia release scripts"
[2]: ../../src/lib/agent-models.test.ts "Cortexia agent registry tests"
[3]: ../../src/routes/run-migration.tsx "Disabled migration route"
[4]: ../../src/lib/api/generate.ts "Cortexia generation path"
[5]: ../../src/lib/api/payments.ts "Cortexia payment path"
[6]: ../../server/api/webhooks/kie.ts "KIE callback verification"
[7]: ../../server/api/webhooks/fedapay.ts "FedaPay callback verification"
[8]: ../../server/api/webhooks/stripe.ts "Stripe callback verification"
[9]: ../../PRODUCTION-RUNBOOK.md "Cortexia staging and release runbook"
