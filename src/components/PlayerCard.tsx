"use client";

import { RankBadge } from "./RankBadge";
import { getAvatarSvg } from "@/lib/avatars";

interface PlayerCardProps {
  username: string;
  elo: number;
  rank: string;
  title?: string | null;
  isYou?: boolean;
  solved?: boolean;
  typing?: boolean;
  avatar?: string | null;
  winStreak?: number;
}

export function PlayerCard({ username, elo, rank, title, isYou, solved, typing, avatar, winStreak }: PlayerCardProps) {
  const avatarSvg = getAvatarSvg(avatar);
  return (
    <div
      className={`p-3 border rounded ${
        solved
          ? "border-[var(--accent-green)] glow-box-green"
          : isYou
          ? "border-[var(--accent-red)] glow-box-red"
          : "border-[var(--border-color)]"
      } bg-[var(--bg-surface)]`}
    >
      <div className="flex items-center gap-2 mb-1">
        {avatarSvg ? (
          <div
            className="w-7 h-7 rounded overflow-hidden flex-shrink-0"
            dangerouslySetInnerHTML={{ __html: avatarSvg }}
          />
        ) : (
          <span className={`text-xs font-bold ${isYou ? "text-[var(--accent-red)]" : "text-[var(--text-dim)]"}`}>
            {isYou ? ">" : "#"}
          </span>
        )}
        <span className={`text-xs ${isYou ? "text-[var(--text-primary)]" : "text-[var(--text-dim)]"}`}>
          {username}
        </span>
        {winStreak !== undefined && winStreak >= 3 && (
          <span className="text-[10px] text-[var(--accent-yellow)]" title={`${winStreak} win streak`}>
            🔥{winStreak}
          </span>
        )}
      </div>
      {title && (
        <div className={`text-[10px] tracking-wider mb-2 pl-4 ${title.startsWith("◈") ? "glitch-title" : title.startsWith("✦") ? "admin-title" : "text-[var(--accent-yellow)]"}`}
          style={title.startsWith("◈") || title.startsWith("✦") ? undefined : { fontFamily: "'Orbitron', sans-serif" }}
        >
          {title}
        </div>
      )}
      <div className="flex items-center justify-between">
        <RankBadge rank={rank} size="sm" />
        <span className="text-[var(--text-dim)] text-xs">{elo}</span>
      </div>
      {typing && (
        <div className="mt-2 text-xs text-[var(--accent-red)]">
          <span className="blink-cursor">coding_</span>
        </div>
      )}
      {solved && (
        <div className="mt-2 text-xs text-[var(--accent-green)] glow-green font-bold">
          SOLVED
        </div>
      )}
    </div>
  );
}
