import type { Model, ParamSpec } from "@/lib/models";

/**
 * Get the 2-3 most important params for inline editing based on category.
 */
export function getPrimaryParams(model: Model): ParamSpec[] {
  const params = model.params ?? [];
  if (params.length === 0) return [];

  const result: ParamSpec[] = [];

  // First: always include prompt/longtext if present
  const promptParam = params.find((p) => p.kind === "prompt" || p.kind === "longtext");
  if (promptParam) result.push(promptParam);

  // Then: category-specific primary params
  switch (model.category) {
    case "image":
      // Style select + seed
      if (result.length < 3) {
        const styleParam = params.find(
          (p) => p.kind === "select" && p.key !== "model" && Array.isArray(p.options),
        );
        if (styleParam && !result.includes(styleParam)) result.push(styleParam);
      }
      if (result.length < 3) {
        const seedParam = params.find((p) => p.kind === "seed");
        if (seedParam && !result.includes(seedParam)) result.push(seedParam);
      }
      break;
    case "video":
      // Duration + aspect ratio
      if (result.length < 3) {
        const durationParam = params.find((p) => p.key === "duration");
        if (durationParam && !result.includes(durationParam)) result.push(durationParam);
      }
      if (result.length < 3) {
        const aspectParam = params.find((p) => p.key === "aspect_ratio" || p.key === "aspect");
        if (aspectParam && !result.includes(aspectParam)) result.push(aspectParam);
      }
      break;
    case "audio":
      // Voice + language
      if (result.length < 3) {
        const voiceParam = params.find((p) => p.key === "voice");
        if (voiceParam && !result.includes(voiceParam)) result.push(voiceParam);
      }
      if (result.length < 3) {
        const langParam = params.find((p) => p.key === "language");
        if (langParam && !result.includes(langParam)) result.push(langParam);
      }
      break;
    case "text":
      // Temperature + max_tokens
      if (result.length < 3) {
        const tempParam = params.find((p) => p.key === "temperature");
        if (tempParam && !result.includes(tempParam)) result.push(tempParam);
      }
      if (result.length < 3) {
        const maxParam = params.find((p) => p.key === "max_tokens" || p.key === "maxTokens");
        if (maxParam && !result.includes(maxParam)) result.push(maxParam);
      }
      break;
    case "music":
      // Duration + genre
      if (result.length < 3) {
        const durationParam = params.find((p) => p.key === "duration");
        if (durationParam && !result.includes(durationParam)) result.push(durationParam);
      }
      if (result.length < 3) {
        const genreParam = params.find((p) => p.key === "genre" || p.key === "style");
        if (genreParam && !result.includes(genreParam)) result.push(genreParam);
      }
      break;
  }

  // Fill remaining slots with other params
  for (const p of params) {
    if (result.length >= 3) break;
    if (!result.includes(p)) result.push(p);
  }

  return result.slice(0, 3);
}
