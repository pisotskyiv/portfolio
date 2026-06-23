import { describe, it, expect } from "vitest";
import { MAX_INPUT_CHARS } from "./chat-limits";

describe("chat limits", () => {
  it("exposes a positive input character budget", () => {
    expect(MAX_INPUT_CHARS).toBe(4000);
    expect(MAX_INPUT_CHARS).toBeGreaterThan(0);
  });
});
