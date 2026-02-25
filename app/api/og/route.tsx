import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const name = searchParams.get("name") || "Conductor";
  const score = searchParams.get("score") || "0";
  const title = searchParams.get("title") || "PILOTO";
  const vehicle = searchParams.get("vehicle") || "";
  const badge = searchParams.get("badge") || "bronze";

  const badgeColors: Record<string, string> = {
    diamond: "#B9F2FF",
    platinum: "#E5E4E2",
    gold: "#FFD700",
    silver: "#C0C0C0",
    bronze: "#CD7F32",
  };

  const badgeColor = badgeColors[badge] || "#CD7F32";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(170deg, #080808 0%, #0e0e0e 35%, #140a0a 60%, #0a0a0a 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top label */}
        <div
          style={{
            display: "flex",
            fontSize: "16",
            letterSpacing: "0.3em",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            marginBottom: "12",
          }}
        >
          GRUPO MEUCCI - DRIVE EXPERIENCE
        </div>

        {/* Badge circle */}
        <div
          style={{
            display: "flex",
            width: "100",
            height: "100",
            borderRadius: "50%",
            border: `3px solid ${badgeColor}`,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20",
            background: `${badgeColor}15`,
          }}
        >
          <div style={{ fontSize: "40", display: "flex" }}>
            {badge === "diamond" ? "D" : badge === "platinum" ? "P" : badge === "gold" ? "G" : badge === "silver" ? "S" : "B"}
          </div>
        </div>

        {/* Name */}
        <div
          style={{
            display: "flex",
            fontSize: "48",
            fontWeight: "bold",
            marginBottom: "8",
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {name}
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: "28",
            letterSpacing: "0.2em",
            color: badgeColor,
            textTransform: "uppercase",
            marginBottom: "16",
          }}
        >
          {title}
        </div>

        {/* Score */}
        <div
          style={{
            display: "flex",
            fontSize: "72",
            fontWeight: "bold",
            color: "#FF7800",
            marginBottom: "8",
          }}
        >
          {Number(score).toLocaleString()}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "18",
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
          }}
        >
          PUNTOS
        </div>

        {/* Vehicle */}
        {vehicle && (
          <div
            style={{
              display: "flex",
              fontSize: "20",
              color: "rgba(255,255,255,0.5)",
              marginTop: "20",
            }}
          >
            Conduciendo: {vehicle}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "30",
            fontSize: "14",
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase",
          }}
        >
          Podes superarme? Jugalo en grupomeucci.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
