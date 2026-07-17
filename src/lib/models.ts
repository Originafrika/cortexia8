// Cortexia model catalog — prices already include the 26% margin over provider cost.
// Provider: kie.ai. Source of truth for pricing everywhere in the app.
// Endpoint paths are relative to the kie.ai API base URL.

export type ModelCategory = "image" | "video" | "audio" | "text";
export type Unit = "image" | "second" | "1k-chars" | "1m-tokens-io";

export type ParamSpec =
  | { kind: "prompt"; label: string; placeholder?: string }
  | { kind: "upload"; label: string; multiple?: boolean; accepts?: string }
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
  /** Simple flat price (used when no tiers). Cortexia price, x1.26. */
  priceUSD?: number;
  /** Multiple tiers (resolution, quality). */
  tiers?: PriceTier[];
  /** For LLMs: input/output per 1M tokens. */
  io?: { inputUSD: number; outputUSD: number };
  /** kie.ai endpoint path. */
  kieEndpoint: string;
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
  { kind: "upload", label: "Références visuelles (optionnel)", multiple: true, accepts: "image/*" },
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
  { kind: "upload", label: "Image de départ (optionnel)", accepts: "image/*" },
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
  // ── IMAGE ────────────────────────────────────────────────────────────
  {
    slug: "seedream-5-pro",
    name: "Seedream 5.0 Pro",
    provider: "ByteDance",
    category: "image",
    unit: "image",
    priceUSD: 0.0675,
    kieEndpoint: "/seedream/5-pro-text-to-image",
    badge: "popular",
    blurb: "Texte lisible dans l'image, compositions maîtrisées.",
    params: commonImageParams,
  },
  {
    slug: "seedream-5-lite",
    name: "Seedream 5.0 Lite",
    provider: "ByteDance",
    category: "image",
    unit: "image",
    priceUSD: 0.035,
    kieEndpoint: "/seedream/5-lite-text-to-image",
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
    kieEndpoint: "/google/nanobanana2",
    tiers: [
      { label: "1K", priceUSD: 0.04 },
      { label: "2K", priceUSD: 0.06 },
      { label: "4K", priceUSD: 0.09 },
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
    priceUSD: 0.025,
    kieEndpoint: "/google/nano-banana-2-lite",
    blurb: "Version légère rapide pour itérations.",
    params: commonImageParams,
  },
  {
    slug: "gpt-image-2",
    name: "GPT Image 2",
    provider: "OpenAI",
    category: "image",
    unit: "image",
    kieEndpoint: "/gpt/gpt-image-2-text-to-image",
    tiers: [
      { label: "1K", priceUSD: 0.03 },
      { label: "2K", priceUSD: 0.05 },
      { label: "4K", priceUSD: 0.08 },
    ],
    blurb: "Le meilleur pour la typographie et les mockups produit.",
    params: commonImageParams,
  },
  {
    slug: "qwen-image-20",
    name: "Qwen Image 2.0",
    provider: "Alibaba",
    category: "image",
    unit: "image",
    priceUSD: 0.02,
    kieEndpoint: "/qwen/text-to-image",
    blurb: "Génération d'images haute qualité par megapixel.",
    params: commonImageParams,
  },
  {
    slug: "wan-27-image",
    name: "Wan 2.7 Image",
    provider: "Alibaba",
    category: "image",
    unit: "image",
    priceUSD: 0.03,
    kieEndpoint: "/wan/2-7-image",
    blurb: "Génération d'images par Wan 2.7.",
    params: commonImageParams,
  },
  {
    slug: "wan-27-image-pro",
    name: "Wan 2.7 Image Pro",
    provider: "Alibaba",
    category: "image",
    unit: "image",
    priceUSD: 0.08,
    kieEndpoint: "/wan/2-7-image-pro",
    badge: "pro",
    blurb: "Version pro de Wan 2.7 pour qualité supérieure.",
    params: commonImageParams,
  },

  // ── VIDEO ────────────────────────────────────────────────────────────
  {
    slug: "seedance-2",
    name: "Seedance 2.0",
    provider: "ByteDance",
    category: "video",
    unit: "second",
    priceUSD: 0.057,
    kieEndpoint: "/bytedance/seedance-2",
    blurb: "Mouvement fluide et naturel, idéal pour le UGC.",
    params: commonVideoParams,
  },
  {
    slug: "seedance-2-fast",
    name: "Seedance 2.0 Fast",
    provider: "ByteDance",
    category: "video",
    unit: "second",
    priceUSD: 0.04,
    kieEndpoint: "/bytedance/seedance-2-fast",
    blurb: "Seedance optimisé pour la vitesse.",
    params: commonVideoParams,
  },
  {
    slug: "seedance-2-mini",
    name: "Seedance 2.0 Mini",
    provider: "ByteDance",
    category: "video",
    unit: "second",
    priceUSD: 0.019,
    kieEndpoint: "/bytedance/seedance-2-mini",
    blurb: "Version économique pour itérations rapides.",
    params: commonVideoParams,
  },
  {
    slug: "kling-3",
    name: "Kling 3.0",
    provider: "Kuaishou",
    category: "video",
    unit: "second",
    priceUSD: 0.07,
    kieEndpoint: "/kling/kling-3-0",
    badge: "popular",
    blurb: "La référence en cinématique IA, audio inclus.",
    params: commonVideoParams,
  },
  {
    slug: "kling-3-turbo",
    name: "Kling 3.0 Turbo",
    provider: "Kuaishou",
    category: "video",
    unit: "second",
    priceUSD: 0.056,
    kieEndpoint: "/kling/v3-turbo-text-to-video",
    blurb: "Kling qui rentre dans les délais serrés.",
    params: commonVideoParams,
  },
  {
    slug: "kling-3-standard",
    name: "Kling 3.0 Standard",
    provider: "Kuaishou",
    category: "video",
    unit: "second",
    priceUSD: 0.063,
    kieEndpoint: "/kling/text-to-video",
    blurb: "Version standard avec audio synchronisé.",
    params: commonVideoParams,
  },
  {
    slug: "kling-3-4k",
    name: "Kling 3.0 4K",
    provider: "Kuaishou",
    category: "video",
    unit: "second",
    priceUSD: 0.21,
    kieEndpoint: "/kling/kling-3-0-4k",
    blurb: "Kling en 4K pour livrables broadcast.",
    params: commonVideoParams,
  },
  {
    slug: "kling-3-motion",
    name: "Kling 3.0 Motion Control",
    provider: "Kuaishou",
    category: "video",
    unit: "second",
    priceUSD: 0.063,
    kieEndpoint: "/kling/motion-control-v3",
    blurb: "Contrôle précis du mouvement caméra et sujet.",
    params: commonVideoParams,
  },
  {
    slug: "wan-27-video",
    name: "Wan 2.7 Video",
    provider: "Alibaba",
    category: "video",
    unit: "second",
    priceUSD: 0.05,
    kieEndpoint: "/wan/2-7-text-to-video",
    blurb: "Génération vidéo par Wan 2.7.",
    params: commonVideoParams,
  },
  {
    slug: "happyhorse-11",
    name: "HappyHorse 1.1",
    provider: "HappyHorse",
    category: "video",
    unit: "second",
    priceUSD: 0.09,
    kieEndpoint: "/happyhorse-1-1/text-to-video",
    blurb: "Génération vidéo créative par HappyHorse.",
    params: commonVideoParams,
  },
  {
    slug: "grok-video-15",
    name: "Grok Video 1.5",
    provider: "xAI",
    category: "video",
    unit: "second",
    priceUSD: 0.015,
    kieEndpoint: "/grok-imagine/1-5-preview",
    blurb: "Le prix le plus bas du marché pour itérer sans compter.",
    params: commonVideoParams,
  },
  {
    slug: "gemini-omni-video",
    name: "Gemini Omni Video",
    provider: "Google",
    category: "video",
    unit: "second",
    priceUSD: 0.66,
    kieEndpoint: "/gemini-omni-video",
    blurb: "Modèle vidéo Gemini, réalisme exceptionnel.",
    params: commonVideoParams,
  },
  {
    slug: "omnihuman-15",
    name: "OmniHuman 1.5",
    provider: "ByteDance",
    category: "video",
    unit: "second",
    priceUSD: 0.085,
    kieEndpoint: "/omnihuman-1-5",
    blurb: "Génération de personnages réalistes.",
    params: commonVideoParams,
  },
  {
    slug: "volcengine-lip-sync",
    name: "Volcengine Lip Sync",
    provider: "ByteDance",
    category: "video",
    unit: "second",
    priceUSD: 0.025,
    kieEndpoint: "/volcengine/video-to-video-lip-sync",
    blurb: "Synchronisation labiale précise.",
    params: commonVideoParams,
  },

  // ── AUDIO ────────────────────────────────────────────────────────────
  {
    slug: "eleven-v3",
    name: "ElevenLabs Text-to-Dialogue V3",
    provider: "ElevenLabs",
    category: "audio",
    unit: "1k-chars",
    priceUSD: 0.07,
    kieEndpoint: "/elevenlabs/text-to-dialogue-v3",
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

  // ── LLM ──────────────────────────────────────────────────────────────
  {
    slug: "claude-opus-47",
    name: "Claude Opus 4.7",
    provider: "Anthropic",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 1.425, outputUSD: 7.15 },
    kieEndpoint: "/claude/claude-opus-4-7",
    badge: "pro",
    blurb: "Raisonnement profond, analyses stratégiques, code exigeant.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "claude-sonnet-46",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 0.85, outputUSD: 4.275 },
    kieEndpoint: "/claude/claude-sonnet-4-6",
    badge: "popular",
    blurb: "Le meilleur compromis raisonnement/vitesse d'Anthropic.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "gpt-55",
    name: "GPT-5.5",
    provider: "OpenAI",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 1.4, outputUSD: 8.4 },
    kieEndpoint: "/chat/gpt-5-5",
    badge: "new",
    blurb: "Le nouveau flagship OpenAI, raisonnement lourd.",
    params: [{ kind: "prompt", label: "Prompt" }],
  },
  {
    slug: "gemini-31-pro",
    name: "Gemini 3.1 Pro",
    provider: "Google",
    category: "text",
    unit: "1m-tokens-io",
    io: { inputUSD: 0.5, outputUSD: 0.5 },
    kieEndpoint: "/gemini/gemini-3-1-pro",
    blurb: "Contexte long, multimodal natif, très performant.",
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
    case "1k-chars":
      return "/ 1 000 caractères";
    case "1m-tokens-io":
      return "/ million de tokens (sortie)";
  }
}
