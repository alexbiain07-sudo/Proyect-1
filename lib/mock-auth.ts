/**
 * Auth types module.
 * AuthUser is the canonical user type used across the game store and all screens.
 * Authentication is now handled by Auth.js v5 (next-auth) with Google OAuth.
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string; // URL to Google profile picture, or initials fallback
}

/**
 * Convert a next-auth Session.user to our AuthUser format.
 */
export function sessionToAuthUser(sessionUser: {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}): AuthUser {
  const name = sessionUser.name || "Usuario";
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    id: sessionUser.id || "",
    name,
    email: sessionUser.email || "",
    avatar: sessionUser.image || initials,
  };
}
