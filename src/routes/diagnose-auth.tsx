import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { diagnoseAuth, runMigration } from "@/lib/api/diagnose";

export const Route = createFileRoute("/diagnose-auth")({
  component: DiagnoseAuth,
});

function DiagnoseAuth() {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState("");
  const [migrationResult, setMigrationResult] = useState<string[] | null>(null);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    diagnoseAuth()
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  async function handleMigrate() {
    setMigrating(true);
    try {
      const result = await runMigration();
      setMigrationResult(result as string[]);
      // Re-run diagnostics
      const newData = await diagnoseAuth();
      setData(newData);
    } catch (e) {
      setError(String(e));
    } finally {
      setMigrating(false);
    }
  }

  return (
    <div className="p-8 font-mono text-xs whitespace-pre-wrap bg-black text-green-400 min-h-screen">
      <h1 className="text-lg font-bold mb-4 text-white">Auth Schema Diagnostics</h1>

      <button
        onClick={handleMigrate}
        disabled={migrating}
        className="mb-4 px-4 py-2 bg-amber text-black font-bold rounded hover:bg-amber/80 disabled:opacity-50"
      >
        {migrating ? "Running migration..." : "Run Migration (create missing tables)"}
      </button>

      {migrationResult && (
        <div className="mb-4 p-4 bg-green-900/30 border border-green-500/30 rounded">
          <div className="text-green-300 font-bold mb-2">Migration Results:</div>
          {migrationResult.map((r, i) => (
            <div key={i}>{r}</div>
          ))}
        </div>
      )}

      {error && <div className="text-red-400">ERROR: {error}</div>}
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
