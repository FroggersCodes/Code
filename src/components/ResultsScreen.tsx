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
          style={{ left: piece.left, animationDelay: piece.delay, backgroundColor: piece.color }}
        />
      ))}
    </>
  );
}

type DiffLine = { type: "same" | "removed" | "added"; line: string };

function computeDiff(aText: string, bText: string): DiffLine[] {
  const a = aText.split("\n");
  const b = bText.split("\n");
  const m = a.length, n = b.length;
  // LCS dp table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);

  const out: DiffLine[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      out.unshift({ type: "same", line: a[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      out.unshift({ type: "added", line: b[j - 1] });
      j--;
    } else {
      out.unshift({ type: "removed", line: a[i - 1] });
      i--;
    }
  }
  return out;
}

function CodeDiff({ buggyCode, fixedCode }: { buggyCode: string; fixedCode: string }) {
  const diff = computeDiff(buggyCode, fixedCode);
  return (
    <pre className="text-left text-xs bg-[rgba(0,0,0,0.5)] border border-[var(--border-color)] p-3 overflow-auto font-mono leading-relaxed max-h-64">
      {diff.map((line, i) => (
        <div
          key={i}
          style={{
            color: line.type === "added" ? "#00ff41" : line.type === "removed" ? "var(--accent-red)" : "var(--text-dim)",
            backgroundColor: line.type === "added" ? "rgba(0,255,65,0.06)" : line.type === "removed" ? "rgba(255,0,60,0.08)" : undefined,
          }}
        >
          <span style={{ userSelect: "none", opacity: 0.5, marginRight: "0.5rem" }}>
            {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
          </span>
          {line.line}
        </div>
      ))}
    </pre>
  );
}

export function ResultsScreen({ result, onPlayAgain, onBackToLobby }: ResultsScreenProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const player = getPlayer();

  useEffect(() => {
    const timer = setTimeout(() => setShowDetails(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const myEloChange = result.won ? result.eloChange : result.draw ? 0 : -result.eloChange;
  const opponentTime = result.opponentTime ?? result.botTime;
  const hasDiff = !!(result.buggyCode && result.fixedCode);

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
            <div className="text-xs text-[var(--accent-green)]">BUG SQUASHED</div>
          </>
        ) : (
          <>
            <div className="text-3xl text-[var(--accent-red)] glow-red mb-2 font-black tracking-wider"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              DEFEAT
            </div>
            <div className="text-xs text-[var(--text-dim)]">the bug lives on...</div>
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

      {hasDiff && (
        <div className="mb-4 slide-up">
          <RetroButton variant="primary" onClick={() => setShowDiff((s) => !s)} className="w-full">
            {showDiff ? "HIDE DIFF" : "VIEW DIFF"}
          </RetroButton>
          {showDiff && (
            <div className="mt-3">
              <div className="flex gap-4 text-[10px] text-[var(--text-dim)] mb-2 px-1">
                <span><span style={{ color: "var(--accent-red)" }}>-</span> removed (bug)</span>
                <span><span style={{ color: "#00ff41" }}>+</span> added (fix)</span>
              </div>
              <CodeDiff buggyCode={result.buggyCode!} fixedCode={result.fixedCode!} />
            </div>
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
