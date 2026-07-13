import { createFileRoute } from "@tanstack/react-router";
import { AccountView } from "@neondatabase/auth-ui";

export const Route = createFileRoute("/account/$pathname")({
  component: Account,
});

function Account() {
  const { pathname } = Route.useParams();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <AccountView pathname={pathname} />
      </div>
    </div>
  );
}
