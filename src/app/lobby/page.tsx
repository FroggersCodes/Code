"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/RetroButton";
import { RankBadge } from "@/components/RankBadge";
import { getPlayer } from "@/lib/storage";
import { startBotGame } from "@/lib/gameEngine";
import { BOT_PLAYER } from "@/lib/bot";
import {
  joinQueue,
  leaveQueue,
  setOnMatchFound,
  setOnQueueStatus,
  type MultiplayerGameState,
} from "@/lib/multiplayerEngine";
import { disconnectSocket } from "@/lib/socket";
import type { Player } from "@/types";

type GameMode = "select" | "bot" | "online";
type LobbyState = "idle" | "queuing" | "matched";

export default function LobbyPage() {
  const [mode, setMode] = useState<GameMode>("select");
  const [state, setState] = useState<LobbyState>("idle");
  const [player, setPlayer] = useState<Player | null>(null);
  const [opponent, setOpponent] = useState<{ username: string; elo: number; rank: string } | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [queueTime, setQueueTime] = useState(0);
  const [showBotFallback, setShowBotFallback] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(false);
  const queueTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const p = getPlayer();
    if (!p) {
      router.push("/");
      return;
    }
    setPlayer(p);

    import("@/lib/socket").then(({ connectSocket, getSocket }) => {
      const socket = connectSocket();
      const timeout = setTimeout(() => {
        if (!socket.connected) {
          socket.disconnect();
          setServerAvailable(false);
        }
      }, 2000);
      socket.on("connect", () => {
        clearTimeout(timeout);
        setServerAvailable(true);
      });
      socket.on("connect_error", () => {
        clearTimeout(timeout);
        socket.disconnect();
        setServerAvailable(false);
      });
    }).catch(() => {
      setServerAvailable(false);
    });
  }, [router]);

  useEffect(() => {
    return () => {
      if (queueTimerRef.current) clearInterval(queueTimerRef.current);
      setOnMatchFound(null);
      setOnQueueStatus(null);
    };
  }, []);

  const handleStartBot = useCallback(() => {
    setMode("bot");
    setState("queuing");
    setTimeout(() => {
      setState("matched");
      setTimeout(() => {
        startBotGame();
        router.push("/game?mode=bot");
      }, 2000);
    }, 1500);
  }, [router]);

  const handleStartOnline = useCallback(() => {
    setMode("online");
    setState("queuing");
    setQueueTime(0);
    setShowBotFallback(false);

    queueTimerRef.current = setInterval(() => {
      setQueueTime((prev) => {
        if (prev >= 30) {
          setShowBotFallback(true);
        }
        return prev + 1;
      });
    }, 1000);

    setOnMatchFound((game: MultiplayerGameState) => {
      if (queueTimerRef.current) {
        clearInterval(queueTimerRef.current);
        queueTimerRef.current = null;
      }
      setOpponent(game.opponent);
      setRoomId(game.roomId);
      setState("matched");

      setTimeout(() => {
        router.push(`/game?mode=multiplayer&room=${game.roomId}`);
      }, 2000);
    });

    joinQueue();
  }, [router]);

  const handleCancelQueue = useCallback(() => {
    leaveQueue();
    if (queueTimerRef.current) {
      clearInterval(queueTimerRef.current);
      queueTimerRef.current = null;
    }
    setMode("select");
    setState("idle");
    setShowBotFallback(false);
  }, []);

  const handleBotFallback = useCallback(() => {
    leaveQueue();
    disconnectSocket();
    if (queueTimerRef.current) {
      clearInterval(queueTimerRef.current);
      queueTimerRef.current = null;
    }
    handleStartBot();
  }, [handleStartBot]);

  if (!player) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <h1
        className="text-lg text-[var(--accent-red)] glow-red mb-8 tracking-widest font-bold"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        BATTLE LOBBY
      </h1>

      {state === "idle" && mode === "select" && (
        <div className="text-center slide-up w-full max-w-md">
          <div className="hacker-card hacker-card-red mb-6">
            <div className="text-xs text-[var(--text-dim)] mb-1 tracking-wider">PLAYER</div>
            <div className="text-[var(--text-primary)] text-base mb-2 font-bold">{player.username}</div>
            <div className="flex items-center justify-center gap-3 mb-6">
              <RankBadge rank={player.rank} size="md" />
              <span className="text-xs text-[var(--text-dim)]">{player.elo} ELO</span>
            </div>
            <div className="mb-2">
              <div className="text-xs text-[var(--text-dim)] mb-4 tracking-wider">SELECT MODE</div>
              <div className="flex justify-center gap-4">
                {serverAvailable && (
                  <RetroButton variant="primary" onClick={handleStartOnline}>
                    VS PLAYER
                  </RetroButton>
                )}
                <RetroButton variant="success" onClick={handleStartBot}>
                  VS BOT
                </RetroButton>
              </div>
            </div>
          </div>
          <div className="text-xs text-[var(--text-dim)]">
            {serverAvailable ? "Challenge a real player or fight the bot" : "Bot difficulty scales with your rank"}
          </div>
        </div>
      )}

      {state === "queuing" && mode === "bot" && (
        <div className="text-center slide-up">
          <div className="hacker-card hacker-card-red inline-block">
            <div className="text-[var(--accent-red)] glow-red text-sm mb-4 tracking-wider">
              INITIALIZING BOT...
            </div>
            <div className="flex justify-center gap-2 mb-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: "var(--accent-red)",
                    animation: "pulse-glow 1s ease-in-out infinite",
                    animationDelay: i * 0.2 + "s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {state === "queuing" && mode === "online" && (
        <div className="text-center slide-up">
          <div className="hacker-card hacker-card-red inline-block min-w-[300px]">
            <div className="text-[var(--accent-red)] glow-red text-sm mb-4 tracking-wider">
              SEARCHING FOR OPPONENT...
            </div>
            <div className="flex justify-center gap-2 mb-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: "var(--accent-red)",
                    animation: "pulse-glow 1s ease-in-out infinite",
                    animationDelay: i * 0.2 + "s",
                  }}
                />
              ))}
            </div>
            <div className="text-xs text-[var(--text-dim)] mb-4">
              {queueTime}s elapsed
            </div>
            <RetroButton variant="error" onClick={handleCancelQueue}>
              CANCEL
            </RetroButton>
            {showBotFallback && (
              <div className="mt-4 border-t border-[var(--border-color)] pt-4">
                <div className="text-xs text-[var(--accent-yellow)] mb-3">
                  NO OPPONENTS FOUND
                </div>
                <RetroButton variant="success" onClick={handleBotFallback}>
                  FIGHT BOT INSTEAD
                </RetroButton>
              </div>
            )}
          </div>
        </div>
      )}

      {state === "matched" && mode === "bot" && (
        <div className="text-center slide-up">
          <div className="text-[var(--accent-red)] text-xl glow-red mb-6 flash font-bold tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            MATCH FOUND
          </div>
          <div className="hacker-card hacker-card-red">
            <div className="flex items-center justify-between gap-8">
              <div>
                <div className="text-xs text-[var(--text-primary)] mb-2">{player.username}</div>
                <RankBadge rank={player.rank} size="md" />
              </div>
              <div className="text-[var(--accent-red)] text-xl pulse-glow font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>VS</div>
              <div>
                <div className="text-xs text-[var(--text-dim)] mb-2">{BOT_PLAYER.username}</div>
                <RankBadge rank={BOT_PLAYER.rank} size="md" />
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-[var(--accent-red)] pulse-glow tracking-wider">
            LOADING CHALLENGE...
          </div>
        </div>
      )}

      {state === "matched" && mode === "online" && opponent && (
        <div className="text-center slide-up">
          <div className="text-[var(--accent-red)] text-xl glow-red mb-6 flash font-bold tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            MATCH FOUND
          </div>
          <div className="hacker-card hacker-card-red">
            <div className="flex items-center justify-between gap-8">
              <div>
                <div className="text-xs text-[var(--text-primary)] mb-2">{player.username}</div>
                <RankBadge rank={player.rank} size="md" />
              </div>
              <div className="text-[var(--accent-red)] text-xl pulse-glow font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>VS</div>
              <div>
                <div className="text-xs text-[var(--text-dim)] mb-2">{opponent.username}</div>
                <RankBadge rank={opponent.rank} size="md" />
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-[var(--accent-red)] pulse-glow tracking-wider">
            LOADING CHALLENGE...
          </div>
        </div>
      )}
    </div>
  );
}
