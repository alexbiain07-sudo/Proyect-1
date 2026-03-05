import { NextRequest, NextResponse } from "next/server";

const CHANNEL_MAP: Record<string, string> = {
  w: "whatsapp",
  f: "facebook",
};

export async function GET(req: NextRequest, { params }: { params: { channel: string } }) {
  const rawParam = params?.channel;
  const rawPath = req.nextUrl.pathname.split("/").filter(Boolean)[1]; // "/r/w" -> ["r","w"] -> "w"
  const rawChannel = rawParam ?? rawPath ?? "unknown";

  const channel = CHANNEL_MAP[rawChannel] ?? rawChannel ?? "unknown";
  const sp = req.nextUrl.searchParams;

  const share_id = sp.get("share_id") ?? undefined;
  const uid = sp.get("uid") ?? undefined;
  const sid = sp.get("sid") ?? undefined;
  const score = sp.get("score") ?? undefined;

  try {
    await fetch(new URL("/api/events", req.nextUrl.origin), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("user-agent") ?? "",
      },
      body: JSON.stringify({
        event_name: "referral_visit",
        ref_session_id: share_id,
        platform: channel,
        page: `/r/${rawChannel}`,
        ts: new Date().toISOString(),
        meta: {
          uid,
          sid,
          score,
        },
      }),
      cache: "no-store",
    });
  } catch {}

  const dest = new URL(req.nextUrl.origin);

  dest.searchParams.set("utm_source", channel);
  dest.searchParams.set("utm_medium", "share");

  if (share_id) dest.searchParams.set("share_id", share_id);
  if (uid) dest.searchParams.set("uid", uid);
  if (sid) dest.searchParams.set("sid", sid);
  if (score) dest.searchParams.set("score", score);

  const res = NextResponse.redirect(dest.toString(), 302);


if (share_id) {
  res.cookies.set("meucci_ref", share_id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
    sameSite: "lax",
    secure: true,
    httpOnly: false, 
  });
}


res.cookies.set("meucci_ref_channel", channel, {
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
  sameSite: "lax",
  secure: true,
  httpOnly: false,
});

return res;
}
