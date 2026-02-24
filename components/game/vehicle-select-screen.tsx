"use client";

import React, { useState, useRef, useCallback } from "react";

import { vehicles, getVehiclesByCompany, companies } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Gauge, Zap, Rocket, Check, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

function StatBar({
  label,
  value,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3"
    >
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
      <span className="text-xs text-muted-foreground w-16">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 20}%` }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold w-6 text-right" style={{ color }}>
        {value}/5
      </span>
    </motion.div>
  );
}

function VehicleDots({
  total,
  active,
  accentColor,
  onDotClick,
}: {
  total: number;
  active: number;
  accentColor: string;
  onDotClick: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          className="touch-manipulation p-1"
          aria-label={`Seleccionar vehiculo ${i + 1}`}
        >
          <motion.div
            animate={{
              width: i === active ? 24 : 8,
              backgroundColor: i === active ? accentColor : "rgba(255,255,255,0.2)",
            }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full"
          />
        </button>
      ))}
    </div>
  );
}

export function VehicleSelectScreen() {
  const { selectVehicle, setScreen, highScore, gamesPlayed, user, selectedCompany } = useGameStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const companyVehicles = selectedCompany ? getVehiclesByCompany(selectedCompany) : vehicles;
  const activeCompany = companies.find((c) => c.id === selectedCompany);
  const currentVehicle = companyVehicles[activeIndex];

  const handleSwipe = useCallback(
    (dir: number) => {
      const newIndex = activeIndex + dir;
      if (newIndex >= 0 && newIndex < companyVehicles.length) {
        setDirection(dir);
        setActiveIndex(newIndex);
      }
    },
    [activeIndex]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
        handleSwipe(deltaX > 0 ? -1 : 1);
      }
    },
    [handleSwipe]
  );

  const handlePlay = () => {
    selectVehicle(currentVehicle);
    setScreen("game");
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.85,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.85,
    }),
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#111] to-black select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Animated background glow that changes with vehicle */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVehicle.id + "-glow"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{ backgroundColor: currentVehicle.accentColor }}
        />
      </AnimatePresence>

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-6 pb-1 px-6 text-center relative z-10"
      >
        {/* User greeting + logo */}
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-2">
            {user && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {user.avatar}
              </div>
            )}
            {user && (
              <span className="text-[10px] tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>
                {"Hola, "}
                {user.name.split(" ")[0]}
              </span>
            )}
          </div>
          <Image
            src={activeCompany?.logo || "/images/scuderia-header-blanco.png"}
            alt={activeCompany?.name || "Scuderia"}
            width={130}
            height={30}
            className="brightness-0 invert"
            style={{ width: "auto", height: "auto", maxHeight: "14px", opacity: 0.4 }}
          />
        </div>
        <span className="text-[9px] font-medium tracking-[0.4em] uppercase text-muted-foreground">
          Drive Experience
        </span>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVehicle.id + "-header"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-[10px] font-medium tracking-[0.3em] text-muted-foreground">
              {currentVehicle.brand}
            </div>
            <h1 className="text-5xl font-bebas tracking-wider text-foreground leading-none">
              {currentVehicle.name}
            </h1>
            <motion.p
              className="text-sm font-medium mt-0.5"
              style={{ color: currentVehicle.accentColor }}
            >
              {currentVehicle.tagline}
            </motion.p>
            <span
              className="inline-block mt-1 text-[10px] px-3 py-0.5 rounded-full border"
              style={{
                color: currentVehicle.accentColor,
                borderColor: currentVehicle.accentColor + "40",
                backgroundColor: currentVehicle.accentColor + "10",
              }}
            >
              {currentVehicle.category}
            </span>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* High score badge */}
      {highScore > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto mt-1 px-3 py-1 bg-secondary/50 rounded-full flex items-center gap-2"
        >
          <Trophy className="w-3 h-3 text-yellow-500" />
          <span className="text-xs text-muted-foreground">
            Record:{" "}
            <span className="font-bold text-foreground">{highScore.toLocaleString()}</span>
          </span>
        </motion.div>
      )}

      {/* Vehicle carousel area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2">
        {/* Navigation arrows */}
        {activeIndex > 0 && (
          <button
            onClick={() => handleSwipe(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-secondary/60 backdrop-blur-sm flex items-center justify-center touch-manipulation active:scale-90 transition-transform"
            aria-label="Vehiculo anterior"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        {activeIndex < companyVehicles.length - 1 && (
          <button
            onClick={() => handleSwipe(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-secondary/60 backdrop-blur-sm flex items-center justify-center touch-manipulation active:scale-90 transition-transform"
            aria-label="Vehiculo siguiente"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        )}

        {/* Car image with AnimatePresence */}
        <div className="relative w-full max-w-[360px] h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentVehicle.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative"
              >
                {/* Glow under car */}
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[70%] h-6 rounded-full blur-xl opacity-50"
                  style={{ backgroundColor: currentVehicle.accentColor }}
                />
                <div className="relative z-10 w-[360px] h-[200px]">
                  <Image
                    src={currentVehicle.image}
                    alt={`${currentVehicle.brand} ${currentVehicle.name}`}
                    fill
                    className="drop-shadow-2xl object-contain"
                    priority
                  />
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots indicator */}
        <div className="mt-3">
          <VehicleDots
            total={companyVehicles.length}
            active={activeIndex}
            accentColor={currentVehicle.accentColor}
            onDotClick={(i) => {
              setDirection(i > activeIndex ? 1 : -1);
              setActiveIndex(i);
            }}
          />
        </div>

        {/* Swipe hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-[10px] text-muted-foreground mt-1.5 text-center"
        >
          {"<"} Desliza para explorar {">"}
        </motion.p>
      </div>

      {/* Stats Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVehicle.id + "-stats"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mx-4 mb-3 bg-card/60 backdrop-blur-md rounded-2xl p-4 border border-border/50 relative z-10"
        >
          <div className="space-y-3">
            <StatBar
              label="Velocidad"
              value={currentVehicle.speed}
              icon={Gauge}
              color={currentVehicle.accentColor}
              delay={0}
            />
            <StatBar
              label="Manejo"
              value={currentVehicle.handling}
              icon={Zap}
              color={currentVehicle.accentColor}
              delay={0.05}
            />
            <StatBar
              label="Nitro"
              value={currentVehicle.boost}
              icon={Rocket}
              color={currentVehicle.accentColor}
              delay={0.1}
            />
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 pt-3 border-t border-border/50"
          >
            <div className="grid grid-cols-2 gap-1.5">
              {currentVehicle.features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
                >
                  <Check
                    className="w-2.5 h-2.5 flex-shrink-0"
                    style={{ color: currentVehicle.accentColor }}
                  />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Play Button */}
      <div className="px-4 pb-6 pt-1 relative z-10">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlay}
          className="w-full py-4 rounded-xl font-bebas text-2xl tracking-wider text-foreground transition-all duration-300 touch-manipulation relative overflow-hidden"
          style={{
            backgroundColor: currentVehicle.accentColor,
            boxShadow: `0 0 40px ${currentVehicle.accentColor}40`,
          }}
        >
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            style={{ skewX: "-20deg", width: "30%" }}
          />
          <span className="relative z-10">
            {gamesPlayed > 0 ? "SUPERAR MI RECORD" : "ACEPTAR EL DESAFIO"}
          </span>
        </motion.button>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[10px] text-muted-foreground mt-2"
        >
          Esquiva. Acelera. Domina. Comparte tu nivel.
        </motion.p>
      </div>
    </div>
  );
}
