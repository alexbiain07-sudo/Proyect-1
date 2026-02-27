import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  
  const baseUrl =
    (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.replace(/\/$/, "")) ||
    `${url.protocol}//${url.host}`;

  // Si Google devolvió error o no vino code, volver al home limpio
  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/`);
  }

  try {
    // 1) Intercambio code -> tokens
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
      return NextResponse.redirect(`${baseUrl}/`);
    }

    const tokens = await tokenRes.json();

    // 2) userinfo
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${baseUrl}/`);
    }

    const googleUser = await userRes.json();

    const userData = {
      id: googleUser.id || "",
      name: googleUser.name || "",
      email: googleUser.email || "",
      avatar: googleUser.picture || "",
    };

    // 3) Redirección limpia (sin querystring)
    const response = NextResponse.redirect(`${baseUrl}/`);

    // 4) Cookie para que el cliente sepa que está logueado
    response.cookies.set("meucci_user", JSON.stringify(userData), {
      httpOnly: false, // tu front lo lee (si después querés mejorar, lo hacemos httpOnly y agregamos /api/me)
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return response;
  } catch {
    return NextResponse.redirect(`${baseUrl}/`);
  }
}
