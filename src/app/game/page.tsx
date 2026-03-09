"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GameArena } from "@/components/GameArena";
import { ResultsScreen } from "@/components/ResultsScreen";
import { getCurrentGame, cleanupGame } from "@/lib/gameEngine";
import type { LocalGameState, GameResult } from "@/lib/gameEngine";

type Phase = "waiting" | "countdown" | "playing" | "results";

export default function GamePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("waiting");
  const [game, setGame] = useState<LocalGameState | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const currentGame = getCurrentGame();
    if (!currentGame) {
      router.push("/lobby");
      return;
    }
    setGame(currentGame);

    // Start countdown
    setPhase("countdown");
    let count = 3;
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setPhase("playing");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const handleGameResult = useCallback((gameResult: GameResult) => {
    setResult(gameResult);
    setTimeout(() => setPhase("results"), 1500);
  }, []);

  const handlePlayAgain = useCallback(() => {
    cleanupGame();
    router.push("/lobby");
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {phase === "waiting" && (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="text-[var(--neon-green)] text-sm pulse-neon">
              LOADING MATCH...
            </div>
          </div>
        </div>
      )}

      {phase === "countdown" && (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            {countdown > 0 ? (
              <div
                className="text-6xl text-[var(--neon-yellow)] glow-blue"
                key={countdown}
                style={{ animation: "pulse-neon 0.5s ease-in-out" }}
              >
                {countdown}
              </div>
            ) : (
              <div className="text-4xl text-[var(--neon-green)] glow-green flash">
                FIX THE BUG!
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "playing" && game && (
        <GameArena
          game={game}
          onGameResult={handleGameResult}
        />
      )}

      {phase === "results" && result && (
        <ResultsScreen
          result={result}
          onPlayAgain={handlePlayAgain}
          onBackToLobby={handlePlayAgain}
        />
      )}
    </div>
  );
}
