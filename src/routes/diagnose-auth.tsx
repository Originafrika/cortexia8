import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { diagnoseAuth } from "@/lib/api/diagnose";

export const Route = createFileRoute("/diagnose-auth")({
  component: DiagnoseAuth,
});

function DiagnoseAuth() {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    diagnoseAuth()
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="p-8 font-mono text-xs whitespace-pre-wrap bg-black text-green-400 min-h-screen">
      <h1 className="text-lg font-bold mb-4 text-white">Auth Schema Diagnostics</h1>
      {error && <div className="text-red-400">ERROR: {error}</div>}
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
