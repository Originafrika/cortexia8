export type CanvasTemplate = {
  id: string;
  name: string;
  description: string;
  category: "Pub" | "UGC" | "Film" | "Musique";
  nodes: Array<{ modelSlug: string; x: number; y: number }>;
  edges: Array<{ source: number; target: number }>;
};

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "pub-visuelle",
    name: "Pub Visuelle",
    description: "Image Seedream → édition → vidéo Kling",
    category: "Pub",
    nodes: [
      { modelSlug: "seedream-5-pro", x: 80, y: 120 },
      { modelSlug: "seedream-5-pro-edit", x: 380, y: 120 },
      { modelSlug: "kling-3", x: 680, y: 120 },
    ],
    edges: [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
    ],
  },
  {
    id: "ugc-authentique",
    name: "UGC Authentique",
    description: "Image → vidéo → voix ElevenLabs",
    category: "UGC",
    nodes: [
      { modelSlug: "seedream-5-pro", x: 80, y: 120 },
      { modelSlug: "kling-3", x: 380, y: 120 },
      { modelSlug: "elevenlabs-tts-multilingual-v2", x: 680, y: 120 },
    ],
    edges: [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
    ],
  },
  {
    id: "storyboard-film",
    name: "Storyboard Film",
    description: "Plusieurs images → composition vidéo",
    category: "Film",
    nodes: [
      { modelSlug: "seedream-5-pro", x: 80, y: 60 },
      { modelSlug: "seedream-5-pro", x: 80, y: 240 },
      { modelSlug: "seedream-5-pro", x: 80, y: 420 },
      { modelSlug: "kling-3", x: 420, y: 200 },
    ],
    edges: [
      { source: 0, target: 3 },
      { source: 1, target: 3 },
      { source: 2, target: 3 },
    ],
  },
  {
    id: "podcast-musique",
    name: "Podcast Musique",
    description: "Voix → musique Suno → sound effects",
    category: "Musique",
    nodes: [
      { modelSlug: "elevenlabs-tts-multilingual-v2", x: 80, y: 120 },
      { modelSlug: "suno-generate-music", x: 380, y: 120 },
      { modelSlug: "elevenlabs-sound-effect-v2", x: 680, y: 120 },
    ],
    edges: [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
    ],
  },
  {
    id: "teaser-video",
    name: "Teaser Vidéo",
    description: "Image → vidéo → voix-off → musique",
    category: "Film",
    nodes: [
      { modelSlug: "seedream-5-pro", x: 80, y: 120 },
      { modelSlug: "kling-3", x: 380, y: 120 },
      { modelSlug: "elevenlabs-tts-multilingual-v2", x: 680, y: 60 },
      { modelSlug: "suno-generate-music", x: 680, y: 240 },
    ],
    edges: [
      { source: 0, target: 1 },
      { source: 1, target: 2 },
      { source: 1, target: 3 },
    ],
  },
];
