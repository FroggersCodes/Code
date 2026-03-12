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
  Grandmaster: "rank-badge-gm",
  Diamond: "rank-badge-diamond",
};

export function RankBadge({ rank, size = "sm" }: { rank: string; size?: "sm" | "md" | "lg" }) {
  const tier = rank as RankTier;
  const color = RANK_COLORS[tier] || "#666";
  const icon = RANK_ICONS[tier] || "?";
  const badgeClass = RANK_BADGE_CLASS[tier] || "";

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1",
  };

  const bgColor =
    tier === "Grandmaster" ? "rgba(255,215,0,0.08)" :
    tier === "Diamond" ? "rgba(255,0,102,0.06)" :
    "rgba(0,0,0,0.4)";

  return (
    <span
      className={`inline-block font-bold tracking-wider ${sizeClasses[size]} ${badgeClass}`}
      style={{
        color,
        border: `1px solid ${color}`,
        backgroundColor: bgColor,
        borderRadius: "2px",
        textShadow: `0 0 8px ${color}, 0 0 16px ${color}40`,
        opacity: tier === "Bronze" ? 0.85 : 1,
      }}
    >
      {icon} {rank}
    </span>
  );
}
