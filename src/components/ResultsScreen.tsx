"use client";

import { useEffect, useState } from "react";
import { RankBadge } from "./RankBadge";
import { RetroButton } from "./RetroButton";
import { getPlayer } from "@/lib/storage";
import type { GameResult } from "@/lib/gameEngine";

interface ResultsScreenProps {
  result: GameResult;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

function Confetti() {
  const colors = ["var(--neon-green)", "var(--neon-blue)", "var(--neon-yellow)", "var(--neon-pink)", "var(--neon-purple)"];
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            backgroundColor: piece.color,
          }}
        />
      ))}
    </>
  );
}

export function ResultsScreen({ result, onPlayAgain, onBackToLobby }: ResultsScreenProps) {
  const [showDetails, setShowDetails] = useState(false);
  const player = getPlayer();

  useEffect(() => {
    const timer = setTimeout(() => setShowDetails(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const myEloChange = result.won ? result.eloChange : result.draw ? 0 : -result.eloChange;
  const opponentTime = result.opponentTime ?? result.botTime;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-center">
      {result.won && <Confetti />}

      <div className="mb-8 slide-up">
        {result.draw ? (
          <div className="text-3xl text-[var(--neon-yellow)] glow-blue pulse-neon mb-2">
            DRAW!
          </div>
        ) : result.won ? (
          <>
            <div className="text-3xl text-[var(--neon-green)] glow-green mb-2">
              VICTORY!
            </div>
            <div className="text-[10px] text-[var(--neon-yellow)]">
              BUG SQUASHED!
            </div>
          </>
        ) : (
          <>
            <div className="text-3xl text-[var(--neon-pink)] glow-pink mb-2">
              DEFEAT
            </div>
            <div className="text-[10px] text-[var(--text-dim)]">
              THE BUG LIVES ON...
            </div>
          </>
        )}
      </div>

      {showDetails && (
        <div className="nes-container is-dark mb-6 slide-up">
          <div className="flex justify-between items-center mb-4">
            <div className="text-left">
              <div className="text-[10px] text-[var(--neon-blue)] mb-1">{player?.username || "You"}</div>
              <div className="text-[8px] text-[var(--text-dim)]">
                Time: {result.playerTime ? `${(result.playerTime / 1000).toFixed(1)}s` : "DNF"}
              </div>
            </div>
            <div className="text-[var(--neon-yellow)] text-xs">VS</div>
            <div className="text-right">
              <div className="text-[10px] text-[var(--neon-pink)] mb-1">{result.opponentName}</div>
              <div className="text-[8px] text-[var(--text-dim)]">
                Time: {opponentTime ? `${(opponentTime / 1000).toFixed(1)}s` : "DNF"}
              </div>
            </div>
          </div>

          <div className="border-t-2 border-[var(--text-dim)] pt-4">
            <div className="text-[8px] text-[var(--text-dim)] mb-2">ELO CHANGE</div>
            <div className="flex items-center justify-center gap-4">
              <span
                className={`text-lg ${
                  myEloChange > 0 ? "text-[var(--neon-green)] glow-green" : myEloChange < 0 ? "text-[var(--neon-pink)] glow-pink" : "text-[var(--text-dim)]"
                }`}
              >
                {myEloChange > 0 ? "+" : ""}{myEloChange}
              </span>
              <span className="text-[8px] text-[var(--text-dim)]">&rarr;</span>
              <span className="text-[var(--neon-yellow)] text-sm">{result.newElo}</span>
            </div>
            <div className="mt-2">
              <RankBadge rank={result.newRank} size="md" />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-4 slide-up">
        <RetroButton variant="success" onClick={onPlayAgain}>
          PLAY AGAIN
        </RetroButton>
        <RetroButton variant="primary" onClick={onBackToLobby}>
          LOBBY
        </RetroButton>
      </div>
    </div>
  );
}
