import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/auth";
import { clearSession } from "@/lib/auth-store";

export const Route = createFileRoute("/access-denied")({
  component: () => {
    const navigate = useNavigate();
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-semibold">Accès refusé</h1>
          <p className="text-muted-foreground mt-3">
            Cette application est en accès restreint.
            Pour obtenir un accès, contacte l'administrateur.
          </p>
          <button
            onClick={async () => {
              await authClient.signOut();
              clearSession();
              navigate({ to: "/auth/sign-in" });
            }}
            className="mt-6 underline text-sm"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    );
  },
});
