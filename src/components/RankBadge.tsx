"use client";

import { RANK_COLORS, type RankTier } from "@/types";

const RANK_ICONS: Record<RankTier, string> = {
  Bronze: "[ B ]",
  Silver: "[ S ]",
  Gold: "[ G ]",
  Platinum: "[ P ]",
  Diamond: "[ D ]",
};

export function RankBadge({ rank, size = "sm" }: { rank: string; size?: "sm" | "md" | "lg" }) {
  const tier = rank as RankTier;
  const color = RANK_COLORS[tier] || "#666";
  const icon = RANK_ICONS[tier] || "[ ? ]";

  const sizeClasses = {
    sm: "text-[8px] px-1",
    md: "text-[10px] px-2 py-1",
    lg: "text-xs px-3 py-1",
  };

  return (
    <span
      className={`inline-block font-bold ${sizeClasses[size]}`}
      style={{
        color,
        textShadow: `0 0 8px ${color}, 0 0 16px ${color}`,
        border: `2px solid ${color}`,
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      {icon} {rank}
    </span>
  );
}
