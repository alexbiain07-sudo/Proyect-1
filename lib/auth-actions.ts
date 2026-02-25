"use server";

import { isGoogleAuthConfigured } from "@/auth";

/**
 * Server Actions for authentication.
 * Returns whether Google OAuth is configured so the client
 * can show the Google button or fall back to guest mode.
 */
export async function getAuthStatus() {
  return { configured: isGoogleAuthConfigured };
}
