"use client";

import { useGameStore } from "@/lib/game-store";
import { motion } from "framer-motion";

export function UnlockScreen() {
  const { currentScore, setScreen, selectedVehicle } = useGameStore();

  const accentColor = selectedVehicle?.accentColor || "#ef4444";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top, rgba(239,68,68,0.18) 0%, rgba(15,23,42,1) 45%, rgba(2,6,23,1) 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-6 w-24 h-24 rounded-full bg-red-500 blur-3xl" />
        <div className="absolute bottom-20 right-6 w-32 h-32 rounded-full bg-orange-500 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl p-6"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10"
        >
          <span className="text-3xl">⚠️</span>
        </motion.div>

        <h1 className="text-3xl font-bebas tracking-wider text-white drop-shadow">
          TE QUEDASTE SIN VIDAS
        </h1>

        <p className="mt-3 text-sm text-gray-300 leading-relaxed">
          Completa el formulario y desbloquea{" "}
          <span className="font-bold text-white">3 vidas más</span> para seguir
          acumulando puntaje.
        </p>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Puntaje actual
          </p>
          <p
            className="mt-1 text-4xl font-bebas tracking-wider"
            style={{ color: accentColor }}
          >
            {currentScore.toLocaleString()}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => setScreen("form")}
            className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-black shadow-lg transition-transform active:scale-[0.98]"
            style={{ backgroundColor: accentColor }}
          >
            DESBLOQUEAR 3 VIDAS
          </button>

          <button
            onClick={() => setScreen("gameover")}
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
          >
            TERMINAR JUEGO
          </button>
        </div>

        <p className="mt-4 text-[11px] text-gray-500">
          Si completas el formulario, seguirás desde aquí con tu mismo puntaje.
        </p>
      </motion.div>
    </div>
  );
}
