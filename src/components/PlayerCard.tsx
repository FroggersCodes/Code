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
      className={`p-3 border-4 ${
        solved
          ? "border-[var(--neon-green)] glow-box-green"
          : isYou
          ? "border-[var(--neon-blue)] glow-box-blue"
          : "border-[var(--neon-pink)] glow-box-pink"
      } bg-[var(--bg-darker)]`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[20px]">{isYou ? ">" : "#"}</span>
        <span className={`text-[10px] ${isYou ? "text-[var(--neon-blue)]" : "text-[var(--neon-pink)]"}`}>
          {username}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <RankBadge rank={rank} size="sm" />
        <span className="text-[var(--neon-yellow)] text-[10px]">{elo} ELO</span>
      </div>
      {typing && (
        <div className="mt-2 text-[8px] text-[var(--neon-green)]">
          <span className="blink-cursor">CODING...</span>
        </div>
      )}
      {solved && (
        <div className="mt-2 text-[8px] text-[var(--neon-green)] glow-green">
          SOLVED!
        </div>
      )}
    </div>
  );
}
