import { describe, it, expect, vi, afterEach } from "vitest";
import { googleProvider, authConfig } from "./auth.config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("googleProvider", () => {
  it("wires credentials from OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET, not the Auth.js defaults", () => {
    vi.stubEnv("OAUTH_CLIENT_ID", "test-client-id");
    vi.stubEnv("OAUTH_CLIENT_SECRET", "test-client-secret");

    const provider = googleProvider();

    expect((provider as { id: string }).id).toBe("google");
    // Auth.js nests the resolved credentials under `options`.
    const options = (provider as { options: { clientId?: string; clientSecret?: string } }).options;
    expect(options.clientId).toBe("test-client-id");
    expect(options.clientSecret).toBe("test-client-secret");
  });

  it("reads the env at call time", () => {
    vi.stubEnv("OAUTH_CLIENT_ID", "first");
    vi.stubEnv("OAUTH_CLIENT_SECRET", "secret");
    expect((googleProvider() as { options: { clientId?: string } }).options.clientId).toBe("first");

    vi.stubEnv("OAUTH_CLIENT_ID", "second");
    expect((googleProvider() as { options: { clientId?: string } }).options.clientId).toBe("second");
  });
});

describe("authConfig", () => {
  it("registers exactly one provider, Google", () => {
    expect(authConfig.providers).toHaveLength(1);
    expect((authConfig.providers[0] as { id: string }).id).toBe("google");
  });
});
