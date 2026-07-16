
## Objectif

Remplir le Wall avec de vraies démos officielles pour **chaque modèle image et vidéo** du catalogue Cortexia, en récupérant les URLs de showcases publiques (fal.ai galleries, pages officielles des providers). Les vidéos jouent déjà en autoplay + loop + muted, et le hover unmute — ce comportement reste, on ajoute juste beaucoup plus de contenu réel et varié.

## Sources de showcases (démos publiques réelles)

Pour chaque modèle je récupérerai 1 à 3 assets réels depuis :

- **fal.ai** galleries publiques (`fal.media/files/...`) — Seedream 5 Pro/Lite, Nano Banana 2 (+ Lite), Qwen Image 2, Wan 2.7 Image/Pro, Wan 2.7 Video, Seedance 2 Fast/Mini, Kling 3 Turbo/Standard/Pro/4K/Motion, HappyHorse 1.1, Grok Imagine 1.5, Gemini Omni Video, OmniHuman 1.5, Volcengine Lip Sync
- **GPT Image 2** → OpenAI cookbook / exemples publics
- Chaque URL sera vérifiée (HEAD 200, bon Content-Type) avant d'être commit

Objectif : ~30–40 items sur le Wall (vs 13 actuellement), avec **au moins 1 asset par modèle du catalogue image/vidéo** et un mix équilibré ad/ugc/show/film.

## Modifications

### 1. `src/lib/wall-data.ts`
- Enrichir la constante `R` (registre d'URLs) en ajoutant les nouveaux assets par modèle (2–3 URLs distinctes pour les modèles phares, 1 pour les autres).
- Étendre `WALL_ITEMS` à ~35 entrées : chaque `modelSlug` du catalogue image/vidéo est représenté au moins une fois, avec `prompt`, `useCase` et `span` variés pour un bon rythme visuel dans le masonry.
- Vérifier que chaque `modelSlug` correspond à un slug existant dans `src/lib/models.ts` (pour que le CTA "Essayer" du modal ouvre bien la bonne page playground).

### 2. `src/components/models-wall.tsx` (petit polish)
- Confirmer que la logique hover→unmute vidéo est OK sur mobile (fallback : sur mobile, un tap sur la carte ouvre le modal avec son, pas de unmute au survol → comportement actuel déjà correct).
- `preload="metadata"` au lieu de `preload="auto"` pour les vidéos hors viewport, afin d'éviter de charger 30 MP4 d'un coup.
- Ajouter `loading="lazy"` sur les `<video>` via un `IntersectionObserver` léger : la vidéo ne commence à jouer que quand la carte entre dans le viewport (économise la bande passante).
- Pas de changement sur le modal ni sur les filtres.

### 3. Rien d'autre
Pas de changement backend, pas de changement de routing, pas de changement au flow waitlist/auth.

## Détails techniques

- Toutes les URLs pointent vers des CDN publics (fal.media, storage.googleapis.com, openai) — pas d'upload dans `public/`.
- Le champ `image` sert toujours de poster pour les vidéos (frame de preview) → pour chaque vidéo je garde une URL image poster distincte si disponible, sinon je réutilise l'URL vidéo (le `<video>` affiche la première frame).
- L'audio (voix / musique) reste sur les mêmes entrées ElevenLabs V3 existantes — pas de changement, l'utilisateur demande explicitement image + vidéo.

## Livrable
Un Wall dense, varié, avec du vrai contenu de chaque modèle du catalogue, autoplay muted en boucle, hover pour le son sur vidéo, clic pour agrandir dans le modal.
