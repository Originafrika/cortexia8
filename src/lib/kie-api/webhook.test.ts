import { describe, expect, it } from "vitest";
import { extractTaskId } from "./webhook";

describe("extractTaskId", () => {
  it("accepts a top-level taskId", () => {
    expect(extractTaskId({ taskId: "task-1" })).toBe("task-1");
  });

  it("accepts nested camelCase and snake_case task IDs", () => {
    expect(extractTaskId({ data: { taskId: "task-2" } })).toBe("task-2");
    expect(extractTaskId({ data: { task_id: "task-3" } })).toBe("task-3");
  });

  it("rejects malformed payloads", () => {
    expect(extractTaskId(null)).toBeNull();
    expect(extractTaskId({ data: { id: "not-a-task" } })).toBeNull();
  });
});
