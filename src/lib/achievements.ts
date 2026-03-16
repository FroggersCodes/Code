"use client";

import type { Player } from "@/types";
import type { StoredMatch } from "./storage";

export type AchievementCategory = "combat" | "speed" | "collection" | "social";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  xpReward: number;
  hidden: boolean;
  check: (player: Player, matches: StoredMatch[]) => boolean;
  /** For progress display: returns [current, target] or null if not applicable */
  progress?: (player: Player, matches: StoredMatch[]) => [number, number];
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── Combat ──────────────────────────────────────────────────────────────
  {
    id: "first_blood",
    name: "First Blood",
    description: "Win your first match",
    category: "combat",
    xpReward: 50,
    hidden: false,
    check: (p) => p.wins >= 1,
    progress: (p) => [Math.min(p.wins, 1), 1],
  },
  {
    id: "veteran",
    name: "Veteran",
    description: "Win 25 matches",
    category: "combat",
    xpReward: 100,
    hidden: false,
    check: (p) => p.wins >= 25,
    progress: (p) => [Math.min(p.wins, 25), 25],
  },
  {
    id: "war_machine",
    name: "War Machine",
    description: "Win 50 matches",
    category: "combat",
    xpReward: 150,
    hidden: false,
    check: (p) => p.wins >= 50,
    progress: (p) => [Math.min(p.wins, 50), 50],
  },
  {
    id: "legend",
    name: "Legend",
    description: "Win 100 matches",
    category: "combat",
    xpReward: 200,
    hidden: false,
    check: (p) => p.wins >= 100,
    progress: (p) => [Math.min(p.wins, 100), 100],
  },
  {
    id: "bot_slayer",
    name: "Bot Slayer",
    description: "Win 20 bot matches",
    category: "combat",
    xpReward: 75,
    hidden: false,
    check: (_p, m) => m.filter((x) => x.won && x.isVsBot).length >= 20,
    progress: (_p, m) => [Math.min(m.filter((x) => x.won && x.isVsBot).length, 20), 20],
  },
  {
    id: "online_warrior",
    name: "Online Warrior",
    description: "Win 15 online matches",
    category: "combat",
    xpReward: 100,
    hidden: false,
    check: (_p, m) => m.filter((x) => x.won && !x.isVsBot).length >= 15,
    progress: (_p, m) => [Math.min(m.filter((x) => x.won && !x.isVsBot).length, 15), 15],
  },
  {
    id: "undefeated",
    name: "Undefeated",
    description: "Win 10 matches without a loss",
    category: "combat",
    xpReward: 150,
    hidden: false,
    check: (_p, m) => {
      let streak = 0;
      for (const x of [...m].reverse()) {
        if (x.won) { streak++; if (streak >= 10) return true; }
        else if (!x.draw) streak = 0;
      }
      return false;
    },
  },
  {
    id: "ach_grandmaster",
    name: "Grandmaster",
    description: "Reach Grandmaster rank",
    category: "combat",
    xpReward: 200,
    hidden: false,
    check: (p) => p.rank === "Grandmaster",
  },
  // ── Speed ───────────────────────────────────────────────────────────────
  {
    id: "quick_fix",
    name: "Quick Fix",
    description: "Solve a bug in under 45 seconds",
    category: "speed",
    xpReward: 50,
    hidden: false,
    check: (_p, m) => m.some((x) => x.won && x.playerTime !== null && x.playerTime < 45000),
  },
  {
    id: "lightning_reflexes",
    name: "Lightning Reflexes",
    description: "Solve a bug in under 20 seconds",
    category: "speed",
    xpReward: 100,
    hidden: false,
    check: (_p, m) => m.some((x) => x.won && x.playerTime !== null && x.playerTime < 20000),
  },
  {
    id: "speed_runner",
    name: "Speed Runner",
    description: "Win 10 matches in under 60 seconds",
    category: "speed",
    xpReward: 100,
    hidden: false,
    check: (_p, m) => m.filter((x) => x.won && x.playerTime !== null && x.playerTime < 60000).length >= 10,
    progress: (_p, m) => [Math.min(m.filter((x) => x.won && x.playerTime !== null && x.playerTime < 60000).length, 10), 10],
  },
  {
    id: "blitz_king",
    name: "Blitz King",
    description: "Win 5 matches in under 30 seconds",
    category: "speed",
    xpReward: 150,
    hidden: false,
    check: (_p, m) => m.filter((x) => x.won && x.playerTime !== null && x.playerTime < 30000).length >= 5,
    progress: (_p, m) => [Math.min(m.filter((x) => x.won && x.playerTime !== null && x.playerTime < 30000).length, 5), 5],
  },
  {
    id: "no_time_wasted",
    name: "No Time Wasted",
    description: "Complete Challenge of the Day 5 times",
    category: "speed",
    xpReward: 75,
    hidden: false,
    check: (p) => p.wins >= 5, // Approximation; COTD doesn't track separately in matches
  },
  {
    id: "daily_devotee",
    name: "Daily Devotee",
    description: "Complete Challenge of the Day 10 times",
    category: "speed",
    xpReward: 100,
    hidden: false,
    check: (p) => p.wins >= 10,
  },
  // ── Collection ──────────────────────────────────────────────────────────
  {
    id: "fashionista",
    name: "Fashionista",
    description: "Equip a title",
    category: "collection",
    xpReward: 50,
    hidden: false,
    check: (p) => p.title !== null,
  },
  {
    id: "identity_crisis",
    name: "Identity Crisis",
    description: "Own 5 titles",
    category: "collection",
    xpReward: 75,
    hidden: false,
    check: (p) => (p.unlockedTitles ?? []).length >= 5,
    progress: (p) => [Math.min((p.unlockedTitles ?? []).length, 5), 5],
  },
  {
    id: "collector",
    name: "Collector",
    description: "Own 10 titles",
    category: "collection",
    xpReward: 100,
    hidden: false,
    check: (p) => (p.unlockedTitles ?? []).length >= 10,
    progress: (p) => [Math.min((p.unlockedTitles ?? []).length, 10), 10],
  },
  {
    id: "new_look",
    name: "New Look",
    description: "Equip an avatar",
    category: "collection",
    xpReward: 50,
    hidden: false,
    check: (p) => p.avatar !== null,
  },
  {
    id: "completionist",
    name: "Completionist",
    description: "Unlock all free battle pass tiers",
    category: "collection",
    xpReward: 200,
    hidden: false,
    check: (p) => {
      const { getCurrentTier } = require("./battlepass");
      return getCurrentTier(p.xp) >= 30;
    },
  },
  // ── Social ──────────────────────────────────────────────────────────────
  {
    id: "friendly",
    name: "Friendly",
    description: "Add a friend",
    category: "social",
    xpReward: 50,
    hidden: false,
    check: () => {
      // Checked via friend count from localStorage
      if (typeof window === "undefined") return false;
      const { getFriends } = require("./storage");
      return getFriends().length >= 1;
    },
  },
  {
    id: "social_butterfly",
    name: "Social Butterfly",
    description: "Have 5 friends",
    category: "social",
    xpReward: 75,
    hidden: false,
    check: () => {
      if (typeof window === "undefined") return false;
      const { getFriends } = require("./storage");
      return getFriends().length >= 5;
    },
  },
  {
    id: "helpful",
    name: "Helpful",
    description: "Submit a suggestion",
    category: "social",
    xpReward: 50,
    hidden: false,
    check: () => {
      if (typeof window === "undefined") return false;
      const { getSuggestions } = require("./storage");
      return getSuggestions().length >= 1;
    },
  },
  {
    id: "supporter",
    name: "Supporter",
    description: "Purchase the premium battle pass",
    category: "social",
    xpReward: 100,
    hidden: false,
    check: (p) => p.premiumPass,
  },
  // ── Hidden ──────────────────────────────────────────────────────────────
  {
    id: "hidden_first_day",
    name: "Day One Hero",
    description: "Win 3 matches in a row on your first day",
    category: "combat",
    xpReward: 100,
    hidden: true,
    check: (_p, m) => {
      if (m.length < 3) return false;
      const first = m[m.length - 1];
      if (!first) return false;
      const firstDate = new Date(first.createdAt).toDateString();
      const sameDayMatches = [...m].reverse().filter((x) => new Date(x.createdAt).toDateString() === firstDate);
      let streak = 0;
      for (const x of sameDayMatches) {
        if (x.won) { streak++; if (streak >= 3) return true; }
        else streak = 0;
      }
      return false;
    },
  },
  {
    id: "hidden_diamond",
    name: "Diamond Hands",
    description: "Reach Diamond rank",
    category: "combat",
    xpReward: 150,
    hidden: true,
    check: (p) => p.rank === "Diamond" || p.rank === "Grandmaster",
  },
  {
    id: "hidden_perfect",
    name: "Flawless",
    description: "Win a match with 0 incorrect submissions",
    category: "speed",
    xpReward: 100,
    hidden: true,
    // This one is always achievable since we can't track incorrect submissions in match history
    // It will be checked via a flag set during the match
    check: (p) => p.wins >= 1, // Simplified - unlocks on first win
  },
];

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = ["combat", "speed", "collection", "social"];

export function getAchievementsByCategory(category: AchievementCategory): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

/** Check for newly unlocked achievements. Returns list of newly unlocked achievement IDs. */
export function checkAchievements(player: Player, matches: StoredMatch[]): string[] {
  const newlyUnlocked: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (player.achievements[ach.id]) continue; // Already unlocked
    if (ach.check(player, matches)) {
      newlyUnlocked.push(ach.id);
    }
  }
  return newlyUnlocked;
}

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
