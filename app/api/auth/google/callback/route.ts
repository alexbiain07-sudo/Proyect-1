import { NextResponse } from "next/server";

/**
 * GET /api/auth/google/ callback
 * Handles the OAuth2 callback from Google.
 * Exchanges the code for tokens, fetches user info,
 * and redirects back to the app with user data in a cookie.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=no_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=not_configured`);
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${baseUrl}/?auth_error=token_exchange_failed`);
    }

    const tokens = await tokenRes.json();

    // Fetch user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${baseUrl}/?auth_error=user_info_failed`);
    }

    const googleUser = await userRes.json();

    // Build our AuthUser data
    const userData = {
      id: googleUser.id || "",
      name: googleUser.name || "",
      email: googleUser.email || "",
      avatar: googleUser.picture || "",
    };

    // Set a cookie with user data (URL-encoded JSON, HttpOnly for security)
    const response = NextResponse.redirect(`${baseUrl}/?auth_success=1`);
    response.cookies.set("meucci_user", JSON.stringify(userData), {
      httpOnly: false, // Client needs to read it
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.redirect(`${baseUrl}/?auth_error=unexpected`);
  }
}
