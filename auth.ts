/**
 * Auth configuration.
 * Checks whether Google OAuth credentials are available.
 * The actual OAuth flow is handled by /api/auth/google/route.ts
 * using standard OAuth2 — no next-auth dependency.
 */
export const isGoogleAuthConfigured =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
