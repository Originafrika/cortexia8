import { H3, type EventHandler, type HTTPMethod } from "h3";

export function createH3ServerRoute(method: HTTPMethod, path: string, handler: EventHandler) {
  const app = new H3();
  app.on(method, path, handler);
  return ({ request }: { request: Request }) => app.request(request);
}
