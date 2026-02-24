"use client";

import { useGameStore } from "@/lib/game-store";
import { companies, getVehiclesByCompany, type CompanyId } from "@/lib/game-data";
import { mockGoogleSignIn, mockSaveUserToDb, mockSendWelcomeEmail } from "@/lib/mock-auth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Trophy, Crown, Star, Award, Target, ChevronRight } from "lucide-react";
import Image from "next/image";

/* ---- Mini Leaderboard Data ---- */
const MOCK_NAMES = [
  "Lucas M.", "Valentina R.", "Martin G.", "Sofia L.", "Tomas B.",
  "Camila A.", "Nicolas F.", "Florencia P.", "Santiago D.", "Catalina V.",
];

interface MiniEntry {
  id: string;
  name: string;
  score: number;
  badge: "diamond" | "platinum" | "gold" | "silver" | "bronze";
}

const badgeConfig: Record<string, { icon: typeof Crown; color: string }> = {
  diamond: { icon: Crown, color: "#B9F2FF" },
  platinum: { icon: Star, color: "#E5E4E2" },
  gold: { icon: Trophy, color: "#FFD700" },
  silver: { icon: Award, color: "#C0C0C0" },
  bronze: { icon: Target, color: "#CD7F32" },
};

function generateInitialEntries(): MiniEntry[] {
  const entries: MiniEntry[] = [];
  const ranges = [
    { min: 11000, max: 14500, badge: "diamond" as const },
    { min: 8500, max: 11000, badge: "platinum" as const },
    { min: 5500, max: 8500, badge: "gold" as const },
    { min: 3000, max: 5500, badge: "silver" as const },
    { min: 800, max: 3000, badge: "bronze" as const },
  ];
  for (let i = 0; i < 5; i++) {
    const range = ranges[i];
    entries.push({
      id: `w-${i}`,
      name: MOCK_NAMES[i],
      score: Math.floor(range.min + Math.random() * (range.max - range.min)),
      badge: range.badge,
    });
  }
  entries.sort((a, b) => b.score - a.score);
  return entries;
}

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
  const { setScreen, setUser, selectCompany } = useGameStore();
  const [phase, setPhase] = useState<"intro" | "companies" | "ready">("intro");
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [hoveredCompany, setHoveredCompany] = useState<CompanyId | null>(null);
  const [selectedCo, setSelectedCo] = useState<CompanyId | null>(null);
  const [miniLeaderboard, setMiniLeaderboard] = useState<MiniEntry[]>(() => generateInitialEntries());
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("companies"), 1800);
    const t2 = setTimeout(() => setPhase("ready"), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Live leaderboard updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMiniLeaderboard((prev) => {
        const updated = [...prev];
        const idx = Math.floor(Math.random() * updated.length);
        const entry = updated[idx];
        const delta = Math.floor(Math.random() * 600) + 150;
        const newScore = entry.score + delta;
        const getBadge = (s: number) => {
          if (s >= 12000) return "diamond" as const;
          if (s >= 8000) return "platinum" as const;
          if (s >= 5000) return "gold" as const;
          if (s >= 2500) return "silver" as const;
          return "bronze" as const;
        };
        updated[idx] = { ...entry, score: newScore, badge: getBadge(newScore) };
        updated.sort((a, b) => b.score - a.score);
        setHighlightId(entry.id);
        setTimeout(() => setHighlightId(null), 1200);
        return updated;
      });
    }, 3500 + Math.random() * 2500);
    return () => clearInterval(interval);
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    if (authState !== "idle" || !selectedCo) return;
    selectCompany(selectedCo);
    setAuthState("signing-in");
    const user = await mockGoogleSignIn();
    setUserName(user.name.split(" ")[0]);
    setUserEmail(user.email);
    setAuthState("saving");
    await mockSaveUserToDb(user);
    setAuthState("sending-email");
    await mockSendWelcomeEmail(user);
    setUser(user);
    setAuthState("welcome-toast");
    setTimeout(() => setScreen("select"), 2200);
  }, [authState, selectedCo, selectCompany, setUser, setScreen]);

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
          <Image
            src="/images/grupo-meucci-logo.png"
            alt="Grupo Meucci"
            width={260}
            height={86}
            className="brightness-0 invert drop-shadow-[0_0_20px_rgba(255,255,255,0.12)]"
            style={{ width: "auto", height: "55px", opacity: 0.95 }}
            priority
          />
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
                        className="w-[80px] h-[36px] relative shrink-0 flex items-center justify-center"
                      >
                        <Image
                          src={company.logo}
                          alt={company.name}
                          width={80}
                          height={36}
                          className="brightness-0 invert object-contain"
                          style={{ width: "auto", height: "auto", maxHeight: "28px", maxWidth: "80px", opacity: isSelected ? 0.95 : 0.5 }}
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
                {miniLeaderboard.map((entry, index) => {
                  const config = badgeConfig[entry.badge];
                  const BadgeIcon = config.icon;
                  const isUpdating = highlightId === entry.id;
                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      className="flex items-center gap-2.5 px-3 py-2"
                      style={{
                        borderBottom: index < 4 ? "1px solid rgba(255,255,255,0.03)" : "none",
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

        {/* CTA - Google Sign In */}
        <AnimatePresence>
          {phase === "ready" && authState !== "welcome-toast" && selectedCo && (
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
                      {authState === "signing-in" && "Conectando con Google..."}
                      {authState === "saving" && "Registrando tu cuenta..."}
                      {authState === "sending-email" && "Enviando bienvenida..."}
                    </span>
                  </div>
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5 relative z-10" />
                    <span className="relative z-10 text-sm font-medium tracking-wide" style={{ color: "rgba(255,255,255,0.85)" }}>
                      Jugar con {activeCompany?.name}
                    </span>
                  </>
                )}
              </motion.button>

              {/* Loading steps */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 mt-4"
                  >
                    {["signing-in", "saving", "sending-email"].map((step, i) => {
                      const stepState =
                        ["signing-in", "saving", "sending-email"].indexOf(authState) > i
                          ? "done"
                          : authState === step
                            ? "active"
                            : "pending";
                      return (
                        <motion.div key={step} className="flex items-center gap-1.5">
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full"
                            animate={{
                              backgroundColor:
                                stepState === "done" ? "rgba(74,222,128,0.8)"
                                  : stepState === "active" ? "rgba(255,255,255,0.6)"
                                    : "rgba(255,255,255,0.15)",
                              scale: stepState === "active" ? [1, 1.4, 1] : 1,
                            }}
                            transition={stepState === "active" ? { scale: { duration: 0.8, repeat: Infinity } } : { duration: 0.3 }}
                          />
                          {i < 2 && (
                            <div className="w-6 h-px" style={{ background: stepState === "done" ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.08)" }} />
                          )}
                        </motion.div>
                      );
                    })}
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
                  Al continuar, aceptas recibir un email de bienvenida de {activeCompany?.name}. Tu informacion se mantiene segura y privada.
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint when no company selected */}
        <AnimatePresence>
          {phase === "ready" && !selectedCo && authState === "idle" && (
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
                  {"Email enviado a "}{userEmail}
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
