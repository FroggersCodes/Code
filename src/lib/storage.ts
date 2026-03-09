"use client";

import type { Player } from "@/types";
import { getRankFromElo } from "./elo";

const PLAYER_KEY = "bugracer_player";
const MATCHES_KEY = "bugracer_matches";

export interface StoredMatch {
  id: number;
  challengeTitle: string;
  challengeLanguage: string;
  opponentName: string;
  isVsBot: boolean;
  won: boolean;
  draw: boolean;
  eloChange: number;
  playerTime: number | null;
  opponentTime: number | null;
  createdAt: string;
}

export function getPlayer(): Player | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(PLAYER_KEY);
  if (!data) return null;
  return JSON.parse(data);
}

export function savePlayer(player: Player): void {
  localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
}

export function createPlayer(username: string): Player {
  const player: Player = {
    id: Date.now(),
    username,
    elo: 1000,
    rank: "Silver",
    wins: 0,
    losses: 0,
    draws: 0,
  };
  savePlayer(player);
  return player;
}

export function updatePlayerAfterMatch(
  won: boolean,
  draw: boolean,
  newElo: number
): void {
  const player = getPlayer();
  if (!player) return;
  player.elo = newElo;
  player.rank = getRankFromElo(newElo);
  if (draw) player.draws++;
  else if (won) player.wins++;
  else player.losses++;
  savePlayer(player);
}

export function getMatches(): StoredMatch[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(MATCHES_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function addMatch(match: StoredMatch): void {
  const matches = getMatches();
  matches.unshift(match);
  // Keep last 50 matches
  if (matches.length > 50) matches.length = 50;
  localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
}

export function logout(): void {
  localStorage.removeItem(PLAYER_KEY);
  localStorage.removeItem(MATCHES_KEY);
}
