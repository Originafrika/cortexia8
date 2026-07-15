import { createFileRoute, useSearch } from "@tanstack/react-router";
import { AuthView } from "@neondatabase/auth-ui";

export const Route = createFileRoute("/auth/$pathname")({
  component: Auth,
});

function Auth() {
  const { pathname } = Route.useParams({});
  const search = useSearch({ from: Route.id });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <AuthView pathname={pathname} redirectTo="/app" callbackURL="/auth/email-otp" />
    </div>
  );
}
