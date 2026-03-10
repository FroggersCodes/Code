"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RankBadge } from "@/components/RankBadge";
import { RetroButton } from "@/components/RetroButton";
import { getPlayer, getMatches, logout } from "@/lib/storage";
import type { Player } from "@/types";
import type { StoredMatch } from "@/lib/storage";

export default function ProfilePage() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<StoredMatch[]>([]);
  const router = useRouter();

  useEffect(() => {
    const p = getPlayer();
    if (!p) {
      router.push("/");
      return;
    }
    setPlayer(p);
    setMatches(getMatches());
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!player) return null;

  const totalGames = player.wins + player.losses + player.draws;
  const winRate = totalGames > 0 ? Math.round((player.wins / totalGames) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="hacker-card hacker-card-red mb-6 text-center slide-up">
        <div className="text-lg text-[var(--text-primary)] mb-2 font-bold">
          {player.username}
        </div>
        <div className="mb-3">
          <RankBadge rank={player.rank} size="lg" />
        </div>
        <div className="text-2xl text-[var(--accent-red)] glow-red mb-6 font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          {player.elo} <span className="text-sm text-[var(--text-dim)]">ELO</span>
        </div>
        <div className="grid grid-cols-4 gap-4 text-center mb-6">
          <div>
            <div className="text-xs text-[var(--text-dim)] mb-1">WINS</div>
            <div className="text-base text-[var(--accent-green)]">{player.wins}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-dim)] mb-1">LOSSES</div>
            <div className="text-base text-[var(--accent-red)]">{player.losses}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-dim)] mb-1">DRAWS</div>
            <div className="text-base text-[var(--text-primary)]">{player.draws}</div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-dim)] mb-1">WIN %</div>
            <div className="text-base text-[var(--accent-yellow)]">{winRate}%</div>
          </div>
        </div>
        <RetroButton variant="error" onClick={handleLogout}>
          LOGOUT
        </RetroButton>
      </div>

      <div className="hacker-card slide-up">
        <h2 className="text-sm text-[var(--accent-red)] mb-4 tracking-wider font-bold">MATCH HISTORY</h2>
        {matches.length === 0 ? (
          <div className="text-xs text-[var(--text-dim)] text-center py-4">
            NO MATCHES YET
          </div>
        ) : (
          <div className="space-y-1">
            {matches.map((match) => (
              <div
                key={match.id}
                className={`flex items-center justify-between text-xs p-3 border-l-2 ${
                  match.won
                    ? "border-[var(--accent-green)] bg-[rgba(0,255,102,0.03)]"
                    : match.draw
                    ? "border-[var(--accent-yellow)] bg-[rgba(255,204,0,0.03)]"
                    : "border-[var(--accent-red)] bg-[rgba(255,0,51,0.03)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold ${
                      match.won ? "text-[var(--accent-green)]" : match.draw ? "text-[var(--accent-yellow)]" : "text-[var(--accent-red)]"
                    }`}
                  >
                    {match.won ? "W" : match.draw ? "D" : "L"}
                  </span>
                  <span className="text-[var(--text-primary)]">vs {match.opponentName}</span>
                  <span className="text-xs text-[var(--text-muted)]">{match.isVsBot ? "BOT" : "ONLINE"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-dim)]">
                    {match.challengeLanguage.toUpperCase()}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      match.won ? "text-[var(--accent-green)]" : match.draw ? "text-[var(--text-dim)]" : "text-[var(--accent-red)]"
                    }`}
                  >
                    {match.won ? "+" : match.draw ? "" : "-"}{match.eloChange}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
