"use client";

import React from "react"

import { vehicle as defaultVehicle } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const LANES = 3;
const LANE_WIDTH = 90;
const GAME_WIDTH = LANES * LANE_WIDTH;

interface Obstacle {
  id: number;
  lane: number;
  y: number;
  type: "car_red" | "car_blue" | "car_white" | "truck" | "cone";
  speed: number;
}

interface Coin {
  id: number;
  lane: number;
  y: number;
}

interface PowerUp {
  id: number;
  lane: number;
  y: number;
  type: "shield" | "magnet" | "x2";
}

export function DrivingGame() {
  const { setScreen, updateScore, selectedVehicle } = useGameStore();
  const vehicle = selectedVehicle || defaultVehicle;

  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [nitroActive, setNitroActive] = useState(false);
  const [nitroCharge, setNitroCharge] = useState(100);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [shield, setShield] = useState(false);
  const [showPowerUpText, setShowPowerUpText] = useState<string | null>(null);
  const [nearMiss, setNearMiss] = useState(false);
  const [speed, setSpeed] = useState(0);

  const gameRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const obstacleIdRef = useRef(0);
  const coinIdRef = useRef(0);
  const powerUpIdRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const gameOverRef = useRef(false);
  const scoreRef = useRef(0);
  const distanceRef = useRef(0);
  const coinsRef = useRef(0);
  const playerLaneRef = useRef(1);
  const comboRef = useRef(0);
  const shieldRef = useRef(false);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref-based obstacle, coin and power-up tracking for reliable collision detection
  const obstaclesRef = useRef<Obstacle[]>([]);
  const coinsDataRef = useRef<Coin[]>([]);
  const powerUpsDataRef = useRef<PowerUp[]>([]);

  const baseSpeed = 4 + vehicle.speed * 0.6;
  const handling = vehicle.handling * 25;
  const nitroBoost = vehicle.boost * 0.5;
  const accentColor = vehicle.accentColor;

  useEffect(() => {
    playerLaneRef.current = playerLane;
  }, [playerLane]);

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  useEffect(() => {
    shieldRef.current = shield;
  }, [shield]);

  // Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !gameStarted) {
      setGameStarted(true);
    }
  }, [countdown, gameStarted]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!gameStarted || gameOver) return;
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [gameStarted, gameOver]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || !gameStarted || gameOver || isMoving) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const threshold = 25;

      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && playerLane < LANES - 1) {
          setPlayerLane((prev) => prev + 1);
          setIsMoving(true);
          setTimeout(() => setIsMoving(false), handling);
        } else if (deltaX < 0 && playerLane > 0) {
          setPlayerLane((prev) => prev - 1);
          setIsMoving(true);
          setTimeout(() => setIsMoving(false), handling);
        }
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      }
    },
    [gameStarted, gameOver, isMoving, playerLane, handling]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  const activateNitro = useCallback(() => {
    if (nitroCharge >= 25 && !nitroActive && gameStarted && !gameOver) {
      setNitroActive(true);
      setNitroCharge((prev) => prev - 25);
      setTimeout(() => setNitroActive(false), 2500);
    }
  }, [nitroCharge, nitroActive, gameStarted, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;

      if (e.key === "ArrowLeft" && playerLane > 0 && !isMoving) {
        setPlayerLane((prev) => prev - 1);
        setIsMoving(true);
        setTimeout(() => setIsMoving(false), handling);
      } else if (e.key === "ArrowRight" && playerLane < LANES - 1 && !isMoving) {
        setPlayerLane((prev) => prev + 1);
        setIsMoving(true);
        setTimeout(() => setIsMoving(false), handling);
      } else if (e.key === " ") {
        activateNitro();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, gameOver, playerLane, isMoving, handling, activateNitro]);

  const handleGameOver = useCallback(() => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    // Defer all store mutations to avoid setState-during-render
    requestAnimationFrame(() => {
      setGameOver(true);
      updateScore(scoreRef.current, Math.floor(distanceRef.current), coinsRef.current);
      setTimeout(() => setScreen("gameover"), 1500);
    });
  }, [updateScore, setScreen]);

  // Main game loop - uses refs for all game entity tracking to avoid React batching issues
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    gameOverRef.current = false;
    obstaclesRef.current = [];
    coinsDataRef.current = [];
    powerUpsDataRef.current = [];
    let currentDistance = 0;

    const PLAYER_Y = 520;

    const gameLoop = (currentTime: number) => {
      if (gameOverRef.current) return;

      if (!lastTimeRef.current) lastTimeRef.current = currentTime;
      const deltaTime = Math.min(currentTime - lastTimeRef.current, 50);
      lastTimeRef.current = currentTime;

      const speedMultiplier = nitroActive ? 1 + nitroBoost : 1;
      const currentSpeed = baseSpeed * speedMultiplier * (1 + currentDistance / 8000);
      setSpeed(Math.floor(currentSpeed * 15));

      currentDistance += currentSpeed * deltaTime * 0.01;
      distanceRef.current = currentDistance;
      setDistance(currentDistance);

      const scoreIncrease = Math.floor(currentSpeed * deltaTime * 0.1 * (nitroActive ? 2 : 1));
      scoreRef.current += scoreIncrease;
      setScore(scoreRef.current);

      if (!nitroActive) {
        setNitroCharge((prev) => Math.min(100, prev + deltaTime * 0.015));
      }

      // Spawn obstacles with variety
      const spawnRate = 0.015 + currentDistance / 80000;
      if (Math.random() < spawnRate) {
        const lane = Math.floor(Math.random() * LANES);
        const types: Obstacle["type"][] = ["car_red", "car_blue", "car_white", "truck", "cone"];
        const type = types[Math.floor(Math.random() * types.length)];
        const obsSpeed = type === "truck" ? 0.3 : type === "cone" ? 0 : 0.5 + Math.random() * 0.5;
        obstaclesRef.current.push({
          id: obstacleIdRef.current++, lane, y: -120, type, speed: obsSpeed,
        });
      }

      // Spawn coins in patterns
      if (Math.random() < 0.03) {
        const lane = Math.floor(Math.random() * LANES);
        const pattern = Math.random();
        if (pattern < 0.3) {
          for (let i = 0; i < 3; i++) {
            coinsDataRef.current.push({ id: coinIdRef.current++, lane, y: -50 - i * 40 });
          }
        } else {
          coinsDataRef.current.push({ id: coinIdRef.current++, lane, y: -50 });
        }
      }

      // Spawn power-ups rarely
      if (Math.random() < 0.003) {
        const lane = Math.floor(Math.random() * LANES);
        const types: PowerUp["type"][] = ["shield", "x2"];
        const type = types[Math.floor(Math.random() * types.length)];
        powerUpsDataRef.current.push({ id: powerUpIdRef.current++, lane, y: -50, type });
      }

      // --- Update obstacles and check collisions directly on refs ---
      const playerX = playerLaneRef.current * LANE_WIDTH + LANE_WIDTH / 2;
      let collisionDetected = false;

      const updatedObs: Obstacle[] = [];
      for (const obs of obstaclesRef.current) {
        const newY = obs.y + currentSpeed * (2 - obs.speed);
        if (newY >= 750) continue; // off-screen, remove

        const obsX = obs.lane * LANE_WIDTH + LANE_WIDTH / 2;
        const hitboxX = obs.type === "cone" ? 25 : 38;
        const hitboxY = obs.type === "truck" ? 55 : 40;

        // Check collision with sweep (check previous and current Y)
        const prevY = obs.y;
        const minY = Math.min(prevY, newY);
        const maxY = Math.max(prevY, newY);
        const playerInYRange = PLAYER_Y >= minY - hitboxY && PLAYER_Y <= maxY + hitboxY;

        if (Math.abs(playerX - obsX) < hitboxX && playerInYRange) {
          if (shieldRef.current) {
            // Shield absorbs hit
            shieldRef.current = false;
            setShield(false);
            setShowPowerUpText("ESCUDO USADO!");
            setTimeout(() => setShowPowerUpText(null), 1000);
            continue; // remove this obstacle
          }
          collisionDetected = true;
          break;
        }

        // Near miss detection
        if (
          Math.abs(playerX - obsX) < 55 &&
          Math.abs(PLAYER_Y - newY) < 65 &&
          Math.abs(playerX - obsX) >= hitboxX
        ) {
          scoreRef.current += 50;
        }

        updatedObs.push({ ...obs, y: newY });
      }

      if (collisionDetected) {
        // Ensure we sync state one last time before game over
        obstaclesRef.current = updatedObs;
        setObstacles([...updatedObs]);
        handleGameOver();
        return;
      }

      obstaclesRef.current = updatedObs;

      // --- Update coins with collision check on refs ---
      const updatedCoins: Coin[] = [];
      for (const coin of coinsDataRef.current) {
        const newY = coin.y + currentSpeed * 2;
        if (newY >= 750) continue;

        const coinX = coin.lane * LANE_WIDTH + LANE_WIDTH / 2;
        if (Math.abs(playerX - coinX) < 45 && Math.abs(PLAYER_Y - newY) < 45) {
          coinsRef.current += 1;
          setCoinsCollected(coinsRef.current);
          const comboBonus = 100 * (comboRef.current + 1);
          scoreRef.current += comboBonus;
          setScore(scoreRef.current);
          setCombo((c) => c + 1);
          setShowCombo(true);

          if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
          comboTimeoutRef.current = setTimeout(() => {
            setCombo(0);
            setShowCombo(false);
          }, 1500);
          continue; // collected, don't keep
        }
        updatedCoins.push({ ...coin, y: newY });
      }
      coinsDataRef.current = updatedCoins;

      // --- Update power-ups with collision check on refs ---
      const updatedPowerUps: PowerUp[] = [];
      for (const p of powerUpsDataRef.current) {
        const newY = p.y + currentSpeed * 2;
        if (newY >= 750) continue;

        const pX = p.lane * LANE_WIDTH + LANE_WIDTH / 2;
        if (Math.abs(playerX - pX) < 45 && Math.abs(PLAYER_Y - newY) < 45) {
          if (p.type === "shield") {
            shieldRef.current = true;
            setShield(true);
            setShowPowerUpText("ESCUDO ACTIVADO!");
          } else if (p.type === "x2") {
            scoreRef.current += 500;
            setScore(scoreRef.current);
            setShowPowerUpText("+500 BONUS!");
          }
          setTimeout(() => setShowPowerUpText(null), 1000);
          continue;
        }
        updatedPowerUps.push({ ...p, y: newY });
      }
      powerUpsDataRef.current = updatedPowerUps;

      // Sync refs to state for rendering
      setObstacles([...obstaclesRef.current]);
      setCoins([...coinsDataRef.current]);
      setPowerUps([...powerUpsDataRef.current]);

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameStarted, gameOver, baseSpeed, nitroActive, nitroBoost, handleGameOver]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center overflow-hidden select-none relative"
      style={{ backgroundColor: "#1a1a2e" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex justify-between items-start max-w-[280px] mx-auto">
          <div className="text-left">
            <div className="text-3xl font-bebas text-white tracking-wider drop-shadow-lg">
              {score.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <span>{Math.floor(distance)}m</span>
              <span className="text-yellow-400">|</span>
              <span style={{ color: accentColor }}>{speed} km/h</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-[10px] font-bold text-black"
            >
              $
            </motion.div>
            <span className="text-yellow-400 font-bold">{coinsCollected}</span>
          </div>
        </div>
      </div>

      {/* Nitro bar */}
      <div className="absolute top-20 left-4 right-4 z-20 max-w-[280px] mx-auto">
        <div className="h-3 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700">
          <motion.div
            className="h-full rounded-full relative"
            style={{
              backgroundColor: nitroActive ? "#00ffff" : accentColor,
              width: `${nitroCharge}%`,
            }}
            animate={
              nitroActive
                ? { opacity: [1, 0.5, 1], boxShadow: ["0 0 10px #00ffff", "0 0 20px #00ffff"] }
                : {}
            }
            transition={{ repeat: Infinity, duration: 0.2 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-500">NITRO</span>
          <span className="text-[10px]" style={{ color: accentColor }}>
            {Math.floor(nitroCharge)}%
          </span>
        </div>
      </div>

      {/* Shield indicator */}
      <AnimatePresence>
        {shield && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-32 left-1/2 -translate-x-1/2 z-20 bg-blue-500/20 border border-blue-400 px-3 py-1 rounded-full"
          >
            <span className="text-xs text-blue-400 font-bold">ESCUDO ACTIVO</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Power-up text */}
      <AnimatePresence>
        {showPowerUpText && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-40 left-1/2 -translate-x-1/2 z-30 text-xl font-bebas text-cyan-400 drop-shadow-lg"
          >
            {showPowerUpText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Combo indicator */}
      <AnimatePresence>
        {showCombo && combo > 1 && (
          <motion.div
            initial={{ scale: 0, y: 0 }}
            animate={{ scale: 1, y: -10 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1/3 z-30 text-4xl font-bebas drop-shadow-lg"
            style={{ color: accentColor }}
          >
            x{combo} COMBO!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Near miss indicator */}
      <AnimatePresence>
        {nearMiss && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 z-30 text-lg font-bebas text-green-400"
          >
            NEAR MISS! +50
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game area */}
      <div
        ref={gameRef}
        className="relative overflow-hidden rounded-lg shadow-2xl"
        style={{ width: GAME_WIDTH, height: 650 }}
        onClick={activateNitro}
      >
        {/* Road background with perspective */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, #2d2d44 0%, #1a1a2e 100%)",
          }}
        >
          {/* Road surface */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0"
            style={{
              width: GAME_WIDTH - 20,
              background: "#333344",
            }}
          />

          {/* Lane markers - animated */}
          {[1, 2].map((i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-1.5 overflow-hidden"
              style={{ left: i * LANE_WIDTH - 3 }}
            >
              <motion.div
                className="w-full"
                style={{
                  height: "200%",
                  background:
                    "repeating-linear-gradient(to bottom, #666 0px, #666 40px, transparent 40px, transparent 80px)",
                }}
                animate={
                  gameStarted && !gameOver ? { y: ["0%", "50%"] } : {}
                }
                transition={{
                  repeat: Infinity,
                  duration: nitroActive ? 0.2 : 0.4,
                  ease: "linear",
                }}
              />
            </div>
          ))}

          {/* Road edges with glow */}
          <div
            className="absolute top-0 bottom-0 left-2.5 w-1.5 rounded-full"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
          />
          <div
            className="absolute top-0 bottom-0 right-2.5 w-1.5 rounded-full"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
          />

          {/* Side decorations */}
          <motion.div
            className="absolute left-0 top-0 w-2.5"
            style={{
              height: "200%",
              background: "repeating-linear-gradient(to bottom, #222 0px, #222 100px, #333 100px, #333 200px)",
            }}
            animate={gameStarted && !gameOver ? { y: ["0%", "50%"] } : {}}
            transition={{ repeat: Infinity, duration: nitroActive ? 0.3 : 0.6, ease: "linear" }}
          />
          <motion.div
            className="absolute right-0 top-0 w-2.5"
            style={{
              height: "200%",
              background: "repeating-linear-gradient(to bottom, #222 0px, #222 100px, #333 100px, #333 200px)",
            }}
            animate={gameStarted && !gameOver ? { y: ["0%", "50%"] } : {}}
            transition={{ repeat: Infinity, duration: nitroActive ? 0.3 : 0.6, ease: "linear" }}
          />
        </div>

        {/* Obstacles */}
        {obstacles.map((obs) => (
          <motion.div
            key={obs.id}
            className="absolute"
            style={{
              left: obs.lane * LANE_WIDTH + 10,
              top: obs.y,
              width: LANE_WIDTH - 20,
            }}
          >
            <ObstacleCar type={obs.type} />
          </motion.div>
        ))}

        {/* Coins */}
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            className="absolute"
            style={{
              left: coin.lane * LANE_WIDTH + LANE_WIDTH / 2 - 14,
              top: coin.y,
            }}
          >
            <motion.div
              className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center text-xs font-bold text-yellow-900 shadow-lg"
              style={{ boxShadow: "0 0 15px #ffd700" }}
              animate={{ rotateY: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            >
              $
            </motion.div>
          </motion.div>
        ))}

        {/* Power-ups */}
        {powerUps.map((p) => (
          <motion.div
            key={p.id}
            className="absolute"
            style={{
              left: p.lane * LANE_WIDTH + LANE_WIDTH / 2 - 16,
              top: p.y,
            }}
          >
            <motion.div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-lg ${
                p.type === "shield"
                  ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                  : "bg-gradient-to-br from-purple-400 to-purple-600 text-white"
              }`}
              style={{
                boxShadow:
                  p.type === "shield" ? "0 0 15px #3b82f6" : "0 0 15px #a855f7",
              }}
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              {p.type === "shield" ? "S" : "x2"}
            </motion.div>
          </motion.div>
        ))}

        {/* Player car */}
        <motion.div
          className="absolute"
          style={{
            width: 75,
            height: 100,
            bottom: 80,
          }}
          animate={{
            left: playerLane * LANE_WIDTH + LANE_WIDTH / 2 - 37.5,
            rotate: isMoving ? (playerLane > playerLaneRef.current ? 3 : -3) : 0,
          }}
          transition={{
            left: { type: "spring", stiffness: 400, damping: 25 },
            rotate: { duration: 0.1 },
          }}
        >
          {/* Shield visual effect */}
          {shield && (
            <motion.div
              className="absolute -inset-3 rounded-full border-2 border-blue-400"
              style={{ boxShadow: "0 0 20px #3b82f6" }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            />
          )}

          {/* Car shadow */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full bg-black/40 blur-sm"
          />

          {/* Player car SVG */}
          <PlayerCarSVG nitro={nitroActive} color={accentColor} />
        </motion.div>

        {/* Nitro speed lines */}
        <AnimatePresence>
          {nitroActive && (
            <>
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`speed-${i}`}
                  className="absolute rounded-full"
                  style={{
                    left: 10 + Math.random() * (GAME_WIDTH - 20),
                    width: 2,
                    height: 50 + Math.random() * 80,
                    background: `linear-gradient(to bottom, transparent, ${accentColor}80, transparent)`,
                  }}
                  initial={{ top: -100, opacity: 0 }}
                  animate={{ top: 700, opacity: [0, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.25,
                    repeat: Infinity,
                    delay: i * 0.03,
                    ease: "linear",
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Countdown */}
        <AnimatePresence>
          {countdown > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="text-8xl font-bebas"
                style={{ color: accentColor, textShadow: `0 0 30px ${accentColor}` }}
              >
                {countdown}
              </motion.div>
              <p className="text-gray-400 mt-4 text-sm">Preparate...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Over overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30"
            >
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-5xl font-bebas text-red-500"
                style={{ textShadow: "0 0 30px #ff0000" }}
              >
                CRASH!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      {gameStarted && !gameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-6 left-0 right-0 text-center"
        >
          <p className="text-xs text-gray-500">
            Desliza izquierda/derecha - Toca para NITRO
          </p>
        </motion.div>
      )}
    </div>
  );
}

function PlayerCarSVG({ nitro, color }: { nitro: boolean; color: string }) {
  return (
    <svg viewBox="0 0 75 100" className="w-full h-full drop-shadow-2xl">
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d0d0d0" />
        </linearGradient>
        <linearGradient id="windowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a365d" />
          <stop offset="100%" stopColor="#2d3748" />
        </linearGradient>
      </defs>

      <path
        d="M10 35 L10 75 Q10 80 15 80 L60 80 Q65 80 65 75 L65 35 L55 20 Q52 15 45 15 L30 15 Q23 15 20 20 Z"
        fill="url(#bodyGrad)"
        stroke="#999"
        strokeWidth="1"
      />

      <path
        d="M15 40 L22 25 Q24 22 30 22 L45 22 Q51 22 53 25 L60 40 Z"
        fill="url(#windowGrad)"
        stroke="#666"
        strokeWidth="1"
      />

      <path
        d="M18 38 L24 27 Q26 25 32 25 L43 25 Q49 25 51 27 L57 38 Z"
        fill="#4a5568"
        opacity="0.9"
      />

      <rect x="12" y="45" width="51" height="30" rx="2" fill="#e0e0e0" stroke="#999" strokeWidth="1" />
      <line x1="15" y1="50" x2="60" y2="50" stroke="#ccc" strokeWidth="1" />

      <rect x="20" y="12" width="35" height="8" rx="2" fill="#222" />
      <rect x="23" y="14" width="8" height="4" rx="1" fill="#444" />
      <rect x="33" y="14" width="8" height="4" rx="1" fill="#444" />
      <rect x="44" y="14" width="8" height="4" rx="1" fill="#444" />

      <ellipse cx="18" cy="18" rx="4" ry="3" fill="#fff" opacity="0.9" />
      <ellipse cx="57" cy="18" rx="4" ry="3" fill="#fff" opacity="0.9" />
      <ellipse cx="18" cy="18" rx="2" ry="1.5" fill="#ffff99" />
      <ellipse cx="57" cy="18" rx="2" ry="1.5" fill="#ffff99" />

      <rect x="6" y="32" width="6" height="4" rx="1" fill="#333" />
      <rect x="63" y="32" width="6" height="4" rx="1" fill="#333" />

      <ellipse cx="20" cy="82" rx="10" ry="8" fill="#111" />
      <ellipse cx="20" cy="82" rx="6" ry="5" fill="#333" />
      <ellipse cx="20" cy="82" rx="3" ry="2" fill="#666" />

      <ellipse cx="55" cy="82" rx="10" ry="8" fill="#111" />
      <ellipse cx="55" cy="82" rx="6" ry="5" fill="#333" />
      <ellipse cx="55" cy="82" rx="3" ry="2" fill="#666" />

      <rect x="12" y="76" width="8" height="3" rx="1" fill={color} />
      <rect x="55" y="76" width="8" height="3" rx="1" fill={color} />

      {nitro && (
        <>
          <motion.ellipse
            cx="22"
            cy="92"
            rx="8"
            ry="12"
            fill="#00ffff"
            opacity="0.8"
            animate={{ ry: [10, 14, 10], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 0.1 }}
          />
          <motion.ellipse
            cx="53"
            cy="92"
            rx="8"
            ry="12"
            fill="#00ffff"
            opacity="0.8"
            animate={{ ry: [10, 14, 10], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 0.1 }}
          />
          <ellipse cx="22" cy="95" rx="5" ry="8" fill="#fff" />
          <ellipse cx="53" cy="95" rx="5" ry="8" fill="#fff" />
        </>
      )}
    </svg>
  );
}

function ObstacleCar({ type }: { type: Obstacle["type"] }) {
  if (type === "cone") {
    return (
      <svg viewBox="0 0 40 50" className="w-10 h-12 mx-auto">
        <polygon points="20,5 35,45 5,45" fill="#ff6600" stroke="#cc5500" strokeWidth="2" />
        <rect x="8" y="15" width="24" height="4" fill="#fff" />
        <rect x="10" y="25" width="20" height="4" fill="#fff" />
        <rect x="3" y="43" width="34" height="5" rx="1" fill="#333" />
      </svg>
    );
  }

  if (type === "truck") {
    return (
      <svg viewBox="0 0 70 100" className="w-full h-24">
        <rect x="8" y="5" width="54" height="90" rx="4" fill="#444" stroke="#333" strokeWidth="2" />
        <rect x="12" y="10" width="46" height="20" rx="2" fill="#2d3748" />
        <rect x="15" y="14" width="40" height="14" rx="1" fill="#4a5568" />
        <rect x="5" y="25" width="8" height="25" rx="2" fill="#333" />
        <rect x="57" y="25" width="8" height="25" rx="2" fill="#333" />
        <rect x="5" y="60" width="8" height="25" rx="2" fill="#333" />
        <rect x="57" y="60" width="8" height="25" rx="2" fill="#333" />
        <rect x="15" y="88" width="12" height="4" rx="1" fill="#ff4444" />
        <rect x="43" y="88" width="12" height="4" rx="1" fill="#ff4444" />
      </svg>
    );
  }

  const colors = {
    car_red: { body: "#dc2626", dark: "#991b1b" },
    car_blue: { body: "#2563eb", dark: "#1d4ed8" },
    car_white: { body: "#e5e7eb", dark: "#9ca3af" },
  };

  const c = colors[type as keyof typeof colors] || colors.car_red;

  return (
    <svg viewBox="0 0 70 90" className="w-full h-20">
      <rect x="10" y="10" width="50" height="70" rx="8" fill={c.body} stroke={c.dark} strokeWidth="2" />
      <path d="M14 25 L20 15 Q22 12 30 12 L40 12 Q48 12 50 15 L56 25 Z" fill="#2d3748" />
      <rect x="16" y="16" width="38" height="8" rx="2" fill="#4a5568" />
      <rect x="6" y="28" width="6" height="15" rx="2" fill="#222" />
      <rect x="58" y="28" width="6" height="15" rx="2" fill="#222" />
      <rect x="6" y="55" width="6" height="15" rx="2" fill="#222" />
      <rect x="58" y="55" width="6" height="15" rx="2" fill="#222" />
      <rect x="14" y="72" width="10" height="4" rx="1" fill="#ff4444" />
      <rect x="46" y="72" width="10" height="4" rx="1" fill="#ff4444" />
    </svg>
  );
}
