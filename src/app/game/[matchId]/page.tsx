"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { GameArena } from "@/components/GameArena";
import { ResultsScreen } from "@/components/ResultsScreen";
import { getSocket } from "@/lib/socket";
import type { GameState, MatchResult } from "@/types";

type Phase = "waiting" | "countdown" | "playing" | "results";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("waiting");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [playerId, setPlayerId] = useState<number>(0);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const uidMatch = document.cookie.match(/(?:^|; )userId=([^;]*)/);
    const unameMatch = document.cookie.match(/(?:^|; )username=([^;]*)/);
    if (uidMatch) setPlayerId(parseInt(uidMatch[1]));
    if (unameMatch) setUsername(decodeURIComponent(unameMatch[1]));
  }, []);

  useEffect(() => {
    const socket = getSocket();

    socket.on("game_start", (state: GameState) => {
      setGameState(state);
      setPhase("countdown");

      // Countdown 3, 2, 1, GO!
      let count = 3;
      const interval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          setPhase("playing");
        }
      }, 1000);
    });

    socket.on("game_end", (matchResult: MatchResult) => {
      setResult(matchResult);
      setTimeout(() => setPhase("results"), 1500);
    });

    return () => {
      socket.off("game_start");
      socket.off("game_end");
    };
  }, []);

  const handleGameEnd = useCallback(() => {
    // Result will come from socket
  }, []);

  const handlePlayAgain = useCallback(() => {
    router.push("/lobby");
  }, [router]);

  const handleBackToLobby = useCallback(() => {
    router.push("/lobby");
  }, [router]);

  const opponentUsername = gameState
    ? playerId === gameState.player1.id
      ? gameState.player2.username
      : gameState.player1.username
    : "???";

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Waiting phase */}
      {phase === "waiting" && (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="text-[var(--neon-green)] text-sm pulse-neon">
              LOADING MATCH...
            </div>
            <div className="text-[8px] text-[var(--text-dim)] mt-2">
              Match #{params.matchId}
            </div>
          </div>
        </div>
      )}

      {/* Countdown phase */}
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

      {/* Playing phase */}
      {phase === "playing" && gameState && (
        <GameArena
          gameState={gameState}
          playerId={playerId}
          onGameEnd={handleGameEnd}
        />
      )}

      {/* Results phase */}
      {phase === "results" && result && (
        <ResultsScreen
          result={result}
          playerId={playerId}
          playerUsername={username}
          opponentUsername={opponentUsername}
          onPlayAgain={handlePlayAgain}
          onBackToLobby={handleBackToLobby}
        />
      )}
    </div>
  );
}
