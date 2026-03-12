"use client";

import { RANK_COLORS, type RankTier } from "@/types";

const RANK_ICONS: Record<RankTier, string> = {
  Bronze: "⬡",
  Silver: "◇",
  Gold: "★",
  Platinum: "◈",
  Diamond: "◆",
  Grandmaster: "♛",
};

const RANK_BADGE_CLASS: Partial<Record<RankTier, string>> = {
  Gold: "rank-badge-gold",
  Platinum: "rank-badge-platinum",
  Diamond: "rank-badge-diamond",
  Grandmaster: "rank-badge-gm",
};

export function RankBadge({ rank, size = "sm" }: { rank: string; size?: "sm" | "md" | "lg" }) {
  const tier = rank as RankTier;
  const color = RANK_COLORS[tier] || "#666";
  const icon = RANK_ICONS[tier] || "?";
  const badgeClass = RANK_BADGE_CLASS[tier] || "";
  const isGm = tier === "Grandmaster";

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1",
  };

  const bgColor =
    tier === "Diamond" ? "rgba(255,0,102,0.07)" :
    tier === "Platinum" ? "rgba(0,212,255,0.06)" :
    tier === "Gold" ? "rgba(255,215,0,0.06)" :
    "rgba(0,0,0,0.4)";

  return (
    <span
      className={`inline-block font-bold tracking-wider ${sizeClasses[size]} ${badgeClass}`}
      style={{
        // GM: let CSS animation control color, border-color, text-shadow
        color: isGm ? undefined : color,
        border: isGm ? undefined : `1px solid ${color}`,
        textShadow: isGm ? undefined : `0 0 8px ${color}, 0 0 18px ${color}50`,
        backgroundColor: bgColor,
        borderRadius: "2px",
        opacity: tier === "Bronze" ? 0.8 : 1,
      }}
    >
      {icon} {rank}
    </span>
  );
}
