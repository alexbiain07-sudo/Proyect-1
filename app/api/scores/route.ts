import { NextResponse } from "next/server";

/**
 * In-memory score store.
 * In production, replace with DynamoDB / RDS / Supabase.
 * This persists across requests within a single serverless instance lifetime
 * which is sufficient for demo/event usage.
 */
interface ScoreEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  score: number;
  distance: number;
  coins: number;
  vehicleId: string;
  vehicleName: string;
  vehicleBrand: string;
  companyId: string;
  badge: string;
  createdAt: string;
}

// Global in-memory store — persists within a single serverless invocation
const scores: ScoreEntry[] = [];

function getBadge(score: number): string {
  if (score >= 12000) return "diamond";
  if (score >= 8000) return "platinum";
  if (score >= 5000) return "gold";
  if (score >= 2500) return "silver";
  return "bronze";
}

/**
 * GET /api/scores
 * Returns the top scores for the leaderboard.
 * Query params:
 *   - company: filter by companyId (optional)
 *   - limit: max results (default 20)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get("company");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

  let filtered = [...scores];
  if (company) {
    filtered = filtered.filter((s) => s.companyId === company);
  }

  // Sort descending by score, take top N
  filtered.sort((a, b) => b.score - a.score);
  const topScores = filtered.slice(0, limit);

  return NextResponse.json({
    scores: topScores,
    total: filtered.length,
  });
}

/**
 * POST /api/scores
 * Saves a new game score.
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

    const entry: ScoreEntry = {
      id: crypto.randomUUID(),
      userId: body.userId || "",
      userName: body.userName || "Anonimo",
      userAvatar: body.userAvatar || "",
      score: Number(body.score) || 0,
      distance: Number(body.distance) || 0,
      coins: Number(body.coins) || 0,
      vehicleId: body.vehicleId || "",
      vehicleName: body.vehicleName || "",
      vehicleBrand: body.vehicleBrand || "",
      companyId: body.companyId || "",
      badge: getBadge(Number(body.score) || 0),
      createdAt: new Date().toISOString(),
    };

    scores.push(entry);

    // Keep only top 200 to prevent memory bloat
    if (scores.length > 200) {
      scores.sort((a, b) => b.score - a.score);
      scores.length = 200;
    }

    return NextResponse.json(
      { success: true, entry },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
