import { createFileRoute, redirect } from "@tanstack/react-router";
import { AccountView } from "@neondatabase/auth-ui";
import { loadSession } from "@/lib/auth-store";

export const Route = createFileRoute("/account/$pathname")({
  head: () => ({
    meta: [
      { title: "Cortexia — Account Settings" },
      { name: "description", content: "Manage your Cortexia account settings, profile, and authentication preferences." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: ({ location }) => {
    const session = loadSession();
    if (!session) {
      throw redirect({ to: "/auth/$pathname" as "/auth/$pathname", params: { pathname: "sign-in" }, search: { redirect: location.href } });
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
