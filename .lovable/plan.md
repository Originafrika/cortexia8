
# Cortexia — Plan de build (frontend, données mockées)

Objectif : livrer une démo produit au niveau de finition Linear / Runway / Vercel. Aucune API réelle, tout mocké en TS. Copywriting entièrement rédigé, ton direct, jamais générique.

## 1. Système de design (fondation, avant toute page)

Fichier : `src/styles.css` (tokens) + `tailwind` via @theme.

- **Palette dark-first** : fond `#0A0A0B` avec 4 nuances superposées (`surface-0` à `surface-3`), texte `#F4F1EA`, muted `#8A8580`.
- **Accent unique** : **ambre profond** `oklch(0.78 0.16 70)` (`#E8A64B`-ish), + accent secondaire `emerald-desaturated` pour états positifs. Pas de violet/bleu IA.
- **Bordures** : `1px solid oklch(1 0 0 / 0.08)`, gradients de bordure sur cards clés (mask/border-image).
- **Ombres colorées** : `shadow-elevated` teintée ambre à faible opacité.
- **Typo** :
  - Display : **Instrument Serif** ou **Fraunces** (variable) — headlines à fort caractère.
  - Sans body : **Geist** — corps et UI.
  - Mono/tabular : **JetBrains Mono** — chiffres, prix, compteurs (font-variant-numeric: tabular-nums partout où il y a des chiffres).
  - Chargées via `<link>` dans `__root.tsx` (jamais `@import` remote en v4).
- **Espacement** : échelle généreuse, sections landing `py-32` desktop / `py-20` mobile.
- **Radius** : `--radius: 0.875rem`, cards importantes `rounded-2xl`.
- **Focus ring** : `ring-2 ring-accent/60 ring-offset-2 ring-offset-background`.

Primitives réutilisables : `PriceDisplay` (count animé + devise), `CurrencyBadge`, `ModelCard`, `Pill`, `Marquee`, `Countdown`, `Accordion`, `Skeleton` (shimmer custom, pas de spinner).

## 2. State global (mock)

- `src/lib/currency.ts` : store Zustand (déjà pas installé — à ajouter) OU React context léger. Devises USD, EUR, XOF, NGN, IDR, BRL, avec taux mockés statiques. Persistance `localStorage`. Un hook `useCurrency()` diffuse les changements → `PriceDisplay` s'anime.
- `src/lib/models.ts` : catalogue complet (image / vidéo / audio / texte) exactement selon le prompt, avec `priceUSD` déjà majoré ×1.26, `params[]`, `badge?`, `slug`, icônes.
- `src/lib/mock-history.ts` : générations factices (image URLs de placeholder générées, prompts, coût, date, modèle).
- `src/lib/format-price.ts` : conversion + formatage tabulaire.
- Hook `useCountUp(value, duration)` pour animation numérique.

## 3. Routes (TanStack Router — `src/routes/`)

```
__root.tsx            → head global (title Cortexia), CurrencyProvider, QueryClient
index.tsx             → Page A : Waitlist (jusqu'au 1er août)
app-preview.tsx       → Page B : landing finale (CTA → /app)
app.tsx               → Layout app (sidebar + header solde crédits + devise)
  app.index.tsx       → Playground unifié (agent)
  app.models.tsx      → Catalogue
  app.models.$slug.tsx→ Playground modèle
  app.history.tsx     → Historique
  app.developers.tsx  → Espace dev (clés + docs + usage)
  app.account.tsx     → Compte / facturation
```

Chaque route a son propre `head()` (title/description/og distincts). Root n'a pas d'og:image.

## 4. Page `/` — Waitlist

Structure verticale, hero asymétrique :

- **Fond animé** : mesh gradient ambre/anthracite très lent (CSS keyframes) + grille de miniatures floutées de créations qui défilent en arrière-plan avec overlay.
- **Hero** : headline serif large ("L'IA sans t'abonner à ce que tu n'utilises pas."), sous-titre direct, countdown éditorial vers 2026-08-01 intégré à droite du hero — grands chiffres tabulaires qui transitionnent (fade sur le dernier digit qui change, pas flicker). Composant `EditorialCountdown`.
- **Waitlist form** : email + pills métier (Pub / UGC / Émission / Film / Autre). Submit → transition en place vers écran de confirmation (rang mocké #1247, barre progression, lien parrainage copiable, boutons partage custom X/WhatsApp/Telegram/LinkedIn stylés).
- **Simulateur de crédits** : carte flottante 2 colonnes. Sliders par catégorie (image/vidéo/voix/texte) avec icônes. Résultat à droite avec `PriceDisplay` animé + phrase dynamique "Avec un abonnement classique, ça t'aurait coûté X même sans rien générer".
- **Sélecteur de devise** discret en haut à droite (drapeau + code, dropdown recherche), change global animé.
- **Bandeau modèles** : marquee horizontal auto-loop des cards de modèles (pause au hover).
- **Comparatif Cortexia vs abonnement** : 2 colonnes contrastées (grise vs ambre), 3-4 exemples chiffrés tirés du catalogue réel.
- **Preuve sociale** : compteur waitlist animé (`useCountUp`, +1 aléatoire toutes les ~15s), 3 témoignages (Amara/Lomé, Julien/São Paulo, Wei/Jakarta) avec avatars générés.
- **FAQ** accordéon (animation height fluide).
- **Footer** avec lien discret "Accès équipe" → `/app-preview`.

## 5. Page `/app-preview`

Mêmes sections que la waitlist (hero, simulateur, marquee modèles, comparatif, tarifs, témoignages, FAQ) SANS countdown ni formulaire waitlist. CTA "Commencer à créer" → `/app`.

## 6. App (`/app/*`)

**Layout `app.tsx`** : sidebar gauche (Agent / Modèles / Historique / Développeur / Compte), header top avec solde crédits animé + sélecteur devise + avatar.

- **`/app`** — Agent : layout à 2 zones, résultat central (image/vidéo/audio), fil de conversation discret à droite ou en bas. Textarea avec placeholder rotatif (5 exemples cyclant toutes les 4s, stop au focus), drag & drop multi-fichiers avec chips preview. Badge de modèle choisi avec raison ("Sélectionné pour son rendu photoréaliste") + mini-menu pour changer. Génération : barre progression simulée + étapes textuelles. Prix affiché avant génération.

- **`/app/models`** — Catalogue : grille cards riches, pills filtres (catégorie), search debounced. Badges "Populaire"/"Nouveau". Prix Cortexia (×1.26 déjà appliqué).

- **`/app/models/$slug`** — Formulaire dynamique selon `params[]` du modèle (prompt, upload, résolution, ratio, durée, seed, style). Toggle Simple/Avancé (transition height). `PriceDisplay` recalculé en direct. Galerie d'exemples pré-remplis en dessous.

- **`/app/history`** — Grille masonry, filtres type/modèle/date, overlay métadonnées au hover, panneau latéral au clic avec bouton "Régénérer".

- **`/app/developers`** — Table clés API (statut, dernière utilisation, permissions), modale création avec affichage one-time du secret. Doc interactive : sidebar endpoints, blocs code coloration (Prism ou shiki minimal), tabs curl/JS/Python, bouton copier. Sparkline usage + coût du mois.

- **`/app/account`** — Carte crédits premium (gradient ambre subtil, style carte de paiement), table transactions, cards moyens de paiement (Mobile Money / Carte / Crypto / Alipay) avec icônes distinctes, montant avec conversion live. Préférence devise persistée + toast confirmation.

## 7. Animations & micro-interactions

- Framer Motion (à installer) pour transitions de page (fade+slide subtle), accordéons, panneaux, modales.
- `useCountUp` custom pour tous les prix / compteurs.
- Hover cards : `scale-[1.02]` + shadow ambre + transition 200ms ease-out.
- Skeletons shimmer via keyframe CSS custom.
- Focus ring cohérent partout.

## 8. Contenu / copywriting

Rédigé intégralement selon le ton défini (voix directe, phrases courtes, vocabulaire créateur). Zéro placeholder. Headlines, sous-titres, boutons, tooltips, erreurs, emails de confirmation à l'écran.

## 9. Détails techniques

- **Dépendances à ajouter** : `framer-motion`, `zustand` (state devise + solde), `lucide-react` (déjà présent probablement).
- **Fonts** via `<link>` Google Fonts dans `__root.tsx` head.
- **Responsive** : mobile-first, chaque section testée mentalement 375px. Countdown, simulateur, waitlist form → traitement mobile spécifique (stack vertical, tailles réduites mais toujours éditoriales).
- **Accessibilité** : contraste AA, focus rings, aria-labels sur boutons icônes, prefers-reduced-motion respecté (désactive marquee & mesh anim).
- **SEO** : `head()` par route, title/desc/og distincts, une seule H1 par page.
- Aucun backend / Supabase / edge function. Tout mocké.
- Placeholder actuel de `/` supprimé.

## 10. Ordre d'exécution

1. Tokens design + fonts + primitives (`PriceDisplay`, `Countdown`, `Marquee`, `Pill`, `Skeleton`, `CurrencyProvider`).
2. Catalogue modèles + hook devise + `useCountUp`.
3. Page `/` waitlist (priorité craft max).
4. Page `/app-preview`.
5. Layout `/app` + agent playground.
6. `/app/models` + `/app/models/$slug`.
7. `/app/history`, `/app/developers`, `/app/account`.
8. Pass responsive + polish (transitions de page, reduced-motion, focus states).

Livrable : produit qui semble déjà en production, pas un prototype.
