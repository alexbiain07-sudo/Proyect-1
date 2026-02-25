"use client";

import { useGameStore } from "@/lib/game-store";
import { companies } from "@/lib/game-data";
import { motion } from "framer-motion";
import { Crown, Star, Trophy, Award, Target, ArrowLeft, RotateCcw, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { GrupoMeucciLogo, CompanyLogo } from "@/components/ui/brand-logo";

interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  score: number;
  vehicleName: string;
  vehicleBrand: string;
  badge: string;
  isPlayer?: boolean;
}

const badgeConfig: Record<string, { icon: typeof Crown; color: string; label: string }> = {
  diamond: { icon: Crown, color: "#B9F2FF", label: "Diamante" },
  platinum: { icon: Star, color: "#E5E4E2", label: "Platino" },
  gold: { icon: Trophy, color: "#FFD700", label: "Oro" },
  silver: { icon: Award, color: "#C0C0C0", label: "Plata" },
  bronze: { icon: Target, color: "#CD7F32", label: "Bronce" },
};

function getBadge(score: number): string {
  if (score >= 12000) return "diamond";
  if (score >= 8000) return "platinum";
  if (score >= 5000) return "gold";
  if (score >= 2500) return "silver";
  return "bronze";
}

export function LeaderboardScreen() {
  const { currentScore, selectedVehicle, user, setScreen, resetGame, selectedCompany } = useGameStore();
  const activeCompany = companies.find((c) => c.id === selectedCompany);
  const playerName = user?.name.split(" ")[0] || "Tu";

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchScores = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch(`/api/scores?limit=20${selectedCompany ? `&company=${selectedCompany}` : ""}`);
      const data = await res.json();

      if (data.scores && Array.isArray(data.scores)) {
        const apiEntries: LeaderboardEntry[] = data.scores.map((s: LeaderboardEntry) => ({
          ...s,
          isPlayer: s.userId === user?.id,
        }));

        // If the current player is not in the fetched results, add them
        const hasPlayer = apiEntries.some((e) => e.isPlayer);
        if (!hasPlayer && currentScore > 0) {
          apiEntries.push({
            id: "current-player",
            userId: user?.id || "",
            userName: playerName,
            userAvatar: user?.avatar || "",
            score: currentScore,
            vehicleName: selectedVehicle?.name || "",
            vehicleBrand: selectedVehicle?.brand || "",
            badge: getBadge(currentScore),
            isPlayer: true,
          });
        }

        apiEntries.sort((a, b) => b.score - a.score);
        setEntries(apiEntries);
      } else {
        // No scores from API yet — show just the player
        setEntries([
          {
            id: "current-player",
            userId: user?.id || "",
            userName: playerName,
            userAvatar: user?.avatar || "",
            score: currentScore,
            vehicleName: selectedVehicle?.name || "",
            vehicleBrand: selectedVehicle?.brand || "",
            badge: getBadge(currentScore),
            isPlayer: true,
          },
        ]);
      }
    } catch {
      // Fallback: just the player
      setEntries([
        {
          id: "current-player",
          userId: user?.id || "",
          userName: playerName,
          userAvatar: user?.avatar || "",
          score: currentScore,
          vehicleName: selectedVehicle?.name || "",
          vehicleBrand: selectedVehicle?.brand || "",
          badge: getBadge(currentScore),
          isPlayer: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentScore, playerName, selectedCompany, selectedVehicle, user]);

  // Fetch on mount
  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  // Auto-refresh every 8 seconds for real-time feel
  useEffect(() => {
    const interval = setInterval(() => {
      fetchScores(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchScores]);

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
          <div className="flex items-center gap-2">
            {activeCompany ? (
              <CompanyLogo companyId={activeCompany.id} size="sm" style={{ opacity: 0.3, color: "rgba(255,255,255,0.4)" }} />
            ) : (
              <GrupoMeucciLogo size="sm" style={{ opacity: 0.3 }} />
            )}
            <button
              onClick={() => fetchScores(true)}
              className="p-1.5 rounded-lg transition-all active:scale-90 touch-manipulation"
              style={{ background: "rgba(255,255,255,0.04)" }}
              aria-label="Actualizar ranking"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                style={{ color: "rgba(255,255,255,0.35)" }}
              />
            </button>
          </div>
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
          {entries.length > 0 && (
            <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
              {entries.length} {entries.length === 1 ? "jugador" : "jugadores"} registrados
            </p>
          )}
        </div>

        {/* Player position card */}
        {playerRank > 0 && (
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
              {/* Avatar — show Google profile pic if available */}
              {user?.avatar && user.avatar.startsWith("http") ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                  style={{
                    border: `2px solid ${selectedVehicle?.accentColor || "#FF7800"}40`,
                  }}
                />
              ) : (
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
              )}
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
        )}
      </div>

      {/* Leaderboard list */}
      <div className="flex-1 overflow-y-auto px-5 pb-2 relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <motion.div
              className="w-6 h-6 rounded-full border-2 border-t-transparent"
              style={{ borderColor: "rgba(255,255,255,0.2)", borderTopColor: "transparent" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-[11px] tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.3)" }}>
              CARGANDO RANKING...
            </span>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Trophy className="w-8 h-8" style={{ color: "rgba(255,255,255,0.15)" }} />
            <span className="text-[11px] tracking-[0.15em] text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
              Se el primero en el ranking
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {entries.slice(0, 20).map((entry, index) => {
              const config = badgeConfig[entry.badge] || badgeConfig.bronze;
              const BadgeIcon = config.icon;

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    layout: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { delay: index * 0.03 },
                    x: { delay: index * 0.03 },
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  style={{
                    background: entry.isPlayer
                      ? `${selectedVehicle?.accentColor || "#FF7800"}08`
                      : "rgba(255,255,255,0.02)",
                    border: entry.isPlayer
                      ? `1px solid ${selectedVehicle?.accentColor || "#FF7800"}20`
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

                  {/* Avatar — Google profile pic or initials */}
                  {entry.userAvatar && entry.userAvatar.startsWith("http") ? (
                    <Image
                      src={entry.userAvatar}
                      alt={entry.userName}
                      width={28}
                      height={28}
                      className="rounded-full object-cover shrink-0"
                      style={{
                        border: entry.isPlayer
                          ? `1px solid ${selectedVehicle?.accentColor || "#FF7800"}30`
                          : "1px solid rgba(255,255,255,0.06)",
                      }}
                    />
                  ) : (
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
                      {entry.userName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-xs font-medium truncate"
                        style={{
                          color: entry.isPlayer ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
                        }}
                      >
                        {entry.userName}
                        {entry.isPlayer && " (Tu)"}
                      </span>
                      <BadgeIcon className="w-3 h-3 shrink-0" style={{ color: config.color }} />
                    </div>
                    <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {entry.vehicleBrand} {entry.isPlayer ? (selectedVehicle?.name || entry.vehicleName) : entry.vehicleName}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <span
                      className="font-bebas text-sm"
                      style={{
                        color: entry.isPlayer
                          ? selectedVehicle?.accentColor || "#FF7800"
                          : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {entry.score.toLocaleString()}
                    </span>
                    <p className="text-[8px]" style={{ color: "rgba(255,255,255,0.2)" }}>pts</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
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
