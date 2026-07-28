import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { runMigration } from "@/lib/api/run-migration";

export const Route = createFileRoute("/run-migration")({
  component: RunMigration,
});

function RunMigration() {
  const [results, setResults] = useState<string[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    runMigration()
      .then(setResults)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="p-8 font-mono text-xs bg-black text-green-400 min-h-screen">
      <h1 className="text-lg font-bold mb-4 text-white">Database Migration</h1>
      {error && <div className="text-red-400">ERROR: {error}</div>}
      {results ? (
        <pre>{JSON.stringify(results, null, 2)}</pre>
      ) : (
        <div>Running migration...</div>
      )}
    </div>
  );
}
