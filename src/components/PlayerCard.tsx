"use client";

import { RankBadge } from "./RankBadge";

interface PlayerCardProps {
  username: string;
  elo: number;
  rank: string;
  isYou?: boolean;
  solved?: boolean;
  typing?: boolean;
}

export function PlayerCard({ username, elo, rank, isYou, solved, typing }: PlayerCardProps) {
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
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold ${isYou ? "text-[var(--accent-red)]" : "text-[var(--text-dim)]"}`}>
          {isYou ? ">" : "#"}
        </span>
        <span className={`text-xs ${isYou ? "text-[var(--text-primary)]" : "text-[var(--text-dim)]"}`}>
          {username}
        </span>
      </div>
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
