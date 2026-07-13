// Cortexia model catalog — prices already include the 26% margin over provider cost.
// Source of truth for pricing everywhere in the app.

export type ModelCategory = "image" | "video" | "audio" | "text";
export type Unit = "image" | "second" | "clip" | "1k-chars" | "1m-tokens-io";

export type ParamSpec =
  | { kind: "prompt"; label: string; placeholder?: string }
  | { kind: "upload"; label: string; multiple?: boolean }
  | { kind: "select"; label: string; key: string; options: string[]; advanced?: boolean }
  | {
      kind: "slider";
      label: string;
      key: string;
      min: number;
      max: number;
      step: number;
      default: number;
      suffix?: string;
      advanced?: boolean;
    }
  | { kind: "seed"; label: string; advanced?: boolean }
  | { kind: "toggle"; label: string; key: string; default?: boolean; advanced?: boolean };

export type PriceTier = { label: string; priceUSD: number };

export type Model = {
  slug: string;
  name: string;
  provider: string;
  category: ModelCategory;
  unit: Unit;
  /** Simple flat price (used when no tiers). Cortexia price, ×1.26. */
  priceUSD?: number;
  /** Multiple tiers (resolution, quality). */
  tiers?: PriceTier[];
  /** For LLMs: input/output per 1M tokens. */
  io?: { inputUSD: number; outputUSD: number };
  badge?: "popular" | "new" | "pro";
  blurb: string;
  params: ParamSpec[];
};

const commonImageParams: ParamSpec[] = [
  {
    kind: "prompt",
    label: "Prompt",
    placeholder: "Un plan produit d'un flacon ambré, lumière studio douce, fond terracotta…",
  },
  { kind: "upload", label: "Références visuelles (optionnel)", multiple: true },
  { kind: "select", label: "Ratio", key: "ratio", options: ["1:1", "3:4", "4:3", "16:9", "9:16"] },
  { kind: "select", label: "Résolution", key: "resolution", options: ["1K", "2K", "4K"] },
  {
    kind: "select",
    label: "Style",
    key: "style",
    options: ["Photoréaliste", "Éditorial", "Cinéma", "Illustration", "3D"],
    advanced: true,
  },
  { kind: "seed", label: "Seed", advanced: true },
];

const commonVideoParams: ParamSpec[] = [
  {
    kind: "prompt",
    label: "Prompt",
    placeholder: "Une créatrice UGC déballe un flacon, plan serré, lumière du matin…",
  },
  { kind: "upload", label: "Image de départ (optionnel)" },
  { kind: "select", label: "Ratio", key: "ratio", options: ["16:9", "9:16", "1:1", "4:3"] },
  {
    kind: "select",
    label: "Résolution",
    key: "resolution",
    options: ["480p", "720p", "1080p", "4K"],
  },
  {
    kind: "slider",
    label: "Durée",
    key: "duration",
    min: 2,
    max: 10,
    step: 1,
    default: 5,
    suffix: "s",
  },
  { kind: "toggle", label: "Audio", key: "audio", default: false, advanced: true },
  { kind: "seed", label: "Seed", advanced: true },
];

export const MODELS: Model[] = [
  // IMAGE
  {
    slug: "qwen-image-2",
    name: "Qwen Image 2.0",
    provider: "Alibaba",
    category: "image",
    unit: "image",
    priceUSD: 0.0378,
    blurb: "Rendu propre, réponse rapide, imbattable en rapport détail/prix.",
    params: commonImageParams,
  },
  {
    slug: "seedream-5-pro",
    name: "Seedream 5.0 Pro",
    provider: "ByteDance",
    category: "image",
    unit: "image",
    badge: "popular",
    tiers: [
      { label: "1K", priceUSD: 0.0441 },
      { label: "2K", priceUSD: 0.0882 },
    ],
    blurb: "Texte lisible dans l'image, compositions maîtrisées.",
    params: commonImageParams,
  },
  {
    slug: "seedream-5-lite",
    name: "Seedream 5.0 Lite",
    provider: "ByteDance",
    category: "image",
    unit: "image",
    priceUSD: 0.0347,
    blurb: "Version économique de Seedream, parfaite pour itérer.",
    params: commonImageParams,
  },
  {
    slug: "nano-banana-2",
    name: "Nano Banana 2",
    provider: "Google",
    category: "image",
    unit: "image",
    badge: "new",
    tiers: [
      { label: "1K", priceUSD: 0.0504 },
      { label: "2K", priceUSD: 0.0756 },
      { label: "4K", priceUSD: 0.1134 },
    ],
    blurb: "Editing conversationnel, cohérence de personnages hors norme.",
    params: commonImageParams,
  },
  {
    slug: "nano-banana-2-lite",
    name: "Nano Banana 2 Lite",
    provider: "Google",
    category: "image",
    unit: "image",
    priceUSD: 0.0252,
    blurb: "Le même moteur, en mode brouillon rapide.",
    params: commonImageParams,
  },
  {
    slug: "gpt-image-2",
    name: "GPT Image 2",
    provider: "OpenAI",
    category: "image",
    unit: "image",
    tiers: [
      { label: "1K", priceUSD: 0.0378 },
      { label: "2K", priceUSD: 0.063 },
      { label: "4K", priceUSD: 0.1008 },
    ],
    blurb: "Le meilleur pour la typographie et les mockups produit.",
    params: commonImageParams,
  },
  {
    slug: "wan-27-image",
    name: "Wan 2.7 Image",
    provider: "Alibaba",
    category: "image",
    unit: "image",
    priceUSD: 0.0302,
    blurb: "Rendus stylisés, très bon pour l'illustration commerciale.",
    params: commonImageParams,
  },
  {
    slug: "wan-27-image-pro",
    name: "Wan 2.7 Image Pro",
    provider: "Alibaba",
    category: "image",
    unit: "image",
    priceUSD: 0.0756,
    badge: "pro",
    blurb: "La version premium de Wan, détails haute fréquence.",
    params: commonImageParams,
  },

  // VIDEO
  {
    slug: "seedance-2-mini",
    name: "Seedance 2.0 Mini",
    provider: "ByteDance",
    category: "video",
    unit: "second",
    tiers: [
      { label: "480p", priceUSD: 0.0378 },
      { label: "720p", priceUSD: 0.0788 },
    ],
    blurb: "Le plancher qualité/prix en vidéo IA. Bluffant sur les tests UGC.",
    params: commonVideoParams,
  },
  {
    slug: "seedance-2-fast",
    name: "Seedance 2.0 Fast",
    provider: "ByteDance",
    category: "video",
    unit: "second",
    badge: "popular",
    tiers: [
      { label: "480p", priceUSD: 0.0567 },
      { label: "720p", priceUSD: 0.126 },
    ],
    blurb: "Plus rapide, mouvements plus fluides. Le workhorse quotidien.",
    params: commonVideoParams,
  },
  {
    slug: "happyhorse-11",
    name: "HappyHorse-1.1",
    provider: "HappyHorse",
    category: "video",
    unit: "second",
    tiers: [
      { label: "720p", priceUSD: 0.1418 },
      { label: "1080p", priceUSD: 0.1827 },
    ],
    blurb: "Rendus mode et beauté, textures peau très propres.",
    params: commonVideoParams,
  },
  {
    slug: "kling-3-turbo",
    name: "Kling 3.0 Turbo",
    provider: "Kuaishou",
    category: "video",
    unit: "second",
    tiers: [
      { label: "720p", priceUSD: 0.1134 },
      { label: "1080p", priceUSD: 0.1418 },
    ],
    blurb: "Kling qui rentre dans les délais serrés.",
    params: commonVideoParams,
  },
  {
    slug: "kling-3-standard",
    name: "Kling 3.0 Standard",
    provider: "Kuaishou",
    category: "video",
    unit: "second",
    priceUSD: 0.126,
    blurb: "Version standard avec audio synchronisé.",
    params: commonVideoParams,
  },
  {
    slug: "kling-3-pro",
    name: "Kling 3.0 Pro",
    provider: "Kuaishou",
    category: "video",
    unit: "second",
    priceUSD: 0.1701,
    badge: "pro",
    blurb: "La référence en cinématique IA, audio inclus.",
    params: commonVideoParams,
  },
  {
    slug: "kling-3-4k",
    name: "Kling 3.0 4K",
    provider: "Kuaishou",
    category: "video",
    unit: "second",
    priceUSD: 0.4221,
    blurb: "Kling en 4K pour livrables broadcast.",
    params: commonVideoParams,
  },
  {
    slug: "kling-3-motion",
    name: "Kling 3.0 Motion Control",
    provider: "Kuaishou",
    category: "video",
    unit: "second",
    tiers: [
      { label: "720p", priceUSD: 0.126 },
      { label: "1080p", priceUSD: 0.1701 },
    ],
    blurb: "Contrôle précis du mouvement caméra et sujet.",
    params: commonVideoParams,
  },
  {
    slug: "grok-imagine-15",
    name: "Grok Imagine Video 1.5",
    provider: "xAI",
    category: "video",
    unit: "second",
    tiers: [
      { label: "480p", priceUSD: 0.0101 },
      { label: "720p", priceUSD: 0.0189 },
    ],
    blurb: "Le prix le plus bas du marché pour itérer sans compter.",
    params: commonVideoParams,
  },
  {
    slug: "wan-27-video",
    name: "Wan 2.7 Video",
    provider: "Alibaba",
    category: "video",
    unit: "second",
    tiers: [
      { label: "720p", priceUSD: 0.1008 },
      { label: "1080p", priceUSD: 0.1512 },
    ],
    blurb: "Mouvement stable, cohérent, prêt pour les pubs sociales.",
    params: commonVideoParams,
  },
  {
    slug: "gemini-omni-video",
    name: "Gemini Omni Video",
    provider: "Google",
    category: "video",
    unit: "clip",
    tiers: [
      { label: "8s sans référence", priceUSD: 0.6615 },
      { label: "8s avec vidéo", priceUSD: 1.0584 },
    ],
    blurb: "Vidéo + audio + suite logique. Le tout-en-un premium.",
    params: commonVideoParams,
  },
  {
    slug: "omnihuman-15",
    name: "OmniHuman 1.5",
    provider: "ByteDance",
    category: "video",
    unit: "second",
    priceUSD: 0.1701,
    blurb: "Personnages parlants réalistes à partir d'une seule photo.",
    params: commonVideoParams,
  },
  {
    slug: "volc-lip-sync",
    name: "Volcengine Lip Sync",
    provider: "Volcengine",
    category: "video",
    unit: "second",
    priceUSD: 0.0504,
    blurb: "Synchronisation labiale sur vidéo existante.",
    params: commonVideoParams,
  },

  // AUDIO
  {
    slug: "eleven-v3",
    name: "ElevenLabs Text-to-Dialogue V3",
    provider: "ElevenLabs",
    category: "audio",
    unit: "1k-chars",
    priceUSD: 0.0882,
    badge: "popular",
    blurb: "Voix off multilingues au niveau studio, dialogues naturels.",
    params: [
      {
        kind: "prompt",
        label: "Texte à lire",
        placeholder:
          "Marie, calmement : « On tourne la scène de nuit demain. » Julien : « J'ai les storyboards. »",
      },
      {
        kind: "select",
        label: "Voix",
        key: "voice",
        options: [
          "Amara — français, naturel",
          "Julien — français, grave",
          "Wei — anglais, chaleureux",
          "Rio — portugais, énergique",
        ],
      },
      {
        kind: "select",
        label: "Langue",
        key: "lang",
        options: ["FR", "EN", "PT", "ES", "AR", "SW"],
      },
      {
        kind: "slider",
        label: "Stabilité",
        key: "stability",
        min: 0,
        max: 100,
        step: 1,
        default: 55,
        suffix: "%",
        advanced: true,
      },
      {
        kind: "slider",
        label: "Style",
        key: "style",
        min: 0,
        max: 100,
        step: 1,
        default: 20,
        suffix: "%",
        advanced: true,
      },
    ],
  },

  // LLM
  {
    slug: "claude-sonnet-5",
    name: "Claude Sonnet 5",
    provider: "Anthropic",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 1.071, outputUSD: 5.3865 },
    badge: "popular",
    blurb: "Le meilleur compromis raisonnement/vitesse d'Anthropic.",
    params: [
      {
        kind: "prompt",
        label: "Prompt système + message",
        placeholder: "Explique le brief client en trois puces.",
      },
    ],
  },
  {
    slug: "claude-fable-5",
    name: "Claude Fable 5",
    provider: "Anthropic",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 5.04, outputUSD: 25.2 },
    badge: "pro",
    blurb: "Modèle narratif : storyboards, scripts longs.",
    params: [
      {
        kind: "prompt",
        label: "Prompt",
        placeholder: "Écris un pitch de mini-série en 4 épisodes.",
      },
    ],
  },
  {
    slug: "claude-opus-48",
    name: "Claude Opus 4.8",
    provider: "Anthropic",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 2.52, outputUSD: 12.6 },
    blurb: "Raisonnement profond, analyses stratégiques.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "claude-opus-47",
    name: "Claude Opus 4.7",
    provider: "Anthropic",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 1.7955, outputUSD: 9.009 },
    blurb: "Opus stable pour code et docs longues.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "claude-opus-46",
    name: "Claude Opus 4.6",
    provider: "Anthropic",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 1.7955, outputUSD: 9.009 },
    blurb: "Version précédente d'Opus, toujours excellente.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "claude-opus-45",
    name: "Claude Opus 4.5",
    provider: "Anthropic",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 1.7955, outputUSD: 9.009 },
    blurb: "Bon rapport qualité/prix sur Opus.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "claude-sonnet-46",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 1.071, outputUSD: 5.3865 },
    blurb: "Sonnet précédent, très solide.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "claude-sonnet-45",
    name: "Claude Sonnet 4.5",
    provider: "Anthropic",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 1.071, outputUSD: 5.3865 },
    blurb: "Sonnet stable pour production.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "claude-haiku-45",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 0.3465, outputUSD: 1.7955 },
    blurb: "Ultra-rapide, parfait pour du routage.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "gpt-55",
    name: "GPT-5.5",
    provider: "OpenAI",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 1.764, outputUSD: 10.584 },
    badge: "new",
    blurb: "Le nouveau flagship OpenAI, raisonnement lourd.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "gpt-54",
    name: "GPT-5.4",
    provider: "OpenAI",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 0.882, outputUSD: 7.056 },
    blurb: "Le sweet spot GPT-5.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "gpt-52",
    name: "GPT-5.2",
    provider: "OpenAI",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 0.5544, outputUSD: 4.41 },
    blurb: "GPT-5 léger, très rentable.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "gpt-5-codex-a",
    name: "GPT-5 Codex 5.2–5.4",
    provider: "OpenAI",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 0.882, outputUSD: 7.056 },
    blurb: "Spécialisé code, refactor et review.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "gpt-5-codex-b",
    name: "GPT-5 Codex 5–5.1",
    provider: "OpenAI",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 0.63, outputUSD: 5.04 },
    blurb: "Codex à moindre coût.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "gemini-31-pro",
    name: "Gemini 3.1 Pro",
    provider: "Google",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 0.63, outputUSD: 4.41 },
    blurb: "Contexte long, multimodal natif.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "gemini-35-flash",
    name: "Gemini 3.5 Flash",
    provider: "Google",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 0.567, outputUSD: 3.402 },
    blurb: "Rapide et pas cher, pour le volume.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "gemini-25-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 0.1134, outputUSD: 0.945 },
    blurb: "Le tarif plancher pour du LLM en masse.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
];

export function modelsByCategory(cat: ModelCategory) {
  return MODELS.filter((m) => m.category === cat);
}
export function getModel(slug: string) {
  return MODELS.find((m) => m.slug === slug);
}
/** Best guess baseline unit price (used for cards / catalog display). */
export function basePrice(m: Model): number {
  if (m.priceUSD != null) return m.priceUSD;
  if (m.tiers?.length) return m.tiers[0].priceUSD;
  if (m.io) return m.io.outputUSD; // representative
  return 0;
}
export function unitLabel(m: Model): string {
  switch (m.unit) {
    case "image":
      return "/ image";
    case "second":
      return "/ seconde";
    case "clip":
      return "/ clip";
    case "1k-chars":
      return "/ 1 000 caractères";
    case "1m-tokens-io":
      return "/ million de tokens (sortie)";
  }
}
