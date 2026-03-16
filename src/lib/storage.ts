"use client";

import type { Player } from "@/types";
import { getRankFromElo } from "./elo";
import { getNewlyUnlocked } from "./titles";

const PLAYER_KEY = "bugracer_player";
const MATCHES_KEY = "bugracer_matches";
const ACCOUNTS_KEY = "bugracer_accounts";
const PENDING_TOASTS_KEY = "bugracer_pending_toasts";

function playerKey(username: string): string {
  return `bugracer_player_${username.toLowerCase()}`;
}
function matchesKey(username: string): string {
  return `bugracer_matches_${username.toLowerCase()}`;
}
function friendsKey(username: string): string {
  return `bugracer_friends_${username.toLowerCase()}`;
}
function cotdKey(date: string, username: string): string {
  return `bugracer_cotd_${date}_${username.toLowerCase()}`;
}

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
    title: "alpha_tester",
    unlockedTitles: ["alpha_tester"],
    avatar: null,
    winStreak: 0,
    coins: 0,
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

  // Check current active session first
  const existing = getPlayer();
  if (existing && existing.username.toLowerCase() === username.toLowerCase()) {
    return existing;
  }

  // Restore from per-user save (data persisted across logouts)
  const savedData = typeof window !== "undefined"
    ? localStorage.getItem(playerKey(username))
    : null;
  if (savedData) {
    const saved = JSON.parse(savedData) as Player;
    // Restore player to active slot
    localStorage.setItem(PLAYER_KEY, savedData);
    // Restore matches
    const savedMatches = localStorage.getItem(matchesKey(username));
    if (savedMatches) localStorage.setItem(MATCHES_KEY, savedMatches);
    return saved;
  }

  // Brand-new player (first login after sign-up clears PLAYER_KEY)
  const player: Player = {
    id: Date.now(),
    username: account.username,
    passwordHash: account.passwordHash,
    elo: 1000,
    rank: "Silver",
    wins: 0,
    losses: 0,
    draws: 0,
    title: null,
    unlockedTitles: [],
    avatar: null,
    winStreak: 0,
    coins: 0,
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
  const player = JSON.parse(data) as Player;
  // Migrate old players who don't have newer fields
  const raw = player as unknown as Record<string, unknown>;
  let migrated = false;
  if (!("unlockedTitles" in raw)) { player.unlockedTitles = []; player.title = null; migrated = true; }
  if (!("avatar" in raw)) { player.avatar = null; migrated = true; }
  if (!("winStreak" in raw)) { player.winStreak = 0; migrated = true; }
  if (!("coins" in raw)) { player.coins = 0; migrated = true; }
  if (migrated) savePlayer(player);
  return player;
}

export function savePlayer(player: Player): void {
  const data = JSON.stringify(player);
  localStorage.setItem(PLAYER_KEY, data);
  localStorage.setItem(playerKey(player.username), data);
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
    title: null,
    unlockedTitles: [],
    avatar: null,
    winStreak: 0,
    coins: 0,
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
  if (draw) { player.draws++; }
  else if (won) { player.wins++; player.winStreak = (player.winStreak ?? 0) + 1; }
  else { player.losses++; player.winStreak = 0; }

  // Earn coins
  let coinsEarned = 0;
  if (won) {
    coinsEarned = 25; // base win reward
    const streak = player.winStreak ?? 0;
    if (streak >= 3) coinsEarned += 10; // streak bonus
    if (streak >= 5) coinsEarned += 15;
    if (streak >= 10) coinsEarned += 25;
  } else if (draw) {
    coinsEarned = 5;
  } else {
    coinsEarned = 2; // participation reward
  }
  player.coins = (player.coins ?? 0) + coinsEarned;

  savePlayer(player);
}

export function equipAvatar(avatarId: string | null): void {
  const player = getPlayer();
  if (!player) return;
  player.avatar = avatarId;
  savePlayer(player);
}

/** Checks for newly unlocked titles, saves them, queues toasts, returns their labels. */
export function checkAndUnlockTitles(): string[] {
  const player = getPlayer();
  if (!player) return [];
  const matches = getMatches();
  const newIds = getNewlyUnlocked(player, matches);
  if (newIds.length === 0) return [];
  player.unlockedTitles = [...(player.unlockedTitles ?? []), ...newIds];
  savePlayer(player);
  const { TITLES } = require("./titles") as typeof import("./titles");
  const labels = newIds.map((id: string) => TITLES.find((t: { id: string }) => t.id === id)?.label ?? id);
  // Queue for display
  const existing: string[] = JSON.parse(localStorage.getItem(PENDING_TOASTS_KEY) ?? "[]");
  localStorage.setItem(PENDING_TOASTS_KEY, JSON.stringify([...existing, ...labels]));
  return labels;
}

export function consumePendingTitleToasts(): string[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(PENDING_TOASTS_KEY);
  if (!data) return [];
  localStorage.removeItem(PENDING_TOASTS_KEY);
  return JSON.parse(data);
}

// ─── Friends ───────────────────────────────────────────────────────────────
export function getFriends(): string[] {
  if (typeof window === "undefined") return [];
  const player = getPlayer();
  if (!player) return [];
  const data = localStorage.getItem(friendsKey(player.username));
  return data ? JSON.parse(data) : [];
}

export function addFriend(friendUsername: string): void {
  const player = getPlayer();
  if (!player) return;
  const friends = getFriends();
  const lower = friendUsername.toLowerCase();
  if (lower === player.username.toLowerCase()) return; // can't friend yourself
  if (!friends.includes(lower)) {
    friends.push(lower);
    localStorage.setItem(friendsKey(player.username), JSON.stringify(friends));
  }
}

export function removeFriend(friendUsername: string): void {
  const player = getPlayer();
  if (!player) return;
  const friends = getFriends().filter((f) => f !== friendUsername.toLowerCase());
  localStorage.setItem(friendsKey(player.username), JSON.stringify(friends));
}

export interface FriendStats {
  username: string;
  elo: number;
  rank: string;
  wins: number;
  losses: number;
}

export function getFriendStats(friendUsername: string): FriendStats | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(playerKey(friendUsername));
  if (!data) return null;
  const p = JSON.parse(data) as { username: string; elo: number; rank: string; wins: number; losses: number };
  return { username: p.username, elo: p.elo, rank: p.rank, wins: p.wins, losses: p.losses };
}

// ─── Challenge of the day ─────────────────────────────────────────────────
export interface CotdRecord {
  bestTime: number | null; // ms, null = DNF
  attempts: number;
  won: boolean;
}

export function getCotdRecord(): CotdRecord | null {
  if (typeof window === "undefined") return null;
  const player = getPlayer();
  if (!player) return null;
  const today = new Date().toISOString().slice(0, 10);
  const data = localStorage.getItem(cotdKey(today, player.username));
  return data ? JSON.parse(data) : null;
}

export function updateCotdRecord(won: boolean, time: number | null): void {
  const player = getPlayer();
  if (!player) return;
  const today = new Date().toISOString().slice(0, 10);
  const existing = getCotdRecord();
  const record: CotdRecord = {
    bestTime: existing
      ? time !== null && (existing.bestTime === null || time < existing.bestTime)
        ? time
        : existing.bestTime
      : time,
    attempts: (existing?.attempts ?? 0) + 1,
    won: existing?.won || won,
  };
  localStorage.setItem(cotdKey(today, player.username), JSON.stringify(record));
}

export function equipTitle(titleId: string | null): void {
  const player = getPlayer();
  if (!player) return;
  if (titleId !== null && !player.unlockedTitles.includes(titleId)) return;
  player.title = titleId;
  savePlayer(player);
}

export function getMatches(): StoredMatch[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(MATCHES_KEY);
  if (!data) return [];
  const matches: StoredMatch[] = JSON.parse(data);
  // Migrate old records where losses were stored with positive eloChange
  let migrated = false;
  for (const m of matches) {
    if (!m.won && !m.draw && m.eloChange > 0) {
      m.eloChange = -m.eloChange;
      migrated = true;
    }
  }
  if (migrated) localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  return matches;
}

export function addMatch(match: StoredMatch): void {
  const matches = getMatches();
  matches.unshift(match);
  // Keep last 50 matches
  if (matches.length > 50) matches.length = 50;
  const data = JSON.stringify(matches);
  localStorage.setItem(MATCHES_KEY, data);
  // Also persist to per-user key
  const player = getPlayer();
  if (player) localStorage.setItem(matchesKey(player.username), data);
}

export function loginAsGuest(): Player {
  const adjectives = ["Swift", "Sneaky", "Glitchy", "Turbo", "Cyber", "Neon", "Pixel", "Shadow", "Hyper", "Quantum"];
  const nouns = ["Debugger", "Hacker", "Coder", "Fixer", "Runner", "Racer", "Ninja", "Ghost", "Byte", "Glitch"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  const username = `${adj}${noun}${num}`;
  return createPlayer(username);
}

export function logout(): void {
  // Per-user keys already have the latest data (savePlayer/addMatch keep them in sync).
  // Just clear the active-session slots.
  localStorage.removeItem(PLAYER_KEY);
  localStorage.removeItem(MATCHES_KEY);
}

// ─── Bug Reports ──────────────────────────────────────────────────────────────
const REPORTS_KEY = "bugracer_reports";

export interface BugReport {
  id: string;
  username: string;
  challengeTitle: string;
  reason: string;
  description: string;
  createdAt: string;
}

export function addBugReport(report: Omit<BugReport, "id" | "username">): void {
  if (typeof window === "undefined") return;
  const reports = getBugReports();
  const player = getPlayer();
  reports.unshift({
    id: Date.now().toString(36),
    username: player?.username ?? "Guest",
    ...report,
  });
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export function getBugReports(): BugReport[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(REPORTS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function deleteBugReport(id: string): void {
  if (typeof window === "undefined") return;
  const reports = getBugReports().filter((r) => r.id !== id);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

// ─── Suggestions ───────────────────────────────────────────────────────────────
const SUGGESTIONS_KEY = "bugracer_suggestions";

export interface Suggestion {
  id: string;
  username: string;
  text: string;
  createdAt: string;
}

export function addSuggestion(text: string): void {
  if (typeof window === "undefined") return;
  const suggestions = getSuggestions();
  const player = getPlayer();
  suggestions.unshift({
    id: Date.now().toString(36),
    username: player?.username ?? "Guest",
    text,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
}

export function getSuggestions(): Suggestion[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(SUGGESTIONS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function deleteSuggestion(id: string): void {
  if (typeof window === "undefined") return;
  const suggestions = getSuggestions().filter((s) => s.id !== id);
  localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
}
