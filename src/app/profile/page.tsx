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
      <div className="nes-container is-dark mb-6 text-center slide-up">
        <div className="text-xl text-[var(--neon-blue)] glow-blue mb-3">
          {player.username}
        </div>
        <div className="mb-3">
          <RankBadge rank={player.rank} size="lg" />
        </div>
        <div className="text-2xl text-[var(--neon-yellow)] mb-4">
          {player.elo} ELO
        </div>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-[8px] text-[var(--text-dim)]">WINS</div>
            <div className="text-sm text-[var(--neon-green)]">{player.wins}</div>
          </div>
          <div>
            <div className="text-[8px] text-[var(--text-dim)]">LOSSES</div>
            <div className="text-sm text-[var(--neon-pink)]">{player.losses}</div>
          </div>
          <div>
            <div className="text-[8px] text-[var(--text-dim)]">DRAWS</div>
            <div className="text-sm text-[var(--text-primary)]">{player.draws}</div>
          </div>
          <div>
            <div className="text-[8px] text-[var(--text-dim)]">WIN %</div>
            <div className="text-sm text-[var(--neon-yellow)]">{winRate}%</div>
          </div>
        </div>
        <div className="mt-4">
          <RetroButton variant="error" onClick={handleLogout}>
            LOGOUT
          </RetroButton>
        </div>
      </div>

      <div className="nes-container is-dark slide-up">
        <h2 className="text-xs text-[var(--neon-green)] mb-4">MATCH HISTORY</h2>
        {matches.length === 0 ? (
          <div className="text-[10px] text-[var(--text-dim)] text-center">
            NO MATCHES YET
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((match) => (
              <div
                key={match.id}
                className={`flex items-center justify-between text-[10px] p-2 border-l-4 ${
                  match.won
                    ? "border-[var(--neon-green)]"
                    : match.draw
                    ? "border-[var(--neon-yellow)]"
                    : "border-[var(--neon-pink)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[8px] ${
                      match.won ? "text-[var(--neon-green)]" : match.draw ? "text-[var(--neon-yellow)]" : "text-[var(--neon-pink)]"
                    }`}
                  >
                    {match.won ? "WIN" : match.draw ? "DRAW" : "LOSS"}
                  </span>
                  <span className="text-[var(--text-primary)]">vs {match.opponentName}</span>
                  <span className="text-[8px] text-[var(--text-dim)]">{match.isVsBot ? "[BOT]" : "[ONLINE]"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[8px] text-[var(--text-dim)]">
                    {match.challengeLanguage.toUpperCase()}
                  </span>
                  <span
                    className={`text-[8px] ${
                      match.won ? "text-[var(--neon-green)]" : match.draw ? "text-[var(--text-dim)]" : "text-[var(--neon-pink)]"
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
