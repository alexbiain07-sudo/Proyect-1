"use client";

/**
 * Brand logo components as styled text fallbacks.
 * These replace missing image files with consistent typography.
 * TODO: Replace with actual logo images when available from client.
 */

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { fontSize: "12px", letterSpacing: "0.15em" },
  md: { fontSize: "16px", letterSpacing: "0.2em" },
  lg: { fontSize: "24px", letterSpacing: "0.25em" },
};

export function GrupoMeucciLogo({ className, style, size = "md" }: LogoProps) {
  const s = sizeMap[size];
  return (
    <span
      className={`font-bebas uppercase tracking-wider select-none ${className || ""}`}
      style={{
        fontSize: s.fontSize,
        letterSpacing: s.letterSpacing,
        color: "rgba(255,255,255,0.85)",
        ...style,
      }}
    >
      GRUPO MEUCCI
    </span>
  );
}

export function CompanyLogo({
  companyId,
  className,
  style,
  size = "md",
}: LogoProps & { companyId: "scuderia" | "dallas" | "alliance" | string }) {
  const s = sizeMap[size];
  const names: Record<string, string> = {
    scuderia: "SCUDERIA",
    dallas: "DALLAS",
    alliance: "ALLIANCE",
  };
  const colors: Record<string, string> = {
    scuderia: "#AA2222",
    dallas: "#1B6B3A",
    alliance: "#1A3C8A",
  };
  return (
    <span
      className={`font-bebas uppercase tracking-wider select-none ${className || ""}`}
      style={{
        fontSize: s.fontSize,
        letterSpacing: s.letterSpacing,
        color: colors[companyId] || "rgba(255,255,255,0.85)",
        ...style,
      }}
    >
      {names[companyId] || companyId.toUpperCase()}
    </span>
  );
}
