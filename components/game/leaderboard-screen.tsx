"use client";

import { useGameStore } from "@/lib/game-store";
import { companies } from "@/lib/game-data";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Star, Trophy, Award, Target, ArrowLeft, RotateCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { GrupoMeucciLogo, CompanyLogo } from "@/components/ui/brand-logo";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  vehicle: string;
  badge: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  isPlayer?: boolean;
}

const badgeConfig = {
  diamond: { icon: Crown, color: "#B9F2FF", label: "Diamante" },
  platinum: { icon: Star, color: "#E5E4E2", label: "Platino" },
  gold: { icon: Trophy, color: "#FFD700", label: "Oro" },
  silver: { icon: Award, color: "#C0C0C0", label: "Plata" },
  bronze: { icon: Target, color: "#CD7F32", label: "Bronce" },
};

const MOCK_NAMES = [
  "Lucas M.", "Valentina R.", "Martin G.", "Sofia L.", "Tomas B.",
  "Camila A.", "Nicolas F.", "Florencia P.", "Santiago D.", "Catalina V.",
  "Matias H.", "Julieta S.", "Agustin C.", "Milagros T.", "Franco J.",
];

const VEHICLES = ["Titano", "Toro", "Strada", "Argo", "Cronos"];

function generateMockLeaderboard(playerScore: number, playerName: string): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];

  const scoreRanges = [
    { min: 11000, max: 14500, badge: "diamond" as const },
    { min: 8500, max: 11000, badge: "platinum" as const },
    { min: 5500, max: 8500, badge: "gold" as const },
    { min: 3000, max: 5500, badge: "silver" as const },
    { min: 800, max: 3000, badge: "bronze" as const },
  ];

  const usedNames = new Set<string>();

  for (let i = 0; i < 15; i++) {
    const range = scoreRanges[Math.min(Math.floor(i / 3), scoreRanges.length - 1)];
    const score = Math.floor(range.min + Math.random() * (range.max - range.min));
    let name: string;
    do {
      name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
    } while (usedNames.has(name));
    usedNames.add(name);

    entries.push({
      id: `mock-${i}`,
      name,
      avatar: name.charAt(0),
      score,
      vehicle: VEHICLES[Math.floor(Math.random() * VEHICLES.length)],
      badge: range.badge,
    });
  }

  const getBadge = (s: number) => {
    if (s >= 12000) return "diamond" as const;
    if (s >= 8000) return "platinum" as const;
    if (s >= 5000) return "gold" as const;
    if (s >= 2500) return "silver" as const;
    return "bronze" as const;
  };

  entries.push({
    id: "player",
    name: playerName,
    avatar: playerName.charAt(0),
    score: playerScore,
    vehicle: "Titano",
    badge: getBadge(playerScore),
    isPlayer: true,
  });

  entries.sort((a, b) => b.score - a.score);
  return entries;
}

export function LeaderboardScreen() {
  const { currentScore, selectedVehicle, user, setScreen, resetGame, selectedCompany } = useGameStore();
  const activeCompany = companies.find((c) => c.id === selectedCompany);
  const playerName = user?.name.split(" ")[0] || "Tu";

  const [entries, setEntries] = useState<LeaderboardEntry[]>(() =>
    generateMockLeaderboard(currentScore, playerName)
  );
  const [highlightNew, setHighlightNew] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEntries((prev) => {
        const updated = [...prev];
        const randomIdx = Math.floor(Math.random() * updated.length);
        const entry = updated[randomIdx];
        if (entry && !entry.isPlayer) {
          const delta = Math.floor(Math.random() * 400) + 100;
          const newScore = entry.score + delta;
          const getBadge = (s: number) => {
            if (s >= 12000) return "diamond" as const;
            if (s >= 8000) return "platinum" as const;
            if (s >= 5000) return "gold" as const;
            if (s >= 2500) return "silver" as const;
            return "bronze" as const;
          };
          updated[randomIdx] = { ...entry, score: newScore, badge: getBadge(newScore) };
          updated.sort((a, b) => b.score - a.score);
          setHighlightNew(entry.id);
          setTimeout(() => setHighlightNew(null), 1500);
        }
        return updated;
      });
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, []);

  const playerRank = entries.findIndex((e) => e.isPlayer) + 1;

  const handlePlayAgain = useCallback(() => {
    resetGame();
    setScreen("select");
  }, [resetGame, setScreen]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #080808 0%, #0e0e0e 35%, #0a0e14 60%, #0a0a0a 100%)",
      }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(255,215,0,0.04) 0%, transparent 60%)" }}
      />

      {/* Header */}
      <div className="relative z-10 px-5 pt-6 pb-3">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setScreen("gameover")}
            className="p-2 -ml-2 touch-manipulation"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
          {activeCompany ? (
            <CompanyLogo companyId={activeCompany.id} size="sm" style={{ opacity: 0.3, color: "rgba(255,255,255,0.4)" }} />
          ) : (
            <GrupoMeucciLogo size="sm" style={{ opacity: 0.3 }} />
          )}
          <div className="w-9" />
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "rgba(74,222,128,0.8)" }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: "rgba(74,222,128,0.6)" }}>
              Ranking en vivo
            </span>
          </div>
          <h2 className="font-bebas text-2xl tracking-[0.15em]" style={{ color: "#ece6e1" }}>
            TABLA DE LIDERES
          </h2>
        </div>

        {/* Player position card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 px-4 py-3 rounded-xl flex items-center justify-between"
          style={{
            background: `linear-gradient(135deg, ${selectedVehicle?.accentColor || "#FF7800"}15, ${selectedVehicle?.accentColor || "#FF7800"}08)`,
            border: `1px solid ${selectedVehicle?.accentColor || "#FF7800"}25`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: `${selectedVehicle?.accentColor || "#FF7800"}20`,
                color: selectedVehicle?.accentColor || "#FF7800",
                border: `1px solid ${selectedVehicle?.accentColor || "#FF7800"}30`,
              }}
            >
              {user?.avatar || "T"}
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                Tu posicion
              </p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                {currentScore.toLocaleString()} pts
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className="font-bebas text-2xl"
              style={{ color: selectedVehicle?.accentColor || "#FF7800" }}
            >
              #{playerRank}
            </span>
            <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              de {entries.length}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Leaderboard list */}
      <div className="flex-1 overflow-y-auto px-5 pb-2 relative z-10">
        <div className="space-y-1.5">
          {entries.slice(0, 15).map((entry, index) => {
            const config = badgeConfig[entry.badge];
            const BadgeIcon = config.icon;
            const isUpdating = highlightNew === entry.id;

            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  backgroundColor: isUpdating
                    ? "rgba(255,215,0,0.06)"
                    : entry.isPlayer
                      ? `${selectedVehicle?.accentColor || "#FF7800"}08`
                      : "rgba(255,255,255,0.02)",
                }}
                transition={{
                  layout: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { delay: index * 0.03 },
                  x: { delay: index * 0.03 },
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{
                  border: entry.isPlayer
                    ? `1px solid ${selectedVehicle?.accentColor || "#FF7800"}20`
                    : isUpdating
                      ? "1px solid rgba(255,215,0,0.1)"
                      : "1px solid rgba(255,255,255,0.03)",
                }}
              >
                {/* Rank number */}
                <span
                  className="font-bebas text-lg w-7 text-center shrink-0"
                  style={{
                    color: index === 0
                      ? "#FFD700"
                      : index === 1
                        ? "#C0C0C0"
                        : index === 2
                          ? "#CD7F32"
                          : "rgba(255,255,255,0.3)",
                  }}
                >
                  {index + 1}
                </span>

                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{
                    background: entry.isPlayer
                      ? `${selectedVehicle?.accentColor || "#FF7800"}20`
                      : "rgba(255,255,255,0.05)",
                    color: entry.isPlayer
                      ? selectedVehicle?.accentColor || "#FF7800"
                      : "rgba(255,255,255,0.4)",
                    border: entry.isPlayer
                      ? `1px solid ${selectedVehicle?.accentColor || "#FF7800"}30`
                      : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {entry.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-xs font-medium truncate"
                      style={{
                        color: entry.isPlayer ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {entry.name}
                      {entry.isPlayer && " (Tu)"}
                    </span>
                    <BadgeIcon className="w-3 h-3 shrink-0" style={{ color: config.color }} />
                  </div>
                  <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                    FIAT {entry.isPlayer ? (selectedVehicle?.name || entry.vehicle) : entry.vehicle}
                  </span>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <motion.span
                    className="font-bebas text-sm"
                    style={{
                      color: entry.isPlayer
                        ? selectedVehicle?.accentColor || "#FF7800"
                        : "rgba(255,255,255,0.5)",
                    }}
                    animate={isUpdating ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {entry.score.toLocaleString()}
                  </motion.span>
                  <p className="text-[8px]" style={{ color: "rgba(255,255,255,0.2)" }}>pts</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-5 pb-6 pt-3 relative z-10"
      >
        <button
          onClick={handlePlayAgain}
          className="w-full py-3.5 rounded-xl font-bebas text-sm tracking-[0.15em] flex items-center justify-center gap-2 transition-all active:scale-[0.97] touch-manipulation"
          style={{
            background: `linear-gradient(135deg, ${selectedVehicle?.accentColor || "#FF7800"}, ${selectedVehicle?.accentColor || "#FF7800"}cc)`,
            boxShadow: `0 0 25px ${selectedVehicle?.accentColor || "#FF7800"}25`,
            color: "#fff",
          }}
        >
          <RotateCcw className="w-4 h-4" />
          SUPERAR MI POSICION
        </button>

        <div className="flex flex-col items-center gap-1.5 mt-4">
          <span className="text-[8px] tracking-[0.3em] uppercase font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
            Una empresa del
          </span>
          <GrupoMeucciLogo size="sm" style={{ opacity: 0.75 }} />
        </div>
      </motion.div>
    </motion.div>
  );
}
