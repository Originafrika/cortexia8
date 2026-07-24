import { createFileRoute, redirect } from "@tanstack/react-router";
import { AccountView } from "@neondatabase/auth-ui";
import { loadSession } from "@/lib/auth-store";

export const Route = createFileRoute("/account/$pathname")({
  beforeLoad: ({ location }) => {
    const session = loadSession();
    if (!session) {
      throw redirect({ to: "/auth/sign-in", search: { redirect: location.href } });
    }
  },
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
