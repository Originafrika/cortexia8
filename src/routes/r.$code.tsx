import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { lookupReferralCode } from "@/lib/waitlist";

export const Route = createFileRoute("/r/$code")({
  component: ReferralRedirect,
  head: () => ({
    meta: [
      { title: "Redirection…" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function ReferralRedirect() {
  const { code } = Route.useParams();

  useEffect(() => {
    lookupReferralCode({ data: { code } }).then((email) => {
      if (email) {
        window.location.href = `/?ref=${encodeURIComponent(email)}`;
      } else {
        window.location.href = "/";
      }
    });
  }, [code]);

  return null;
}
