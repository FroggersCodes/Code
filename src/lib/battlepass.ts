"use client";

import { getPlayer, savePlayer } from "./storage";
import type { Player } from "@/types";

// ── Season ──────────────────────────────────────────────────────────────────
const SEASON_EPOCH = new Date("2026-03-01T00:00:00Z").getTime();
const SEASON_LENGTH_DAYS = 183;
const SEASON_LENGTH_MS = SEASON_LENGTH_DAYS * 24 * 60 * 60 * 1000;

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
export const TOTAL_TIERS = 30;

export type RewardType = "title" | "avatar" | "border";

export interface TierReward {
  type: RewardType;
  id: string;
  name: string;
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

const TIER_REWARDS: BattlePassTier[] = (() => {
  const tiers: BattlePassTier[] = [];

  const freeRewards: (TierReward | null)[] = [
    // Tier 1-5
    { type: "title", id: "bp_rookie", name: "Rookie" },
    null,
    { type: "border", id: "red_circuit", name: "Red Circuit" },
    null,
    { type: "avatar", id: "samurai", name: "Samurai" },
    // Tier 6-10
    null,
    { type: "border", id: "green_terminal", name: "Green Terminal" },
    null,
    { type: "title", id: "bp_grinder", name: "Grinder" },
    null,
    // Tier 11-15
    { type: "avatar", id: "wizard", name: "Wizard" },
    null,
    { type: "border", id: "blue_neon", name: "Blue Neon" },
    null,
    { type: "title", id: "bp_dedicated", name: "Dedicated" },
    // Tier 16-20
    null, null, null, null, null,
    // Tier 21-25
    null, null, null, null, null,
    // Tier 26-30
    null, null, null, null,
    { type: "title", id: "bp_season_free", name: "Season Survivor" },
  ];

  const premiumRewards: (TierReward | null)[] = [
    // Tier 1-5
    null,
    { type: "avatar", id: "demon", name: "Demon" },
    null,
    { type: "border", id: "plasma_ring", name: "Plasma Ring" },
    null,
    // Tier 6-10
    { type: "title", id: "bp_elite", name: "Elite" },
    null,
    { type: "border", id: "void_aura", name: "Void Aura" },
    null,
    { type: "avatar", id: "angel", name: "Angel" },
    // Tier 11-15
    null,
    { type: "border", id: "fire_ring", name: "Fire Ring" },
    null,
    { type: "title", id: "bp_apex", name: "Apex Predator" },
    null,
    // Tier 16-20
    { type: "border", id: "diamond_shimmer", name: "Diamond Shimmer" },
    null, null, null,
    { type: "border", id: "rainbow_pulse", name: "Rainbow Pulse" },
    // Tier 21-25
    null, null, null, null,
    { type: "border", id: "cyber_grid", name: "Cyber Grid" },
    // Tier 26-30
    null, null, null, null,
    { type: "title", id: "bp_season_victor", name: "Season Victor" },
  ];

  for (let i = 0; i < TOTAL_TIERS; i++) {
    tiers.push({
      tier: i + 1,
      xpRequired: cumulativeXpForTier(i + 1),
      freeReward: freeRewards[i] ?? null,
      premiumReward: premiumRewards[i] ?? null,
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

  return {
    base,
    streakBonus,
    speedBonus,
    total: base + streakBonus + speedBonus,
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
  }
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
