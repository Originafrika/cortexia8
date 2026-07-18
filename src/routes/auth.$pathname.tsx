import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { authClient } from "@/auth";
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
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name: name || email.split("@")[0] || "User",
      });
      if (error) throw error;

      if (data?.user && !data.user.emailVerified) {
        setInfo("Un code de vérification vient de t'être envoyé par email.");
        setStep("verify");
      } else {
        navigate({ to: "/app" });
      }
    } catch (err) {
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
      const { error } = await authClient.signIn.email({ email, password });
      if (error) throw error;
      navigate({ to: "/app" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Identifiants invalides.";
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
      const { data, error } = await authClient.emailOtp.verifyEmail({ email, otp: code });
      if (error) throw error;

      const anyData = data as { session?: unknown; token?: string } | null;
      if (anyData?.session || anyData?.token) {
        navigate({ to: "/app" });
        return;
      }
      // Auto-sign-in disabled — try to sign the user in with their password.
      if (password) {
        const { error: signErr } = await authClient.signIn.email({ email, password });
        if (!signErr) {
          navigate({ to: "/app" });
          return;
        }
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
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (mode === "sign-up") handleSignUp(e as unknown as FormEvent);
                      else handleSignIn(e as unknown as FormEvent);
                    }}
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
