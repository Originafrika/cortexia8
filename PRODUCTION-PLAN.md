# Cortexia — Plan de mise en production

## État actuel (résumé)
- **RÉEL** : DB Neon Postgres, Auth Neon, Waitlist SQL, Wall URLs CDN (images/vidéos), Simulateur (math)
- **MOCK** : Agent IA 100%, Facturation/Paiement, Audio wall, ~12 modèles fictifs (GPT-5.5, Claude Opus 4.8...)

---

## Phase A — Intégration IA (priorité 1)

### A1. Connexion fal.ai pour l'exécution des modèles
**Fichier** : `src/server.ts` ou nouveau `src/lib/ai.ts`

- Créer un server function `generateContent` qui appelle l'API fal.ai
- Pour chaque type (image/vidéo/voix/texte), router vers le bon endpoint fal.ai
- Retourner l'URL du résultat généré
- **Endpoints à connecter** :
  - Image : `fal-ai/seedream/v5/pro/text-to-image`, `fal-ai/nano-banana-2`, `fal-ai/gpt-image-2`
  - Vidéo : `fal-ai/kling-video/v3/pro/text-to-video`, `fal-ai/seedance-2.0/text-to-video`
  - Voix : `elevenlabs/tts/turbo-v2.5`
  - Texte : `fal-ai/claude-sonnet-5` (ou autre LLM)

### A2. Remplacer le mock de l'agent
**Fichier** : `src/routes/app.index.tsx`

- Remplacer `inferKind()` par un vrai appel LLM (Claude/GPT) pour classifier le prompt
- Remplacer `pickModels()` par un routing intelligent basé sur le type détecté
- Remplacer `runGeneration()` par l'appel `generateContent` du serveur
- Remplacer les images placeholder `picsum.photos` par les vraies URLs de sortie

### A3. Modèles fictifs
**Fichier** : `src/lib/models.ts`

- Supprimer ou renommer les modèles fictifs : `claude-sonnet-5`, `claude-opus-48`, `gpt-55`, `gemini-31-pro`, etc.
- Garder uniquement les modèles réellement disponibles via fal.ai
- Vérifier les prix against les tarifs réels fal.ai

---

## Phase B — Facturation et Crédits (priorité 2)

### B1. Système de crédits
**Fichiers** : `src/lib/credits.ts` (nouveau), `drizzle/schema.ts`

- Table `credits` : user_id, amount, source (waitlist_bonus, recharge, usage)
- Table `usage` : user_id, model, units, cost, timestamp
- Server functions : `getBalance`, `useCredits`, `rechargeCredits`

### B2. Intégration paiement
**Fichier** : `src/lib/payments.ts` (nouveau)

- Stripe Checkout ou Mobile Money via PawaPay
- Webhook pour confirmer les paiements
- Créditer le compte utilisateur après paiement

### B3. Affichage du solde dans l'app
**Fichier** : `src/routes/app.index.tsx`

- Remplacer `const CREDIT_USD = 24.63` par un vrai appel `getBalance()`
- Afficher le solde réel dans le header

---

## Phase C — Wall Audio (priorité 3)

### C1. Générer les fichiers audio
- Utiliser l'API ElevenLabs pour générer les 3 clips audio (teaser FR, spot PT-BR, afrobeat)
- Stocker les fichiers dans un bucket (S3/Cloudflare R2)

### C2. Mettre à jour wall-data.ts
- Ajouter les `audioSrc` avec les vraies URLs des fichiers audio générés

---

## Phase D — Nettoyage des modèles fictifs (priorité 4)

### D1. Identifier les modèles réels vs fictifs
**Réels** (vérifiables sur fal.ai) :
- Seedream 5.0 Pro/Lite, Nano Banana 2/Lite, GPT Image 2, Qwen Image 2.0
- Kling 3.0 (Pro/Turbo/Standard/4K/Motion), Seedance 2.0 (Fast/Mini)
- Wan 2.7 (Image/Video), HappyHorse 1.1, Grok Video 1.5
- Gemini Omni Video, OmniHuman 1.5, Volcengine Lip Sync
- ElevenLabs V3

**Fictifs à supprimer ou remplacer** :
- `claude-sonnet-5`, `claude-fable-5`, `claude-opus-48/47/46/45`, `claude-sonnet-46/45`, `claude-haiku-45`
- `gpt-55`, `gpt-54`, `gpt-52`, `gpt-5-codex-a/b`
- `gemini-31-pro`, `gemini-35-flash`, `gemini-25-flash`

### D2. Remplacer par des modèles réels
- Utiliser les modèles LLM disponibles via fal.ai ou directement via les APIs
- Vérifier les prix contre les tarifs réels

---

## Phase E — Optimisations et Polish (priorité 5)

### E1. Performance
- Lazy loading des vidéos (déjà fait avec IntersectionObserver)
- Optimisation des images (WebP, responsive)
- Cache des prix du catalogue

### E2. SEO et Meta
- Tags Open Graph pour chaque page
- Sitemap
- Meta descriptions

### E3. Monitoring
- Erreurs serveur (Sentry ou similar)
- Analytics (Plausible ou PostHog)
- Uptime monitoring

---

## Ordre d'exécution recommandé

| Étape | Priorité | Effort | Impact |
|-------|----------|--------|--------|
| A1 (fal.ai) | P0 | Moyen | Débloque tout le reste |
| A2 (Agent mock) | P0 | Élevé | Le cœur du produit |
| B1 (Crédits) | P1 | Moyen | Nécessaire pour la facturation |
| B2 (Paiement) | P1 | Élevé | Monétisation |
| C1 (Audio wall) | P2 | Faible | Polish visuel |
| D1 (Modèles fictifs) | P2 | Faible | Cohérence du catalogue |
| A3 (Nettoyage modèles) | P2 | Moyen | Fiabilité |
| E1-E3 (Polish) | P3 | Variable | Production-ready |

---

## Estimation temps

| Phase | Semaines estimées |
|-------|-------------------|
| A (Intégration IA) | 3-4 semaines |
| B (Facturation) | 2-3 semaines |
| C (Audio wall) | 1 semaine |
| D (Nettoyage modèles) | 1 semaine |
| E (Polish) | 1-2 semaines |
| **Total** | **8-11 semaines** |

---

## Questions ouvertes

1. **Quel LLM pour l'agent ?** Claude via API directe, ou fal.ai ?
2. **Quel provider de paiement ?** Stripe (carte), PawaPay (Mobile Money), ou les deux ?
3. **Quel bucket pour les assets ?** Cloudflare R2, AWS S3, ou autre ?
4. **Le wall doit-il être dynamique (généré à la demande) ou statique (pré-généré) ?**
