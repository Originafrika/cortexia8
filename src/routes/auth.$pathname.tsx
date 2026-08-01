import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { authClient } from "@/auth";
import { saveSession } from "@/lib/auth-store";
import { ArrowRight, Mail, KeyRound, AlertCircle } from "lucide-react";
import { AmbientBackground } from "@/components/ambient-background";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/auth/$pathname")({
  head: () => ({
    meta: [
      { title: "Cortexia — Sign in / Sign up" },
      { name: "description", content: "Sign in or create a Cortexia account to access AI generation models, manage your balance, and start creating." },
    ],
  }),
  component: Auth,
});

type Mode = "sign-in" | "sign-up";

function Auth() {
  const t = useT();
  const { pathname } = Route.useParams();
  const navigate = useNavigate();

  const initialMode: Mode = pathname === "sign-up" ? "sign-up" : "sign-in";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState<"auth" | "verify">("auth");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const reset = () => {
    setError("");
    setInfo("");
  };

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name: name || email.split("@")[0] || "User",
      });
      if (error) throw error;

      if (data?.user && !data.user.emailVerified) {
        setInfo(t("auth.verification_code_sent"));
        setStep("verify");
      } else if (data?.user) {
        saveSession({
          token: (data as any).token ?? (data as any).session?.token ?? "",
          user: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: (data.user as any).role ?? "user",
            emailVerified: true,
          },
        });
        navigate({ to: "/app-preview" });
      } else {
        navigate({ to: "/app-preview" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.error_generic"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      const result = await authClient.signIn.email({ email, password });
      console.log("[AUTH_DEBUG] signIn result:", { hasData: !!result.data, hasUser: !!result.data?.user, token: result.data?.token ? result.data.token.slice(0, 12) + "..." : "UNDEFINED", dataKeys: result.data ? Object.keys(result.data) : [] });
      if (result.error) throw result.error;
      if (result.data?.user) {
        const role = (result.data.user as any).role ?? "user";
        const token = result.data.token ?? (result.data as any).session?.token ?? "";
        console.log("[AUTH_DEBUG] saving session with token:", token ? token.slice(0, 12) + "..." : "EMPTY");
        saveSession({
          token,
          user: {
            id: result.data.user.id,
            name: result.data.user.name,
            email: result.data.user.email,
            role,
            emailVerified: result.data.user.emailVerified ?? false,
          },
        });
        navigate({ to: "/app-preview" });
      } else {
        navigate({ to: "/app-preview" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("auth.invalid_credentials");
      // If Neon returned "email not verified", switch to the verify step and send a code.
      if (/verif/i.test(msg)) {
        try {
          await authClient.sendVerificationEmail({
            email,
            callbackURL: window.location.origin + "/app",
          });
          setInfo(t("auth.email_not_verified_resend"));
          setStep("verify");
        } catch {
          setError(msg);
        }
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      const { data, error } = await authClient.emailOtp.verifyEmail({ email, otp: code });
      if (error) throw error;

      // Always re-sign in after OTP verification to get a proper session token.
      // The verifyEmail response may not include a usable token.
      if (password) {
        const signResult = await authClient.signIn.email({ email, password });
        if (!signResult.error && signResult.data?.user) {
          const role = (signResult.data.user as any).role ?? "user";
          saveSession({
            token: signResult.data.token,
            user: {
              id: signResult.data.user.id,
              name: signResult.data.user.name,
              email: signResult.data.user.email,
              role,
              emailVerified: true,
            },
          });
          navigate({ to: "/app-preview" });
          return;
        }
      } else {
      }
      // Fallback: if no password was stored, try to extract user info from verify response.
      const anyData = data as { session?: { user?: { id: string; name: string; email: string; role?: string } }; token?: string } | null;
      if (anyData?.session?.user) {
        const u = anyData.session.user;
        saveSession({
          token: anyData.token ?? anyData.session?.token ?? "",
          user: {
            id: u.id ?? "",
            name: u.name ?? "",
            email: u.email ?? email,
            role: u.role ?? "user",
            emailVerified: true,
          },
        });
        navigate({ to: "/app-preview" });
        return;
      }
      setInfo(t("auth.email_verified_signin"));
      setMode("sign-in");
      setStep("auth");
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.invalid_code"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    reset();
    setLoading(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: window.location.origin + "/app",
      });
      if (error) throw error;
      setInfo(t("auth.code_resent"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.code_resend_error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <div className="grid place-items-center size-7 rounded-lg bg-gradient-to-br from-amber to-amber-soft text-primary-foreground">
              <span className="font-display text-sm">C</span>
            </div>
            <span className="font-display tracking-[-0.02em] text-foreground text-base">
              Cortexia
            </span>
          </Link>

          <div className="surface-gradient-border rounded-2xl bg-surface-1/70 backdrop-blur-xl p-6 sm:p-8">
            {step === "verify" ? (
              <VerifyForm
                email={email}
                code={code}
                setCode={setCode}
                onSubmit={handleVerify}
                onResend={handleResend}
                loading={loading}
                error={error}
                info={info}
                onBack={() => {
                  setStep("auth");
                  reset();
                }}
              />
            ) : (
              <>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {mode === "sign-up" ? t("auth.create_account") : t("auth.sign_in")}
                </div>
                <h1 className="mt-2 font-display text-3xl tracking-[-0.02em]">
                  {mode === "sign-up" ? t("auth.welcome_new") : t("auth.welcome_back")}
                </h1>

                <form
                  onSubmit={mode === "sign-up" ? handleSignUp : handleSignIn}
                  className="mt-6 space-y-3"
                >
                  {mode === "sign-up" && (
                    <Input
                      type="text"
                      placeholder={t("auth.name_placeholder")}
                      value={name}
                      onChange={(v) => setName(v)}
                    />
                  )}
                  <Input
                    type="email"
                    placeholder={t("auth.email_placeholder")}
                    value={email}
                    onChange={(v) => setEmail(v)}
                    required
                    icon={<Mail className="size-4" />}
                  />
                  <Input
                    type="password"
                    placeholder={t("auth.password_placeholder")}
                    value={password}
                    onChange={(v) => setPassword(v)}
                    required
                    icon={<KeyRound className="size-4" />}
                  />

                  {error && <Alert kind="error">{error}</Alert>}
                  {info && <Alert kind="info">{info}</Alert>}

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-40 hover:opacity-95 transition"
                  >
                    {loading ? "…" : mode === "sign-up" ? t("auth.create_my_account") : t("auth.sign_in")}
                    {!loading && (
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </button>
                </form>

                <div className="mt-5 text-center text-xs text-muted-foreground">
                  {mode === "sign-up" ? (
                    <>
                      {t("auth.already_account")}{" "}
                      <button
                        onClick={() => {
                          setMode("sign-in");
                          reset();
                        }}
                        className="text-amber-soft hover:underline"
                      >
                        {t("auth.sign_in")}
                      </button>
                    </>
                  ) : (
                    <>
                      {t("auth.no_account")}{" "}
                      <button
                        onClick={() => {
                          setMode("sign-up");
                          reset();
                        }}
                        className="text-amber-soft hover:underline"
                      >
                        {t("auth.create_account")}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({
  type,
  placeholder,
  value,
  onChange,
  required,
  icon,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <label className="relative block">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={
          "w-full h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
          (icon ? "pl-10" : "")
        }
      />
    </label>
  );
}

function Alert({ kind, children }: { kind: "error" | "info"; children: React.ReactNode }) {
  return (
    <div
      className={
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs " +
        (kind === "error"
          ? "border-red-500/30 bg-red-500/10 text-red-200"
          : "border-amber/30 bg-amber/10 text-amber-soft")
      }
    >
      <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function VerifyForm({
  email,
  code,
  setCode,
  onSubmit,
  onResend,
  loading,
  error,
  info,
  onBack,
}: {
  email: string;
  code: string;
  setCode: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  onResend: () => void;
  loading: boolean;
  error: string;
  info: string;
  onBack: () => void;
}) {
  const t = useT();
  return (
    <>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {t("auth.verification")}
      </div>
      <h1 className="mt-2 font-display text-3xl tracking-[-0.02em]">{t("auth.verify_email")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("auth.code_sent_to")} <span className="text-foreground/90">{email}</span>.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          aria-label="Verification code"
          className="w-full rounded-xl border border-border bg-surface-0/80 px-4 py-4 text-center font-mono text-2xl tracking-[0.5em] placeholder:text-muted-foreground/40 focus:border-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />

        {error && <Alert kind="error">{error}</Alert>}
        {info && <Alert kind="info">{info}</Alert>}

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-40 hover:opacity-95 transition"
        >
          {loading ? "…" : t("auth.verify")}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-xs">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition">
          {t("auth.back")}
        </button>
        <button
          onClick={onResend}
          disabled={loading}
          className="text-amber-soft hover:underline disabled:opacity-40"
        >
          {t("auth.resend_code")}
        </button>
      </div>
    </>
  );
}
