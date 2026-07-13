import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AuthView, AuthCallback } from "@neondatabase/auth-ui";

export const Route = createFileRoute("/auth/$pathname")({
  component: Auth,
});

function Auth() {
  const { pathname } = Route.useParams();
  const router = useRouter();

  if (pathname === "callback") {
    return <AuthCallback redirectTo="/app" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <AuthView
        pathname={pathname}
        callbackURL="/app"
        redirectTo="/app"
      />
    </div>
  );
}
