import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/auth";

export const Route = createFileRoute("/access-denied")({
  component: () => (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-semibold">Accès refusé</h1>
        <p className="text-muted-foreground mt-3">
          Cette application est en accès restreint.
          Pour obtenir un accès, contacte l'administrateur.
        </p>
        <button
          onClick={() => authClient.signOut()}
          className="mt-6 underline text-sm"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  ),
});
