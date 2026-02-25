"use client";

import { useGameStore } from "@/lib/game-store";
import { companies, getVehiclesByCompany, type CompanyId } from "@/lib/game-data";
import { type AuthUser } from "@/lib/mock-auth";
import { getAuthStatus } from "@/lib/auth-actions";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, Crown, Star, Award, Target, ChevronRight } from "lucide-react";
import Image from "next/image";
import { GrupoMeucciLogo, CompanyLogo } from "@/components/ui/brand-logo";

/* ---- Mini Leaderboard Data ---- */
interface MiniEntry {
  id: string;
  name: string;
  score: number;
  badge: "diamond" | "platinum" | "gold" | "silver" | "bronze";
  avatar?: string;
}

const badgeConfig: Record<string, { icon: typeof Crown; color: string }> = {
  diamond: { icon: Crown, color: "#B9F2FF" },
  platinum: { icon: Star, color: "#E5E4E2" },
  gold: { icon: Trophy, color: "#FFD700" },
  silver: { icon: Award, color: "#C0C0C0" },
  bronze: { icon: Target, color: "#CD7F32" },
};

function FloatingParticle({ index }: { index: number }) {
  const startX = 10 + ((index * 23.7) % 80);
  const startY = 15 + ((index * 31.3) % 70);
  const size = index % 4 === 0 ? 3 : 2;
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        width: `${size}px`,
        height: `${size}px`,
        background:
          index % 3 === 0
            ? "rgba(200,170,140,0.3)"
            : "rgba(255,255,255,0.06)",
      }}
      animate={{
        y: [0, -35 - (index % 25), 0],
        x: [0, (index % 2 === 0 ? 12 : -12), 0],
        opacity: [0, 0.6, 0],
        scale: [0.5, 1.3, 0.5],
      }}
      transition={{
        duration: 3.8 + (index % 3),
        delay: index * 0.25,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* Google "G" icon as SVG */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

type AuthState = "idle" | "signing-in" | "saving" | "sending-email" | "welcome-toast";

export function WelcomeScreen() {
  const { setScreen, setUser, selectCompany, isAuthenticated } = useGameStore();
  const [phase, setPhase] = useState<"intro" | "companies" | "ready">("intro");
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [hoveredCompany, setHoveredCompany] = useState<CompanyId | null>(null);
  const [selectedCo, setSelectedCo] = useState<CompanyId | null>(null);
  const [miniLeaderboard, setMiniLeaderboard] = useState<MiniEntry[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"checking" | "google" | "local">("checking");
  const [showLocalForm, setShowLocalForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formError, setFormError] = useState("");
  const authChecked = useRef(false);

  // Check if Google OAuth is configured on mount
  useEffect(() => {
    if (authChecked.current) return;
    authChecked.current = true;
    getAuthStatus().then((res) => {
      setAuthMode(res.configured ? "google" : "local");
    }).catch(() => {
      setAuthMode("local");
    });
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("companies"), 1800);
    const t2 = setTimeout(() => setPhase("ready"), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // On mount: check for Google OAuth callback cookie (set by /api/auth/google/callback)
  useEffect(() => {
    if (isAuthenticated) return;
    try {
      const cookies = document.cookie.split(";").map((c) => c.trim());
      const userCookie = cookies.find((c) => c.startsWith("meucci_user="));
      if (userCookie) {
        const jsonStr = decodeURIComponent(userCookie.split("=").slice(1).join("="));
        const userData = JSON.parse(jsonStr) as AuthUser;
        if (userData.id && userData.name) {
          const storedCo = sessionStorage.getItem("meucci_selected_company") as CompanyId | null;
          if (storedCo) {
            setSelectedCo(storedCo);
            selectCompany(storedCo);
          }
          setUserName(userData.name.split(" ")[0]);
          setUserEmail(userData.email);
          setUser(userData);

          // Save to leads API
          fetch("/api/leads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre: userData.name,
              email: userData.email,
              googleId: userData.id,
              avatar: userData.avatar,
            }),
          }).catch(() => {});

          setAuthState("welcome-toast");
          setTimeout(() => setScreen("select"), 2200);
        }
      }
    } catch {
      // Cookie parsing failed — continue normally
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist selectedCo to sessionStorage so it survives the OAuth redirect
  useEffect(() => {
    if (selectedCo) {
      sessionStorage.setItem("meucci_selected_company", selectedCo);
    }
  }, [selectedCo]);

  // Restore selectedCo after OAuth redirect
  useEffect(() => {
    const stored = sessionStorage.getItem("meucci_selected_company");
    if (stored && !selectedCo) {
      setSelectedCo(stored as CompanyId);
    }
  }, [selectedCo]);

  // Fetch real leaderboard from API and poll for updates
  const fetchMiniLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/scores?limit=5");
      if (!res.ok) return;
      const data = await res.json();
      if (data.scores && Array.isArray(data.scores) && data.scores.length > 0) {
        const getBadge = (s: number) => {
          if (s >= 12000) return "diamond" as const;
          if (s >= 8000) return "platinum" as const;
          if (s >= 5000) return "gold" as const;
          if (s >= 2500) return "silver" as const;
          return "bronze" as const;
        };
        const entries: MiniEntry[] = data.scores.map((s: { id: string; userName: string; score: number; userAvatar?: string }) => ({
          id: s.id,
          name: s.userName,
          score: s.score,
          badge: getBadge(s.score),
          avatar: s.userAvatar || "",
        }));
        entries.sort((a, b) => b.score - a.score);

        setMiniLeaderboard((prev) => {
          if (prev.length > 0) {
            for (const entry of entries) {
              const old = prev.find((p) => p.id === entry.id);
              if (old && old.score !== entry.score) {
                setHighlightId(entry.id);
                setTimeout(() => setHighlightId(null), 1200);
                break;
              }
            }
          }
          return entries;
        });
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchMiniLeaderboard();
    const interval = setInterval(fetchMiniLeaderboard, 8000);
    return () => clearInterval(interval);
  }, [fetchMiniLeaderboard]);

  /**
   * Handles the main CTA button:
   * - Google mode: redirect to OAuth
   * - Local mode: show name+email form
   */
  const handleGoogleSignIn = useCallback(async () => {
    if (authState !== "idle" || !selectedCo) return;
    selectCompany(selectedCo);

    if (authMode === "google") {
      setAuthState("signing-in");
      window.location.href = "/api/auth/google";
      return;
    }

    // Local mode: show the name+email form instead of creating a random guest
    setShowLocalForm(true);
  }, [authState, authMode, selectedCo, selectCompany]);

  /**
   * Handles the local form submission — captures real name + email.
   */
  const handleLocalFormSubmit = useCallback(async () => {
    const trimmedName = formName.trim();
    const trimmedEmail = formEmail.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setFormError("Ingresa tu nombre (minimo 2 caracteres)");
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError("Ingresa un email valido");
      return;
    }

    setFormError("");
    setAuthState("signing-in");

    const userId = `user_${Date.now()}`;
    const initials = trimmedName.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
    const user: AuthUser = {
      id: userId,
      name: trimmedName,
      email: trimmedEmail,
      avatar: initials,
    };

    // Save to leads API
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: trimmedName,
        email: trimmedEmail,
        googleId: userId,
        avatar: initials,
      }),
    }).catch(() => {});

    await new Promise((r) => setTimeout(r, 600));
    setUserName(trimmedName.split(" ")[0]);
    setUserEmail(trimmedEmail);
    setUser(user);
    setShowLocalForm(false);
    setAuthState("welcome-toast");
    setTimeout(() => setScreen("select"), 2000);
  }, [formName, formEmail, setUser, setScreen]);

  const isLoading = authState === "signing-in" || authState === "saving" || authState === "sending-email";
  const activeCompany = companies.find((c) => c.id === selectedCo);
  const previewVehicles = selectedCo ? getVehiclesByCompany(selectedCo) : [];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto overflow-x-hidden"
      style={{
        background: "linear-gradient(165deg, #080808 0%, #0e0e0e 30%, #0c0a08 55%, #0c0c0c 100%)",
      }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background layers */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 35%, transparent 25%, rgba(0,0,0,0.7) 100%)" }}
        />
        {[...Array(10)].map((_, i) => (
          <FloatingParticle key={`p-${i}`} index={i} />
        ))}
        <motion.div
          className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(200,170,140,0.04) 0%, rgba(150,130,110,0.02) 45%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-6 w-full min-h-full py-12 max-w-md mx-auto">

        {/* Grupo Meucci Logo - Prominent */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <GrupoMeucciLogo size="lg" style={{ opacity: 0.95 }} />
          <motion.div
            className="w-20 h-px mt-4"
            style={{ background: "linear-gradient(90deg, transparent, rgba(200,170,140,0.35), transparent)" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-[10px] tracking-[0.35em] uppercase font-sans mt-4 text-center"
          style={{ color: "rgba(200,180,160,0.4)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Elegi tu concesionario
        </motion.p>

        {/* Company Cards */}
        <AnimatePresence>
          {(phase === "companies" || phase === "ready") && (
            <motion.div
              className="w-full mt-8 flex flex-col gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {companies.map((company, idx) => {
                const isSelected = selectedCo === company.id;
                const isHovered = hoveredCompany === company.id;
                const companyVehicles = getVehiclesByCompany(company.id);

                return (
                  <motion.button
                    key={company.id}
                    onClick={() => setSelectedCo(isSelected ? null : company.id)}
                    onMouseEnter={() => setHoveredCompany(company.id)}
                    onMouseLeave={() => setHoveredCompany(null)}
                    className="relative w-full rounded-xl overflow-hidden text-left touch-manipulation"
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${company.accentColor}12, ${company.accentColor}06)`
                        : "rgba(255,255,255,0.02)",
                      border: `1px solid ${
                        isSelected
                          ? `${company.accentColor}40`
                          : isHovered
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(255,255,255,0.05)"
                      }`,
                      transition: "border-color 0.2s, background 0.2s",
                    }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx, duration: 0.5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-4 p-4">
                      {/* Company Logo */}
                      <div
                        className="w-[80px] h-[36px] shrink-0 flex items-center justify-center"
                      >
                        <CompanyLogo
                          companyId={company.id}
                          size="sm"
                          style={{ opacity: isSelected ? 0.95 : 0.5, color: isSelected ? company.accentColor : "rgba(255,255,255,0.5)" }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[10px] tracking-[0.1em] uppercase"
                          style={{ color: isSelected ? `${company.accentColor}` : "rgba(255,255,255,0.3)" }}
                        >
                          {company.brands.join(" & ")}
                        </p>
                        <p
                          className="text-[9px] mt-0.5 truncate"
                          style={{ color: "rgba(255,255,255,0.2)" }}
                        >
                          {company.tagline}
                        </p>
                      </div>

                      {/* Arrow / Count */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="text-[9px] font-medium"
                          style={{ color: "rgba(255,255,255,0.2)" }}
                        >
                          {companyVehicles.length} modelos
                        </span>
                        <ChevronRight
                          className="w-3.5 h-3.5 transition-transform"
                          style={{
                            color: isSelected ? company.accentColor : "rgba(255,255,255,0.15)",
                            transform: isSelected ? "rotate(90deg)" : "rotate(0deg)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Expanded Vehicle Preview */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div
                            className="px-4 pb-4 pt-1"
                            style={{ borderTop: `1px solid ${company.accentColor}15` }}
                          >
                            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                              {companyVehicles.map((v) => (
                                <div
                                  key={v.id}
                                  className="flex flex-col items-center shrink-0"
                                >
                                  <div
                                    className="w-[90px] h-[56px] rounded-lg relative overflow-hidden flex items-center justify-center"
                                    style={{ background: "rgba(255,255,255,0.03)" }}
                                  >
                                    <Image
                                      src={v.image}
                                      alt={v.name}
                                      fill
                                      className="object-contain p-1"
                                    />
                                  </div>
                                  <span
                                    className="text-[9px] font-medium mt-1.5 tracking-wider"
                                    style={{ color: "rgba(255,255,255,0.45)" }}
                                  >
                                    {v.brand} {v.name}
                                  </span>
                                  <span
                                    className="text-[8px]"
                                    style={{ color: "rgba(255,255,255,0.2)" }}
                                  >
                                    {v.category}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Mini Leaderboard */}
        <AnimatePresence>
          {phase === "ready" && authState === "idle" && (
            <motion.div
              className="w-full mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2.5 px-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5" style={{ color: "#FFD700" }} />
                  <span
                    className="text-[10px] tracking-[0.15em] uppercase font-medium"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    Ranking en vivo
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "rgba(74,222,128,0.8)" }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-[9px]" style={{ color: "rgba(74,222,128,0.5)" }}>
                    En vivo
                  </span>
                </div>
              </div>

              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {miniLeaderboard.length === 0 ? (
                  <div className="px-3 py-6 text-center">
                    <span className="text-[10px] tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.25)" }}>
                      Se el primero en el ranking
                    </span>
                  </div>
                ) : miniLeaderboard.map((entry, index) => {
                  const config = badgeConfig[entry.badge];
                  const BadgeIcon = config.icon;
                  const isUpdating = highlightId === entry.id;
                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      className="flex items-center gap-2.5 px-3 py-2"
                      style={{
                        borderBottom: index < miniLeaderboard.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                        background: isUpdating ? "rgba(255,215,0,0.04)" : "transparent",
                      }}
                      transition={{ layout: { type: "spring", stiffness: 400, damping: 35 } }}
                    >
                      <span
                        className="font-bebas text-base w-5 text-center shrink-0"
                        style={{
                          color: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : index === 2 ? "#CD7F32" : "rgba(255,255,255,0.25)",
                        }}
                      >
                        {index + 1}
                      </span>
                      {entry.avatar && entry.avatar.startsWith("http") ? (
                        <Image
                          src={entry.avatar}
                          alt={entry.name}
                          width={20}
                          height={20}
                          className="rounded-full object-cover shrink-0"
                          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                        />
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.35)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          {entry.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex items-center gap-1">
                        <span className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.55)" }}>
                          {entry.name}
                        </span>
                        <BadgeIcon className="w-2.5 h-2.5 shrink-0" style={{ color: config.color }} />
                      </div>
                      <motion.span
                        className="font-bebas text-xs shrink-0"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                        animate={isUpdating ? { scale: [1, 1.2, 1], color: ["rgba(255,215,0,0.8)", "rgba(255,255,255,0.4)"] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        {entry.score.toLocaleString()}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA - Sign In (Google or Local Form) */}
        <AnimatePresence>
          {phase === "ready" && authState !== "welcome-toast" && selectedCo && !showLocalForm && (
            <motion.div
              className="flex flex-col items-center mt-8 w-full"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="relative w-full flex items-center justify-center gap-3 px-6 py-3.5 cursor-pointer overflow-hidden disabled:cursor-not-allowed"
                style={{
                  background: isLoading
                    ? "rgba(255,255,255,0.06)"
                    : `linear-gradient(135deg, ${activeCompany?.accentColor}18, rgba(255,255,255,0.08))`,
                  border: `1px solid ${activeCompany?.accentColor}30`,
                  borderRadius: "12px",
                  transition: "background 0.2s",
                }}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.97 } : {}}
              >
                {!isLoading && (
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }}
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                  />
                )}

                {isLoading ? (
                  <div className="flex items-center gap-3 relative z-10">
                    <motion.div
                      className="w-5 h-5 rounded-full border-2 border-t-transparent"
                      style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "transparent" }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Conectando con Google...
                    </span>
                  </div>
                ) : (
                  <>
                    {authMode === "google" ? (
                      <GoogleIcon className="w-5 h-5 relative z-10" />
                    ) : (
                      <ChevronRight className="w-4 h-4 relative z-10" style={{ color: "rgba(255,255,255,0.6)" }} />
                    )}
                    <span className="relative z-10 text-sm font-medium tracking-wide" style={{ color: "rgba(255,255,255,0.85)" }}>
                      {authMode === "google" ? `Ingresar con Google` : `Jugar con ${activeCompany?.name}`}
                    </span>
                  </>
                )}
              </motion.button>

              {/* Loading indicator */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 mt-4"
                  >
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    <div className="w-6 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {!isLoading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-[9px] text-center mt-4 max-w-[260px] leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.15)" }}
                >
                  {authMode === "google"
                    ? `Al continuar, inicias sesion con tu cuenta de Google para ${activeCompany?.name}. Tu informacion se mantiene segura y privada.`
                    : `Ingresa tus datos para participar en el ranking de ${activeCompany?.name}.`
                  }
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Local Name+Email Form (when Google is not configured) */}
        <AnimatePresence>
          {showLocalForm && authState !== "welcome-toast" && (
            <motion.div
              className="flex flex-col items-center mt-6 w-full gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-[11px] tracking-[0.1em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                Ingresa tus datos para jugar
              </p>
              <input
                type="text"
                placeholder="Tu nombre"
                value={formName}
                onChange={(e) => { setFormName(e.target.value); setFormError(""); }}
                disabled={isLoading}
                className="w-full px-4 py-3 text-sm rounded-lg outline-none placeholder:text-white/20 disabled:opacity-50"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)",
                }}
                autoFocus
              />
              <input
                type="email"
                placeholder="Tu email"
                value={formEmail}
                onChange={(e) => { setFormEmail(e.target.value); setFormError(""); }}
                disabled={isLoading}
                onKeyDown={(e) => { if (e.key === "Enter") handleLocalFormSubmit(); }}
                className="w-full px-4 py-3 text-sm rounded-lg outline-none placeholder:text-white/20 disabled:opacity-50"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)",
                }}
              />
              {formError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px]"
                  style={{ color: "#ff6b6b" }}
                >
                  {formError}
                </motion.p>
              )}
              <motion.button
                onClick={handleLocalFormSubmit}
                disabled={isLoading}
                className="relative w-full flex items-center justify-center gap-3 px-6 py-3.5 cursor-pointer overflow-hidden disabled:cursor-not-allowed mt-1"
                style={{
                  background: isLoading
                    ? "rgba(255,255,255,0.06)"
                    : `linear-gradient(135deg, ${activeCompany?.accentColor}25, rgba(255,255,255,0.1))`,
                  border: `1px solid ${activeCompany?.accentColor}40`,
                  borderRadius: "12px",
                }}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.97 } : {}}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-5 h-5 rounded-full border-2 border-t-transparent"
                      style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "transparent" }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Registrando...
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-medium tracking-wide" style={{ color: "rgba(255,255,255,0.9)" }}>
                    Comenzar a jugar
                  </span>
                )}
              </motion.button>
              <button
                onClick={() => setShowLocalForm(false)}
                className="text-[10px] mt-1 cursor-pointer"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                Volver
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint when no company selected */}
        <AnimatePresence>
          {phase === "ready" && !selectedCo && authState === "idle" && !showLocalForm && (
            <motion.p
              className="text-[10px] tracking-[0.15em] uppercase text-center mt-8"
              style={{ color: "rgba(255,255,255,0.18)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Selecciona un concesionario para comenzar
            </motion.p>
          )}
        </AnimatePresence>

        {/* Welcome toast after sign-in */}
        <AnimatePresence>
          {authState === "welcome-toast" && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="mt-10 flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: "linear-gradient(135deg, rgba(74,222,128,0.15), rgba(74,222,128,0.05))",
                  border: "1px solid rgba(74,222,128,0.3)",
                }}
              >
                <motion.svg
                  width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(74,222,128,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <motion.path
                    d="M20 6L9 17l-5-5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </motion.svg>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-bebas text-xl tracking-wider text-center"
                style={{ color: "#ece6e1" }}
              >
                {"Bienvenido, "}{userName}{"!"}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 mt-2 px-4 py-2 rounded-full"
                style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)" }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "rgba(74,222,128,0.7)" }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[10px] tracking-wider" style={{ color: "rgba(74,222,128,0.7)" }}>
                  {userEmail ? `Conectado como ${userEmail}` : "Listo para jugar"}
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.5, 1] }}
                transition={{ delay: 1.2, duration: 1.5 }}
                className="text-[9px] tracking-[0.3em] uppercase mt-6"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Preparando tu experiencia...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom accent */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 10%, rgba(200,170,140,0.2) 50%, transparent 90%)" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        transformTemplate={({ scaleX }) => `scaleX(${scaleX})`}
      />
    </motion.div>
  );
}
