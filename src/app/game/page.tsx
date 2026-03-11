"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GameArena } from "@/components/GameArena";
import { ResultsScreen } from "@/components/ResultsScreen";
import { TitleUnlockToast } from "@/components/TitleUnlockToast";
import { getCurrentGame, cleanupGame, startBotGameWithChallenge } from "@/lib/gameEngine";
import {
  getCurrentMultiplayerGame,
  signalReady,
  cleanupMultiplayerGame,
  setOnGameStart,
} from "@/lib/multiplayerEngine";
import { consumePendingTitleToasts, updateCotdRecord } from "@/lib/storage";
import { getChallengeOfTheDay } from "@/lib/challenges";
import { playWinSound, playLoseSound, playCountdownBeep } from "@/lib/sounds";
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
  const [pendingToasts, setPendingToasts] = useState<string[]>([]);
  const [showingToasts, setShowingToasts] = useState(false);
  const resultReadyRef = useRef(false);

  const showResults = useCallback((gameResult: GameResult) => {
    if (gameResult.won) playWinSound();
    else if (!gameResult.draw) playLoseSound();
    const toasts = consumePendingTitleToasts();
    setPendingToasts(toasts);
    setShowingToasts(toasts.length > 0);
    setResult(gameResult);
    setPhase("results");
  }, []);

  const startCountdown = useCallback(() => {
    setPhase("countdown");
    let count = 3;
    setCountdown(3);
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      playCountdownBeep(count === 0);
      if (count <= 0) {
        clearInterval(interval);
        setPhase("playing");
      }
    }, 1000);
    return interval;
  }, []);

  // Bot / COTD mode
  useEffect(() => {
    if (mode !== "bot" && mode !== "cotd") return;

    let currentGame = getCurrentGame();
    if (mode === "cotd" && !currentGame) {
      currentGame = startBotGameWithChallenge(getChallengeOfTheDay());
    }
    if (!currentGame) {
      router.push("/lobby");
      return;
    }
    setGame(currentGame);
    const interval = startCountdown();
    return () => clearInterval(interval);
  }, [mode, router, startCountdown]);

  // Multiplayer mode
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

    return () => { setOnGameStart(null); };
  }, [mode, roomId, router, startCountdown]);

  const handleGameResult = useCallback((gameResult: GameResult) => {
    if (resultReadyRef.current) return;
    resultReadyRef.current = true;
    if (mode === "cotd") updateCotdRecord(gameResult.won, gameResult.playerTime);
    setTimeout(() => showResults(gameResult), 1500);
  }, [mode, showResults]);

  const handleMultiplayerResult = useCallback((mpResult: MultiplayerResult) => {
    if (resultReadyRef.current) return;
    resultReadyRef.current = true;
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
      fixedCode: mpResult.fixedCode,
      buggyCode: mpResult.buggyCode,
    };
    setTimeout(() => showResults(gameResult), 1500);
  }, [showResults]);

  const handlePlayAgain = useCallback(() => {
    if (mode === "bot" || mode === "cotd") cleanupGame();
    else cleanupMultiplayerGame();
    router.push(mode === "cotd" ? "/" : "/lobby");
  }, [mode, router]);

  const mpGame = getCurrentMultiplayerGame();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {showingToasts && pendingToasts.length > 0 && (
        <TitleUnlockToast titles={pendingToasts} onDone={() => setShowingToasts(false)} />
      )}

      {phase === "waiting" && (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="text-[var(--accent-red)] text-sm pulse-glow tracking-wider">
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
                className="text-6xl text-[var(--accent-red)] glow-red font-black"
                key={countdown}
                style={{ fontFamily: "'Orbitron', sans-serif", animation: "pulse-glow 0.5s ease-in-out" }}
              >
                {countdown}
              </div>
            ) : (
              <div className="text-4xl text-[var(--accent-green)] glow-green flash font-black tracking-wider"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                FIX THE BUG
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "playing" && (mode === "bot" || mode === "cotd") && game && (
        <GameArena game={game} onGameResult={handleGameResult} />
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
        <div className="text-[var(--accent-red)] text-sm pulse-glow tracking-wider">LOADING...</div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
