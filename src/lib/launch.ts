// Global launch configuration.
// Flip LAUNCH_MODE to "live" on 1st August to remove every waitlist artefact
// at once. Individual routes read this constant to decide what to render.

export type LaunchMode = "waitlist" | "live";

export const LAUNCH_MODE: LaunchMode = "waitlist";

// Next 1st August (UTC) — recomputed at build/import time.
export const LAUNCH_DATE = (() => {
  const now = new Date();
  const isBefore =
    now.getUTCMonth() < 7 ||
    (now.getUTCMonth() === 7 && now.getUTCDate() < 1);
  const y = isBefore ? now.getUTCFullYear() : now.getUTCFullYear() + 1;
  return new Date(Date.UTC(y, 7, 1, 0, 0, 0));
})();

export const isWaitlist = () => LAUNCH_MODE === "waitlist";
