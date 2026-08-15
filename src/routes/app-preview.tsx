import { createFileRoute } from "@tanstack/react-router";
import { AppPreview } from "@/components/app-preview";

export const Route = createFileRoute("/app-preview")({
  head: () => ({
    meta: [{ name: "description", content: "Cortexia — AI generation platform with 200+ models." }],
  }),
  component: AppPreview,
});
