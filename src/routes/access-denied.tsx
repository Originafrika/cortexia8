import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/auth";
import { clearSession } from "@/lib/auth-store";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/access-denied")({
  head: () => ({
    meta: [
      { title: "Cortexia — Access Denied" },
      { name: "description", content: "You do not have permission to access this page on Cortexia." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => {
    const navigate = useNavigate();
    const t = useT();
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-semibold">{t("access_denied.title")}</h1>
          <p className="text-muted-foreground mt-3">
            {t("access_denied.body")}
          </p>
          <button
            onClick={async () => {
              await authClient.signOut();
              clearSession();
              navigate({ to: "/auth/$pathname" as "/auth/$pathname", params: { pathname: "sign-in" } });
            }}
            className="mt-6 underline text-sm"
          >
            {t("access_denied.signout")}
          </button>
        </div>
      </div>
    );
  },
});
