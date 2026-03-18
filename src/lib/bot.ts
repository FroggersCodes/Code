/**
 * Bot opponent logic.
 * The bot simulates a player solving a challenge with difficulty-scaled timing.
 */

import { RANK_THRESHOLDS, type RankTier } from "@/types";

/** Returns the rank tier that matches the given ELO, so the bot visually mirrors the player. */
export function getBotRank(playerElo: number): RankTier {
  const tiers: RankTier[] = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Grandmaster"];
  for (const tier of tiers) {
    const { min, max } = RANK_THRESHOLDS[tier];
    if (playerElo >= min && playerElo <= max) return tier;
  }
  return "Silver";
}

export function getBotSolveDelay(playerElo: number, difficulty: number): number {
  // Base delay ranges by player ELO
  // Lower ELO players get a slower bot (easier), higher ELO get faster bot (harder)
  const eloFactor = Math.max(0.3, Math.min(1.5, playerElo / 1200));

  // Base time: 15-45 seconds depending on difficulty
  const baseTime = 15000 + difficulty * 6000;

  // Scale by ELO factor (higher ELO = faster bot)
  const scaledTime = baseTime / eloFactor;

  // Add some randomness (±30%)
  const randomFactor = 0.7 + Math.random() * 0.6;

  return Math.round(scaledTime * randomFactor);
}

export function shouldBotFail(playerElo: number): boolean {
  // Bot has a chance to "fail" on first attempt for realism
  // Higher ELO = lower chance of bot failing (bot is smarter)
  const failChance = Math.max(0.05, 0.4 - playerElo / 4000);
  return Math.random() < failChance;
}

export const BOT_PLAYER = {
  id: -1,
  username: "BugBot_9000",
  elo: 1000,
  rank: "Silver" as const,
  wins: 0,
  losses: 0,
  draws: 0,
};
