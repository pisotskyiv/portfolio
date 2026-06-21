"use client";

import { SessionProvider } from "next-auth/react";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Client boundary that gives the chat/booking subtree access to the Auth.js
 * session via `useSession`. Kept thin so the server layout can wrap a client
 * island without becoming a client component itself.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
