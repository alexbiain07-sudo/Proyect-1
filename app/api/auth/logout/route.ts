import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;

  const response = NextResponse.redirect(baseUrl);

  response.cookies.set("meucci_user", "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}


export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });

  response.cookies.set("meucci_user", "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}
