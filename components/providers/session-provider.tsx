"use client";

/**
 * Simple session provider — just renders children.
 * Auth state is managed by the game store and cookies.
 * No next-auth dependency needed.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
