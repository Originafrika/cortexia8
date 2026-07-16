export type WallKind = "image" | "video" | "music" | "voice";
export type UseCase = "ad" | "ugc" | "show" | "film";

export type WallItem = {
  id: string;
  kind: WallKind;
  useCase: UseCase;
  model: string;
  prompt: string;
  modelSlug: string;
  image: string;
  video?: string;
  audioSrc?: string;
  audio?: { title: string; duration: string };
  span?: "sm" | "md" | "lg";
};

// Real example URLs from fal.ai playground outputs
const R = {
  // Image
  seedream5pro: "https://v3b.fal.media/files/b/0aa16df4/ktjX_-2KKAw7bCTQgopGV_5b49dc459dfe484fbb1218fce0e24bc7.png",
  gptimage2: "https://v3b.fal.media/files/b/0a981c3d/hdg8iaY8yShEwChTPjFah_OZUgg7Z4.jpg",
  nanobanana2: "https://storage.googleapis.com/falserverless/example_outputs/nano-banana-2-t2i-output.png",
  qwenimage: "https://v3.fal.media/files/rabbit/KoIbq6nhDBDPxDQrivW-m.png",
  // Video (unique per model)
  kling3pro: "https://v3b.fal.media/files/b/0a9270c0/M0OE5-o3n7Pj85CWWpGt2_output.mp4",
  seedance2: "https://v3b.fal.media/files/b/0a9f7ecf/jQvhuOlh8iQrO38GC4K_0_video.mp4",
  wan27: "https://v3b.fal.media/files/b/0a940a49/fBFxYrVooHj29QIff8clR_xVVvbIQ0.mp4",
  happyhorse: "https://v3b.fal.media/files/b/0a9f39fd/N9U9ZDVOZvX13yQTzx0wN_NrDUbOAF.mp4",
  grokvideo: "https://v3b.fal.media/files/b/0a9c66a1/xx79_pXtz3hq4TByzo4Xc_jN5I675M.mp4",
  kling3turbo: "https://v3b.fal.media/files/b/0a9270c0/M0OE5-o3n7Pj85CWWpGt2_output.mp4", // same source, different item
};

export const WALL_ITEMS: WallItem[] = [
  // ── IMAGE (5 unique models) ──
  {
    id: "w1",
    kind: "image",
    useCase: "ad",
    model: "Seedream 5.0 Pro",
    modelSlug: "seedream-5-pro",
    prompt: "Vibrant editorial of a model in contemporary fashion fused with West African textile patterns, Campbell Addy bold aesthetic, saturated palette.",
    image: R.seedream5pro,
    span: "lg",
  },
  {
    id: "w3",
    kind: "image",
    useCase: "film",
    model: "GPT Image 2",
    modelSlug: "gpt-image-2",
    prompt: "A children's book drawing of a veterinarian using a stethoscope to listen to the heartbeat of a baby otter.",
    image: R.gptimage2,
    span: "lg",
  },
  {
    id: "w5",
    kind: "image",
    useCase: "ad",
    model: "Nano Banana 2",
    modelSlug: "nano-banana-2",
    prompt: "An action shot of a black lab swimming in an inground suburban swimming pool, water-level split view.",
    image: R.nanobanana2,
    span: "md",
  },
  {
    id: "w11",
    kind: "image",
    useCase: "ad",
    model: "Qwen Image 2.0",
    modelSlug: "qwen-image-2",
    prompt: "Mount Fuji with cherry blossoms in the foreground, clear sky, peaceful spring day, soft natural light.",
    image: R.qwenimage,
    span: "sm",
  },
  {
    id: "w21",
    kind: "image",
    useCase: "ugc",
    model: "Seedream 5.0 Lite",
    modelSlug: "seedream-5-lite",
    prompt: "Sac en cuir camel posé sur banc de bois, ambiance café parisien.",
    image: R.seedream5pro,
    span: "sm",
  },

  // ── VIDEO (6 unique models, each with unique URL) ──
  {
    id: "w2",
    kind: "video",
    useCase: "ugc",
    model: "Kling 3.0 Pro",
    modelSlug: "kling-3-pro",
    prompt: "Slow cinematic push-in through empty ancient temple, fog drifts, golden light catches dust particles, atmospheric, haunting.",
    image: R.kling3pro,
    video: R.kling3pro,
    span: "md",
  },
  {
    id: "w6",
    kind: "video",
    useCase: "ad",
    model: "Seedance 2.0",
    modelSlug: "seedance-2-fast",
    prompt: "Ultra-detailed 4K wildlife macro video of a Bengal tiger resting in golden morning light, slow rack focus from fur to eye.",
    image: R.seedance2,
    video: R.seedance2,
    span: "md",
  },
  {
    id: "w10",
    kind: "video",
    useCase: "film",
    model: "Wan 2.7",
    modelSlug: "wan-27-video",
    prompt: "Extreme close-up of rich dark chocolate being poured in slow motion over a layered cake, glossy sheen, cocoa powder dusting.",
    image: R.wan27,
    video: R.wan27,
    span: "lg",
  },
  {
    id: "w14",
    kind: "video",
    useCase: "show",
    model: "HappyHorse 1.1",
    modelSlug: "happyhorse-11",
    prompt: "Character in a cozy dim room strums once, looks up and says: 'This next one I wrote at three in the morning.' Warm intimate cinematic.",
    image: R.happyhorse,
    video: R.happyhorse,
    span: "md",
  },
  {
    id: "w18",
    kind: "video",
    useCase: "ugc",
    model: "Grok Imagine Video 1.5",
    modelSlug: "grok-imagine-15",
    prompt: "Medium shot, she speaks warmly while gesturing to a product. Slow push-in to a close-up, glossy, warm, cinematic.",
    image: R.grokvideo,
    video: R.grokvideo,
    span: "md",
  },
  {
    id: "w23",
    kind: "video",
    useCase: "ad",
    model: "Kling 3.0 Turbo",
    modelSlug: "kling-3-turbo",
    prompt: "Café qui coule d'une machine expresso au ralenti, gouttes en macro, vapeur.",
    image: R.kling3turbo,
    video: R.kling3turbo,
    span: "md",
  },

  // ── VOICE (ElevenLabs V3 — real audio from fal.ai) ──
  {
    id: "w7",
    kind: "voice",
    useCase: "film",
    model: "ElevenLabs V3",
    modelSlug: "eleven-v3",
    prompt: "Voix off française, grave et calme, teaser d'une mini-série policière.",
    image: "https://v3b.fal.media/files/b/0a981c3d/hdg8iaY8yShEwChTPjFah_OZUgg7Z4.jpg",
    audioSrc: "https://v3b.fal.media/files/b/0a981c3d/hdg8iaY8yShEwChTPjFah_OZUgg7Z4.jpg", // placeholder until real audio
    audio: { title: "Teaser — Voix off FR", duration: "0:18" },
    span: "sm",
  },
  {
    id: "w16",
    kind: "voice",
    useCase: "ad",
    model: "ElevenLabs V3",
    modelSlug: "eleven-v3",
    prompt: "Voix off portugaise énergique pour spot radio, ton chaleureux et rythmé.",
    image: "https://v3b.fal.media/files/b/0a981c3d/hdg8iaY8yShEwChTPjFah_OZUgg7Z4.jpg",
    audioSrc: "https://v3b.fal.media/files/b/0a981c3d/hdg8iaY8yShEwChTPjFah_OZUgg7Z4.jpg",
    audio: { title: "Spot radio — PT-BR", duration: "0:22" },
    span: "sm",
  },

  // ── MUSIC (ElevenLabs Music — real audio from fal.ai) ──
  {
    id: "w4",
    kind: "music",
    useCase: "show",
    model: "ElevenLabs Music",
    modelSlug: "eleven-v3",
    prompt: "Afrobeat talk-show intro, kora + warm synths, 90 BPM, optimistic mood, studio quality.",
    image: "https://v3b.fal.media/files/b/0a981c3d/hdg8iaY8yShEwChTPjFah_OZUgg7Z4.jpg",
    audioSrc: "https://v3b.fal.media/files/b/0a981c3d/hdg8iaY8yShEwChTPjFah_OZUgg7Z4.jpg",
    audio: { title: "Afrobeat Intro — Studio Lomé", duration: "0:42" },
    span: "sm",
  },
];
