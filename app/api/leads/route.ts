import { NextResponse } from "next/server";

/**
 * In-memory leads store.
 * In production, replace with DynamoDB / RDS / Supabase.
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

const leads: LeadEntry[] = [];

/**
 * POST /api/leads
 * Receives lead data from both Google sign-in and the form screen.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // At minimum we need a name or email
    if (!body.nombre && !body.email) {
      return NextResponse.json(
        { error: "Se requiere nombre o email" },
        { status: 400 }
      );
    }

    // Basic email validation if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: "Email invalido" },
          { status: 400 }
        );
      }
    }

    const entry: LeadEntry = {
      id: crypto.randomUUID(),
      nombre: body.nombre || "",
      email: body.email || "",
      telefono: body.telefono || "",
      googleId: body.googleId || "",
      avatar: body.avatar || "",
      vehiculoInteres: body.vehiculoInteres || "",
      vehiculoId: body.vehiculoId || "",
      puntajeJuego: Number(body.puntajeJuego) || 0,
      nivelConductor: body.nivelConductor || "",
      createdAt: new Date().toISOString(),
    };

    // Deduplicate by email — update existing entry
    const existingIdx = body.email
      ? leads.findIndex((l) => l.email === body.email)
      : -1;
    if (existingIdx >= 0) {
      leads[existingIdx] = { ...leads[existingIdx], ...entry, id: leads[existingIdx].id };
    } else {
      leads.push(entry);
    }

    return NextResponse.json(
      { success: true, message: "Lead registrado correctamente" },
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
 * Returns all leads (for admin/export purposes).
 */
export async function GET() {
  return NextResponse.json({
    leads,
    total: leads.length,
  });
}
