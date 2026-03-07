"use client";

import { useGameStore } from "@/lib/game-store";
import { AnimatePresence } from "framer-motion";
import { DrivingGame } from "./driving-game";
import { FormScreen } from "./form-screen";
import { GameOverScreen } from "./game-over-screen";
import { VehicleSelectScreen } from "./vehicle-select-screen";
import { LeaderboardScreen } from "./leaderboard-screen";
import { WelcomeScreen } from "./welcome-screen";
import { UnlockScreen } from "./unlock-screen";

export function GameContainer() {
  const { currentScreen } = useGameStore();

  return (
    <div className="min-h-screen w-full max-w-md mx-auto bg-background relative overflow-hidden">
      <div className="min-h-screen">
        <AnimatePresence mode="wait">
          {currentScreen === "welcome" && <WelcomeScreen key="welcome" />}
          {currentScreen === "select" && <VehicleSelectScreen key="select" />}
          {currentScreen === "game" && <DrivingGame key="game" />}
          {currentScreen === "gameover" && <GameOverScreen key="gameover" />}
          {currentScreen === "leaderboard" && <LeaderboardScreen key="leaderboard" />}
          {currentScreen === "form" && <FormScreen key="form" />}
          {currentScreen === "unlock" && <UnlockScreen key="unlock" />}
        </AnimatePresence>
      </div>
    </div>
  );
}
