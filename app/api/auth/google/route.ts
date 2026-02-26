import { NextResponse } from "next/server";

/**
 * Lead payload.
 * NOTE: This route now forwards data to an AWS Lambda URL (which should persist to S3).
 */
interface LeadEntry {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  googleId: string;
  avatar: string;
  vehiculoInteres: string;
  vehiculoId: string;
  puntajeJuego: number;
  nivelConductor: string;
  createdAt: string;
}

/**
 * POST /api/leads
 * Receives lead data from both Google sign-in and the form screen,
 * validates it, then forwards to AWS Lambda for persistence (S3).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // At minimum we need a name or email
    if (!body?.nombre && !body?.email) {
      return NextResponse.json(
        { error: "Se requiere nombre o email" },
        { status: 400 }
      );
    }

    // Basic email validation if provided
    if (body?.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(body.email))) {
        return NextResponse.json(
          { error: "Email invalido" },
          { status: 400 }
        );
      }
    }

    const entry: LeadEntry = {
      id: crypto.randomUUID(),
      nombre: body?.nombre || "",
      email: body?.email || "",
      telefono: body?.telefono || "",
      googleId: body?.googleId || "",
      avatar: body?.avatar || "",
      vehiculoInteres: body?.vehiculoInteres || "",
      vehiculoId: body?.vehiculoId || "",
      puntajeJuego: Number(body?.puntajeJuego) || 0,
      nivelConductor: body?.nivelConductor || "",
      createdAt: new Date().toISOString(),
    };

    const lambdaUrl = process.env.LEADS_LAMBDA_URL;
    if (!lambdaUrl) {
      return NextResponse.json(
        { error: "Falta configurar LEADS_LAMBDA_URL en Vercel" },
        { status: 500 }
      );
    }

    // Forward to Lambda (Lambda should write into S3)
    const resp = await fetch(lambdaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // If later you add a token, include it here:
      // headers: { "Content-Type": "application/json", "x-api-key": process.env.LEADS_API_KEY ?? "" },
      body: JSON.stringify(entry),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return NextResponse.json(
        {
          error: "Lambda fallo",
          status: resp.status,
          details: text || "(sin detalle)",
        },
        { status: 502 }
      );
    }

    // If Lambda returns JSON, we include it; if not, we ignore.
    const result = await resp.json().catch(() => ({}));

    return NextResponse.json(
      {
        success: true,
        message: "Lead registrado correctamente",
        // This is useful to confirm the exact record that was sent
        sent: entry,
        // This is useful to confirm what Lambda answered (e.g., S3 key)
        lambda: result,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads
 * Proxies to Lambda GET (if your Lambda supports it).
 * If not supported, it will return a clear error.
 */
export async function GET() {
  const lambdaUrl = process.env.LEADS_LAMBDA_URL;
  if (!lambdaUrl) {
    return NextResponse.json(
      { error: "Falta configurar LEADS_LAMBDA_URL en Vercel" },
      { status: 500 }
    );
  }

  const resp = await fetch(lambdaUrl, { method: "GET" });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    return NextResponse.json(
      {
        error:
          "Lambda no soporta GET o fallo. Si querés listar leads, hay que implementarlo en Lambda.",
        status: resp.status,
        details: text || "(sin detalle)",
      },
      { status: 502 }
    );
  }

  const data = await resp.json().catch(() => ({}));
  return NextResponse.json(data);
}
