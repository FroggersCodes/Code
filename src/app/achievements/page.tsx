"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPlayer, getMatches } from "@/lib/storage";
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  getAchievementsByCategory,
  type AchievementCategory,
  type AchievementDef,
} from "@/lib/achievements";
import type { Player } from "@/types";
import type { StoredMatch } from "@/lib/storage";

function AchievementCard({
  ach,
  player,
  matches,
}: {
  ach: AchievementDef;
  player: Player;
  matches: StoredMatch[];
}) {
  const unlocked = !!player.achievements[ach.id];
  const isHidden = ach.hidden && !unlocked;
  const progress = ach.progress ? ach.progress(player, matches) : null;

  return (
    <div
      className={`border rounded-lg p-3 sm:p-4 transition-all ${
        unlocked
          ? "border-[var(--accent-green)] shadow-[0_0_8px_rgba(0,255,136,0.15)]"
          : "border-[var(--border-color)] opacity-70"
      }`}
      style={{ backgroundColor: "var(--card-bg)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold tracking-wider truncate" style={{ color: unlocked ? "var(--accent-green)" : "var(--text-primary)" }}>
              {isHidden ? "???" : ach.name}
            </h3>
            {unlocked && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-green)] text-black font-bold flex-shrink-0">
                DONE
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-dim)] mb-2">
            {isHidden ? "Hidden achievement — keep playing to discover it!" : ach.description}
          </p>

          {/* Progress bar */}
          {progress && !unlocked && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full border border-[var(--border-color)] overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (progress[0] / progress[1]) * 100)}%`,
                    background: "var(--accent-red)",
                  }}
                />
              </div>
              <span className="text-[10px] text-[var(--text-dim)] font-mono flex-shrink-0">
                {progress[0]}/{progress[1]}
              </span>
            </div>
          )}
        </div>

        {/* XP reward */}
        <div className="flex-shrink-0 text-right">
          <span className="text-xs font-mono" style={{ color: "var(--accent-yellow)" }}>
            +{ach.xpReward} XP
          </span>
        </div>
      </div>
    </div>
  );
}

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  combat: "Combat",
  speed: "Speed",
  collection: "Collection",
  social: "Social",
};

export default function AchievementsPage() {
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<StoredMatch[]>([]);
  const [activeCategory, setActiveCategory] = useState<AchievementCategory>("combat");

  useEffect(() => {
    const p = getPlayer();
    if (!p) {
      router.push("/");
      return;
    }
    setPlayer(p);
    setMatches(getMatches());
  }, [router]);

  if (!player) return null;

  const totalUnlocked = ACHIEVEMENTS.filter((a) => player.achievements[a.id]).length;
  const totalAchievements = ACHIEVEMENTS.length;
  const categoryAchievements = getAchievementsByCategory(activeCategory);
  // Also include hidden achievements that match this category
  const hiddenInCategory = ACHIEVEMENTS.filter((a) => a.hidden && a.category === activeCategory);
  const allInCategory = [...categoryAchievements.filter((a) => !a.hidden), ...hiddenInCategory];

  return (
    <main className="min-h-screen pt-16 pb-12 px-3 sm:px-6" style={{ backgroundColor: "var(--bg-dark)" }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1
            className="text-2xl sm:text-4xl font-bold tracking-widest mb-2"
            style={{ fontFamily: "'Orbitron', sans-serif", color: "var(--accent-red)" }}
          >
            ACHIEVEMENTS
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-dim)] tracking-wider">
            {totalUnlocked} / {totalAchievements} UNLOCKED
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 sm:gap-2 mb-6 overflow-x-auto">
          {ACHIEVEMENT_CATEGORIES.map((cat) => {
            const catCount = getAchievementsByCategory(cat).length;
            const catUnlocked = getAchievementsByCategory(cat).filter((a) => player.achievements[a.id]).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-2 rounded text-xs uppercase tracking-wider font-bold cursor-pointer transition-all border flex-shrink-0 ${
                  activeCategory === cat
                    ? "border-[var(--accent-red)] text-[var(--accent-red)]"
                    : "border-[var(--border-color)] text-[var(--text-dim)] hover:text-[var(--text-primary)]"
                }`}
                style={{
                  backgroundColor: activeCategory === cat ? "rgba(255,0,68,0.1)" : "transparent",
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                {CATEGORY_LABELS[cat]}
                <span className="ml-1 text-[10px] opacity-70">
                  {catUnlocked}/{catCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Achievement cards */}
        <div className="flex flex-col gap-3">
          {allInCategory.map((ach) => (
            <AchievementCard key={ach.id} ach={ach} player={player} matches={matches} />
          ))}
        </div>
      </div>
    </main>
  );
}
