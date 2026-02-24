"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { Trophy, Flame, Zap, Crown, ChevronUp, Car } from "lucide-react";

interface LeaderboardEntry {
  id: number;
  name: string;
  avatar: string;
  score: number;
  vehicle: string;
  badge: "diamond" | "platinum" | "gold" | "silver" | "bronze";
  isNew?: boolean;
  trend: "up" | "down" | "stable";
  positionsChanged?: number;
}

const BADGE_CONFIG = {
  diamond: { label: "Diamante", color: "#b9f2ff", bg: "rgba(185,242,255,0.08)", border: "rgba(185,242,255,0.2)" },
  platinum: { label: "Platino", color: "#e5e4e2", bg: "rgba(229,228,226,0.06)", border: "rgba(229,228,226,0.15)" },
  gold: { label: "Oro", color: "#ffd700", bg: "rgba(255,215,0,0.06)", border: "rgba(255,215,0,0.15)" },
  silver: { label: "Plata", color: "#c0c0c0", bg: "rgba(192,192,192,0.06)", border: "rgba(192,192,192,0.12)" },
  bronze: { label: "Bronce", color: "#cd7f32", bg: "rgba(205,127,50,0.06)", border: "rgba(205,127,50,0.12)" },
};

const INITIAL_LEADERS: LeaderboardEntry[] = [
  { id: 1, name: "Valentina R.", avatar: "VR", score: 14280, vehicle: "TITANO", badge: "diamond", trend: "stable" },
  { id: 2, name: "Matias G.", avatar: "MG", score: 13650, vehicle: "TORO", badge: "diamond", trend: "up", positionsChanged: 1 },
  { id: 3, name: "Luciana P.", avatar: "LP", score: 12890, vehicle: "TITANO", badge: "diamond", trend: "down", positionsChanged: 1 },
  { id: 4, name: "Santiago M.", avatar: "SM", score: 11420, vehicle: "ARGO", badge: "platinum", trend: "up", positionsChanged: 2 },
  { id: 5, name: "Camila B.", avatar: "CB", score: 10870, vehicle: "STRADA", badge: "platinum", trend: "stable" },
  { id: 6, name: "Nicolas F.", avatar: "NF", score: 9540, vehicle: "CRONOS", badge: "platinum", trend: "up", positionsChanged: 1 },
  { id: 7, name: "Florencia D.", avatar: "FD", score: 8920, vehicle: "TORO", badge: "gold", trend: "down", positionsChanged: 2 },
  { id: 8, name: "Tomas L.", avatar: "TL", score: 7650, vehicle: "TITANO", badge: "gold", trend: "stable" },
  { id: 9, name: "Carolina S.", avatar: "CS", score: 6310, vehicle: "ARGO", badge: "gold", trend: "up", positionsChanged: 3 },
  { id: 10, name: "Agustin V.", avatar: "AV", score: 5480, vehicle: "STRADA", badge: "gold", trend: "stable" },
];

const NAMES = [
  "Martin H.", "Sofia A.", "Juan P.", "Daniela R.", "Facundo T.",
  "Milagros C.", "Gonzalo E.", "Rocio M.", "Leandro K.", "Paula W.",
  "Federico Z.", "Julieta N.", "Ignacio B.", "Aldana G.", "Ramiro D.",
];
const VEHICLES = ["TITANO", "TORO", "STRADA", "ARGO", "CRONOS"];

function getBadge(score: number): LeaderboardEntry["badge"] {
  if (score >= 12000) return "diamond";
  if (score >= 8000) return "platinum";
  if (score >= 5000) return "gold";
  if (score >= 2500) return "silver";
  return "bronze";
}

export function LeaderboardSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>(INITIAL_LEADERS);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [liveCount, setLiveCount] = useState(247);
  const nextIdRef = useRef(11);

  const simulateUpdate = useCallback(() => {
    setLeaders((prev) => {
      const updated = [...prev];
      const action = Math.random();

      if (action < 0.4) {
        // New player enters
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        const score = Math.floor(Math.random() * 10000) + 4000;
        const vehicle = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
        const initials = name.split(" ").map((n) => n[0]).join("");
        const newEntry: LeaderboardEntry = {
          id: nextIdRef.current++,
          name,
          avatar: initials,
          score,
          vehicle,
          badge: getBadge(score),
          isNew: true,
          trend: "up",
          positionsChanged: 0,
        };
        updated.push(newEntry);
      } else if (action < 0.8) {
        // Existing player beats their score
        const idx = Math.floor(Math.random() * updated.length);
        const boost = Math.floor(Math.random() * 2000) + 500;
        updated[idx] = {
          ...updated[idx],
          score: updated[idx].score + boost,
          badge: getBadge(updated[idx].score + boost),
          isNew: false,
          trend: "up",
          positionsChanged: 0,
        };
      }

      // Sort by score desc
      updated.sort((a, b) => b.score - a.score);

      // Calculate position changes
      const top10 = updated.slice(0, 10).map((entry, i) => {
        const oldIdx = prev.findIndex((p) => p.id === entry.id);
        let trend: "up" | "down" | "stable" = "stable";
        let positionsChanged = 0;
        if (oldIdx === -1) {
          trend = "up";
          positionsChanged = 10 - i;
        } else if (oldIdx > i) {
          trend = "up";
          positionsChanged = oldIdx - i;
        } else if (oldIdx < i) {
          trend = "down";
          positionsChanged = i - oldIdx;
        }
        return { ...entry, trend, positionsChanged, isNew: oldIdx === -1 };
      });

      return top10;
    });

    setLastUpdate(new Date());
    setLiveCount((c) => c + Math.floor(Math.random() * 5) - 2);
  }, []);

  useEffect(() => {
    const interval = setInterval(simulateUpdate, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [simulateUpdate]);

  const podiumColors = [
    "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.02) 100%)",
    "linear-gradient(135deg, rgba(192,192,192,0.08) 0%, rgba(192,192,192,0.02) 100%)",
    "linear-gradient(135deg, rgba(205,127,50,0.08) 0%, rgba(205,127,50,0.02) 100%)",
  ];
  const podiumBorders = [
    "rgba(255,215,0,0.2)",
    "rgba(192,192,192,0.15)",
    "rgba(205,127,50,0.15)",
  ];

  return (
    <section id="ranking" className="relative z-10 py-24 md:py-32 px-6 md:px-12" ref={ref}>
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.4em] uppercase font-medium mb-4"
            style={{ color: "rgba(200, 170, 140, 0.5)" }}
          >
            <Flame className="w-3.5 h-3.5" />
            Ranking en vivo
          </span>
          <h2
            className="font-bebas text-4xl md:text-5xl lg:text-6xl tracking-wide mb-4 text-balance"
            style={{ color: "rgba(245, 240, 235, 0.92)" }}
          >
            Los mejores pilotos
          </h2>
          <p
            className="text-sm md:text-base leading-relaxed max-w-md mx-auto"
            style={{ color: "rgba(200, 195, 190, 0.45)" }}
          >
            Competencia en tiempo real. Cada partida cuenta.
            {" "}Podes superarlos?
          </p>
        </motion.div>

        {/* Live indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center justify-between mb-8 px-2"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#4ade80" }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "#4ade80" }} />
            </span>
            <span className="text-[12px] font-medium" style={{ color: "rgba(74,222,128,0.7)" }}>
              {liveCount} jugadores activos
            </span>
          </div>
          <span className="text-[11px]" style={{ color: "rgba(200,195,190,0.3)" }}>
            Actualizado {lastUpdate.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </motion.div>

        {/* Leaderboard table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.015)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Table header */}
          <div
            className="grid items-center px-5 py-3.5"
            style={{
              gridTemplateColumns: "32px 1fr 90px 70px 56px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(200,195,190,0.3)" }}>#</span>
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(200,195,190,0.3)" }}>Piloto</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-right" style={{ color: "rgba(200,195,190,0.3)" }}>Vehiculo</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-right" style={{ color: "rgba(200,195,190,0.3)" }}>Puntos</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-right" style={{ color: "rgba(200,195,190,0.3)" }}>Rango</span>
          </div>

          {/* Rows */}
          <AnimatePresence mode="popLayout">
            {leaders.map((entry, i) => {
              const badge = BADGE_CONFIG[entry.badge];
              const isPodium = i < 3;

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={entry.isNew ? { opacity: 0, x: -30, scale: 0.95 } : false}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{
                    layout: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.4 },
                    x: { duration: 0.4 },
                  }}
                  className="grid items-center px-5 py-3 transition-colors duration-300"
                  style={{
                    gridTemplateColumns: "32px 1fr 90px 70px 56px",
                    background: isPodium ? podiumColors[i] : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.025)",
                    borderLeft: isPodium ? `2px solid ${podiumBorders[i]}` : "2px solid transparent",
                  }}
                >
                  {/* Position */}
                  <div className="flex items-center gap-1">
                    {i === 0 ? (
                      <Crown className="w-4 h-4" style={{ color: "#ffd700" }} />
                    ) : (
                      <span
                        className="text-[13px] font-medium font-bebas"
                        style={{ color: isPodium ? "rgba(245,240,235,0.8)" : "rgba(200,195,190,0.35)" }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </div>

                  {/* Player */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        color: badge.color,
                      }}
                    >
                      {entry.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[13px] font-medium truncate"
                          style={{ color: isPodium ? "rgba(245,240,235,0.9)" : "rgba(230,225,220,0.7)" }}
                        >
                          {entry.name}
                        </span>
                        {entry.trend === "up" && entry.positionsChanged && entry.positionsChanged > 0 && (
                          <span className="flex items-center text-[10px] shrink-0" style={{ color: "#4ade80" }}>
                            <ChevronUp className="w-3 h-3" />
                            {entry.positionsChanged}
                          </span>
                        )}
                        {entry.isNew && (
                          <span
                            className="text-[8px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full shrink-0"
                            style={{
                              background: "rgba(74,222,128,0.1)",
                              color: "rgba(74,222,128,0.7)",
                              border: "1px solid rgba(74,222,128,0.15)",
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle */}
                  <div className="flex items-center justify-end gap-1.5">
                    <Car className="w-3 h-3 shrink-0" style={{ color: "rgba(200,195,190,0.3)" }} />
                    <span className="text-[11px]" style={{ color: "rgba(200,195,190,0.4)" }}>
                      {entry.vehicle}
                    </span>
                  </div>

                  {/* Score */}
                  <span
                    className="text-[14px] font-bebas tracking-wide text-right"
                    style={{ color: isPodium ? "rgba(245,240,235,0.9)" : "rgba(200,195,190,0.6)" }}
                  >
                    {entry.score.toLocaleString()}
                  </span>

                  {/* Badge */}
                  <div className="flex justify-end">
                    <span
                      className="text-[9px] tracking-[0.1em] uppercase px-2 py-1 rounded-full"
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-center mt-10"
        >
          <a
            href="/game"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[13px] tracking-[0.15em] uppercase font-medium transition-all duration-500"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(245,240,235,0.8)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              e.currentTarget.style.color = "rgba(245,240,235,1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "rgba(245,240,235,0.8)";
            }}
          >
            <Zap className="w-4 h-4" />
            Jugar Drive Experience
          </a>
          <p className="text-[11px] mt-3" style={{ color: "rgba(200,195,190,0.25)" }}>
            Entra al ranking y demostra que sos el mejor piloto
          </p>
        </motion.div>
      </div>
    </section>
  );
}
