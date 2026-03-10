"use client";

import type { Player } from "@/types";
import { getRankFromElo } from "./elo";

const PLAYER_KEY = "bugracer_player";
const MATCHES_KEY = "bugracer_matches";
const ACCOUNTS_KEY = "bugracer_accounts";

interface StoredAccount {
  username: string;
  passwordHash: string;
}

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash.toString(36);
}

function getAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(ACCOUNTS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

function saveAccounts(accounts: StoredAccount[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function signUp(
  username: string,
  password: string
): Player | { error: string } {
  const accounts = getAccounts();
  if (accounts.find((a) => a.username.toLowerCase() === username.toLowerCase())) {
    return { error: "Username already taken" };
  }
  const pwHash = hashPassword(password);
  accounts.push({ username, passwordHash: pwHash });
  saveAccounts(accounts);

  const player: Player = {
    id: Date.now(),
    username,
    passwordHash: pwHash,
    elo: 1000,
    rank: "Silver",
    wins: 0,
    losses: 0,
    draws: 0,
  };
  savePlayer(player);
  return player;
}

export function login(
  username: string,
  password: string
): Player | { error: string } {
  const accounts = getAccounts();
  const account = accounts.find(
    (a) => a.username.toLowerCase() === username.toLowerCase()
  );
  if (!account) {
    return { error: "Account not found" };
  }
  if (account.passwordHash !== hashPassword(password)) {
    return { error: "Incorrect password" };
  }

  // Check if player data exists, otherwise create fresh
  const existing = getPlayer();
  if (existing && existing.username.toLowerCase() === username.toLowerCase()) {
    return existing;
  }

  // Look in all stored player data or create new
  const player: Player = {
    id: Date.now(),
    username: account.username,
    passwordHash: account.passwordHash,
    elo: 1000,
    rank: "Silver",
    wins: 0,
    losses: 0,
    draws: 0,
  };
  savePlayer(player);
  return player;
}

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

export function createPlayer(username: string, passwordHash = ""): Player {
  const player: Player = {
    id: Date.now(),
    username,
    passwordHash,
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
