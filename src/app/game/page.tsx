"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GameArena } from "@/components/GameArena";
import { ResultsScreen } from "@/components/ResultsScreen";
import { getCurrentGame, cleanupGame } from "@/lib/gameEngine";
import {
  getCurrentMultiplayerGame,
  signalReady,
  cleanupMultiplayerGame,
  setOnGameStart,
} from "@/lib/multiplayerEngine";
import type { LocalGameState, GameResult } from "@/lib/gameEngine";
import type { ChallengeData, MultiplayerResult } from "@/types";

type Phase = "waiting" | "countdown" | "playing" | "results";

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "bot";
  const roomId = searchParams.get("room");

  const [phase, setPhase] = useState<Phase>("waiting");
  const [game, setGame] = useState<LocalGameState | null>(null);
  const [multiplayerChallenge, setMultiplayerChallenge] = useState<ChallengeData | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [countdown, setCountdown] = useState(3);

  const startCountdown = useCallback(() => {
    setPhase("countdown");
    let count = 3;
    setCountdown(3);
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setPhase("playing");
      }
    }, 1000);
    return interval;
  }, []);

  // Bot mode init
  useEffect(() => {
    if (mode !== "bot") return;

    const currentGame = getCurrentGame();
    if (!currentGame) {
      router.push("/lobby");
      return;
    }
    setGame(currentGame);
    const interval = startCountdown();
    return () => clearInterval(interval);
  }, [mode, router, startCountdown]);

  // Multiplayer mode init
  useEffect(() => {
    if (mode !== "multiplayer" || !roomId) return;

    const mpGame = getCurrentMultiplayerGame();
    if (!mpGame) {
      router.push("/lobby");
      return;
    }

    setOnGameStart((updatedGame) => {
      if (updatedGame.challenge) {
        setMultiplayerChallenge(updatedGame.challenge);
        startCountdown();
      }
    });

    if (mpGame.challenge) {
      setMultiplayerChallenge(mpGame.challenge);
      startCountdown();
    } else {
      signalReady(roomId);
    }

    return () => {
      setOnGameStart(null);
    };
  }, [mode, roomId, router, startCountdown]);

  const handleGameResult = useCallback((gameResult: GameResult) => {
    setResult(gameResult);
    setTimeout(() => setPhase("results"), 1500);
  }, []);

  const handleMultiplayerResult = useCallback((mpResult: MultiplayerResult) => {
    const gameResult: GameResult = {
      won: mpResult.won,
      draw: mpResult.draw,
      playerTime: mpResult.playerTime,
      botTime: mpResult.opponentTime,
      opponentTime: mpResult.opponentTime,
      opponentName: mpResult.opponentName,
      eloChange: mpResult.eloChange,
      newElo: mpResult.newElo,
      newRank: mpResult.newRank,
    };
    setResult(gameResult);
    setTimeout(() => setPhase("results"), 1500);
  }, []);

  const handlePlayAgain = useCallback(() => {
    if (mode === "bot") {
      cleanupGame();
    } else {
      cleanupMultiplayerGame();
    }
    router.push("/lobby");
  }, [mode, router]);

  const mpGame = getCurrentMultiplayerGame();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {phase === "waiting" && (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="text-[var(--neon-green)] text-sm pulse-neon">
              {mode === "multiplayer" ? "WAITING FOR OPPONENT..." : "LOADING MATCH..."}
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

      {phase === "playing" && mode === "bot" && game && (
        <GameArena
          game={game}
          onGameResult={handleGameResult}
        />
      )}

      {phase === "playing" && mode === "multiplayer" && multiplayerChallenge && roomId && mpGame && (
        <GameArena
          challenge={multiplayerChallenge}
          multiplayerConfig={{ roomId, opponent: mpGame.opponent }}
          onMultiplayerResult={handleMultiplayerResult}
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

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-[var(--neon-green)] text-sm pulse-neon">LOADING...</div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
