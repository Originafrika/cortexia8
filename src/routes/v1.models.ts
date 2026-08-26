import { createFileRoute } from "@tanstack/react-router";
import h3Handler from "../../server/api/v1/models/index";
import { createH3ServerRoute } from "@/lib/server/h3-route";

export const Route = createFileRoute("/v1/models")({
  server: {
    handlers: {
      GET: createH3ServerRoute("GET", "/v1/models", h3Handler),
    },
  },
});
