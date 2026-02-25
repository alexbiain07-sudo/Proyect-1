"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";

/**
 * Wraps children in NextAuth SessionProvider only when auth is configured.
 * When basePath returns 501, we know auth is not set up and skip the provider
 * so the app works without Google credentials.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [authAvailable, setAuthAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/session", { method: "GET" })
      .then((res) => {
        // If auth is not configured, the noop handler returns 501
        setAuthAvailable(res.status !== 501);
      })
      .catch(() => setAuthAvailable(false));
  }, []);

  // While checking, render children without auth wrapper
  if (authAvailable === null || authAvailable === false) {
    return <>{children}</>;
  }

  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
