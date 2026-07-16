# Wall - Real renders to generate

Each item below needs a real output from the listed model. Replace the `image:`, `video:`, and `audio:` URLs with the actual generated files.

## Image models (8 items)

| # | Model | Prompt | Use case |
|---|-------|--------|----------|
| w1 | Seedream 5.0 Pro | Flacon de parfum ambré sur marbre travertin, lumière rasante d'aube, contre-jour doux, éditorial mode. | Pub |
| w5 | Nano Banana 2 | Boîte de céréales bio flottant dans un ciel pastel, style pub magazine 2000s. | Pub |
| w8 | Seedream 5.0 Pro | Assiette de pâtisserie fine posée sur nappe lin blanc, plan zénithal, lumière du matin. | UGC |
| w11 | Qwen Image 2.0 | Bouteille de kombucha rose sur fond bleu ciel, ombres nettes, style pub minimaliste. | Pub |
| w15 | Seedream 5.0 Pro | Basket haute rouge suspendue par un fil, fond papier crème, lumière studio. | Pub |
| w17 | GPT Image 2 | Écran d'iPhone posé sur un carnet, message d'inscription à une newsletter mode. | UGC |
| w21 | Seedream 5.0 Lite | Sac en cuir camel posé sur banc de bois, ambiance café parisien. | Pub |
| w24 | Qwen Image 2.0 | Plante monstera dans un intérieur chaleureux, lumière du soir dorée. | UGC |

## Image models - Film/Show (4 items)

| # | Model | Prompt | Use case |
|---|-------|--------|----------|
| w3 | GPT Image 2 | Portrait cinématographique d'une comédienne en costume 1940, cheveux au vent, tempête à l'horizon. | Film |
| w9 | Wan 2.7 Image Pro | Décor de plateau TV cuisine ouverte, tons chauds bois et cuivre, projecteurs allumés. | Émission |
| w13 | Nano Banana 2 | Enfant lit un livre sur un toit de Jakarta au crépuscule, silhouette contre-jour orange. | Film |
| w19 | Wan 2.7 Image Pro | Ruelle pavée de Lisbonne la nuit, lampadaires jaunes, silhouette solitaire au fond. | Film |
| w22 | Nano Banana 2 | Titre d'émission « Nuits de Dakar » en typographie art déco dorée sur fond noir. | Émission |

## Video models (6 items)

| # | Model | Prompt | Use case |
|---|-------|--------|----------|
| w2 | Kling 3.0 Pro | Créatrice UGC déballe une paire de sneakers en unboxing, plan serré, lumière naturelle, ambiance matinale. | UGC |
| w6 | Seedance 2.0 Fast | Voiture électrique traverse une ville de nuit sous la pluie, reflets néons, plan travelling. | Pub |
| w10 | Kling 3.0 4K | Plan aérien d'un désert au coucher du soleil, dunes ondulantes, mouvement de caméra lent. | Film |
| w14 | Kling 3.0 Motion | Chef découpe un ananas dans un studio cuisine, plan macro, mouvement de dolly lent. | Émission |
| w18 | Seedance 2.0 Mini | Yoga au bord d'une piscine à Bali, salutation au soleil, plan large, lumière chaude. | UGC |
| w23 | Kling 3.0 Turbo | Café qui coule d'une machine expresso au ralenti, gouttes en macro, vapeur. | Pub |

## Audio models (3 items)

| # | Model | Prompt | Title | Use case |
|---|-------|--------|-------|----------|
| w4 | ElevenLabs V3 | Générique de talk-show africain, kora + synths chauds, 90 BPM, mood optimiste. | Générique — Studio Lomé (0:42) | Émission |
| w7 | ElevenLabs V3 | Voix off française, grave et calme, teaser d'une mini-série policière. | Teaser — Voix off FR (0:18) | Film |
| w12 | ElevenLabs V3 | Musique lo-fi pour reel Instagram beauté, guitare feutrée, batterie douce. | Reel beauté — Lo-fi (0:15) | UGC |
| w16 | ElevenLabs V3 | Voix off portugaise énergique pour spot radio, ton chaleureux et rythmé. | Spot radio — PT-BR (0:22) | Pub |
| w20 | ElevenLabs V3 | Nappe orchestrale sombre pour scène de suspense, cordes graves et pulsation lente. | Suspense — Cordes (1:04) | Film |

## How to get real renders

1. **Images**: Use the app's playground (Seedream, Nano Banana, GPT Image, Qwen, Wan) with each prompt above. Download the outputs.
2. **Videos**: Use Kling 3.0 Pro/Turbo/4K/Motion or Seedance 2.0 with each prompt. Download the MP4s.
3. **Audio**: Use ElevenLabs V3 with each prompt. Download the MP3s.
4. **Upload**: Store assets in `/public/wall/` or on a CDN. Update `wall-data.ts` URLs.
