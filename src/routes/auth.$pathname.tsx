import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { authClient } from "@/auth";
import { saveSession } from "@/lib/auth-store";
import { ArrowRight, Mail, KeyRound, AlertCircle } from "lucide-react";
import { AmbientBackground } from "@/components/ambient-background";

export const Route = createFileRoute("/auth/$pathname")({
  component: Auth,
});

type Mode = "sign-in" | "sign-up";

function Auth() {
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
      console.log("[auth] handleSignUp called for:", email);
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name: name || email.split("@")[0] || "User",
      });
      console.log("[auth] signUp response:", { hasData: !!data, hasError: !!error, dataKeys: data ? Object.keys(data) : [] });
      if (error) throw error;

      if (data?.user && !data.user.emailVerified) {
        console.log("[auth] email not verified, going to verify step");
        setInfo("Un code de vérification vient de t'être envoyé par email.");
        setStep("verify");
      } else if (data?.user) {
        console.log("[auth] email already verified, saving session");
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
        console.log("[auth] no user in response, navigating to /app-preview");
        navigate({ to: "/app-preview" });
      }
    } catch (err) {
      console.error("[auth] handleSignUp error:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    reset();
    setLoading(true);
    try {
      console.log("[auth] handleSignIn called for:", email);
      const result = await authClient.signIn.email({ email, password });
      console.log("[auth] signIn response:", { hasData: !!result.data, hasError: !!result.error, token: result.data?.token ? result.data.token.slice(0, 12) + "..." : "NONE" });
      if (result.error) throw result.error;
      if (result.data?.user) {
        const role = result.data.user.role ?? "user";
        console.log("[auth] handleSignIn saving session, token:", result.data.token.slice(0, 12) + "...", "role:", role);
        saveSession({
          token: result.data.token,
          user: {
            id: result.data.user.id,
            name: result.data.user.name,
            email: result.data.user.email,
            role,
            emailVerified: result.data.user.emailVerified ?? false,
          },
        });
        if (role === "admin") {
          navigate({ to: "/app-preview" });
        } else {
          navigate({ to: "/access-denied" });
        }
      } else {
        console.log("[auth] handleSignIn no user in response, navigating to /app-preview");
        navigate({ to: "/app-preview" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Identifiants invalides.";
      console.error("[auth] handleSignIn error:", msg);
      // If Neon returned "email not verified", switch to the verify step and send a code.
      if (/verif/i.test(msg)) {
        try {
          await authClient.sendVerificationEmail({
            email,
            callbackURL: window.location.origin + "/app",
          });
          setInfo("Ton email n'est pas encore vérifié. On vient de t'envoyer un nouveau code.");
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
      console.log("[auth] handleVerify called for:", email, "code:", code);
      const { data, error } = await authClient.emailOtp.verifyEmail({ email, otp: code });
      console.log("[auth] verifyEmail response:", { hasData: !!data, hasError: !!error, dataKeys: data ? Object.keys(data) : [] });
      if (error) throw error;

      // Always re-sign in after OTP verification to get a proper session token.
      // The verifyEmail response may not include a usable token.
      if (password) {
        console.log("[auth] handleVerify re-signing in with password...");
        const signResult = await authClient.signIn.email({ email, password });
        console.log("[auth] handleVerify re-sign response:", { hasError: !!signResult.error, hasUser: !!signResult.data?.user, token: signResult.data?.token ? signResult.data.token.slice(0, 12) + "..." : "NONE" });
        if (!signResult.error && signResult.data?.user) {
          const role = signResult.data.user.role ?? "user";
          console.log("[auth] handleVerify saving session, token:", signResult.data.token.slice(0, 12) + "...");
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
          if (role === "admin") {
            navigate({ to: "/app-preview" });
          } else {
            navigate({ to: "/access-denied" });
          }
          return;
        }
        console.log("[auth] handleVerify re-sign FAILED:", signResult.error);
      } else {
        console.log("[auth] handleVerify no password available for re-sign-in");
      }
      // Fallback: if no password was stored, try to extract token from verify response.
      const anyData = data as { session?: { user?: { id: string; name: string; email: string; role?: string } }; token?: string } | null;
      const token = anyData?.token ?? anyData?.session?.user?.id ? (anyData as any)?.session?.token : undefined;
      if (token) {
        const u = anyData?.session?.user;
        saveSession({
          token,
          user: {
            id: u?.id ?? "",
            name: u?.name ?? "",
            email: u?.email ?? email,
            role: u?.role ?? "user",
            emailVerified: true,
          },
        });
        navigate({ to: "/app-preview" });
        return;
      }
      setInfo("Email vérifié. Tu peux maintenant te connecter.");
      setMode("sign-in");
      setStep("auth");
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code invalide ou expiré.");
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
      setInfo("Nouveau code envoyé. Vérifie ta boîte de réception.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de renvoyer le code.");
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
                  {mode === "sign-up" ? "Créer un compte" : "Se connecter"}
                </div>
                <h1 className="mt-2 font-display text-3xl tracking-[-0.02em]">
                  {mode === "sign-up" ? "Bienvenue chez Cortexia." : "Bon retour."}
                </h1>

                <form
                  onSubmit={mode === "sign-up" ? handleSignUp : handleSignIn}
                  className="mt-6 space-y-3"
                >
                  {mode === "sign-up" && (
                    <Input
                      type="text"
                      placeholder="Ton nom (optionnel)"
                      value={name}
                      onChange={(v) => setName(v)}
                    />
                  )}
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(v) => setEmail(v)}
                    required
                    icon={<Mail className="size-4" />}
                  />
                  <Input
                    type="password"
                    placeholder="Mot de passe"
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
                    {loading ? "…" : mode === "sign-up" ? "Créer mon compte" : "Se connecter"}
                    {!loading && (
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    )}
                  </button>
                </form>

                <div className="mt-5 text-center text-xs text-muted-foreground">
                  {mode === "sign-up" ? (
                    <>
                      Déjà un compte ?{" "}
                      <button
                        onClick={() => {
                          setMode("sign-in");
                          reset();
                        }}
                        className="text-amber-soft hover:underline"
                      >
                        Se connecter
                      </button>
                    </>
                  ) : (
                    <>
                      Pas encore de compte ?{" "}
                      <button
                        onClick={() => {
                          setMode("sign-up");
                          reset();
                        }}
                        className="text-amber-soft hover:underline"
                      >
                        Créer un compte
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
          "w-full rounded-xl border border-border bg-surface-0/80 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-amber/50 focus:outline-none " +
          (icon ? "pl-10 pr-3" : "px-4")
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
  return (
    <>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Vérification
      </div>
      <h1 className="mt-2 font-display text-3xl tracking-[-0.02em]">Vérifie ton email.</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Code à 6 chiffres envoyé à <span className="text-foreground/90">{email}</span>.
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
          className="w-full rounded-xl border border-border bg-surface-0/80 px-4 py-4 text-center font-mono text-2xl tracking-[0.5em] placeholder:text-muted-foreground/40 focus:border-amber/50 focus:outline-none"
        />

        {error && <Alert kind="error">{error}</Alert>}
        {info && <Alert kind="info">{info}</Alert>}

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-40 hover:opacity-95 transition"
        >
          {loading ? "…" : "Vérifier"}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-xs">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition">
          ← Retour
        </button>
        <button
          onClick={onResend}
          disabled={loading}
          className="text-amber-soft hover:underline disabled:opacity-40"
        >
          Renvoyer le code
        </button>
      </div>
    </>
  );
}
