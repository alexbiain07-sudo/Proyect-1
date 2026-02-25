import { NextResponse } from "next/server";

/**
 * GET /api/scores
 * Returns the top scores for the leaderboard.
 *
 * Query params:
 * - company: "scuderia" | "dallas" | "alliance" (optional filter)
 * - limit: number (default 10)
 *
 * TODO: Connect to AWS DynamoDB or RDS to fetch real scores.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const _company = searchParams.get("company");
  const _limit = parseInt(searchParams.get("limit") || "10", 10);

  // TODO: Replace with actual DB query
  // Example DynamoDB:
  // const client = new DynamoDBClient({ region: process.env.AWS_REGION });
  // const result = await client.send(new ScanCommand({
  //   TableName: "meucci-scores",
  //   Limit: limit,
  //   FilterExpression: company ? "companyId = :c" : undefined,
  //   ExpressionAttributeValues: company ? { ":c": { S: company } } : undefined,
  // }));

  return NextResponse.json({
    scores: [],
    message: "Connect to database to retrieve real scores",
  });
}

/**
 * POST /api/scores
 * Saves a new game score.
 *
 * Required body:
 * - userId: string
 * - userName: string
 * - score: number
 * - distance: number
 * - coins: number
 * - vehicleId: string
 * - companyId: string
 *
 * TODO: Connect to AWS DynamoDB or RDS to persist scores.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const required = ["score", "vehicleId", "companyId"];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { error: `Campo requerido: ${field}` },
          { status: 400 }
        );
      }
    }

    // TODO: Replace with actual DB write
    return NextResponse.json(
      { success: true, message: "Score registrado" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
