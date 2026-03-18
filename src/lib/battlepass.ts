"use client";

import { getPlayer, savePlayer } from "./storage";
import type { Player } from "@/types";

// ── Season ──────────────────────────────────────────────────────────────────
const SEASON_EPOCH = new Date("2026-03-01T00:00:00Z").getTime();
const SEASON_LENGTH_DAYS = 180;
const SEASON_LENGTH_MS = SEASON_LENGTH_DAYS * 24 * 60 * 60 * 1000;

// ── Chapter unlocks (each chapter unlocks every 60 days) ─────────────────────
// Chapter 1: day 1  (tiers 1–30)
// Chapter 2: day 61 (tiers 31–60)
// Chapter 3: day 121 (tiers 61–90)
const CHAPTER_UNLOCK_DAYS = [1, 61, 121] as const;

/** Returns how many chapters are currently unlocked (1, 2, or 3). */
export function getUnlockedChapters(): number {
  const now = Date.now();
  if (now < SEASON_EPOCH) return 1;
  const dayInSeason = Math.floor((now - SEASON_EPOCH) / (24 * 60 * 60 * 1000)) + 1;
  if (dayInSeason >= 121) return 3;
  if (dayInSeason >= 61) return 2;
  return 1;
}

/** Returns the max tier currently accessible based on chapter unlocks. */
export function getUnlockedTierCount(): number {
  return getUnlockedChapters() * 30;
}

/** Returns the calendar date when the given chapter (2 or 3) unlocks. */
export function getChapterUnlockDate(chapter: 2 | 3): Date {
  const dayOffset = CHAPTER_UNLOCK_DAYS[chapter - 1] - 1; // days after epoch
  return new Date(SEASON_EPOCH + dayOffset * 24 * 60 * 60 * 1000);
}

export function getCurrentSeasonId(): number {
  const now = Date.now();
  if (now < SEASON_EPOCH) return 0;
  return Math.floor((now - SEASON_EPOCH) / SEASON_LENGTH_MS) + 1;
}

export function getSeasonDaysLeft(): number {
  const now = Date.now();
  if (now < SEASON_EPOCH) return SEASON_LENGTH_DAYS;
  const elapsed = (now - SEASON_EPOCH) % SEASON_LENGTH_MS;
  return Math.ceil((SEASON_LENGTH_MS - elapsed) / (24 * 60 * 60 * 1000));
}

export function checkSeasonReset(player: Player): Player {
  const currentSeason = getCurrentSeasonId();
  if (player.seasonId !== currentSeason) {
    player.xp = 0;
    player.seasonId = currentSeason;
    player.claimedTiers = [];
    player.dailyMissions = [];
    player.weeklyMissions = [];
    player.missionsLastRefresh = null;
    player.weeklyMissionsLastRefresh = null;
    // Keep premiumPass, achievements, cosmetics
  }
  return player;
}

// ── Tiers ───────────────────────────────────────────────────────────────────
export const TOTAL_TIERS = 90;

/** First tier of each new chapter — a divider appears in the UI before these tiers */
export const CHAPTER_BREAKPOINTS: number[] = [31, 61];

export type RewardType = "title" | "avatar" | "border" | "coins" | "xp_boost" | "name_color" | "profile_effect";

export interface TierReward {
  type: RewardType;
  id: string;
  name: string;
  amount?: number; // for coins (count) or xp_boost (hours)
}

export interface BattlePassTier {
  tier: number;
  xpRequired: number; // cumulative XP needed to reach this tier
  freeReward: TierReward | null;
  premiumReward: TierReward | null;
}

// XP per tier: starts at 100, increases by 50 each tier
function xpForTier(tier: number): number {
  return 100 + (tier - 1) * 50;
}

function cumulativeXpForTier(tier: number): number {
  // Sum of 100 + 150 + 200 + ... + (100 + (tier-1)*50)
  // = tier*100 + 50*(tier-1)*tier/2
  return tier * 100 + 50 * (tier - 1) * tier / 2;
}

/** Returns the season-specific title ID for tier 30 */
const SEASON_NAMES: Record<number, string> = {
  1: "Alpha",
};

export function getSeasonName(id?: number): string {
  const s = id ?? getCurrentSeasonId();
  return SEASON_NAMES[s] ?? `Season ${s}`;
}

export function getSeasonTitleId(): string {
  const s = getCurrentSeasonId();
  return `bp_s${s}_champion`;
}

export function getSeasonTitleLabel(): string {
  return `${getSeasonName()} Champion`;
}

const TIER_REWARDS: BattlePassTier[] = (() => {
  const tiers: BattlePassTier[] = [];

  const freeRewards: (TierReward | null)[] = [
    // Tier 1: 50 coins
    { type: "coins", id: "coins_50", name: "50 Coins", amount: 50 },
    // Tier 2: --
    null,
    // Tier 3: Border
    { type: "border", id: "red_circuit", name: "Red Circuit" },
    // Tier 4: 50 coins
    { type: "coins", id: "coins_50", name: "50 Coins", amount: 50 },
    // Tier 5: Avatar
    { type: "avatar", id: "samurai", name: "Samurai" },
    // Tier 6: --
    null,
    // Tier 7: Border
    { type: "border", id: "green_terminal", name: "Green Terminal" },
    // Tier 8: 75 coins
    { type: "coins", id: "coins_75", name: "75 Coins", amount: 75 },
    // Tier 9: --
    null,
    // Tier 10: XP Boost
    { type: "xp_boost", id: "xpb_12", name: "2x XP (12h)", amount: 12 },
    // Tier 11: Avatar
    { type: "avatar", id: "wizard", name: "Wizard" },
    // Tier 12: 50 coins
    { type: "coins", id: "coins_50", name: "50 Coins", amount: 50 },
    // Tier 13: Border
    { type: "border", id: "blue_neon", name: "Blue Neon" },
    // Tier 14: --
    null,
    // Tier 15: 100 coins
    { type: "coins", id: "coins_100", name: "100 Coins", amount: 100 },
    // Tier 16: --
    null,
    // Tier 17: 75 coins
    { type: "coins", id: "coins_75", name: "75 Coins", amount: 75 },
    // Tier 18: --
    null,
    // Tier 19: Border
    { type: "border", id: "gold_frame", name: "Gold Frame" },
    // Tier 20: XP Boost
    { type: "xp_boost", id: "xpb_12", name: "2x XP (12h)", amount: 12 },
    // Tier 21: 100 coins
    { type: "coins", id: "coins_100", name: "100 Coins", amount: 100 },
    // Tier 22: --
    null,
    // Tier 23: 75 coins
    { type: "coins", id: "coins_75", name: "75 Coins", amount: 75 },
    // Tier 24: --
    null,
    // Tier 25: 150 coins
    { type: "coins", id: "coins_150", name: "150 Coins", amount: 150 },
    // Tier 26: --
    null,
    // Tier 27: 100 coins
    { type: "coins", id: "coins_100", name: "100 Coins", amount: 100 },
    // Tier 28: --
    null,
    // Tier 29: 150 coins
    { type: "coins", id: "coins_150", name: "150 Coins", amount: 150 },
    // Tier 30: 200 coins
    { type: "coins", id: "coins_200", name: "200 Coins", amount: 200 },
    // ── Chapter 2: Alpha Ascendant (Tiers 31–60) ──────────────────────────
    // Tier 31: 100 coins
    { type: "coins", id: "coins_100", name: "100 Coins", amount: 100 },
    // Tier 32: --
    null,
    // Tier 33: Border — Storm Surge
    { type: "border", id: "storm_surge", name: "Storm Surge" },
    // Tier 34: 100 coins
    { type: "coins", id: "coins_100", name: "100 Coins", amount: 100 },
    // Tier 35: 150 coins
    { type: "coins", id: "coins_150", name: "150 Coins", amount: 150 },
    // Tier 36: --
    null,
    // Tier 37: 125 coins
    { type: "coins", id: "coins_125", name: "125 Coins", amount: 125 },
    // Tier 38: Avatar — Phantom
    { type: "avatar", id: "phantom", name: "Phantom" },
    // Tier 39: XP Boost (12h)
    { type: "xp_boost", id: "xpb_12", name: "2x XP (12h)", amount: 12 },
    // Tier 40: 200 coins
    { type: "coins", id: "coins_200", name: "200 Coins", amount: 200 },
    // Tier 41: 100 coins
    { type: "coins", id: "coins_100", name: "100 Coins", amount: 100 },
    // Tier 42: --
    null,
    // Tier 43: XP Boost (12h)
    { type: "xp_boost", id: "xpb_12", name: "2x XP (12h)", amount: 12 },
    // Tier 44: Border — Solar Flare
    { type: "border", id: "solar_flare", name: "Solar Flare" },
    // Tier 45: 150 coins
    { type: "coins", id: "coins_150", name: "150 Coins", amount: 150 },
    // Tier 46: --
    null,
    // Tier 47: 150 coins
    { type: "coins", id: "coins_150", name: "150 Coins", amount: 150 },
    // Tier 48: Avatar — Dragon
    { type: "avatar", id: "dragon", name: "Dragon" },
    // Tier 49: XP Boost (24h)
    { type: "xp_boost", id: "xpb_24", name: "2x XP (24h)", amount: 24 },
    // Tier 50: 300 coins
    { type: "coins", id: "coins_300", name: "300 Coins", amount: 300 },
    // Tier 51: 150 coins
    { type: "coins", id: "coins_150", name: "150 Coins", amount: 150 },
    // Tier 52: Border — Cyber Wave
    { type: "border", id: "cyber_wave", name: "Cyber Wave" },
    // Tier 53: 200 coins
    { type: "coins", id: "coins_200", name: "200 Coins", amount: 200 },
    // Tier 54: --
    null,
    // Tier 55: XP Boost (24h)
    { type: "xp_boost", id: "xpb_24", name: "2x XP (24h)", amount: 24 },
    // Tier 56: --
    null,
    // Tier 57: 200 coins
    { type: "coins", id: "coins_200", name: "200 Coins", amount: 200 },
    // Tier 58: --
    null,
    // Tier 59: 250 coins
    { type: "coins", id: "coins_250", name: "250 Coins", amount: 250 },
    // Tier 60: 500 coins (chapter 2 capstone)
    { type: "coins", id: "coins_500", name: "500 Coins", amount: 500 },
    // ── Chapter 3: Alpha Apex (Tiers 61–90) ───────────────────────────────
    // Tier 61: 200 coins
    { type: "coins", id: "coins_200", name: "200 Coins", amount: 200 },
    // Tier 62: Border — Void Storm
    { type: "border", id: "void_storm", name: "Void Storm" },
    // Tier 63: XP Boost (24h)
    { type: "xp_boost", id: "xpb_24", name: "2x XP (24h)", amount: 24 },
    // Tier 64: 250 coins
    { type: "coins", id: "coins_250", name: "250 Coins", amount: 250 },
    // Tier 65: 200 coins
    { type: "coins", id: "coins_200", name: "200 Coins", amount: 200 },
    // Tier 66: Avatar — Cyber Knight
    { type: "avatar", id: "cyber_knight", name: "Cyber Knight" },
    // Tier 67: 250 coins
    { type: "coins", id: "coins_250", name: "250 Coins", amount: 250 },
    // Tier 68: Border — Aurora Edge
    { type: "border", id: "aurora_edge", name: "Aurora Edge" },
    // Tier 69: XP Boost (24h)
    { type: "xp_boost", id: "xpb_24", name: "2x XP (24h)", amount: 24 },
    // Tier 70: 350 coins
    { type: "coins", id: "coins_350", name: "350 Coins", amount: 350 },
    // Tier 71: 250 coins
    { type: "coins", id: "coins_250", name: "250 Coins", amount: 250 },
    // Tier 72: Border — Neon Burst
    { type: "border", id: "neon_burst", name: "Neon Burst" },
    // Tier 73: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 74: Avatar — Void Phantom
    { type: "avatar", id: "void_phantom", name: "Void Phantom" },
    // Tier 75: 400 coins
    { type: "coins", id: "coins_400", name: "400 Coins", amount: 400 },
    // Tier 76: Border — Phantom Glow
    { type: "border", id: "phantom_glow", name: "Phantom Glow" },
    // Tier 77: 300 coins
    { type: "coins", id: "coins_300", name: "300 Coins", amount: 300 },
    // Tier 78: Border — Solar Corona
    { type: "border", id: "solar_corona", name: "Solar Corona" },
    // Tier 79: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 80: 500 coins
    { type: "coins", id: "coins_500", name: "500 Coins", amount: 500 },
    // Tier 81: 300 coins
    { type: "coins", id: "coins_300", name: "300 Coins", amount: 300 },
    // Tier 82: Avatar — Specter
    { type: "avatar", id: "specter", name: "Specter" },
    // Tier 83: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 84: Border — Quantum Rift
    { type: "border", id: "quantum_rift", name: "Quantum Rift" },
    // Tier 85: 400 coins
    { type: "coins", id: "coins_400", name: "400 Coins", amount: 400 },
    // Tier 86: Profile Effect — Aurora
    { type: "profile_effect", id: "pe_aurora", name: "Aurora" },
    // Tier 87: 500 coins
    { type: "coins", id: "coins_500", name: "500 Coins", amount: 500 },
    // Tier 88: Border — Eclipse
    { type: "border", id: "eclipse", name: "Eclipse" },
    // Tier 89: 600 coins
    { type: "coins", id: "coins_600", name: "600 Coins", amount: 600 },
    // Tier 90: 1000 coins (chapter 3 free capstone)
    { type: "coins", id: "coins_1000", name: "1000 Coins", amount: 1000 },
  ];

  const premiumRewards: (TierReward | null)[] = [
    // Tier 1: Name Color
    { type: "name_color", id: "nc_crimson", name: "Crimson" },
    // Tier 2: 75 coins
    { type: "coins", id: "coins_75", name: "75 Coins", amount: 75 },
    // Tier 3: XP Boost
    { type: "xp_boost", id: "xpb_24", name: "2x XP (24h)", amount: 24 },
    // Tier 4: Avatar → replaced with 150 coins
    { type: "coins", id: "coins_150", name: "150 Coins", amount: 150 },
    // Tier 5: 100 coins
    { type: "coins", id: "coins_100", name: "100 Coins", amount: 100 },
    // Tier 6: Name Color
    { type: "name_color", id: "nc_cyan", name: "Cyan Pulse" },
    // Tier 7: 75 coins
    { type: "coins", id: "coins_75", name: "75 Coins", amount: 75 },
    // Tier 8: Border
    { type: "border", id: "plasma_ring", name: "Plasma Ring" },
    // Tier 9: XP Boost
    { type: "xp_boost", id: "xpb_24", name: "2x XP (24h)", amount: 24 },
    // Tier 10: XP Boost (replaces removed avatar)
    { type: "xp_boost", id: "xpb_24", name: "2x XP (24h)", amount: 24 },
    // Tier 11: 100 coins
    { type: "coins", id: "coins_100", name: "100 Coins", amount: 100 },
    // Tier 12: Border
    { type: "border", id: "void_aura", name: "Void Aura" },
    // Tier 13: Profile Effect
    { type: "profile_effect", id: "pe_scanlines", name: "Scanlines" },
    // Tier 14: 100 coins
    { type: "coins", id: "coins_100", name: "100 Coins", amount: 100 },
    // Tier 15: Border
    { type: "border", id: "fire_ring", name: "Fire Ring" },
    // Tier 16: XP Boost
    { type: "xp_boost", id: "xpb_24", name: "2x XP (24h)", amount: 24 },
    // Tier 17: 150 coins
    { type: "coins", id: "coins_150", name: "150 Coins", amount: 150 },
    // Tier 18: Border
    { type: "border", id: "diamond_shimmer", name: "Diamond Shimmer" },
    // Tier 19: Profile Effect
    { type: "profile_effect", id: "pe_matrix", name: "Matrix Rain" },
    // Tier 20: Border
    { type: "border", id: "rainbow_pulse", name: "Rainbow Pulse" },
    // Tier 21: 150 coins
    { type: "coins", id: "coins_150", name: "150 Coins", amount: 150 },
    // Tier 22: XP Boost
    { type: "xp_boost", id: "xpb_24", name: "2x XP (24h)", amount: 24 },
    // Tier 23: 200 coins
    { type: "coins", id: "coins_200", name: "200 Coins", amount: 200 },
    // Tier 24: Profile Effect
    { type: "profile_effect", id: "pe_neon_grid", name: "Neon Grid" },
    // Tier 25: Border
    { type: "border", id: "gold_frame", name: "Gold Frame" },
    // Tier 26: 200 coins
    { type: "coins", id: "coins_200", name: "200 Coins", amount: 200 },
    // Tier 27: XP Boost (48h!)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 28: 250 coins
    { type: "coins", id: "coins_250", name: "250 Coins", amount: 250 },
    // Tier 29: Profile Effect
    { type: "profile_effect", id: "pe_particles", name: "Particle Field" },
    // Tier 30: Season Title (unique per season) — handled dynamically below
    null,
    // ── Chapter 2: Alpha Ascendant (Tiers 31–60) ──────────────────────────
    // Tier 31: Name Color — Gold
    { type: "name_color", id: "nc_gold", name: "Gold" },
    // Tier 32: 150 coins
    { type: "coins", id: "coins_150", name: "150 Coins", amount: 150 },
    // Tier 33: XP Boost (24h)
    { type: "xp_boost", id: "xpb_24", name: "2x XP (24h)", amount: 24 },
    // Tier 34: 200 coins
    { type: "coins", id: "coins_200", name: "200 Coins", amount: 200 },
    // Tier 35: Name Color — Neon Green
    { type: "name_color", id: "nc_neon_green", name: "Neon Green" },
    // Tier 36: 150 coins
    { type: "coins", id: "coins_150", name: "150 Coins", amount: 150 },
    // Tier 37: XP Boost (24h)
    { type: "xp_boost", id: "xpb_24", name: "2x XP (24h)", amount: 24 },
    // Tier 38: 200 coins
    { type: "coins", id: "coins_200", name: "200 Coins", amount: 200 },
    // Tier 39: XP Boost (24h)
    { type: "xp_boost", id: "xpb_24", name: "2x XP (24h)", amount: 24 },
    // Tier 40: Border — Nebula Drift
    { type: "border", id: "nebula_drift", name: "Nebula Drift" },
    // Tier 41: 200 coins
    { type: "coins", id: "coins_200", name: "200 Coins", amount: 200 },
    // Tier 42: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 43: 250 coins
    { type: "coins", id: "coins_250", name: "250 Coins", amount: 250 },
    // Tier 44: Profile Effect — Glitch Storm
    { type: "profile_effect", id: "pe_glitch", name: "Glitch Storm" },
    // Tier 45: 250 coins
    { type: "coins", id: "coins_250", name: "250 Coins", amount: 250 },
    // Tier 46: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 47: 300 coins
    { type: "coins", id: "coins_300", name: "300 Coins", amount: 300 },
    // Tier 48: Border — Prismatic Edge
    { type: "border", id: "prismatic_edge", name: "Prismatic Edge" },
    // Tier 49: Name Color — Violet
    { type: "name_color", id: "nc_violet", name: "Violet" },
    // Tier 50: 400 coins
    { type: "coins", id: "coins_400", name: "400 Coins", amount: 400 },
    // Tier 51: 300 coins
    { type: "coins", id: "coins_300", name: "300 Coins", amount: 300 },
    // Tier 52: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 53: 350 coins
    { type: "coins", id: "coins_350", name: "350 Coins", amount: 350 },
    // Tier 54: Border — Cosmic Ring
    { type: "border", id: "cosmic_ring", name: "Cosmic Ring" },
    // Tier 55: 350 coins
    { type: "coins", id: "coins_350", name: "350 Coins", amount: 350 },
    // Tier 56: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 57: 400 coins
    { type: "coins", id: "coins_400", name: "400 Coins", amount: 400 },
    // Tier 58: 400 coins
    { type: "coins", id: "coins_400", name: "400 Coins", amount: 400 },
    // Tier 59: 500 coins
    { type: "coins", id: "coins_500", name: "500 Coins", amount: 500 },
    // Tier 60: 1000 coins (chapter 2 premium capstone — Alpha Legend moves to tier 90)
    { type: "coins", id: "coins_1000", name: "1000 Coins", amount: 1000 },
    // ── Chapter 3: Alpha Apex Premium (Tiers 61–90) ───────────────────────
    // Tier 61: 350 coins
    { type: "coins", id: "coins_350", name: "350 Coins", amount: 350 },
    // Tier 62: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 63: Border — Void Blaze
    { type: "border", id: "void_blaze", name: "Void Blaze" },
    // Tier 64: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 65: Name Color — Rose
    { type: "name_color", id: "nc_rose", name: "Rose" },
    // Tier 66: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 67: 500 coins
    { type: "coins", id: "coins_500", name: "500 Coins", amount: 500 },
    // Tier 68: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 69: Profile Effect — Glitch Storm
    { type: "profile_effect", id: "pe_glitch", name: "Glitch Storm" },
    // Tier 70: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 71: Name Color — Orange
    { type: "name_color", id: "nc_orange", name: "Orange" },
    // Tier 72: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 73: 600 coins
    { type: "coins", id: "coins_600", name: "600 Coins", amount: 600 },
    // Tier 74: 500 coins
    { type: "coins", id: "coins_500", name: "500 Coins", amount: 500 },
    // Tier 75: Profile Effect — Aurora
    { type: "profile_effect", id: "pe_aurora", name: "Aurora" },
    // Tier 76: 700 coins
    { type: "coins", id: "coins_700", name: "700 Coins", amount: 700 },
    // Tier 77: Border — Solar Corona
    { type: "border", id: "solar_corona", name: "Solar Corona" },
    // Tier 78: 750 coins
    { type: "coins", id: "coins_750", name: "750 Coins", amount: 750 },
    // Tier 79: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 80: 1000 coins
    { type: "coins", id: "coins_1000", name: "1000 Coins", amount: 1000 },
    // Tier 81: Name Color — White
    { type: "name_color", id: "nc_white", name: "Pure White" },
    // Tier 82: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 83: Profile Effect — Storm
    { type: "profile_effect", id: "pe_storm", name: "Storm" },
    // Tier 84: 700 coins
    { type: "coins", id: "coins_700", name: "700 Coins", amount: 700 },
    // Tier 85: XP Boost (48h)
    { type: "xp_boost", id: "xpb_48", name: "2x XP (48h)", amount: 48 },
    // Tier 86: Border — Quantum Rift
    { type: "border", id: "quantum_rift", name: "Quantum Rift" },
    // Tier 87: Profile Effect — Void Pulse
    { type: "profile_effect", id: "pe_void_pulse", name: "Void Pulse" },
    // Tier 88: 1000 coins
    { type: "coins", id: "coins_1000", name: "1000 Coins", amount: 1000 },
    // Tier 89: 1500 coins
    { type: "coins", id: "coins_1500", name: "1500 Coins", amount: 1500 },
    // Tier 90: Alpha Legend title — handled dynamically below
    null,
  ];

  for (let i = 0; i < TOTAL_TIERS; i++) {
    let premReward = premiumRewards[i] ?? null;
    // Tier 30 premium = season-unique champion title (chapter 1 capstone)
    if (i === 29 && !premReward) {
      premReward = { type: "title", id: getSeasonTitleId(), name: getSeasonTitleLabel() };
    }
    // Tier 90 premium = Alpha Legend title (chapter 3 capstone, season 1 exclusive)
    if (i === TOTAL_TIERS - 1 && !premReward) {
      premReward = { type: "title", id: "alpha_legend", name: "Alpha Legend" };
    }
    tiers.push({
      tier: i + 1,
      xpRequired: cumulativeXpForTier(i + 1),
      freeReward: freeRewards[i] ?? null,
      premiumReward: premReward,
    });
  }

  return tiers;
})();

export function getTierRewards(): BattlePassTier[] {
  return TIER_REWARDS;
}

export function getCurrentTier(xp: number): number {
  for (let i = TOTAL_TIERS - 1; i >= 0; i--) {
    if (xp >= TIER_REWARDS[i].xpRequired) return i + 1;
  }
  return 0;
}

export function getXPForNextTier(xp: number): { current: number; needed: number; tierXP: number } {
  const tier = getCurrentTier(xp);
  if (tier >= TOTAL_TIERS) return { current: 0, needed: 0, tierXP: 0 };
  const prevCumulative = tier > 0 ? TIER_REWARDS[tier - 1].xpRequired : 0;
  const nextCumulative = TIER_REWARDS[tier].xpRequired;
  const tierXP = nextCumulative - prevCumulative;
  const current = xp - prevCumulative;
  return { current, needed: tierXP - current, tierXP };
}

// ── XP Granting ─────────────────────────────────────────────────────────────
export interface XPBreakdown {
  base: number;
  streakBonus: number;
  speedBonus: number;
  total: number;
  source: string;
}

export function calculateMatchXP(
  won: boolean,
  draw: boolean,
  isVsBot: boolean,
  playerTime: number | null,
  winStreak: number,
  isCotd?: boolean,
  xpBoosted?: boolean,
): XPBreakdown {
  let base = 0;
  if (isCotd && won) {
    base = 30;
  } else if (won) {
    base = isVsBot ? 40 : 60;
  } else if (draw) {
    base = 20;
  } else {
    base = 15;
  }

  const streakBonus = won ? Math.min(winStreak * 10, 50) : 0;
  const speedBonus = won && playerTime !== null && playerTime < 30000 ? 15 : 0;
  let total = base + streakBonus + speedBonus;

  // 2x XP boost doubles everything
  if (xpBoosted) total *= 2;

  return {
    base,
    streakBonus,
    speedBonus,
    total,
    source: isCotd ? "cotd" : isVsBot ? "bot" : "online",
  };
}

export function grantXP(amount: number): { newXP: number; previousTier: number; newTier: number } {
  const player = getPlayer();
  if (!player) return { newXP: 0, previousTier: 0, newTier: 0 };

  const previousTier = getCurrentTier(player.xp);
  player.xp += amount;
  const newTier = getCurrentTier(player.xp);

  // Auto-unlock rewards for tiers that were crossed
  for (let t = previousTier + 1; t <= newTier; t++) {
    unlockTierRewards(player, t);
  }

  savePlayer(player);
  return { newXP: player.xp, previousTier, newTier };
}

function unlockTierRewards(player: Player, tier: number): void {
  const tierData = TIER_REWARDS[tier - 1];
  if (!tierData) return;

  // Free reward
  if (tierData.freeReward) {
    unlockReward(player, tierData.freeReward);
  }

  // Premium reward
  if (tierData.premiumReward && player.premiumPass) {
    unlockReward(player, tierData.premiumReward);
  }
}

function unlockReward(player: Player, reward: TierReward): void {
  switch (reward.type) {
    case "title":
      if (!player.unlockedTitles.includes(reward.id)) {
        player.unlockedTitles.push(reward.id);
      }
      break;
    case "avatar":
      if (!(player.unlockedAvatars ?? []).includes(reward.id)) {
        player.unlockedAvatars = [...(player.unlockedAvatars ?? []), reward.id];
      }
      break;
    case "border":
      if (!player.unlockedBorders.includes(reward.id)) {
        player.unlockedBorders.push(reward.id);
      }
      break;
    case "coins":
      player.coins = (player.coins ?? 0) + (reward.amount ?? 0);
      break;
    case "xp_boost": {
      const hours = reward.amount ?? 12;
      const boostEnd = Date.now() + hours * 60 * 60 * 1000;
      // Extend existing boost or set new one
      player.xpBoostUntil = player.xpBoostUntil && player.xpBoostUntil > Date.now()
        ? player.xpBoostUntil + hours * 60 * 60 * 1000
        : boostEnd;
      break;
    }
    case "name_color":
      if (!player.unlockedNameColors.includes(reward.id)) {
        player.unlockedNameColors.push(reward.id);
      }
      break;
    case "profile_effect":
      if (!player.unlockedProfileEffects.includes(reward.id)) {
        player.unlockedProfileEffects.push(reward.id);
      }
      break;
  }
}

/** Check if the player currently has an active XP boost */
export function hasActiveXPBoost(player: Player): boolean {
  return !!player.xpBoostUntil && player.xpBoostUntil > Date.now();
}

/** Called when premium pass is purchased — retroactively unlock premium rewards for already-reached tiers */
export function unlockPremiumPass(): void {
  const player = getPlayer();
  if (!player) return;
  player.premiumPass = true;

  const currentTier = getCurrentTier(player.xp);
  for (let t = 1; t <= currentTier; t++) {
    const tierData = TIER_REWARDS[t - 1];
    if (tierData?.premiumReward) {
      unlockReward(player, tierData.premiumReward);
    }
  }

  savePlayer(player);
}

/**
 * Retroactively grants any battle pass rewards (free + premium) the player
 * has earned but not yet received — e.g. when rewards were added after XP
 * was already gained, or when XP was set outside of grantXP.
 */
export function reconcileBattlePassRewards(): void {
  const player = getPlayer();
  if (!player) return;

  const currentTier = getCurrentTier(player.xp);
  if (currentTier === 0) return;

  const before = JSON.stringify({
    unlockedTitles: player.unlockedTitles,
    unlockedBorders: player.unlockedBorders,
    unlockedAvatars: player.unlockedAvatars,
    unlockedNameColors: player.unlockedNameColors,
    unlockedProfileEffects: player.unlockedProfileEffects,
    coins: player.coins,
  });

  for (let t = 1; t <= currentTier; t++) {
    const tierData = TIER_REWARDS[t - 1];
    if (!tierData) continue;
    if (tierData.freeReward) unlockReward(player, tierData.freeReward);
    if (tierData.premiumReward && player.premiumPass) {
      unlockReward(player, tierData.premiumReward);
    }
  }

  const after = JSON.stringify({
    unlockedTitles: player.unlockedTitles,
    unlockedBorders: player.unlockedBorders,
    unlockedAvatars: player.unlockedAvatars,
    unlockedNameColors: player.unlockedNameColors,
    unlockedProfileEffects: player.unlockedProfileEffects,
    coins: player.coins,
  });

  if (before !== after) savePlayer(player);
}
