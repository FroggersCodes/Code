"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RankBadge } from "@/components/RankBadge";
import { RetroButton } from "@/components/RetroButton";
import Link from "next/link";

interface ProfileData {
  user: {
    id: number;
    username: string;
    elo: number;
    rank: string;
    wins: number;
    losses: number;
    draws: number;
    createdAt: string;
  };
  matches: Array<{
    id: number;
    winnerId: number | null;
    isVsBot: boolean;
    eloChange: number;
    createdAt: string;
    player1: { username: string; elo: number };
    player2: { username: string; elo: number } | null;
    challenge: { title: string; language: string };
  }>;
}

export default function ProfilePage() {
  const params = useParams();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/profile/${params.username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Player not found");
        setLoading(false);
      });
  }, [params.username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-[var(--neon-blue)] pulse-neon">LOADING PROFILE...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-[var(--neon-pink)] glow-pink mb-4">PLAYER NOT FOUND</div>
        <Link href="/leaderboard">
          <RetroButton variant="primary">VIEW LEADERBOARD</RetroButton>
        </Link>
      </div>
    );
  }

  const { user, matches } = data;
  const totalGames = user.wins + user.losses + user.draws;
  const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Player header */}
      <div className="nes-container is-dark mb-6 text-center slide-up">
        <div className="text-xl text-[var(--neon-blue)] glow-blue mb-3">
          {user.username}
        </div>
        <div className="mb-3">
          <RankBadge rank={user.rank} size="lg" />
        </div>
        <div className="text-2xl text-[var(--neon-yellow)] mb-4">
          {user.elo} ELO
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-[8px] text-[var(--text-dim)]">WINS</div>
            <div className="text-sm text-[var(--neon-green)]">{user.wins}</div>
          </div>
          <div>
            <div className="text-[8px] text-[var(--text-dim)]">LOSSES</div>
            <div className="text-sm text-[var(--neon-pink)]">{user.losses}</div>
          </div>
          <div>
            <div className="text-[8px] text-[var(--text-dim)]">DRAWS</div>
            <div className="text-sm text-[var(--text-primary)]">{user.draws}</div>
          </div>
          <div>
            <div className="text-[8px] text-[var(--text-dim)]">WIN %</div>
            <div className="text-sm text-[var(--neon-yellow)]">{winRate}%</div>
          </div>
        </div>
      </div>

      {/* Match history */}
      <div className="nes-container is-dark slide-up">
        <h2 className="text-xs text-[var(--neon-green)] mb-4">MATCH HISTORY</h2>

        {matches.length === 0 ? (
          <div className="text-[10px] text-[var(--text-dim)] text-center">
            NO MATCHES YET
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((match) => {
              const isPlayer1 = match.player1.username === user.username;
              const won = match.winnerId === user.id;
              const draw = match.winnerId === null;
              const opponentName = match.isVsBot
                ? "BugBot_9000"
                : isPlayer1
                ? match.player2?.username ?? "???"
                : match.player1.username;

              return (
                <div
                  key={match.id}
                  className={`flex items-center justify-between text-[10px] p-2 border-l-4 ${
                    won
                      ? "border-[var(--neon-green)]"
                      : draw
                      ? "border-[var(--neon-yellow)]"
                      : "border-[var(--neon-pink)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[8px] ${
                        won ? "text-[var(--neon-green)]" : draw ? "text-[var(--neon-yellow)]" : "text-[var(--neon-pink)]"
                      }`}
                    >
                      {won ? "WIN" : draw ? "DRAW" : "LOSS"}
                    </span>
                    <span className="text-[var(--text-primary)]">vs {opponentName}</span>
                    {match.isVsBot && (
                      <span className="text-[8px] text-[var(--text-dim)]">[BOT]</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[8px] text-[var(--text-dim)]">
                      {match.challenge.language.toUpperCase()}
                    </span>
                    <span
                      className={`text-[8px] ${
                        won ? "text-[var(--neon-green)]" : draw ? "text-[var(--text-dim)]" : "text-[var(--neon-pink)]"
                      }`}
                    >
                      {won ? "+" : draw ? "" : "-"}{match.eloChange}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
