"use client";

import type { Player, MissionProgress } from "@/types";
import type { StoredMatch } from "./storage";

// ── Mission Templates ───────────────────────────────────────────────────────

interface MissionTemplate {
  id: string;
  description: string;
  target: number;
  xpReward: number;
  check: (matches: StoredMatch[], player: Player) => number; // Returns current progress count
}

const DAILY_POOL: MissionTemplate[] = [
  {
    id: "d_win2",
    description: "Win 2 matches",
    target: 2,
    xpReward: 75,
    check: (m) => m.filter((x) => x.won).length,
  },
  {
    id: "d_play3",
    description: "Play 3 matches",
    target: 3,
    xpReward: 75,
    check: (m) => m.length,
  },
  {
    id: "d_fast_win",
    description: "Win a match in under 60 seconds",
    target: 1,
    xpReward: 75,
    check: (m) => m.filter((x) => x.won && x.playerTime !== null && x.playerTime < 60000).length,
  },
  {
    id: "d_bot_win",
    description: "Win a bot match",
    target: 1,
    xpReward: 75,
    check: (m) => m.filter((x) => x.won && x.isVsBot).length,
  },
  {
    id: "d_online_win",
    description: "Win an online match",
    target: 1,
    xpReward: 75,
    check: (m) => m.filter((x) => x.won && !x.isVsBot).length,
  },
  {
    id: "d_play5",
    description: "Play 5 matches",
    target: 5,
    xpReward: 75,
    check: (m) => m.length,
  },
  {
    id: "d_win_streak",
    description: "Win 2 matches in a row",
    target: 1,
    xpReward: 75,
    check: (m) => {
      let streak = 0;
      for (const x of [...m].reverse()) {
        if (x.won) { streak++; if (streak >= 2) return 1; }
        else streak = 0;
      }
      return 0;
    },
  },
];

const WEEKLY_POOL: MissionTemplate[] = [
  {
    id: "w_win10",
    description: "Win 10 matches",
    target: 10,
    xpReward: 200,
    check: (m) => m.filter((x) => x.won).length,
  },
  {
    id: "w_play15",
    description: "Play 15 matches",
    target: 15,
    xpReward: 200,
    check: (m) => m.length,
  },
  {
    id: "w_bot5",
    description: "Win 5 bot matches",
    target: 5,
    xpReward: 200,
    check: (m) => m.filter((x) => x.won && x.isVsBot).length,
  },
  {
    id: "w_online3",
    description: "Win 3 online matches",
    target: 3,
    xpReward: 200,
    check: (m) => m.filter((x) => x.won && !x.isVsBot).length,
  },
  {
    id: "w_streak5",
    description: "Achieve a 5-win streak",
    target: 1,
    xpReward: 200,
    check: (m) => {
      let streak = 0;
      for (const x of [...m].reverse()) {
        if (x.won) { streak++; if (streak >= 5) return 1; }
        else streak = 0;
      }
      return 0;
    },
  },
  {
    id: "w_fast3",
    description: "Win 3 matches in under 60 seconds",
    target: 3,
    xpReward: 200,
    check: (m) => m.filter((x) => x.won && x.playerTime !== null && x.playerTime < 60000).length,
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function pickRandom<T>(pool: T[], count: number): T[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getUTCDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUTCWeekString(): string {
  const now = new Date();
  // Get Monday of this week
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  return monday.toISOString().slice(0, 10);
}

function templateToMission(t: MissionTemplate): MissionProgress {
  return {
    id: t.id,
    description: t.description,
    target: t.target,
    current: 0,
    completed: false,
    xpReward: t.xpReward,
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

/** Check if missions need refreshing and generate new ones if so. Returns true if refreshed. */
export function refreshMissions(player: Player): boolean {
  const today = getUTCDateString();
  const thisWeek = getUTCWeekString();
  let changed = false;

  // Refresh dailies
  if (player.missionsLastRefresh !== today) {
    const templates = pickRandom(DAILY_POOL, 3);
    player.dailyMissions = templates.map(templateToMission);
    player.missionsLastRefresh = today;
    changed = true;
  }

  // Refresh weeklies
  if (player.weeklyMissionsLastRefresh !== thisWeek) {
    const templates = pickRandom(WEEKLY_POOL, 3);
    player.weeklyMissions = templates.map(templateToMission);
    player.weeklyMissionsLastRefresh = thisWeek;
    changed = true;
  }

  return changed;
}

/** Update mission progress after a match. Returns list of newly completed mission IDs. */
export function updateMissionProgress(
  player: Player,
  todayMatches: StoredMatch[],
  weekMatches: StoredMatch[],
): string[] {
  const completed: string[] = [];

  // Update daily missions
  for (const mission of player.dailyMissions) {
    if (mission.completed) continue;
    const template = DAILY_POOL.find((t) => t.id === mission.id);
    if (!template) continue;
    const progress = template.check(todayMatches, player);
    mission.current = Math.min(progress, mission.target);
    if (mission.current >= mission.target) {
      mission.completed = true;
      completed.push(mission.id);
    }
  }

  // Update weekly missions
  for (const mission of player.weeklyMissions) {
    if (mission.completed) continue;
    const template = WEEKLY_POOL.find((t) => t.id === mission.id);
    if (!template) continue;
    const progress = template.check(weekMatches, player);
    mission.current = Math.min(progress, mission.target);
    if (mission.current >= mission.target) {
      mission.completed = true;
      completed.push(mission.id);
    }
  }

  return completed;
}

/** Get matches from today for mission progress checking */
export function getMatchesSince(matches: StoredMatch[], since: string): StoredMatch[] {
  return matches.filter((m) => m.createdAt >= since);
}

export function getTodayMatches(matches: StoredMatch[]): StoredMatch[] {
  const today = getUTCDateString();
  return matches.filter((m) => m.createdAt.startsWith(today));
}

export function getWeekMatches(matches: StoredMatch[]): StoredMatch[] {
  const thisWeek = getUTCWeekString();
  return matches.filter((m) => m.createdAt >= thisWeek);
}
