// Mock showcase items for the "Le Wall" section.
// Real outputs will be swapped in once the backend is connected.

export type WallKind = "image" | "video" | "music" | "voice";
export type UseCase = "ad" | "ugc" | "show" | "film";

export type WallItem = {
  id: string;
  kind: WallKind;
  useCase: UseCase;
  /** Displayed model name (matches catalog when possible). */
  model: string;
  prompt: string;
  /** Playground slug to open when clicking "Make your own". */
  modelSlug: string;
  /** Poster / cover image URL (always present). */
  image: string;
  /** Optional MP4 for auto-loop on hover (video kind). */
  video?: string;
  /** For music/voice: track title + duration. */
  audio?: { title: string; duration: string };
  /** Relative masonry weight — bigger cards break the grid. */
  span?: "sm" | "md" | "lg";
};

// Real outputs from model playgrounds + placeholder for items without real outputs yet.
const img = (seed: string, w = 900, h = 1200) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

// Real example URLs from fal.ai playground outputs + official model sites
const REAL = {
  seedream5pro: "https://v3b.fal.media/files/b/0aa16df4/ktjX_-2KKAw7bCTQgopGV_5b49dc459dfe484fbb1218fce0e24bc7.png",
  kling3pro: "https://v3b.fal.media/files/b/0a9270c0/M0OE5-o3n7Pj85CWWpGt2_output.mp4",
  gptimage2: "https://v3b.fal.media/files/b/0a981c3d/hdg8iaY8yShEwChTPjFah_OZUgg7Z4.jpg",
  nanobanana2: "https://storage.googleapis.com/falserverless/example_outputs/nano-banana-2-t2i-output.png",
  seedance2: "https://v3b.fal.media/files/b/0a9f7ecf/jQvhuOlh8iQrO38GC4K_0_video.mp4",
  qwenimage: "https://v3.fal.media/files/rabbit/KoIbq6nhDBDPxDQrivW-m.png",
  happyhorse: "https://v3b.fal.media/files/b/0a9f39fd/N9U9ZDVOZvX13yQTzx0wN_NrDUbOAF.mp4",
  grokvideo: "https://v3b.fal.media/files/b/0a9c66a1/xx79_pXtz3hq4TByzo4Xc_jN5I675M.mp4",
  wan27: "https://v3b.fal.media/files/b/0a940a49/fBFxYrVooHj29QIff8clR_xVVvbIQ0.mp4",
};

export const WALL_ITEMS: WallItem[] = [
  {
    id: "w1",
    kind: "image",
    useCase: "ad",
    model: "Seedream 5.0 Pro",
    modelSlug: "seedream-5-pro",
    prompt:
      "Flacon de parfum ambré sur marbre travertin, lumière rasante d'aube, contre-jour doux, éditorial mode.",
    image: REAL.seedream5pro,
    span: "lg",
  },
  {
    id: "w2",
    kind: "video",
    useCase: "ugc",
    model: "Kling 3.0 Pro",
    modelSlug: "kling-3-pro",
    prompt:
      "Créatrice UGC déballe une paire de sneakers en unboxing, plan serré, lumière naturelle, ambiance matinale.",
    image: img("sneakers-ugc", 900, 900),
    video: REAL.kling3pro,
    span: "md",
  },
  {
    id: "w3",
    kind: "image",
    useCase: "film",
    model: "GPT Image 2",
    modelSlug: "gpt-image-2",
    prompt:
      "Portrait cinématographique d'une comédienne en costume 1940, cheveux au vent, tempête à l'horizon.",
    image: REAL.gptimage2,
    span: "lg",
  },
  {
    id: "w4",
    kind: "music",
    useCase: "show",
    model: "Cortexia Score v1",
    modelSlug: "eleven-v3",
    prompt: "Générique de talk-show africain, kora + synths chauds, 90 BPM, mood optimiste.",
    image: img("music-cover-a", 900, 900),
    audio: { title: "Générique — Studio Lomé", duration: "0:42" },
    span: "sm",
  },
  {
    id: "w5",
    kind: "image",
    useCase: "ad",
    model: "Nano Banana 2",
    modelSlug: "nano-banana-2",
    prompt: "Boîte de céréales bio flottant dans un ciel pastel, style pub magazine 2000s.",
    image: REAL.nanobanana2,
    span: "md",
  },
  {
    id: "w6",
    kind: "video",
    useCase: "ad",
    model: "Seedance 2.0 Fast",
    modelSlug: "seedance-2-fast",
    prompt:
      "Voiture électrique traverse une ville de nuit sous la pluie, reflets néons, plan travelling.",
    image: img("car-neon", 900, 1100),
    video: REAL.seedance2,
    span: "md",
  },
  {
    id: "w7",
    kind: "voice",
    useCase: "film",
    model: "ElevenLabs V3",
    modelSlug: "eleven-v3",
    prompt: "Voix off française, grave et calme, teaser d'une mini-série policière.",
    image: img("voice-noir", 900, 900),
    audio: { title: "Teaser — Voix off FR", duration: "0:18" },
    span: "sm",
  },
  {
    id: "w8",
    kind: "image",
    useCase: "ugc",
    model: "Seedream 5.0 Pro",
    modelSlug: "seedream-5-pro",
    prompt:
      "Assiette de pâtisserie fine posée sur nappe lin blanc, plan zénithal, lumière du matin.",
    image: REAL.seedream5pro,
    span: "sm",
  },
  {
    id: "w9",
    kind: "image",
    useCase: "show",
    model: "Wan 2.7 Image Pro",
    modelSlug: "wan-27-image-pro",
    prompt: "Décor de plateau TV cuisine ouverte, tons chauds bois et cuivre, projecteurs allumés.",
    image: img("tv-kitchen", 900, 1200),
    span: "md",
  },
  {
    id: "w10",
    kind: "video",
    useCase: "film",
    model: "Kling 3.0 4K",
    modelSlug: "kling-3-4k",
    prompt:
      "Plan aérien d'un désert au coucher du soleil, dunes ondulantes, mouvement de caméra lent.",
    image: img("desert-drone", 900, 1300),
    video: REAL.wan27,
    span: "lg",
  },
  {
    id: "w11",
    kind: "image",
    useCase: "ad",
    model: "Qwen Image 2.0",
    modelSlug: "qwen-image-2",
    prompt: "Bouteille de kombucha rose sur fond bleu ciel, ombres nettes, style pub minimaliste.",
    image: REAL.qwenimage,
    span: "sm",
  },
  {
    id: "w12",
    kind: "music",
    useCase: "ugc",
    model: "Cortexia Score v1",
    modelSlug: "eleven-v3",
    prompt: "Musique lo-fi pour reel Instagram beauté, guitare feutrée, batterie douce.",
    image: img("music-lofi", 900, 900),
    audio: { title: "Reel beauté — Lo-fi", duration: "0:15" },
    span: "sm",
  },
  {
    id: "w13",
    kind: "image",
    useCase: "film",
    model: "Nano Banana 2",
    modelSlug: "nano-banana-2",
    prompt:
      "Enfant lit un livre sur un toit de Jakarta au crépuscule, silhouette contre-jour orange.",
    image: REAL.nanobanana2,
    span: "md",
  },
  {
    id: "w14",
    kind: "video",
    useCase: "show",
    model: "Kling 3.0 Motion",
    modelSlug: "kling-3-motion",
    prompt: "Chef découpe un ananas dans un studio cuisine, plan macro, mouvement de dolly lent.",
    image: img("chef-macro", 900, 900),
    video: REAL.happyhorse,
    span: "md",
  },
  {
    id: "w15",
    kind: "image",
    useCase: "ad",
    model: "Seedream 5.0 Pro",
    modelSlug: "seedream-5-pro",
    prompt: "Basket haute rouge suspendue par un fil, fond papier crème, lumière studio.",
    image: REAL.seedream5pro,
    span: "md",
  },
  {
    id: "w16",
    kind: "voice",
    useCase: "ad",
    model: "ElevenLabs V3",
    modelSlug: "eleven-v3",
    prompt: "Voix off portugaise énergique pour spot radio, ton chaleureux et rythmé.",
    image: img("voice-pt", 900, 900),
    audio: { title: "Spot radio — PT-BR", duration: "0:22" },
    span: "sm",
  },
  {
    id: "w17",
    kind: "image",
    useCase: "ugc",
    model: "GPT Image 2",
    modelSlug: "gpt-image-2",
    prompt: "Écran d'iPhone posé sur un carnet, message d'inscription à une newsletter mode.",
    image: img("mockup-phone", 900, 1200),
    span: "md",
  },
  {
    id: "w18",
    kind: "video",
    useCase: "ugc",
    model: "Seedance 2.0 Mini",
    modelSlug: "seedance-2-mini",
    prompt: "Yoga au bord d'une piscine à Bali, salutation au soleil, plan large, lumière chaude.",
    image: img("yoga-bali", 900, 1100),
    video: REAL.grokvideo,
    span: "md",
  },
  {
    id: "w19",
    kind: "image",
    useCase: "film",
    model: "Wan 2.7 Image Pro",
    modelSlug: "wan-27-image-pro",
    prompt: "Ruelle pavée de Lisbonne la nuit, lampadaires jaunes, silhouette solitaire au fond.",
    image: img("lisbon-night", 900, 1300),
    span: "lg",
  },
  {
    id: "w20",
    kind: "music",
    useCase: "film",
    model: "Cortexia Score v1",
    modelSlug: "eleven-v3",
    prompt: "Nappe orchestrale sombre pour scène de suspense, cordes graves et pulsation lente.",
    image: img("music-dark", 900, 900),
    audio: { title: "Suspense — Cordes", duration: "1:04" },
    span: "sm",
  },
  {
    id: "w21",
    kind: "image",
    useCase: "ad",
    model: "Seedream 5.0 Lite",
    modelSlug: "seedream-5-lite",
    prompt: "Sac en cuir camel posé sur banc de bois, ambiance café parisien.",
    image: img("bag-camel", 900, 900),
    span: "sm",
  },
  {
    id: "w22",
    kind: "image",
    useCase: "show",
    model: "Nano Banana 2",
    modelSlug: "nano-banana-2",
    prompt: "Titre d'émission « Nuits de Dakar » en typographie art déco dorée sur fond noir.",
    image: REAL.nanobanana2,
    span: "md",
  },
  {
    id: "w23",
    kind: "video",
    useCase: "ad",
    model: "Kling 3.0 Turbo",
    modelSlug: "kling-3-turbo",
    prompt: "Café qui coule d'une machine expresso au ralenti, gouttes en macro, vapeur.",
    image: img("coffee-macro", 900, 1000),
    video: REAL.happyhorse,
    span: "md",
  },
  {
    id: "w24",
    kind: "image",
    useCase: "ugc",
    model: "Qwen Image 2.0",
    modelSlug: "qwen-image-2",
    prompt: "Plante monstera dans un intérieur chaleureux, lumière du soir dorée.",
    image: REAL.qwenimage,
    span: "md",
  },
];
