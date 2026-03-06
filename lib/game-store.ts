import { create } from "zustand";
import type { Vehicle, CompanyId } from "./game-data";
import type { AuthUser } from "./mock-auth";

type Screen = "welcome" | "select" | "game" | "gameover" | "leaderboard" | "form" | "unlock";
type LifeResult = "continue" | "unlock" | "gameover";
export interface DriverProfile {
  title: string;
  subtitle: string;
  percentile: number;
  badge: "bronze" | "silver" | "gold" | "platinum" | "diamond";
}

function getDriverProfile(score: number): DriverProfile {
  if (score >= 12000) return { title: "LEYENDA DE LA RUTA", subtitle: "Dominio absoluto", percentile: 97, badge: "diamond" };
  if (score >= 8000) return { title: "REY DEL ASFALTO", subtitle: "Conductor elite", percentile: 91, badge: "platinum" };
  if (score >= 5000) return { title: "PILOTO EXPERTO", subtitle: "Nivel profesional", percentile: 82, badge: "gold" };
  if (score >= 2500) return { title: "CONDUCTOR AVANZADO", subtitle: "Habilidad comprobada", percentile: 65, badge: "silver" };
  if (score >= 1000) return { title: "NOVATO AUDAZ", subtitle: "En ascenso", percentile: 40, badge: "bronze" };
  return { title: "PRINCIPIANTE", subtitle: "Solo el comienzo", percentile: 15, badge: "bronze" };
}

interface GameState {
  currentScreen: Screen;
  selectedCompany: CompanyId | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  selectedVehicle: Vehicle | null;
  currentScore: number;
  highScore: number;
  distance: number;
  coinsCollected: number;
  gamesPlayed: number;
  formSubmitted: boolean;
  lives: number;
  extraLivesUnlocked: boolean;
  referralLivesUsed: number;
  referralPointsUsed: number;
  resultVehicle: Vehicle | null;
  driverProfile: DriverProfile | null;
  dominanceIndex: number;

  setScreen: (screen: Screen) => void;
  selectCompany: (company: CompanyId) => void;
  setUser: (user: AuthUser) => void;
  selectVehicle: (vehicle: Vehicle) => void;
  updateScore: (score: number, distance: number, coins: number) => void;
  loseLife: () => LifeResult;
  unlockExtraLives: () => void;
  addReferralBonus: () => void;
  resetGame: () => void;
  submitForm: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentScreen: "welcome",
  selectedCompany: null,
  user: null,
  isAuthenticated: false,
  selectedVehicle: null,
  currentScore: 0,
  highScore: 0,
  distance: 0,
  coinsCollected: 0,
  gamesPlayed: 0,
  formSubmitted: false,
  lives: 3,
  extraLivesUnlocked: false,
  referralLivesUsed: 0,
  referralPointsUsed: 0,
  resultVehicle: null,
  driverProfile: null,
  dominanceIndex: 0,

  setScreen: (screen) => set({ currentScreen: screen }),

  selectCompany: (company) => set({ selectedCompany: company }),

  setUser: (user) => set({ user, isAuthenticated: true }),

  selectVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

  updateScore: (score, distance, coins) => {
    const state = get();
    const profile = getDriverProfile(score);
    const maxPossible = 15000;
    const dominance = Math.min(99, Math.round((score / maxPossible) * 100));
    set({
      currentScore: score,
      distance,
      coinsCollected: coins,
      highScore: Math.max(state.highScore, score),
      gamesPlayed: state.gamesPlayed + 1,
      driverProfile: profile,
      dominanceIndex: dominance,
    });
  },

    loseLife: () => {
    const state = get();
    const newLives = state.lives - 1;

    if (newLives <= 0 && !state.extraLivesUnlocked) {
      set({
        lives: 0,
        currentScreen: "unlock",
      });
      return "unlock";
    }

    if (newLives <= 0 && state.extraLivesUnlocked) {
      set({
        lives: 0,
        currentScreen: "gameover",
      });
      return "gameover";
    }

    set({ lives: newLives });
      return "continue"
  },
    unlockExtraLives: () =>
      set({
          extraLivesUnlocked: true,
          lives: 3,
          currentScreen: "game",
    }),
    addReferralBonus: () => {
    const state = get();

    const canAddLife = state.referralLivesUsed < 5;
    const canAddPoints = state.referralPointsUsed < 5;

    set({
      lives: canAddLife ? state.lives + 1 : state.lives,
      referralLivesUsed: canAddLife ? state.referralLivesUsed + 1 : state.referralLivesUsed,
      currentScore: canAddPoints ? state.currentScore + 50 : state.currentScore,
      referralPointsUsed: canAddPoints ? state.referralPointsUsed + 1 : state.referralPointsUsed,
      highScore: canAddPoints
        ? Math.max(state.highScore, state.currentScore + 50)
        : state.highScore,
    });
  },

    resetGame: () =>
      set({
        currentScreen: "select",
        currentScore: 0,
        distance: 0,
        coinsCollected: 0,
        formSubmitted: false,
        lives: 3,
        extraLivesUnlocked: false,
        referralLivesUsed: 0,
        referralPointsUsed: 0,
        driverProfile: null,
        dominanceIndex: 0,
        }),

    submitForm: () =>
    set({
      formSubmitted: true,
      extraLivesUnlocked: true,
      lives: 3,
      currentScreen: "game",
    }),
}));
