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
  const colors = ["var(--accent-red)", "var(--accent-green)", "var(--accent-yellow)", "#ff3355", "#cc0022"];
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
  const [showSolution, setShowSolution] = useState(false);
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
          <div className="text-3xl text-[var(--accent-yellow)] pulse-glow mb-2 font-black tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            DRAW
          </div>
        ) : result.won ? (
          <>
            <div className="text-3xl text-[var(--accent-green)] glow-green mb-2 font-black tracking-wider"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              VICTORY
            </div>
            <div className="text-xs text-[var(--accent-green)]">
              BUG SQUASHED
            </div>
          </>
        ) : (
          <>
            <div className="text-3xl text-[var(--accent-red)] glow-red mb-2 font-black tracking-wider"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              DEFEAT
            </div>
            <div className="text-xs text-[var(--text-dim)]">
              the bug lives on...
            </div>
          </>
        )}
      </div>

      {showDetails && (
        <div className="hacker-card hacker-card-red mb-6 slide-up">
          <div className="flex justify-between items-center mb-4">
            <div className="text-left">
              <div className="text-xs text-[var(--text-primary)] mb-1">{player?.username || "You"}</div>
              <div className="text-xs text-[var(--text-dim)]">
                {result.playerTime ? `${(result.playerTime / 1000).toFixed(1)}s` : "DNF"}
              </div>
            </div>
            <div className="text-[var(--accent-red)] text-sm font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>VS</div>
            <div className="text-right">
              <div className="text-xs text-[var(--text-dim)] mb-1">{result.opponentName}</div>
              <div className="text-xs text-[var(--text-dim)]">
                {opponentTime ? `${(opponentTime / 1000).toFixed(1)}s` : "DNF"}
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--border-color)] pt-4">
            <div className="text-xs text-[var(--text-dim)] mb-2 tracking-wider">ELO CHANGE</div>
            <div className="flex items-center justify-center gap-4">
              <span
                className={`text-xl font-bold ${
                  myEloChange > 0 ? "text-[var(--accent-green)] glow-green" : myEloChange < 0 ? "text-[var(--accent-red)] glow-red" : "text-[var(--text-dim)]"
                }`}
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                {myEloChange > 0 ? "+" : ""}{myEloChange}
              </span>
              <span className="text-xs text-[var(--text-muted)]">&rarr;</span>
              <span className="text-[var(--text-primary)] text-base font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                {result.newElo}
              </span>
            </div>
            <div className="mt-3">
              <RankBadge rank={result.newRank} size="md" />
            </div>
          </div>
        </div>
      )}

      {result.fixedCode && (
        <div className="mb-4 slide-up">
          <RetroButton variant="primary" onClick={() => setShowSolution((s) => !s)} className="w-full">
            {showSolution ? "HIDE SOLUTION" : "VIEW SOLUTION"}
          </RetroButton>
          {showSolution && (
            <pre className="mt-3 text-left text-xs bg-[rgba(0,0,0,0.4)] border border-[var(--border-color)] p-3 overflow-auto text-[var(--accent-green)] font-mono leading-relaxed max-h-64">
              {result.fixedCode}
            </pre>
          )}
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
