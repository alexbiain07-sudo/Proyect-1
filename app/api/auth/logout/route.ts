import { NextResponse } from "next/server";


export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("meucci_user", "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}


export async function GET() {
  const response = NextResponse.redirect("/");

  response.cookies.set("meucci_user", "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}
