import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)meucci_user=([^;]+)/);
  const raw = match?.[1];

  let user: any = null;

  if (raw) {
    // Intento 1: si está url-encoded
    try {
      user = JSON.parse(decodeURIComponent(raw));
    } catch {
      // Intento 2: si NO está encoded (tu cookie actual)
      try {
        user = JSON.parse(raw);
      } catch {
        user = null;
      }
    }
  }

  const res = NextResponse.json({ user });

  // Borra la cookie SIEMPRE (one-time login)
  res.cookies.set("meucci_user", "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return res;
}
