export interface Player {
  id: number;
  username: string;
  passwordHash: string;
  elo: number;
  rank: string;
  wins: number;
  losses: number;
  draws: number;
  title: string | null;
  unlockedTitles: string[];
}

export interface ChallengeData {
  id: number;
  title: string;
  description: string;
  language: string;
  buggyCode: string;
  hint?: string;
  difficulty: number;
  category: string;
}

export type RankTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Grandmaster";

export const RANK_THRESHOLDS: Record<RankTier, { min: number; max: number }> = {
  Bronze: { min: 0, max: 999 },
  Silver: { min: 1000, max: 1199 },
  Gold: { min: 1200, max: 1399 },
  Platinum: { min: 1400, max: 1599 },
  Diamond: { min: 1600, max: 1999 },
  Grandmaster: { min: 2000, max: Infinity },
};

export const RANK_COLORS: Record<RankTier, string> = {
  Bronze: "#cd7f32",
  Silver: "#c0c0c0",
  Gold: "#ffd700",
  Platinum: "#00d4ff",
  Diamond: "#ff0066",
  Grandmaster: "#ff4500",
};

export interface OnlineOpponent {
  username: string;
  elo: number;
  rank: string;
  title?: string | null;
}

export interface MultiplayerResult {
  won: boolean;
  draw: boolean;
  playerTime: number | null;
  opponentTime: number | null;
  opponentName: string;
  eloChange: number;
  newElo: number;
  newRank: string;
  fixedCode?: string;
  buggyCode?: string;
}

export interface PracticeConfig {
  language: "javascript" | "python";
  difficulty: 1 | 2 | 3 | null; // null = any
  timeLimit: number; // seconds
  mode: "solo" | "invite";
}

export interface PracticeOpponent {
  username: string;
  elo: number;
  rank: string;
  title?: string | null;
}
