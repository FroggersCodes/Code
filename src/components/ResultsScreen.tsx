"use client";

import { useEffect, useState } from "react";
import { RankBadge } from "./RankBadge";
import { RetroButton } from "./RetroButton";
import { getPlayer } from "@/lib/storage";
import { connectSocket } from "@/lib/socket";
import { RANK_COLORS, type RankTier } from "@/types";
import type { GameResult } from "@/lib/gameEngine";

const REACTIONS = ["GG", "WELL PLAYED", "UNLUCKY", "NICE TRY", "CLOSE ONE"] as const;

const RANK_ORDER: RankTier[] = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Grandmaster"];

function RankChangePopup({ oldRank, newRank, onDismiss }: { oldRank: string; newRank: string; onDismiss: () => void }) {
  const isPromotion = RANK_ORDER.indexOf(newRank as RankTier) > RANK_ORDER.indexOf(oldRank as RankTier);
  const color = RANK_COLORS[newRank as RankTier] || "#666";

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
      onClick={onDismiss}
    >
      <div className="text-center slide-up" onClick={(e) => e.stopPropagation()}>
        <div
          className="text-sm tracking-widest mb-4"
          style={{ color: isPromotion ? "#00ff41" : "var(--accent-red)", fontFamily: "'Orbitron', sans-serif" }}
        >
          {isPromotion ? "RANK UP!" : "RANK DOWN"}
        </div>

        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center opacity-50">
            <RankBadge rank={oldRank} size="md" />
            <div className="text-[10px] text-[var(--text-muted)] mt-1">{oldRank}</div>
          </div>
          <div
            className="text-xl font-bold"
            style={{ color: isPromotion ? "#00ff41" : "var(--accent-red)", fontFamily: "'Orbitron', sans-serif" }}
          >
            {isPromotion ? "▸" : "◂"}
          </div>
          <div className="text-center">
            <div style={{ filter: `drop-shadow(0 0 12px ${color})` }}>
              <RankBadge rank={newRank} size="lg" />
            </div>
            <div
              className="text-xs font-bold mt-1"
              style={{ color, textShadow: `0 0 8px ${color}` }}
            >
              {newRank}
            </div>
          </div>
        </div>

        <div className="text-[10px] text-[var(--text-muted)] tracking-wider mb-4">
          {isPromotion ? "Congratulations on your promotion!" : "Keep fighting to climb back!"}
        </div>

        <RetroButton variant={isPromotion ? "success" : "primary"} onClick={onDismiss}>
          CONTINUE
        </RetroButton>
      </div>
    </div>
  );
}

interface ResultsScreenProps {
  result: GameResult;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  onSendReaction?: (msg: string) => void;
  opponentReaction?: string | null;
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

export function ResultsScreen({ result, onPlayAgain, onBackToLobby, onSendReaction, opponentReaction }: ResultsScreenProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("Fix is wrong");
  const [reportDesc, setReportDesc] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [mySentReaction, setMySentReaction] = useState<string | null>(null);
  const [showRankChange, setShowRankChange] = useState(false);
  const player = getPlayer();

  const rankChanged = result.previousRank && result.newRank !== result.previousRank;

  useEffect(() => {
    if (rankChanged) {
      const timer = setTimeout(() => setShowRankChange(true), 1800);
      return () => clearTimeout(timer);
    }
  }, [rankChanged]);

  useEffect(() => {
    const timer = setTimeout(() => setShowDetails(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const myEloChange = result.won ? result.eloChange : result.draw ? 0 : -result.eloChange;
  const opponentTime = result.opponentTime ?? result.botTime;
  const hasDiff = !!(result.buggyCode && result.fixedCode);

  // Calculate coins earned (same logic as storage.ts)
  let coinsEarned = 0;
  if (result.won) {
    coinsEarned = 25;
    const streak = player?.winStreak ?? 0;
    if (streak >= 3) coinsEarned += 10;
    if (streak >= 5) coinsEarned += 15;
    if (streak >= 10) coinsEarned += 25;
  } else if (result.draw) {
    coinsEarned = 5;
  } else {
    coinsEarned = 2;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-center">
      {showRankChange && rankChanged && (
        <RankChangePopup
          oldRank={result.previousRank!}
          newRank={result.newRank}
          onDismiss={() => setShowRankChange(false)}
        />
      )}
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
            <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
              <div className="flex items-center justify-center gap-1">
                <span className="text-[var(--accent-yellow)]">$</span>
                <span className="text-sm font-bold text-[var(--accent-yellow)]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  +{coinsEarned}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] ml-1">COINS</span>
              </div>
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

      {/* Quick Reactions — multiplayer only */}
      {onSendReaction && (
        <div className="mb-4 slide-up">
          <div className="hacker-card hacker-card-red">
            <div className="text-xs text-[var(--text-dim)] mb-2 tracking-wider">QUICK REACTIONS</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {REACTIONS.map((msg) => (
                <button
                  key={msg}
                  disabled={!!mySentReaction}
                  onClick={() => {
                    onSendReaction(msg);
                    setMySentReaction(msg);
                  }}
                  className={`text-[10px] px-2 py-1 border rounded tracking-wider transition-all ${
                    mySentReaction === msg
                      ? "border-[var(--accent-green)] text-[var(--accent-green)]"
                      : mySentReaction
                      ? "border-[var(--border-color)] text-[var(--text-muted)] opacity-40 cursor-not-allowed"
                      : "border-[var(--border-color)] text-[var(--text-dim)] hover:border-[var(--accent-red)] hover:text-[var(--text-primary)] cursor-pointer"
                  }`}
                  style={{ background: "transparent", fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {msg}
                </button>
              ))}
            </div>
            {opponentReaction && (
              <div className="mt-3 text-xs text-[var(--accent-green)] border-l-2 border-[var(--accent-green)] pl-2">
                <span className="text-[var(--text-dim)]">{result.opponentName}:</span> &quot;{opponentReaction}&quot;
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Challenge */}
      {!reportSubmitted ? (
        <div className="mb-4 slide-up">
          {!showReport ? (
            <button
              onClick={() => setShowReport(true)}
              className="text-[9px] text-[var(--text-muted)] hover:text-[var(--accent-yellow)] tracking-wider transition-colors bg-transparent border-none cursor-pointer w-full"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              ⚑ REPORT CHALLENGE
            </button>
          ) : (
            <div className="hacker-card border-[var(--accent-yellow)] border-opacity-40 text-left">
              <div className="text-xs text-[var(--accent-yellow)] mb-3 tracking-wider">REPORT CHALLENGE</div>
              <div className="mb-3">
                <label className="text-[9px] text-[var(--text-dim)] tracking-wider block mb-1">REASON</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="hacker-input text-xs py-1"
                  style={{ appearance: "none" }}
                >
                  <option>Fix is wrong</option>
                  <option>Bug is confusing/impossible</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="text-[9px] text-[var(--text-dim)] tracking-wider block mb-1">DESCRIPTION (OPTIONAL)</label>
                <textarea
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className="hacker-input text-xs py-1 resize-none"
                  rows={3}
                  placeholder="Describe the issue..."
                />
              </div>
              <div className="flex gap-2">
                <RetroButton
                  variant="warning"
                  onClick={() => {
                    const socket = connectSocket();
                    socket.emit("report:add", {
                      username: player?.username ?? "Guest",
                      challengeTitle: result.challengeTitle ?? "Unknown",
                      reason: reportReason,
                      description: reportDesc,
                    });
                    setShowReport(false);
                    setReportSubmitted(true);
                  }}
                >
                  SUBMIT
                </RetroButton>
                <RetroButton variant="primary" onClick={() => setShowReport(false)}>
                  CANCEL
                </RetroButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4 text-xs text-[var(--accent-green)] tracking-wider slide-up">
          ✓ Report submitted
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
