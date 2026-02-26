import { NextResponse } from "next/server";

interface LeadEntry {
  id?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  googleId?: string;
  avatar?: string;
  vehiculoInteres?: string;
  vehiculoId?: string;
  puntajeJuego?: number;
  nivelConductor?: string;
  createdAt?: string;
}

// Utilidad para responder 500/502 prolijo
function jsonError(message: string, status = 500, extra?: any) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/**
 * POST /api/leads
 * - Valida mínimo nombre o email
 * - Forwardea el payload a AWS Lambda URL (que escribe en S3)
 *
 * Requiere env:
 * - LEADS_LAMBDA_URL = https://xxxxx.lambda-url.sa-east-1.on.aws/
 *
 * Opcional (recomendado):
 * - LEADS_API_TOKEN = "algún token"  (se manda como Authorization: Bearer)
 *   (tu Lambda debería validarlo si lo implementás)
 */
export async function POST(request: Request) {
  try {
    const lambdaUrl = process.env.LEADS_LAMBDA_URL;

    if (!lambdaUrl) {
      return jsonError(
        "Falta configurar LEADS_LAMBDA_URL en variables de entorno",
        500
      );
    }

    const body: LeadEntry = await request.json();

    // Validación mínima
    if (!body.nombre && !body.email) {
      return NextResponse.json(
        { error: "Se requiere nombre o email" },
        { status: 400 }
      );
    }

    // Validación email si viene
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json({ error: "Email invalido" }, { status: 400 });
      }
    }

    // Normalizamos payload (por si faltan campos)
    const payload: LeadEntry = {
      ...body,
      puntajeJuego: Number(body.puntajeJuego ?? 0),
      createdAt: new Date().toISOString(),
    };

    // Forward a Lambda
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = process.env.LEADS_API_TOKEN;
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
      // si Lambda devuelve texto plano, lo dejamos en "raw"
      data = text ? { raw: text } : null;
    }

    if (!resp.ok) {
      return jsonError("Lambda respondió error", 502, {
        lambdaStatus: resp.status,
        lambdaBody: data,
      });
    }

    // OK
    return NextResponse.json(
      { success: true, message: "Lead enviado a AWS correctamente", lambda: data },
      { status: 201 }
    );
  } catch (err: any) {
    return jsonError("Error interno del servidor", 500, {
      detail: err?.message,
    });
  }
}

/**
 * GET /api/leads
 * OJO: esto SOLO funciona si tu Lambda implementa GET (listado desde S3).
 * Si no, devolvemos 501 para que no “mienta” con in-memory.
 */
export async function GET() {
  const lambdaUrl = process.env.LEADS_LAMBDA_URL;
  if (!lambdaUrl) {
    return jsonError(
      "Falta configurar LEADS_LAMBDA_URL en variables de entorno",
      500
    );
  }

  const headers: Record<string, string> = {};
  const token = process.env.LEADS_API_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const resp = await fetch(lambdaUrl, { method: "GET", headers });
    const text = await resp.text();

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text ? { raw: text } : null;
    }

    if (!resp.ok) {
      // si la lambda no soporta GET, suele ser 405
      return NextResponse.json(
        {
          error: "Lambda no soporta GET o devolvió error",
          lambdaStatus: resp.status,
          lambdaBody: data,
        },
        { status: resp.status === 405 ? 501 : 502 }
      );
    }

    return NextResponse.json(data ?? { ok: true });
  } catch (err: any) {
    return jsonError("No se pudo consultar Lambda", 502, { detail: err?.message });
  }
}
