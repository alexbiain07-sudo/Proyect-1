"use server";

import { signIn, signOut } from "@/auth";

/**
 * Server Actions for authentication.
 * These wrap Auth.js functions so they can be called from client components.
 */

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutUser() {
  await signOut({ redirectTo: "/" });
}
