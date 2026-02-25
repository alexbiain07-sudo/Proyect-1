"use client";

/**
 * Brand logo components using actual logo images.
 * Scuderia logo is white on transparent (native for dark backgrounds).
 * Dallas, Alliance, and Meucci logos are black on white (use brightness-0 invert for dark backgrounds).
 */

import Image from "next/image";

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "md" | "lg";
}

const LOGO_URLS = {
  scuderia: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/scuderia-header-blanco-IaxsIT81ePuQX08H02H6KcvaaDEEpH.png",
  dallas: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dallas%20logo-CUrLjkdr2qpfg6oadbonCb6toOGeF7.png",
  alliance: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Alliance-citroen-negro-jMhGcXwZzT34ZBm7irnDw2N11DGXtu.png",
  meucci: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Meucci%20logo-m9iuUHF71wHg45Fg86UZrwRdhpIPJf.png",
} as const;

const sizeHeights = {
  sm: 18,
  md: 28,
  lg: 55,
};

const sizeWidths = {
  sm: 80,
  md: 140,
  lg: 260,
};

export function GrupoMeucciLogo({ className, style, size = "md" }: LogoProps) {
  const h = sizeHeights[size];
  const w = sizeWidths[size];
  return (
    <Image
      src={LOGO_URLS.meucci}
      alt="Grupo Meucci"
      width={w}
      height={h}
      className={`brightness-0 invert select-none drop-shadow-[0_0_10px_rgba(255,255,255,0.12)] ${className || ""}`}
      style={{ ...style, width: style?.width ?? "auto", height: style?.height ?? `${h}px` }}
    />
  );
}

export function MeucciNavLogo({ className, style, size = "md" }: LogoProps) {
  const h = sizeHeights[size];
  const w = sizeWidths[size];
  return (
    <Image
      src={LOGO_URLS.meucci}
      alt="Meucci Automotores"
      width={w}
      height={h}
      className={`brightness-0 invert select-none ${className || ""}`}
      style={{ ...style, width: style?.width ?? "auto", height: style?.height ?? `${h}px` }}
    />
  );
}

export function CompanyLogo({
  companyId,
  className,
  style,
  size = "md",
}: LogoProps & { companyId: "scuderia" | "dallas" | "alliance" | string }) {
  const h = sizeHeights[size];
  const w = sizeWidths[size];
  const url = LOGO_URLS[companyId as keyof typeof LOGO_URLS];

  if (!url) {
    return (
      <span
        className={`font-bebas uppercase tracking-wider select-none ${className || ""}`}
        style={{ fontSize: `${h * 0.6}px`, letterSpacing: "0.15em", color: "rgba(255,255,255,0.85)", ...style }}
      >
        {companyId.toUpperCase()}
      </span>
    );
  }

  // Scuderia logo is already white on transparent - no invert needed
  const isWhiteLogo = companyId === "scuderia";

  return (
    <Image
      src={url}
      alt={companyId.charAt(0).toUpperCase() + companyId.slice(1)}
      width={w}
      height={h}
      className={`select-none ${isWhiteLogo ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" : "brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"} ${className || ""}`}
      style={{ ...style, width: style?.width ?? "auto", height: style?.height ?? `${h}px` }}
    />
  );
}
