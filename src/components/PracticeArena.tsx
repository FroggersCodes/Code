"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CodeEditor } from "./CodeEditor";
import { Timer } from "./Timer";
import { RetroButton } from "./RetroButton";
import { RankBadge } from "./RankBadge";
import { submitPracticeCode, practiceTimeUp, type PracticeResult } from "@/lib/practiceEngine";
import { getPlayer } from "@/lib/storage";
import type { FullChallenge } from "@/lib/challenges";
import type { PracticeOpponent } from "@/types";

interface PracticeArenaProps {
  challenge: FullChallenge;
  timeLimit: number; // seconds
  onFinished: (result: PracticeResult) => void;
  // Present only in friend/invite mode
  friendMode?: {
    roomId: string;
    opponent: PracticeOpponent;
    onSubmit: (code: string) => void;
    onTimeout: () => void;
    opponentSolved: boolean;
    opponentTime: number | null;
  };
}

const DIFFICULTY_STARS = ["", "★", "★★", "★★★"];
const DIFFICULTY_COLORS = ["", "#00ff41", "#ffcc00", "var(--accent-red)"];

export function PracticeArena({ challenge, timeLimit, onFinished, friendMode }: PracticeArenaProps) {
  const player = getPlayer();
  const [code, setCode] = useState(challenge.buggyCode);
  const [gameEnded, setGameEnded] = useState(false);
  const [solved, setSolved] = useState(false);
  const [showError, setShowError] = useState(false);
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const resultSent = useRef(false);

  const handleTimeUp = useCallback(() => {
    if (resultSent.current) return;
    resultSent.current = true;
    const r = practiceTimeUp();
    setGameEnded(true);
    setShowSolution(true);
    setResult(r);
    friendMode?.onTimeout();
    onFinished(r);
  }, [onFinished, friendMode]);

  const handleSubmit = useCallback(() => {
    if (gameEnded) return;

    // In friend mode the parent handles submission via socket
    if (friendMode) {
      friendMode.onSubmit(code);
      return;
    }

    const { correct, result: r } = submitPracticeCode(code);
    if (!correct) {
      setShowError(true);
      setShake(true);
      setTimeout(() => { setShake(false); setShowError(false); }, 600);
      return;
    }

    if (!resultSent.current && r) {
      resultSent.current = true;
      setSolved(true);
      setGameEnded(true);
      setResult(r);
      onFinished(r);
    }
  }, [code, gameEnded, friendMode, onFinished]);

  // In friend mode: parent notifies us of a correct submission result
  const handleFriendResult = useCallback((correct: boolean, r?: PracticeResult) => {
    if (!correct) {
      setShowError(true);
      setShake(true);
      setTimeout(() => { setShake(false); setShowError(false); }, 600);
      return;
    }
    if (r && !resultSent.current) {
      resultSent.current = true;
      setSolved(true);
      setGameEnded(true);
      setShowSolution(true);
      setResult(r);
      onFinished(r);
    }
  }, [onFinished]);

  // Expose handleFriendResult via ref so parent can call it
  const friendResultRef = useRef(handleFriendResult);
  friendResultRef.current = handleFriendResult;

  // When opponent solves in friend mode, end the game for us too if we haven't
  useEffect(() => {
    if (friendMode?.opponentSolved && !gameEnded) {
      // Don't force-end — player can still finish, parent will send practice:end
    }
  }, [friendMode?.opponentSolved, gameEnded]);

  const diffColor = DIFFICULTY_COLORS[challenge.difficulty] || "#666";
  const diffStars = DIFFICULTY_STARS[challenge.difficulty] || "";

  return (
    <div className={`w-full max-w-4xl mx-auto px-2 sm:px-4 ${shake ? "shake" : ""}`}>
      {/* Header row: timer + challenge info */}
      <div className="flex items-start justify-between mb-4 gap-2 sm:gap-4">
        {/* Player info */}
        <div className="hacker-card hacker-card-red flex items-center gap-2 sm:gap-3 py-2 px-2 sm:px-3 min-w-0 flex-1">
          <RankBadge rank={player?.rank ?? "Bronze"} size="sm" />
          <div>
            <div className="text-xs text-[var(--text-primary)] font-bold truncate">
              {player?.username ?? "PLAYER"}
            </div>
            <div className="text-xs text-[var(--text-dim)]">{player?.elo ?? 0} ELO</div>
          </div>
          {solved && (
            <span className="text-xs text-[#00ff41] font-bold tracking-wider ml-1">✓ SOLVED</span>
          )}
        </div>

        {/* Timer */}
        <div className="hacker-card hacker-card-red py-2 px-4">
          <Timer duration={timeLimit} onTimeUp={handleTimeUp} started={!gameEnded} />
        </div>

        {/* Opponent (friend mode only) or PRACTICE badge */}
        {friendMode ? (
          <div className="hacker-card hacker-card-red flex items-center gap-2 sm:gap-3 py-2 px-2 sm:px-3 min-w-0 flex-1">
            <RankBadge rank={friendMode.opponent.rank} size="sm" />
            <div>
              <div className="text-xs text-[var(--text-primary)] font-bold">
                {friendMode.opponent.username}
              </div>
              <div className="text-xs text-[var(--text-dim)]">{friendMode.opponent.elo} ELO</div>
            </div>
            {friendMode.opponentSolved && (
              <span className="text-xs text-[#00ff41] font-bold tracking-wider ml-1">✓ SOLVED</span>
            )}
          </div>
        ) : (
          <div className="hacker-card hacker-card-red py-2 px-4 flex items-center">
            <span className="text-xs text-[var(--accent-red)] tracking-widest font-bold">
              PRACTICE
            </span>
          </div>
        )}
      </div>

      {/* Challenge card */}
      <div className="hacker-card hacker-card-red mb-4">
        <div className="flex items-center justify-between mb-2">
          <div
            className="text-sm font-bold text-[var(--text-primary)] tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {challenge.title}
          </div>
          <span className="text-xs font-bold" style={{ color: diffColor }}>
            {diffStars}
          </span>
        </div>
        <p className="text-xs text-[var(--text-dim)] mb-3">{challenge.description}</p>
        {challenge.hint && (
          <div>
            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-[var(--accent-red)] hover:text-[var(--text-primary)] transition-colors tracking-wider"
              >
                [ SHOW HINT ]
              </button>
            ) : (
              <div className="text-xs text-[var(--accent-yellow)] border border-[var(--accent-yellow)] border-opacity-30 px-2 py-1 rounded">
                HINT: {challenge.hint}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Code editor */}
      <div className="hacker-card hacker-card-red mb-4">
        <CodeEditor
          value={code}
          language={challenge.language}
          onChange={setCode}
          readOnly={gameEnded}
        />
      </div>

      {/* Error / submit */}
      {!gameEnded && (
        <div className="flex flex-col items-center gap-3 mb-4">
          {showError && (
            <div className="text-xs text-[var(--accent-red)] tracking-wider flash">
              ✗ INCORRECT — CHECK YOUR FIX
            </div>
          )}
          <RetroButton variant="success" onClick={handleSubmit} className="w-full max-w-xs">
            SUBMIT FIX
          </RetroButton>
        </div>
      )}

      {/* Result banner */}
      {gameEnded && result && (
        <div
          className={`hacker-card mb-4 text-center ${
            result.solved ? "hacker-card-green" : "hacker-card-red"
          }`}
        >
          <div
            className={`text-lg font-bold mb-1 tracking-widest ${
              result.solved ? "text-[#00ff41] glow-green" : "text-[var(--accent-red)] glow-red"
            }`}
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {result.solved ? "BUG FIXED!" : "TIME UP"}
          </div>
          {result.solved && result.timeMs !== null && (
            <div className="text-xs text-[var(--text-dim)]">
              Solved in {(result.timeMs / 1000).toFixed(2)}s
            </div>
          )}
          {friendMode?.opponentSolved && friendMode.opponentTime !== null && (
            <div className="text-xs text-[var(--text-dim)] mt-1">
              {friendMode.opponent.username} solved in {(friendMode.opponentTime / 1000).toFixed(2)}s
            </div>
          )}
          <div className="text-xs text-[var(--accent-yellow)] mt-1 tracking-wider">
            NO ELO CHANGE — PRACTICE MODE
          </div>
        </div>
      )}

      {/* Correct solution reveal */}
      {gameEnded && (
        <div className="hacker-card hacker-card-red mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-dim)] tracking-wider">CORRECT SOLUTION</span>
            {!showSolution && (
              <button
                onClick={() => setShowSolution(true)}
                className="text-xs text-[var(--accent-red)] hover:text-[var(--text-primary)] transition-colors tracking-wider"
              >
                [ REVEAL ]
              </button>
            )}
          </div>
          {showSolution && (
            <CodeEditor
              value={challenge.fixedCode}
              language={challenge.language}
              onChange={() => {}}
              readOnly
            />
          )}
        </div>
      )}
    </div>
  );
}
