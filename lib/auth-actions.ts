"use server";

import { signIn, signOut, isAuthConfigured } from "@/auth";

/**
 * Server Actions for authentication.
 * These wrap Auth.js functions so they can be called from client components.
 * When Google OAuth is not configured, they return a flag so the client can
 * fall back to a simple local sign-in flow.
 */

export async function getAuthStatus() {
  return { configured: isAuthConfigured };
}

export async function signInWithGoogle() {
  if (!isAuthConfigured) {
    return { fallback: true };
  }
  await signIn("google", { redirectTo: "/" });
}

export async function signOutUser() {
  if (!isAuthConfigured) return;
  await signOut({ redirectTo: "/" });
}
