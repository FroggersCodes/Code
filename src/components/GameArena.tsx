"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CodeEditor } from "./CodeEditor";
import { PlayerCard } from "./PlayerCard";
import { Timer } from "./Timer";
import { RetroButton } from "./RetroButton";
import { submitCode, timeUp, setOnBotSolve } from "@/lib/gameEngine";
import { getPlayer } from "@/lib/storage";
import { BOT_PLAYER } from "@/lib/bot";
import type { LocalGameState, GameResult } from "@/lib/gameEngine";

interface GameArenaProps {
  game: LocalGameState;
  onGameResult: (result: GameResult) => void;
}

export function GameArena({ game, onGameResult }: GameArenaProps) {
  const [code, setCode] = useState(game.challenge.buggyCode);
  const [submitted, setSubmitted] = useState(false);
  const [solved, setSolved] = useState(false);
  const [opponentSolved, setOpponentSolved] = useState(false);
  const [showError, setShowError] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [botTyping, setBotTyping] = useState(true);
  const resultSent = useRef(false);

  const player = getPlayer();

  useEffect(() => {
    // Simulate bot typing
    const typingInterval = setInterval(() => {
      setBotTyping((prev) => !prev);
    }, 2000 + Math.random() * 3000);

    // Listen for bot solving
    setOnBotSolve(() => {
      setOpponentSolved(true);
      setBotTyping(false);
      // End the game after a brief moment
      setTimeout(() => {
        if (!resultSent.current) {
          resultSent.current = true;
          setGameEnded(true);
          const result = timeUp();
          onGameResult(result);
        }
      }, 1500);
    });

    return () => clearInterval(typingInterval);
  }, [onGameResult]);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
    setShowError(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (submitted && solved) return;
    if (gameEnded) return;

    setSubmitted(true);
    setShake(true);
    setTimeout(() => setShake(false), 500);

    const { correct, result } = submitCode(code);

    if (correct && result) {
      setSolved(true);
      resultSent.current = true;
      setGameEnded(true);
      onGameResult(result);
    } else {
      setTimeout(() => {
        setShowError(true);
        setSubmitted(false);
      }, 300);
    }
  }, [code, submitted, solved, gameEnded, onGameResult]);

  const handleTimeUp = useCallback(() => {
    if (!gameEnded && !resultSent.current) {
      resultSent.current = true;
      setGameEnded(true);
      const result = timeUp();
      onGameResult(result);
    }
  }, [gameEnded, onGameResult]);

  return (
    <div className={`max-w-7xl mx-auto px-4 py-4 ${shake ? "shake" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <PlayerCard
          username={player?.username || "You"}
          elo={player?.elo || 1000}
          rank={player?.rank || "Silver"}
          isYou={true}
          solved={solved}
        />

        <Timer duration={90} onTimeUp={handleTimeUp} started={true} />

        <PlayerCard
          username={BOT_PLAYER.username}
          elo={BOT_PLAYER.elo}
          rank={BOT_PLAYER.rank}
          isYou={false}
          solved={opponentSolved}
          typing={botTyping && !opponentSolved && !gameEnded}
        />
      </div>

      <div className="nes-container is-dark mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[var(--neon-yellow)] text-xs">
            {game.challenge.title}
          </h2>
          <span className="text-[8px] text-[var(--text-dim)]">
            {game.challenge.language.toUpperCase()} | DIFF: {"*".repeat(game.challenge.difficulty)}
          </span>
        </div>
        <p className="text-[10px] text-[var(--text-primary)] leading-relaxed">
          {game.challenge.description}
        </p>
        {game.challenge.hint && (
          <div className="mt-2">
            {showHint ? (
              <p className="text-[8px] text-[var(--neon-purple)]">
                HINT: {game.challenge.hint}
              </p>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="text-[8px] text-[var(--text-dim)] hover:text-[var(--neon-purple)] transition-colors cursor-pointer bg-transparent border-none"
                style={{ fontFamily: "inherit" }}
              >
                [ SHOW HINT ]
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <CodeEditor
          value={code}
          language={game.challenge.language}
          onChange={handleCodeChange}
          readOnly={gameEnded || solved}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          {showError && (
            <span className="text-[10px] text-[var(--neon-pink)] glow-pink flash">
              INCORRECT FIX! TRY AGAIN
            </span>
          )}
          {solved && (
            <span className="text-[10px] text-[var(--neon-green)] glow-green">
              BUG SQUASHED!
            </span>
          )}
        </div>
        <RetroButton
          variant="success"
          onClick={handleSubmit}
          disabled={gameEnded || solved}
        >
          SUBMIT FIX
        </RetroButton>
      </div>

      {opponentSolved && !solved && !gameEnded && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="text-[var(--neon-pink)] glow-pink text-lg animate-bounce">
            OPPONENT SOLVED IT!
          </div>
        </div>
      )}
    </div>
  );
}
