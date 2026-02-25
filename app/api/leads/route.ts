import { NextResponse } from "next/server";

/**
 * POST /api/leads
 * Receives lead form submissions from the game's form screen.
 *
 * Required body:
 * - nombre: string
 * - apellido: string
 * - email: string
 * - telefono: string
 * - vehiculoInteres: string
 * - vehiculoId: string
 * - puntajeJuego: number
 * - nivelConductor: string
 *
 * TODO: Connect to AWS DynamoDB or RDS to persist leads.
 * TODO: Add rate limiting (e.g., Upstash Redis) to prevent spam.
 * TODO: Add email notification via AWS SES or Resend.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["nombre", "apellido", "email", "telefono"];
    for (const field of required) {
      if (!body[field] || typeof body[field] !== "string" || body[field].trim() === "") {
        return NextResponse.json(
          { error: `Campo requerido: ${field}` },
          { status: 400 }
        );
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Email invalido" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual DB write
    // Example DynamoDB integration:
    // import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
    // const client = new DynamoDBClient({ region: process.env.AWS_REGION });
    // await client.send(new PutItemCommand({
    //   TableName: "meucci-leads",
    //   Item: {
    //     id: { S: crypto.randomUUID() },
    //     nombre: { S: body.nombre },
    //     apellido: { S: body.apellido },
    //     email: { S: body.email },
    //     telefono: { S: body.telefono },
    //     vehiculoInteres: { S: body.vehiculoInteres || "" },
    //     vehiculoId: { S: body.vehiculoId || "" },
    //     puntajeJuego: { N: String(body.puntajeJuego || 0) },
    //     nivelConductor: { S: body.nivelConductor || "" },
    //     createdAt: { S: new Date().toISOString() },
    //   },
    // }));

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
