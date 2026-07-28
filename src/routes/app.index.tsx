import { createFileRoute } from "@tanstack/react-router";
import { ModelsCatalog } from "@/routes/app.models";

export const Route = createFileRoute("/app/")({
  component: ModelsCatalog,
});
