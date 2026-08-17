import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routesDirectory = resolve(process.cwd(), "src/routes");
const apiDirectory = resolve(process.cwd(), "src/lib/api");
const routeTreePath = resolve(process.cwd(), "src/routeTree.gen.ts");

describe("legacy migration route safety", () => {
  it.each(["anonymous", "ordinary-user", "administrator", "production-disabled"])(
    "%s requests cannot reach the removed schema-changing route",
    () => {
      expect(existsSync(resolve(routesDirectory, "run-migration.tsx"))).toBe(false);
      expect(existsSync(resolve(apiDirectory, "run-migration.ts"))).toBe(false);
    },
  );

  it("does not register /run-migration in the generated route tree", () => {
    const routeTree = readFileSync(routeTreePath, "utf8");
    expect(routeTree).not.toContain("/run-migration");
    expect(routeTree).not.toContain("RunMigrationRoute");
  });
});
