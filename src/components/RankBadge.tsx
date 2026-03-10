"use client";

import { RANK_COLORS, type RankTier } from "@/types";

const RANK_ICONS: Record<RankTier, string> = {
  Bronze: "B",
  Silver: "S",
  Gold: "G",
  Platinum: "P",
  Diamond: "D",
};

export function RankBadge({ rank, size = "sm" }: { rank: string; size?: "sm" | "md" | "lg" }) {
  const tier = rank as RankTier;
  const color = RANK_COLORS[tier] || "#666";
  const icon = RANK_ICONS[tier] || "?";

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
    lg: "text-sm px-3 py-1",
  };

  return (
    <span
      className={`inline-block font-bold tracking-wider ${sizeClasses[size]}`}
      style={{
        color,
        border: `1px solid ${color}`,
        backgroundColor: "rgba(0,0,0,0.4)",
        borderRadius: "2px",
        textShadow: `0 0 6px ${color}`,
      }}
    >
      {icon} {rank}
    </span>
  );
}
