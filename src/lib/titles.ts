import type { Player } from "@/types";
import type { StoredMatch } from "./storage";

export interface TitleDef {
  id: string;
  label: string;
  description: string;
  adminOnly?: boolean;
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
    description: "Win 15 matches across different challenge categories",
    check: (_p, matches) => {
      const cats = new Set(matches.filter((m) => m.won).map((m) => m.challengeTitle));
      return cats.size >= 15;
    },
  },
  {
    id: "ranked_demon",
    label: "Ranked Demon",
    description: "Win 10 ranked (online) matches",
    check: (_p, matches) =>
      matches.filter((m) => m.won && !m.isVsBot).length >= 10,
  },
  {
    id: "speed_demon",
    label: "Speed Demon",
    description: "Win 5 matches in under 60 seconds each",
    check: (_p, matches) =>
      matches.filter((m) => m.won && m.playerTime !== null && m.playerTime < 60000).length >= 5,
  },
  {
    id: "streak_lord",
    label: "Streak Lord",
    description: "Achieve a 10-win streak",
    check: (_p, matches) => {
      let streak = 0;
      for (const m of [...matches].reverse()) {
        if (m.won) { streak++; if (streak >= 10) return true; }
        else streak = 0;
      }
      return false;
    },
  },
  {
    id: "centurion",
    label: "⚔ Centurion",
    description: "Win 50 ranked (online) matches",
    check: (_p, matches) =>
      matches.filter((m) => m.won && !m.isVsBot).length >= 50,
  },
  {
    id: "redacted",
    label: "[REDACTED]",
    description: "Reach Grandmaster rank",
    check: (p) => p.rank === "Grandmaster",
  },
];

// ─── Battle Pass titles (season-unique, granted at tier 30 premium) ───────
// Minimal season helpers duplicated here to avoid importing the "use client" battlepass module.
const _BP_SEASON_EPOCH = new Date("2026-03-01T00:00:00Z").getTime();
const _BP_SEASON_LENGTH_MS = 183 * 24 * 60 * 60 * 1000;
const _BP_SEASON_NAMES: Record<number, string> = { 1: "Alpha" };
function _getBPCurrentSeasonId(): number {
  const now = Date.now();
  if (now < _BP_SEASON_EPOCH) return 0;
  return Math.floor((now - _BP_SEASON_EPOCH) / _BP_SEASON_LENGTH_MS) + 1;
}
const _currentSeason = _getBPCurrentSeasonId();
const _currentSeasonName = _BP_SEASON_NAMES[_currentSeason] ?? `S${_currentSeason}`;

export const BP_TITLES: TitleDef[] = _currentSeason > 0
  ? [
    {
      id: `bp_s${_currentSeason}_champion`,
      label: `${_currentSeasonName} Champion`,
      description: `Reached tier 30 on the premium Battle Pass — Season ${_currentSeasonName}`,
      check: () => false,
    },
    ...(_currentSeason === 1 ? [{
      id: "alpha_legend",
      label: "⚔ Alpha Legend",
      description: "Conquered all 60 tiers of the Alpha Battle Pass — the ultimate grind",
      adminOnly: false as const,
      check: () => false,
    } satisfies TitleDef] : []),
  ]
  : [];
export const BP_TITLE_IDS = new Set(BP_TITLES.map((t) => t.id));

/** Check if a title ID is a battle pass season title (e.g. "bp_s1_champion") */
export function isBPSeasonTitle(id: string | null | undefined): boolean {
  return !!id && /^bp_s\d+_champion$/.test(id);
}

// ─── Premium titles (purchasable) ──────────────────────────────────────────
export const PREMIUM_TITLES: TitleDef[] = [
  { id: "neon_phantom", label: "⚡ Neon Phantom", description: "Premium title — spectral neon energy", adminOnly: true, check: () => false },
  { id: "void_walker",  label: "◉ Void Walker",  description: "Premium title — walks between dimensions", adminOnly: true, check: () => false },
  { id: "cyber_dragon", label: "🐉 Cyber Dragon", description: "Premium title — digital dragon lord", adminOnly: true, check: () => false },
];

export const PREMIUM_TITLE_IDS = new Set(PREMIUM_TITLES.map((t) => t.id));

// ─── Admin-only titles ────────────────────────────────────────────────────
export const ADMIN_TITLES: TitleDef[] = [
  { id: "alpha_tester", label: "α Alpha Tester", description: "Signed up during the Alpha — an OG", adminOnly: true, check: () => false },
  { id: "tester",    label: "✦ Tester",    description: "Granted by admin — game tester",    adminOnly: true, check: () => false },
  { id: "developer", label: "✦ Developer", description: "Granted by admin — game developer", adminOnly: true, check: () => false },
  { id: "owner",     label: "✦ Owner",     description: "Granted by admin — game owner",     adminOnly: true, check: () => false },
  { id: "glitch",    label: "◈ Glitched",  description: "Granted by admin — found a real bug", adminOnly: true, check: () => false },
];

export const ADMIN_TITLE_IDS = new Set(ADMIN_TITLES.map((t) => t.id));
export const ALL_TITLES = [...TITLES, ...BP_TITLES, ...PREMIUM_TITLES, ...ADMIN_TITLES];

/** Returns true if a title ID is an admin-only title. */
export function isAdminTitle(id: string | null | undefined): boolean {
  return !!id && ADMIN_TITLE_IDS.has(id);
}

/** Returns true if a title ID is a premium (purchasable) title. */
export function isPremiumTitle(id: string | null | undefined): boolean {
  return !!id && PREMIUM_TITLE_IDS.has(id);
}

/** Returns true if the title ID is the special Glitch title. */
export function isGlitchTitle(id: string | null | undefined): boolean {
  return id === "glitch";
}

/** Returns true if the title ID is the [REDACTED] title. */
export function isRedactedTitle(id: string | null | undefined): boolean {
  return id === "redacted";
}

/** Returns the list of title IDs that are now unlocked but weren't before. */
export function getNewlyUnlocked(player: Player, matches: StoredMatch[]): string[] {
  const already = new Set(player.unlockedTitles ?? []);
  return TITLES.filter((t) => !already.has(t.id) && t.check(player, matches)).map((t) => t.id);
}

/** Converts a title ID to its display label, or null if not found. */
export function getTitleLabel(titleId: string | null | undefined): string | null {
  if (!titleId) return null;
  // Handle dynamic BP season titles (e.g. "bp_s1_champion" → "Alpha Champion")
  if (isBPSeasonTitle(titleId)) {
    const match = titleId.match(/^bp_s(\d+)_champion$/);
    if (match) {
      const s = parseInt(match[1]);
      const name = _BP_SEASON_NAMES[s] ?? `S${s}`;
      return `${name} Champion`;
    }
    return titleId;
  }
  return ALL_TITLES.find((t) => t.id === titleId)?.label ?? null;
}

/**
 * Returns the CSS class name for a title's animation, or null for plain styled titles.
 * Components should apply inline Orbitron + yellow color when this returns null.
 */
export function getTitleClass(id: string | null | undefined): string | null {
  if (!id) return null;
  switch (id) {
    case "glitch":       return "glitch-title";
    case "redacted":     return "redacted-title";
    case "on_fire":      return "fire-title";
    case "unstoppable":  return "unstoppable-title";
    case "lightning":    return "lightning-title";
    case "speed_demon":  return "speed-demon-title";
    case "streak_lord":  return "streak-lord-title";
    case "centurion":    return "centurion-title";
    case "neon_phantom": return "neon-phantom-title";
    case "void_walker":  return "void-walker-title";
    case "cyber_dragon": return "cyber-dragon-title";
    default:
      if (ADMIN_TITLE_IDS.has(id)) return "admin-title";
      if (id === "alpha_legend") return "alpha-legend-title";
      if (id === "bp_s1_champion") return "alpha-champion-title";
      if (isBPSeasonTitle(id)) return "bp-victor-title";
      return null;
  }
}
