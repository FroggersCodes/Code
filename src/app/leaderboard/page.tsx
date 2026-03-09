"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RankBadge } from "@/components/RankBadge";
import type { Player } from "@/types";

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data.players);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl text-[var(--neon-green)] glow-green text-center mb-8">
        LEADERBOARD
      </h1>

      {loading ? (
        <div className="text-center text-[var(--neon-blue)] pulse-neon">
          LOADING RANKINGS...
        </div>
      ) : players.length === 0 ? (
        <div className="text-center">
          <div className="nes-container is-dark">
            <div className="text-[10px] text-[var(--text-dim)] mb-2">
              NO PLAYERS YET
            </div>
            <div className="text-[8px] text-[var(--neon-green)]">
              Be the first to play!
            </div>
          </div>
        </div>
      ) : (
        <div className="nes-container is-dark">
          {/* Header */}
          <div className="flex items-center text-[8px] text-[var(--text-dim)] mb-3 pb-2 border-b-2 border-[var(--text-dim)]">
            <span className="w-8">#</span>
            <span className="flex-1">PLAYER</span>
            <span className="w-20 text-center">RANK</span>
            <span className="w-16 text-right">ELO</span>
            <span className="w-12 text-right">W</span>
            <span className="w-12 text-right">L</span>
          </div>

          {/* Player rows */}
          {players.map((player, index) => (
            <Link
              key={player.id}
              href={`/profile/${player.username}`}
              className="no-underline"
            >
              <div
                className={`flex items-center text-[10px] py-2 px-1 hover:bg-[rgba(0,212,255,0.05)] transition-colors ${
                  index < 3 ? "text-[var(--neon-yellow)]" : "text-[var(--text-primary)]"
                }`}
              >
                <span className="w-8">
                  {index === 0 ? (
                    <span className="text-[var(--neon-yellow)]">1st</span>
                  ) : index === 1 ? (
                    <span className="text-[var(--text-primary)]">2nd</span>
                  ) : index === 2 ? (
                    <span className="text-[#cd7f32]">3rd</span>
                  ) : (
                    <span className="text-[var(--text-dim)]">{index + 1}</span>
                  )}
                </span>
                <span className="flex-1 text-[var(--neon-blue)]">{player.username}</span>
                <span className="w-20 text-center">
                  <RankBadge rank={player.rank} size="sm" />
                </span>
                <span className="w-16 text-right text-[var(--neon-yellow)]">{player.elo}</span>
                <span className="w-12 text-right text-[var(--neon-green)]">{player.wins}</span>
                <span className="w-12 text-right text-[var(--neon-pink)]">{player.losses}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
