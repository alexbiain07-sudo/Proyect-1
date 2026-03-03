import { NextResponse } from "next/server";

interface GameEvent {
  event_name: string;          
  session_id?: string;         
  ref_session_id?: string;     
  platform?: string;           
  ts?: string;                
  page?: string;
  meta?: any;
}

function jsonError(message: string, status = 500, extra?: any) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function POST(request: Request) {
  try {
    const lambdaUrl = process.env.EVENTS_LAMBDA_URL;
    if (!lambdaUrl) {
      return jsonError("Falta configurar EVENTS_LAMBDA_URL en variables de entorno", 500);
    }

    const body: GameEvent = await request.json();

    if (!body?.event_name) {
      return NextResponse.json({ error: "Missing event_name" }, { status: 400 });
    }

    // Normalizamos
    const payload: GameEvent = {
      ...body,
      platform: body.platform || "unknown",
      ts: body.ts || new Date().toISOString(),
    };

    const headers: Record<string, string> = { "Content-Type": "application/json" };

    const token = process.env.EVENTS_API_TOKEN;
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const resp = await fetch(lambdaUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text ? { raw: text } : null;
    }

    if (!resp.ok) {
      return jsonError("Lambda respondió error", 502, {
        lambdaStatus: resp.status,
        lambdaBody: data,
      });
    }

    return NextResponse.json({ success: true, lambda: data }, { status: 201 });
  } catch (err: any) {
    return jsonError("Error interno del servidor", 500, { detail: err?.message });
  }
}
