import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lookupReferralCode } from "@/lib/waitlist";

export const Route = createFileRoute("/r/$code")({
  component: ReferralRedirect,
  head: () => ({
    meta: [
      { title: "Redirection..." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function ReferralRedirect() {
  const { code } = Route.useParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    lookupReferralCode({ data: { code } })
      .then((email) => {
        if (email) {
          window.location.href = `/?ref=${encodeURIComponent(email)}`;
        } else {
          window.location.href = "/";
        }
      })
      .catch(() => {
        setError(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      });
  }, [code]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Invalid referral code
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Redirecting to homepage...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
