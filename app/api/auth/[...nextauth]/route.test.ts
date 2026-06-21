import { describe, it, expect, vi } from "vitest";

// Mock the Auth.js instance: the route's only job is to re-export its handlers,
// and loading the real next-auth runtime under jsdom pulls in Node-only modules.
vi.mock("@/auth", () => ({
  handlers: {
    GET: () => new Response(null, { status: 200 }),
    POST: () => new Response(null, { status: 200 }),
  },
}));

describe("auth route handler", () => {
  it("re-exports GET and POST from the Auth.js handlers", async () => {
    const route = await import("./route");
    expect(typeof route.GET).toBe("function");
    expect(typeof route.POST).toBe("function");
  });
});
