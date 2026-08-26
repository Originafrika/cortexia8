import { createFileRoute } from "@tanstack/react-router";
import h3Handler from "../../server/api/v1/generate";
import { createH3ServerRoute } from "@/lib/server/h3-route";

export const Route = createFileRoute("/v1/generate")({
  server: {
    handlers: {
      POST: createH3ServerRoute("POST", "/v1/generate", h3Handler),
    },
  },
});
