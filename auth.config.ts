import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

/**
 * Build the Google OAuth provider from this project's own env var names.
 *
 * Auth.js defaults to AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET; we deliberately read
 * OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET to match the credentials already used by
 * the rest of the app. Env is read at call time so the values are never frozen
 * at module load.
 *
 * Scope is the Google provider default (openid email profile) — enough to
 * autofill the booking form. Calendar-write scope is a separate, later decision.
 */
export function googleProvider() {
  return Google({
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
  });
}

/**
 * Framework-agnostic Auth.js config. Kept separate from the NextAuth() call in
 * `auth.ts` so the provider wiring stays unit-testable and edge-safe (no Node
 * APIs), ready to reuse from middleware if we add it later.
 */
export const authConfig = {
  providers: [googleProvider()],
} satisfies NextAuthConfig;
