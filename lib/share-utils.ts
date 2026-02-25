/**
 * Share utilities for generating branded share images
 * and handling social platform sharing (Instagram Stories, Facebook).
 */

interface ShareData {
  userName: string;
  score: number;
  title: string;
  subtitle: string;
  badge: string;
  vehicleName: string;
  vehicleBrand: string;
  percentile: number;
  accentColor: string;
}

const BADGE_COLORS: Record<string, string> = {
  diamond: "#B9F2FF",
  platinum: "#E5E4E2",
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
};

const BADGE_LABELS: Record<string, string> = {
  diamond: "DIAMANTE",
  platinum: "PLATINO",
  gold: "ORO",
  silver: "PLATA",
  bronze: "BRONCE",
};

/**
 * Generate a branded 1080x1920 canvas image for Instagram Stories sharing.
 * Returns a Blob of the rendered PNG.
 */
export async function generateShareImage(data: ShareData): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // -- Background gradient
  const grad = ctx.createLinearGradient(0, 0, W * 0.3, H);
  grad.addColorStop(0, "#080808");
  grad.addColorStop(0.35, "#0e0e0e");
  grad.addColorStop(0.6, "#140a0a");
  grad.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // -- Subtle radial glow
  const glow = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, 500);
  glow.addColorStop(0, `${data.accentColor}15`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const badgeColor = BADGE_COLORS[data.badge] || "#CD7F32";
  const badgeLabel = BADGE_LABELS[data.badge] || "BRONCE";

  // -- Top label
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "500 22px sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "8px";
  ctx.fillText("DRIVE EXPERIENCE", W / 2, 180);

  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "400 18px sans-serif";
  ctx.letterSpacing = "12px";
  ctx.fillText("GRUPO MEUCCI", W / 2, 215);

  // -- Badge circle
  const circleY = 380;
  ctx.beginPath();
  ctx.arc(W / 2, circleY, 80, 0, Math.PI * 2);
  ctx.strokeStyle = badgeColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = `${badgeColor}15`;
  ctx.fill();

  // Badge letter
  ctx.fillStyle = badgeColor;
  ctx.font = "bold 52px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeLabel.charAt(0), W / 2, circleY);

  // Badge label below circle
  ctx.fillStyle = badgeColor;
  ctx.font = "600 20px sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.letterSpacing = "6px";
  ctx.fillText(badgeLabel, W / 2, circleY + 115);

  // -- User name
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "bold 64px sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText(data.userName, W / 2, 580);

  // -- Title
  ctx.fillStyle = badgeColor;
  ctx.font = "bold 36px sans-serif";
  ctx.letterSpacing = "8px";
  ctx.fillText(data.title, W / 2, 640);

  // -- Subtitle
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "400 24px sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText(data.subtitle, W / 2, 680);

  // -- Score (big)
  ctx.fillStyle = data.accentColor;
  ctx.font = "bold 120px sans-serif";
  ctx.letterSpacing = "0px";
  ctx.fillText(data.score.toLocaleString(), W / 2, 850);

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "500 24px sans-serif";
  ctx.letterSpacing = "10px";
  ctx.fillText("PUNTOS", W / 2, 895);

  // -- Percentile bar
  const barY = 970;
  const barW = 600;
  const barH = 16;
  const barX = (W - barW) / 2;

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 8);
  ctx.fill();

  const fillW = (data.percentile / 100) * barW;
  const barGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
  barGrad.addColorStop(0, `${badgeColor}60`);
  barGrad.addColorStop(1, badgeColor);
  ctx.fillStyle = barGrad;
  ctx.beginPath();
  ctx.roundRect(barX, barY, fillW, barH, 8);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "400 18px sans-serif";
  ctx.letterSpacing = "4px";
  ctx.textAlign = "left";
  ctx.fillText("INDICE DE DOMINIO", barX, barY - 12);
  ctx.textAlign = "right";
  ctx.fillStyle = badgeColor;
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(`${data.percentile}%`, barX + barW, barY - 10);

  // -- Vehicle info
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "400 26px sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText(`${data.vehicleBrand} ${data.vehicleName}`, W / 2, 1080);

  // -- Challenge text
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "bold 32px sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("Podes superarme?", W / 2, 1220);

  // -- Top percentile callout
  const topPercent = 100 - data.percentile;
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "400 22px sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText(`Solo el ${topPercent}% alcanza este nivel`, W / 2, 1270);

  // -- Footer
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "400 18px sans-serif";
  ctx.letterSpacing = "8px";
  ctx.fillText("MEUCCI AUTOMOTORES", W / 2, H - 80);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      "image/png",
      1
    );
  });
}

/**
 * Share to Instagram Stories via Web Share API (mobile) or clipboard fallback (desktop).
 */
export async function shareToInstagram(data: ShareData, fallbackText: string): Promise<"shared" | "copied" | "failed"> {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  try {
    // Generate the branded image
    const blob = await generateShareImage(data);
    const file = new File([blob], "meucci-drive-result.png", { type: "image/png" });

    // Try Web Share API with file (supported on iOS Safari 15+, Chrome Android 89+)
    if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `${data.userName} - ${data.title}`,
        text: fallbackText,
        files: [file],
      });
      return "shared";
    }

    // Mobile fallback: copy text and open Instagram
    if (isMobile) {
      await navigator.clipboard.writeText(fallbackText);
      setTimeout(() => {
        window.location.href = "instagram://story-camera";
      }, 300);
      return "copied";
    }

    // Desktop fallback: copy text to clipboard
    await navigator.clipboard.writeText(fallbackText);
    return "copied";
  } catch (err) {
    // User cancelled the share sheet, or API not available
    if (err instanceof Error && err.name === "AbortError") {
      return "copied";
    }
    // Last resort fallback
    try {
      await navigator.clipboard.writeText(fallbackText);
      return "copied";
    } catch {
      return "failed";
    }
  }
}

/**
 * Share to Facebook with the OG image URL for rich link previews.
 */
export function shareToFacebook(ogParams: {
  name: string;
  score: number;
  title: string;
  badge: string;
  vehicle: string;
}): void {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const ogUrl = `${baseUrl}/api/og?name=${encodeURIComponent(ogParams.name)}&score=${ogParams.score}&title=${encodeURIComponent(ogParams.title)}&badge=${ogParams.badge}&vehicle=${encodeURIComponent(ogParams.vehicle)}`;

  // The share URL is the main page — Facebook will pick up the OG tags
  const shareUrl = baseUrl;
  const text = `${ogParams.name} es ${ogParams.title} con ${ogParams.score.toLocaleString()} pts! Podes superarme?`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;

  window.open(fbUrl, "_blank", "noopener,noreferrer,width=600,height=400");
}
