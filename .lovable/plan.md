# Cortexia v4 — Finalisation UI complète

Objectif : livrer un produit démontrable de bout en bout, plus rien en placeholder.

## 1. Corrections urgentes (avant tout ajout)

- **Fix hydratation countdown** : `EditorialCountdown` rend `Date.now()` au SSR → mismatch. Le composant ne calcule le `diff` qu'après montage (état initial = `null`, valeurs affichées `--` jusqu'à l'hydratation).
- **Nettoyer toute mention de marge/×1.26/kie.ai** dans les textes visibles (simulateur, comparatif, FAQ, catalogue). La majoration reste un commentaire code, jamais un mot UI.

## 2. Le Wall — showcase modèles

Nouveau composant `ModelsWall` (masonry CSS columns 2/3/4 responsive) présent sur `/` et `/app-preview`.
- Mix images (Unsplash source stable), vidéos MP4 en autoplay muted loop au hover, cards audio avec waveform SVG animée + cover.
- Chaque card : badge modèle utilisé, catégorie.
- Filtres pills au-dessus : catégorie (Image/Vidéo/Musique/Voix) + cas d'usage (Pub/UGC/Émission/Film).
- Cascade d'apparition au scroll via Framer `whileInView` staggered.
- Chargement progressif : bouton "Voir plus" qui ajoute un batch de 12 (illusion d'infini avec ~60 items mockés).
- Clic → modale (Dialog custom) avec grand média, prompt, modèle, CTA "Crée le tien" → `/app/models/$slug`.
- Version condensée `WallPreview` (bandeau 6 cards + fondu) sous le hero des deux landings.

## 3. Devise + langue combinés (i18n)

- Nouveau `src/lib/i18n.ts` : dictionnaire par langue (`fr`, `en`, `pt`, `id`, `es`), hook `useT()`, store Zustand langue + devise unifié.
- Mapping devise→langue par défaut (USD→en, XOF→fr, EUR→fr, BRL→pt, IDR→id, NGN→en, MXN→es…). Override manuel possible.
- Composant unique `LocalePicker` (remplace `CurrencyPicker`) : drapeau + code devise + langue, popover avec recherche, deux colonnes (devise / langue) reliées mais dissociables.
- Toutes les strings des landings + nav app passent par `t("clé")`. Transition texte : fade court sur changement de langue (motion `AnimatePresence` sur `lang` key).

## 4. Agent (`/app`) amélioré

- **Onboarding première visite** : overlay 3 étapes (agent / playgrounds / paiement à l'usage) gated par `localStorage("cortexia:onboarded")`, ré-ouvrable via icône aide dans le header. Crédit de bienvenue 5 $ visible dès l'entrée.
- **Prompt starters** : 6 cards catégorisées (Pub/UGC/Émission/Film) affichées quand le fil est vide, remplissent la textarea au clic.
- **Carte de décision modèle** dans le fil : icône + justification rédigée + 2-3 alternatives mini-cards cliquables (switch instantané).
- **Chips d'affinage** après chaque génération : "Plus cinématographique", "Ambiance nuit", "Version 6s", etc. — envoient un message auto qui relance une génération dans le même thread.
- **Progression réaliste** : barre par type (vidéo = étapes + ETA plus long ; image = réveil par flou décroissant sur un placeholder).
- **Thread multi-générations** : liste scrollable, chaque résultat gardé avec ancre, mini-nav "sauter au résultat N".

## 5. Simulateur corrigé

- Toujours calcul des deux montants (Cortexia à l'usage vs abonnement mensuel de référence par catégorie, ex. Higgsfield-like 39 $, Midjourney 30 $, ElevenLabs 22 $).
- 3 états d'affichage : économie positive / seuil approché / abonnement compétitif — jamais 0. Message honnête dans le 3ᵉ cas, deux montants toujours visibles.
- Repère visuel de seuil sur chaque slider (tick + tooltip "seuil abonnement").
- Marche pour toutes catégories et toutes devises.

## 6. Distinction waitlist / live

- Constante `src/lib/launch.ts` : `LAUNCH_MODE: "waitlist" | "live"`, `LAUNCH_DATE`.
- `/` (waitlist) : badge persistant "Pré-lancement · J-N" intégré au header + mini countdown compact, footer "Accès équipe" en lien texte sobre.
- `/app-preview` : zéro mention waitlist/countdown/rang.
- Aucun CTA de la waitlist ne pointe vers `/app` ou `/app-preview` sauf le lien discret footer.

## 7. Onboarding waitlist enrichi

- Écran de confirmation reprend le cas d'usage sélectionné ("Parfait pour les créateurs UGC…").
- Compteur amis invités (mock 0), progression parrainage, partage stylé conservé.

## 8. Détails techniques

- Nouveaux fichiers : `lib/i18n.ts`, `lib/launch.ts`, `lib/wall-data.ts`, `components/models-wall.tsx`, `components/wall-preview.tsx`, `components/wall-modal.tsx`, `components/locale-picker.tsx`, `components/onboarding-overlay.tsx`, `components/prompt-starters.tsx`, `components/model-decision-card.tsx`, `components/refine-chips.tsx`, `components/waveform-card.tsx`.
- Refactor : `EditorialCountdown` (fix hydration), `SiteHeader` (badge + mini countdown en mode waitlist), `CreditSimulator` (nouvelle logique 3 états), `WaitlistForm` (récap use case), routes `index.tsx`, `app-preview.tsx`, `app.tsx`, `app.index.tsx` (i18n + onboarding + agent enrichi), `app.account.tsx` (LocalePicker), suppression `CurrencyPicker` (remplacé partout).
- Assets Wall : URLs Unsplash/Pexels/mixkit publiques + covers générées.
- Aucune dépendance nouvelle (Framer + Zustand déjà présents).

## 9. Ordre d'exécution en un passage

1. Fix countdown + purge mentions marge.
2. `launch.ts` + `i18n.ts` + `LocalePicker` (remplacement `CurrencyPicker` partout).
3. `wall-data.ts` + `ModelsWall` + `WallPreview` + `WallModal`.
4. Refactor `SiteHeader` waitlist-aware + `WaitlistForm` récap.
5. Refactor `CreditSimulator` 3 états + repère seuil.
6. Refactor `app.index.tsx` : onboarding, starters, decision card, refine chips, thread multi, progression.
7. Injection i18n dans routes `/` et `/app-preview`.
8. Passe responsive rapide + vérif liens/routes.

Livrable : produit prêt à démo, backend seul reste à connecter.
