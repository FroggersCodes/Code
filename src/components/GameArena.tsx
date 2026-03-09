"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CodeEditor } from "./CodeEditor";
import { PlayerCard } from "./PlayerCard";
import { Timer } from "./Timer";
import { RetroButton } from "./RetroButton";
import type { GameState } from "@/types";
import { getSocket } from "@/lib/socket";

interface GameArenaProps {
  gameState: GameState;
  playerId: number;
  onGameEnd: () => void;
}

export function GameArena({ gameState, playerId, onGameEnd }: GameArenaProps) {
  const [code, setCode] = useState(gameState.challenge.buggyCode);
  const [submitted, setSubmitted] = useState(false);
  const [solved, setSolved] = useState(false);
  const [opponentSolved, setOpponentSolved] = useState(false);
  const [opponentTyping, setOpponentTyping] = useState(false);
  const [showError, setShowError] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const isPlayer1 = playerId === gameState.player1.id;
  const myInfo = isPlayer1 ? gameState.player1 : gameState.player2;
  const opponentInfo = isPlayer1 ? gameState.player2 : gameState.player1;

  useEffect(() => {
    const socket = getSocket();

    socket.on("opponent_progress", (data) => {
      setOpponentTyping(data.typing);
      if (data.submitCount > 0) {
        setOpponentTyping(false);
      }
    });

    socket.on("opponent_solved", () => {
      setOpponentSolved(true);
    });

    socket.on("game_end", () => {
      setGameEnded(true);
      setTimeout(onGameEnd, 1500);
    });

    return () => {
      socket.off("opponent_progress");
      socket.off("opponent_solved");
      socket.off("game_end");
    };
  }, [onGameEnd]);

  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value);
      setShowError(false);

      const socket = getSocket();
      socket.emit("typing_update", { matchId: gameState.matchId, typing: true });

      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit("typing_update", { matchId: gameState.matchId, typing: false });
      }, 2000);
    },
    [gameState.matchId]
  );

  const handleSubmit = useCallback(() => {
    if (submitted && solved) return;

    setSubmitted(true);
    setShake(true);
    setTimeout(() => setShake(false), 500);

    const socket = getSocket();
    socket.emit("code_submit", { matchId: gameState.matchId, code });

    // If the submission was wrong, the server won't respond with game_end
    // We'll show an error after a short delay if no success
    setTimeout(() => {
      if (!solved && !gameEnded) {
        setShowError(true);
        setSubmitted(false);
      }
    }, 500);
  }, [code, gameState.matchId, submitted, solved, gameEnded]);

  const handleTimeUp = useCallback(() => {
    if (!gameEnded) {
      setGameEnded(true);
      setTimeout(onGameEnd, 1500);
    }
  }, [gameEnded, onGameEnd]);

  // Listen for successful solve (game_end with us as winner)
  useEffect(() => {
    const socket = getSocket();
    const handleEnd = (result: { winnerId: number | null }) => {
      if (result.winnerId === playerId) {
        setSolved(true);
      }
    };
    socket.on("game_end", handleEnd);
    return () => {
      socket.off("game_end", handleEnd);
    };
  }, [playerId]);

  return (
    <div className={`max-w-7xl mx-auto px-4 py-4 ${shake ? "shake" : ""}`}>
      {/* Top bar: Timer + Players */}
      <div className="flex items-center justify-between mb-4">
        <PlayerCard
          username={myInfo.username}
          elo={myInfo.elo}
          rank={myInfo.rank}
          isYou={true}
          solved={solved}
        />

        <Timer duration={90} onTimeUp={handleTimeUp} started={true} />

        <PlayerCard
          username={opponentInfo.username}
          elo={opponentInfo.elo}
          rank={opponentInfo.rank}
          isYou={false}
          solved={opponentSolved}
          typing={opponentTyping}
        />
      </div>

      {/* Challenge info */}
      <div className="nes-container is-dark mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[var(--neon-yellow)] text-xs">
            {gameState.challenge.title}
          </h2>
          <span className="text-[8px] text-[var(--text-dim)]">
            {gameState.challenge.language.toUpperCase()} | DIFF: {"*".repeat(gameState.challenge.difficulty)}
          </span>
        </div>
        <p className="text-[10px] text-[var(--text-primary)] leading-relaxed">
          {gameState.challenge.description}
        </p>
        {gameState.challenge.hint && (
          <div className="mt-2">
            {showHint ? (
              <p className="text-[8px] text-[var(--neon-purple)]">
                HINT: {gameState.challenge.hint}
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

      {/* Code editor */}
      <div className="mb-4">
        <CodeEditor
          value={code}
          language={gameState.challenge.language}
          onChange={handleCodeChange}
          readOnly={gameEnded || solved}
        />
      </div>

      {/* Submit area */}
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

      {/* Opponent solved overlay */}
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
