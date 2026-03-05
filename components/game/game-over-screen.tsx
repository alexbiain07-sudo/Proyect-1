"use client";

import { useGameStore } from "@/lib/game-store";
import { companies } from "@/lib/game-data";
import { shareToInstagram, shareToFacebook, shareToWhatsApp, buildTrackedUrl, createShareId } from "@/lib/share-utils";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trophy, Zap, MapPin, Crown, Star, Award, Target, Copy, Check, Share2 } from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { GrupoMeucciLogo, CompanyLogo } from "@/components/ui/brand-logo";

const badgeConfig = {
  diamond: { icon: Crown, color: "#B9F2FF", glow: "rgba(185,242,255,0.3)", label: "DIAMANTE" },
  platinum: { icon: Star, color: "#E5E4E2", glow: "rgba(229,228,226,0.3)", label: "PLATINO" },
  gold: { icon: Trophy, color: "#FFD700", glow: "rgba(255,215,0,0.3)", label: "ORO" },
  silver: { icon: Award, color: "#C0C0C0", glow: "rgba(192,192,192,0.25)", label: "PLATA" },
  bronze: { icon: Target, color: "#CD7F32", glow: "rgba(205,127,50,0.2)", label: "BRONCE" },
};

function CountUp({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <>{val.toLocaleString()}</>;
}

function PercentileBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
          Indice de Dominio
        </span>
        <motion.span
          className="font-bebas text-lg"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {value}%
        </motion.span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}60, ${color})`,
            boxShadow: `0 0 12px ${color}40`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export function GameOverScreen() {
  const {
    selectedVehicle,
    currentScore,
    highScore,
    distance,
    coinsCollected,
    gamesPlayed,
    driverProfile,
    dominanceIndex,
    setScreen,
    resetGame,
    user,
    selectedCompany,
  } = useGameStore();

  const activeCompany = companies.find((c) => c.id === selectedCompany);
  const isNewRecord = currentScore >= highScore && currentScore > 0;
  const accentColor = selectedVehicle?.accentColor || "#FF7800";
  const badge = driverProfile?.badge || "bronze";
  const config = badgeConfig[badge];
  const BadgeIcon = config.icon;

  // Post the score to the API when this screen mounts
  useEffect(() => {
    if (currentScore > 0 && selectedVehicle && selectedCompany) {
      fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "",
          userName: user?.name || "Anonimo",
          userAvatar: user?.avatar || "",
          score: currentScore,
          distance,
          coins: coinsCollected,
          vehicleId: selectedVehicle.id,
          vehicleName: selectedVehicle.name,
          vehicleBrand: selectedVehicle.brand,
          companyId: selectedCompany,
        }),
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayAgain = () => {
    resetGame();
    setScreen("select");
  };

  const handleGetInfo = () => {
    setScreen("form");
  };

  const [shareState, setShareState] = useState<"idle" | "generating" | "shared" | "copied">("idle");

  const shareData = useMemo(() => ({
    userName: user?.name.split(" ")[0] || "Conductor",
    score: currentScore,
    title: driverProfile?.title || "PILOTO",
    subtitle: driverProfile?.subtitle || "",
    badge: driverProfile?.badge || "bronze",
    vehicleName: selectedVehicle?.name || "",
    vehicleBrand: selectedVehicle?.brand || "",
    percentile: driverProfile?.percentile || 15,
    accentColor: selectedVehicle?.accentColor || "#FF7800",
  }), [user, currentScore, driverProfile, selectedVehicle]);

  const getShareText = useCallback(() => {
  const userName = user?.name?.split(" ")[0] || "Un conductor";

  return `${userName} es ${driverProfile?.title} con ${currentScore.toLocaleString()} pts manejando el ${selectedVehicle?.brand} ${selectedVehicle?.name}! Solo el ${100 - (driverProfile?.percentile || 0)}% alcanza este nivel. Podes superarme?`;
}, [user, driverProfile, currentScore, selectedVehicle]);

  const handleShareFacebook = useCallback(() => {
  const share_id = createShareId();

  const trackedUrl = buildTrackedUrl({
    channel: "f",
    share_id,
    score: shareData.score,
    // uid: user?.id,
    // sid: sessionId,
  });

  shareToFacebook({
    name: shareData.userName,
    score: shareData.score,
    title: shareData.title,
    badge: shareData.badge,
    vehicle: `${shareData.vehicleBrand} ${shareData.vehicleName}`,
    trackedUrl,
  });
}, [shareData]);

  const handleShareWhatsApp = useCallback(() => {

  const share_id = createShareId();

  const trackedUrl = buildTrackedUrl({
    channel: "w",
    share_id,
    score: shareData.score,
    // uid: user?.id,
    // sid: sessionId,
  });

  const message = getShareText();

  shareToWhatsApp(message, trackedUrl);

}, [getShareText, shareData]);

  const handleShareInstagram = useCallback(async () => {
    setShareState("generating");
    const result = await shareToInstagram(shareData, getShareText());
    setShareState(result === "shared" ? "shared" : result === "copied" ? "copied" : "idle");
    if (result !== "idle") {
      setTimeout(() => setShareState("idle"), 3000);
    }
  }, [shareData, getShareText]);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: "linear-gradient(170deg, #080808 0%, #0e0e0e 35%, #140a0a 60%, #0a0a0a 100%)",
      }}
    >
      {/* Background effects */}
      <motion.div
        className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${accentColor}12 0%, transparent 60%)`,
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Confetti for new record */}
      {isNewRecord && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(35)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-sm"
              style={{
                width: 3 + (i % 4) * 2,
                height: 3 + (i % 4) * 2,
                backgroundColor: [config.color, accentColor, "#FFD700", "#fff", "#E63946"][i % 5],
                left: `${(i * 2.85) % 100}%`,
                top: -10,
              }}
              animate={{
                y: [0, typeof window !== "undefined" ? window.innerHeight + 50 : 850],
                rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
                opacity: [1, 0],
              }}
              transition={{ duration: 2.5 + (i % 3) * 0.5, delay: (i % 8) * 0.08, ease: "easeOut" }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 relative z-10 pt-8 pb-4">
        {/* Scuderia branding + user */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex items-center gap-3"
        >
          {user && (
            user.avatar && user.avatar.startsWith("http") ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={24}
                height={24}
                className="rounded-full object-cover"
                style={{ border: "1px solid rgba(255,255,255,0.15)" }}
              />
            ) : (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {user.avatar || user.name.charAt(0)}
              </div>
            )
          )}
          {activeCompany ? (
            <CompanyLogo companyId={activeCompany.id} size="sm" style={{ opacity: 0.35, color: "rgba(255,255,255,0.5)" }} />
          ) : (
            <GrupoMeucciLogo size="sm" style={{ opacity: 0.35 }} />
          )}
        </motion.div>

        {/* New record badge */}
        {isNewRecord && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="mb-3 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider"
            style={{
              background: `linear-gradient(135deg, ${config.color}30, ${config.color}10)`,
              border: `1px solid ${config.color}40`,
              color: config.color,
            }}
          >
            NUEVO RECORD!
          </motion.div>
        )}

        {/* Badge & rank */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center mb-2"
        >
          {/* Badge circle */}
          <motion.div
            className="relative w-20 h-20 rounded-full flex items-center justify-center mb-3"
            style={{
              background: `linear-gradient(135deg, ${config.color}15, ${config.color}05)`,
              border: `2px solid ${config.color}35`,
              boxShadow: `0 0 40px ${config.glow}`,
            }}
            animate={{
              boxShadow: [
                `0 0 20px ${config.glow}`,
                `0 0 50px ${config.glow}`,
                `0 0 20px ${config.glow}`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <BadgeIcon className="w-9 h-9" style={{ color: config.color }} />
          </motion.div>

          <motion.h2
            className="font-bebas text-2xl tracking-[0.2em] text-center"
            style={{ color: config.color }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {driverProfile?.title || "PRINCIPIANTE"}
          </motion.h2>
          <motion.p
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ color: "rgba(255,255,255,0.35)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {driverProfile?.subtitle}
          </motion.p>
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-4"
        >
          <h1
            className="text-6xl font-bebas tracking-wider leading-none"
            style={{ color: "#ece6e1" }}
          >
            <CountUp target={currentScore} />
          </h1>
          <p className="text-[10px] tracking-[0.3em] uppercase mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            Puntos totales
          </p>
        </motion.div>

        {/* Percentile callout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="px-5 py-2 rounded-full mb-5"
          style={{
            background: `linear-gradient(135deg, ${accentColor}12, transparent)`,
            border: `1px solid ${accentColor}20`,
          }}
        >
          <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.6)" }}>
            {"Estas en el "}
            <span className="font-bold" style={{ color: accentColor }}>
              top {100 - (driverProfile?.percentile || 85)}%
            </span>
            {" de los conductores"}
          </p>
        </motion.div>

        {/* Dominance index bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-xs mb-5"
        >
          <PercentileBar value={dominanceIndex} color={accentColor} />
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-xs grid grid-cols-3 gap-2 mb-5"
        >
          <div
            className="flex flex-col items-center p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <MapPin className="w-3.5 h-3.5 mb-1" style={{ color: "rgba(255,255,255,0.35)" }} />
            <span className="font-bebas text-base text-foreground">{distance.toLocaleString()}m</span>
            <span className="text-[8px] tracking-wider uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>
              Distancia
            </span>
          </div>
          <div
            className="flex flex-col items-center p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-yellow-400/80 mb-1" />
            <span className="font-bebas text-base text-yellow-400">{coinsCollected}</span>
            <span className="text-[8px] tracking-wider uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>
              Monedas
            </span>
          </div>
          <div
            className="flex flex-col items-center p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Zap className="w-3.5 h-3.5 mb-1" style={{ color: accentColor }} />
            <span className="font-bebas text-base" style={{ color: accentColor }}>
              {selectedVehicle?.name}
            </span>
            <span className="text-[8px] tracking-wider uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>
              Vehiculo
            </span>
          </div>
        </motion.div>

        {/* Vehicle image + CTA text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="relative w-16 h-10">
            <Image
              src={selectedVehicle?.image || "/placeholder.svg"}
              alt={selectedVehicle?.name || "Vehicle"}
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs max-w-[200px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            {gamesPlayed >= 3
              ? `${gamesPlayed} partidas jugadas. Llevalo al mundo real.`
              : `El ${selectedVehicle?.name} es tu match. Descubrilo en persona.`}
          </p>
        </motion.div>
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="px-5 pb-7 pt-2 space-y-2.5 relative z-10"
      >
        {/* Primary CTA - lead capture */}
        <button
          onClick={handleGetInfo}
          className="w-full py-3.5 rounded-xl font-bebas text-base tracking-[0.15em] text-foreground transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
            boxShadow: `0 0 30px ${accentColor}30`,
          }}
        >
          <motion.div
            className="absolute inset-0 bg-white/15"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 2 }}
            style={{ skewX: "-20deg", width: "30%" }}
          />
          <span className="relative z-10">DESBLOQUEA TU PROPUESTA PERSONALIZADA</span>
        </button>

        {/* Leaderboard CTA */}
        <button
          onClick={() => setScreen("leaderboard")}
          className="w-full py-3 rounded-xl font-bebas text-sm tracking-[0.12em] flex items-center justify-center gap-2 transition-all active:scale-[0.97] touch-manipulation"
          style={{
            background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,215,0,0.03))",
            border: "1px solid rgba(255,215,0,0.15)",
            color: "rgba(255,215,0,0.8)",
          }}
        >
          <Trophy className="w-4 h-4" />
          VER RANKING EN VIVO
          <motion.div
            className="w-1.5 h-1.5 rounded-full ml-1"
            style={{ backgroundColor: "rgba(74,222,128,0.7)" }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </button>

        {/* Social share + play again */}
        <div className="flex gap-2">
          <button
            onClick={handleShareInstagram}
            className="flex-1 py-3 rounded-xl font-bebas text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] touch-manipulation"
            style={{
              background: "linear-gradient(135deg, rgba(225,48,108,0.12), rgba(131,58,180,0.08))",
              border: "1px solid rgba(225,48,108,0.2)",
              color: "rgba(225,48,108,0.9)",
            }}
          >
            {shareState === "generating" ? (
              <>
                <Share2 className="w-3.5 h-3.5 animate-pulse" />
                GENERANDO...
              </>
            ) : shareState === "shared" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                COMPARTIDO
              </>
            ) : shareState === "copied" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                COPIADO
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                INSTAGRAM
              </>
            )}
          </button>

          <button
            onClick={handleShareFacebook}
            className="flex-1 py-3 rounded-xl font-bebas text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] touch-manipulation"
            style={{
              background: "rgba(24,119,242,0.1)",
              border: "1px solid rgba(24,119,242,0.2)",
              color: "rgba(24,119,242,0.9)",
            }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            FACEBOOK
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex-1 py-3 rounded-xl font-bebas text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] touch-manipulation"
            style={{
              background: "rgba(37,211,102,0.1)",
              border: "1px solid rgba(37,211,102,0.2)",
              color: "rgba(37,211,102,0.9)",
            }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.768.967-.941 1.165-.174.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.174-.297-.019-.458.13-.607.134-.133.297-.347.446-.521.149-.174.198-.298.297-.496.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.67-.51l-.571-.01c-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479s1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.626.711.226 1.358.194 1.87.118.571-.085 1.758-.718 2.006-1.413.248-.694.248-1.29.174-1.413-.075-.124-.273-.198-.571-.347z"/>
            </svg>
            WHATSAPP
          </button>
          
          <button
            onClick={handlePlayAgain}
            className="flex-1 py-3 rounded-xl font-bebas text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] touch-manipulation"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            JUGAR
          </button>
        </div>

        <div className="flex flex-col items-center gap-1.5 mt-4">
          <span className="text-[8px] tracking-[0.3em] uppercase font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
            Una empresa del
          </span>
          <GrupoMeucciLogo size="sm" style={{ opacity: 0.8 }} />
        </div>
      </motion.div>
    </div>
  );
}
