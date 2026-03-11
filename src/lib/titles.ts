import type { Player } from "@/types";
import type { StoredMatch } from "./storage";

export interface TitleDef {
  id: string;
  label: string;
  description: string;
  check: (player: Player, matches: StoredMatch[]) => boolean;
}

export const TITLES: TitleDef[] = [
  {
    id: "bug_squasher",
    label: "Bug Squasher",
    description: "Win your first match",
    check: (p) => p.wins >= 1,
  },
  {
    id: "exterminator",
    label: "Exterminator",
    description: "Win 10 matches",
    check: (p) => p.wins >= 10,
  },
  {
    id: "on_fire",
    label: "On Fire",
    description: "Achieve a 3-win streak",
    check: (_p, matches) => {
      let streak = 0;
      for (const m of [...matches].reverse()) {
        if (m.won) { streak++; if (streak >= 3) return true; }
        else streak = 0;
      }
      return false;
    },
  },
  {
    id: "unstoppable",
    label: "Unstoppable",
    description: "Achieve a 5-win streak",
    check: (_p, matches) => {
      let streak = 0;
      for (const m of [...matches].reverse()) {
        if (m.won) { streak++; if (streak >= 5) return true; }
        else streak = 0;
      }
      return false;
    },
  },
  {
    id: "lightning",
    label: "Lightning",
    description: "Win a match in under 30 seconds",
    check: (_p, matches) =>
      matches.some((m) => m.won && m.playerTime !== null && m.playerTime < 30000),
  },
  {
    id: "polyglot",
    label: "Polyglot",
    description: "Win in both JavaScript and Python",
    check: (_p, matches) =>
      matches.some((m) => m.won && m.challengeLanguage === "javascript") &&
      matches.some((m) => m.won && m.challengeLanguage === "python"),
  },
  {
    id: "ranked_demon",
    label: "Ranked Demon",
    description: "Win 10 ranked (online) matches",
    check: (_p, matches) =>
      matches.filter((m) => m.won && !m.isVsBot).length >= 10,
  },
  {
    id: "redacted",
    label: "[REDACTED]",
    description: "Reach Grandmaster rank",
    check: (p) => p.rank === "Grandmaster",
  },
];

/** Returns the list of title IDs that are now unlocked but weren't before. */
export function getNewlyUnlocked(player: Player, matches: StoredMatch[]): string[] {
  const already = new Set(player.unlockedTitles ?? []);
  return TITLES.filter((t) => !already.has(t.id) && t.check(player, matches)).map((t) => t.id);
}

/** Converts a title ID to its display label, or null if not found. */
export function getTitleLabel(titleId: string | null | undefined): string | null {
  if (!titleId) return null;
  return TITLES.find((t) => t.id === titleId)?.label ?? null;
}
