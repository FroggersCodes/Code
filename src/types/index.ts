export interface Player {
  id: number;
  username: string;
  passwordHash: string;
  elo: number;
  rank: string;
  wins: number;
  losses: number;
  draws: number;
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

export type RankTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";

export const RANK_THRESHOLDS: Record<RankTier, { min: number; max: number }> = {
  Bronze: { min: 0, max: 999 },
  Silver: { min: 1000, max: 1199 },
  Gold: { min: 1200, max: 1399 },
  Platinum: { min: 1400, max: 1599 },
  Diamond: { min: 1600, max: 9999 },
};

export const RANK_COLORS: Record<RankTier, string> = {
  Bronze: "#cd7f32",
  Silver: "#c0c0c0",
  Gold: "#ffd700",
  Platinum: "#00d4ff",
  Diamond: "#ff0066",
};

export interface OnlineOpponent {
  username: string;
  elo: number;
  rank: string;
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
}
