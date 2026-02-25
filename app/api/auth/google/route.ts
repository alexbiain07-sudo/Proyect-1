import { NextResponse } from "next/server";

/**
 * GET /api/auth/google
 * Redirects the user to Google's OAuth consent screen.
 * Standard OAuth2 — no next-auth dependency.
 */
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL || ""}/api/auth/google/callback`;

  if (!clientId) {
    return NextResponse.json({ error: "Google OAuth not configured" }, { status: 501 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
