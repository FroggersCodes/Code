"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getPlayer } from "@/lib/storage";
import {
  getTierRewards,
  getCurrentTier,
  getXPForNextTier,
  getSeasonDaysLeft,
  getCurrentSeasonId,
  getSeasonName,
  hasActiveXPBoost,
  TOTAL_TIERS,
  type BattlePassTier,
} from "@/lib/battlepass";
import type { Player } from "@/types";

function RewardIcon({ type, name }: { type: string; name: string }) {
  const icons: Record<string, string> = {
    title: "T",
    avatar: "A",
    border: "✦",
    coins: "$",
    xp_boost: "2x",
    name_color: "C",
    profile_effect: "FX",
  };
  const colors: Record<string, string> = {
    title: "var(--accent-yellow)",
    avatar: "var(--accent-red)",
    border: "#ffd700",
    coins: "#ffd700",
    xp_boost: "var(--accent-green)",
    name_color: "#00e5ff",
    profile_effect: "#ff6b35",
  };

  const isBorder = type === "border";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-8 h-8 sm:w-10 sm:h-10 rounded flex items-center justify-center text-[9px] font-bold border"
        style={{
          borderColor: isBorder ? "#c9a227" : (colors[type] ?? "var(--border-color)"),
          color: isBorder ? "#ffd700" : (colors[type] ?? "var(--text-dim)"),
          backgroundColor: isBorder ? "rgba(255,215,0,0.12)" : "rgba(0,0,0,0.4)",
          boxShadow: isBorder ? "0 0 6px rgba(255,215,0,0.35), inset 0 0 8px rgba(255,200,0,0.08)" : "none",
          fontSize: isBorder ? "13px" : undefined,
        }}
      >
        {icons[type] ?? "?"}
      </div>
      <span
        className="text-[9px] sm:text-[10px] text-center leading-tight max-w-[60px] truncate"
        style={{
          color: colors[type],
          textShadow: isBorder ? "0 0 6px rgba(255,215,0,0.6)" : "none",
        }}
      >
        {name}
      </span>
    </div>
  );
}

function TierCard({
  tier,
  isReached,
  isCurrent,
  isPremiumOwner,
}: {
  tier: BattlePassTier;
  isReached: boolean;
  isCurrent: boolean;
  isPremiumOwner: boolean;
}) {
  const reached = isReached;
  return (
    <div
      className={`relative flex-shrink-0 w-[100px] sm:w-[120px] border rounded-lg p-2 sm:p-3 flex flex-col gap-2 transition-all ${
        isCurrent
          ? "border-[var(--accent-red)] shadow-[0_0_12px_rgba(255,0,68,0.3)]"
          : reached
          ? "border-[var(--accent-green)]"
          : "border-[var(--border-color)] opacity-60"
      }`}
      style={{ backgroundColor: "var(--card-bg)" }}
    >
      {/* Tier number */}
      <div className="text-center">
        <span
          className={`text-xs font-bold tracking-wider ${
            isCurrent ? "text-[var(--accent-red)]" : reached ? "text-[var(--accent-green)]" : "text-[var(--text-dim)]"
          }`}
        >
          TIER {tier.tier}
        </span>
      </div>

      {/* Free reward */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[8px] uppercase tracking-wider text-[var(--text-dim)]">Free</span>
        {tier.freeReward ? (
          <RewardIcon type={tier.freeReward.type} name={tier.freeReward.name} />
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded border border-[var(--border-color)] flex items-center justify-center text-[var(--text-dim)] text-xs opacity-30">
            —
          </div>
        )}
      </div>

      {/* Premium reward */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[8px] uppercase tracking-wider" style={{ color: isPremiumOwner ? "#ffd700" : "var(--text-dim)" }}>
          ★ Premium
        </span>
        {tier.premiumReward ? (
          <div className={isPremiumOwner ? "" : "opacity-40 grayscale"}>
            <RewardIcon type={tier.premiumReward.type} name={tier.premiumReward.name} />
          </div>
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded border border-[var(--border-color)] flex items-center justify-center text-[var(--text-dim)] text-xs opacity-30">
            —
          </div>
        )}
        {tier.premiumReward && !isPremiumOwner && (
          <span className="text-[8px] text-[var(--text-dim)]">🔒</span>
        )}
      </div>

      {/* Reached check */}
      {reached && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent-green)] flex items-center justify-center text-[8px] text-black font-bold">
          ✓
        </div>
      )}
    </div>
  );
}

export default function BattlePassPage() {
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = getPlayer();
    if (!p) {
      router.push("/");
      return;
    }
    setPlayer(p);
  }, [router]);

  // Auto-scroll to current tier
  useEffect(() => {
    if (!player || !scrollRef.current) return;
    const currentTier = getCurrentTier(player.xp);
    const tierEl = scrollRef.current.children[Math.max(0, currentTier - 1)] as HTMLElement;
    if (tierEl) {
      tierEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [player]);

  if (!player) return null;

  const tiers = getTierRewards();
  const currentTier = getCurrentTier(player.xp);
  const xpProgress = getXPForNextTier(player.xp);
  const daysLeft = getSeasonDaysLeft();
  const seasonId = getCurrentSeasonId();
  const seasonName = getSeasonName(seasonId);
  const progressPercent = currentTier >= TOTAL_TIERS ? 100 : xpProgress.tierXP > 0 ? Math.round((xpProgress.current / xpProgress.tierXP) * 100) : 0;

  return (
    <main className="min-h-screen pt-16 pb-12 px-3 sm:px-6" style={{ backgroundColor: "var(--bg-dark)" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1
            className="text-2xl sm:text-4xl font-bold tracking-widest mb-2"
            style={{ fontFamily: "'Orbitron', sans-serif", color: "var(--accent-red)" }}
          >
            BATTLE PASS
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-dim)] tracking-wider">
            SEASON {seasonName.toUpperCase()} — {daysLeft} DAYS REMAINING
          </p>
        </div>

        {/* XP Summary */}
        <div
          className="border border-[var(--border-color)] rounded-lg p-4 sm:p-6 mb-6"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="text-[var(--text-dim)] text-xs uppercase tracking-wider mb-1">Current Tier</div>
              <div className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: "var(--accent-red)" }}>
                {currentTier >= TOTAL_TIERS ? "MAX" : currentTier}
                <span className="text-lg text-[var(--text-dim)]"> / {TOTAL_TIERS}</span>
              </div>
            </div>

            <div className="flex-1 w-full sm:max-w-md">
              <div className="flex justify-between text-xs text-[var(--text-dim)] mb-1">
                <span>{player.xp.toLocaleString()} XP</span>
                {currentTier < TOTAL_TIERS && (
                  <span>{xpProgress.needed.toLocaleString()} XP to next tier</span>
                )}
              </div>
              <div className="w-full h-3 rounded-full border border-[var(--border-color)] overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    background: "linear-gradient(90deg, var(--accent-red), var(--accent-red-bright))",
                  }}
                />
              </div>
            </div>

            {!player.premiumPass && (
              <button
                onClick={() => router.push("/store")}
                className="px-4 py-2 rounded border text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                style={{
                  borderColor: "#c9a227",
                  color: "#ffd700",
                  backgroundColor: "rgba(255,215,0,0.06)",
                  fontFamily: "'Orbitron', sans-serif",
                  boxShadow: "0 0 0 rgba(255,215,0,0)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 12px rgba(255,215,0,0.35)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 0 rgba(255,215,0,0)")}
              >
                ★ Unlock Premium
              </button>
            )}
            {player.premiumPass && (
              <div
                className="px-3 py-1.5 rounded border text-xs font-bold uppercase tracking-wider"
                style={{
                  borderColor: "#c9a227",
                  color: "#ffd700",
                  backgroundColor: "rgba(255,215,0,0.08)",
                  fontFamily: "'Orbitron', sans-serif",
                  boxShadow: "0 0 8px rgba(255,215,0,0.2)",
                }}
              >
                ★ Premium Active
              </div>
            )}
          </div>

          {/* Coin balance + XP boost status */}
          <div className="flex gap-4 mt-3 justify-center sm:justify-start">
            <div className="flex items-center gap-1.5 text-xs">
              <span style={{ color: "#ffd700" }}>$</span>
              <span className="text-[var(--text-primary)] font-bold">{(player.coins ?? 0).toLocaleString()}</span>
              <span className="text-[var(--text-dim)]">coins</span>
            </div>
            {hasActiveXPBoost(player) && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[var(--accent-green)] font-bold">2x XP ACTIVE</span>
                <span className="text-[var(--text-dim)]">
                  ({Math.ceil((player.xpBoostUntil! - Date.now()) / (60 * 60 * 1000))}h left)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tier Track */}
        <div className="mb-6">
          <h2 className="text-sm font-bold tracking-wider text-[var(--text-dim)] uppercase mb-3">Tier Rewards</h2>
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin"
            style={{ scrollbarColor: "var(--border-color) transparent" }}
          >
            {tiers.map((tier) => (
              <TierCard
                key={tier.tier}
                tier={tier}
                isReached={currentTier >= tier.tier}
                isCurrent={currentTier === tier.tier - 1}
                isPremiumOwner={player.premiumPass}
              />
            ))}
          </div>
        </div>

        {/* XP Earning Guide */}
        <div
          className="border border-[var(--border-color)] rounded-lg p-4 sm:p-6"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <h2 className="text-sm font-bold tracking-wider text-[var(--text-dim)] uppercase mb-3">How to Earn XP</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              ["Win (Online)", "+60 XP"],
              ["Win (vs Bot)", "+40 XP"],
              ["Loss", "+15 XP"],
              ["Draw", "+20 XP"],
              ["Win Streak Bonus", "+10/level (max +50)"],
              ["Fast Solve (<30s)", "+15 XP"],
              ["COTD Completion", "+30 XP"],
              ["Daily Mission", "+75 XP each"],
              ["Weekly Mission", "+200 XP each"],
              ["Achievement", "+50-200 XP"],
            ].map(([label, xp]) => (
              <div key={label} className="flex justify-between py-1 border-b border-[var(--border-color)]">
                <span className="text-[var(--text-dim)]">{label}</span>
                <span className="text-[var(--accent-green)] font-mono">{xp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
