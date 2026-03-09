export interface Player {
  id: number;
  username: string;
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

export interface MatchData {
  id: number;
  player1: Player;
  player2: Player | null;
  challenge: ChallengeData;
  isVsBot: boolean;
  status: string;
}

export interface GameState {
  matchId: number;
  challenge: ChallengeData;
  timeRemaining: number;
  player1: { id: number; username: string; elo: number; rank: string; submitted: boolean; solved: boolean };
  player2: { id: number; username: string; elo: number; rank: string; submitted: boolean; solved: boolean };
  isVsBot: boolean;
}

export interface MatchResult {
  matchId: number;
  winnerId: number | null;
  player1Time: number | null;
  player2Time: number | null;
  eloChange: number;
  player1NewElo: number;
  player2NewElo: number;
  isDraw: boolean;
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

// Socket.io event types
export interface ServerToClientEvents {
  match_found: (data: { matchId: number; opponent: Player }) => void;
  game_start: (state: GameState) => void;
  opponent_progress: (data: { typing: boolean; submitCount: number }) => void;
  opponent_solved: (data: { time: number }) => void;
  game_end: (result: MatchResult) => void;
  queue_position: (position: number) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  join_queue: (data: { userId: number; mode: "pvp" | "bot" }) => void;
  leave_queue: () => void;
  code_submit: (data: { matchId: number; code: string }) => void;
  typing_update: (data: { matchId: number; typing: boolean }) => void;
}
