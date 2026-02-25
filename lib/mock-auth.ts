/**
 * Auth types module.
 * AuthUser is the canonical user type used across the game store and all screens.
 * Authentication is handled by a simple OAuth2 flow with Google (or guest mode).
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string; // URL to Google profile picture, or initials fallback
}
