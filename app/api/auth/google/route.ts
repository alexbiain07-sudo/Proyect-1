import { NextResponse } from "next/server";


export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.NEXTAUTH_URL;

  if (!clientId) {
    return NextResponse.json(
      { error: "Falta GOOGLE_CLIENT_ID en variables de entorno (Vercel)" },
      { status: 500 }
    );
  }
  if (!baseUrl) {
    return NextResponse.json(
      { error: "Falta NEXTAUTH_URL en variables de entorno (Vercel)" },
      { status: 500 }
    );
  }

  // OJO: esto debe coincidir EXACTO con lo configurado en Google Cloud
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // scopes mínimos para obtener email + perfil
  const scope = [
    "openid",
    "email",
    "profile",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    // opcional, pero útil para forzar cuenta
    prompt: "select_account",
    // si luego querés refresh_token:
    // access_type: "offline",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return NextResponse.redirect(authUrl);
}

/**
 * (Opcional) Si alguien pega /api/auth/google por POST, devolvemos 405.
 * Esto evita confusiones.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Method Not Allowed. Usá GET para iniciar OAuth." },
    { status: 405 }
  );
}
