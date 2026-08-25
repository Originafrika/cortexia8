import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/run-migration")({
  component: DisabledMigrationRoute,
});

function DisabledMigrationRoute() {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-6 text-green-300">
      <section className="max-w-xl space-y-4 font-mono text-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-green-500">410 · Gone</p>
        <h1 className="text-xl font-semibold text-white">Migration web désactivée</h1>
        <p className="text-green-200/80">
          Les migrations de production sont exécutées exclusivement par la chaîne versionnée et la
          procédure opérateur documentée. Cette URL ne lit ni n’écrit aucune donnée.
        </p>
      </section>
    </main>
  );
}
