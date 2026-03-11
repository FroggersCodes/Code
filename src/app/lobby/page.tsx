"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/RetroButton";
import { RankBadge } from "@/components/RankBadge";
import { getPlayer } from "@/lib/storage";
import { getTitleLabel } from "@/lib/titles";
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
type LobbyState = "idle" | "queuing" | "matched" | "connection_error";

export default function LobbyPage() {
  const [mode, setMode] = useState<GameMode>("select");
  const [state, setState] = useState<LobbyState>("idle");
  const [player, setPlayer] = useState<Player | null>(null);
  const [opponent, setOpponent] = useState<{ username: string; elo: number; rank: string; title?: string | null } | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [queueTime, setQueueTime] = useState(0);
  const [showBotFallback, setShowBotFallback] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(false);
  const [autoStart, setAutoStart] = useState<"bot" | "online" | null>(null);
  const queueTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStartedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const p = getPlayer();
    if (!p) {
      router.push("/");
      return;
    }
    setPlayer(p);

    import("@/lib/socket").then(({ connectSocket }) => {
      const socket = connectSocket();
      const timeout = setTimeout(() => {
        if (!socket.connected) {
          socket.disconnect();
        }
      }, 4000);
      socket.on("connect", () => {
        clearTimeout(timeout);
        setServerAvailable(true);
        // Report stats to leaderboard
        if (p) {
          socket.emit("leaderboard:update", {
            username: p.username,
            elo: p.elo,
            rank: p.rank,
            wins: p.wins,
            losses: p.losses,
            draws: p.draws,
          });
        }
      });
      socket.on("connect_error", () => {
        clearTimeout(timeout);
        socket.disconnect();
      });
    }).catch(() => {
      // Socket module failed to load
    });

    // Auto-start mode from query param
    const params = new URLSearchParams(window.location.search);
    const autoMode = params.get("mode");
    if (autoMode === "bot") {
      // Will be triggered after player is set
      setAutoStart("bot");
    } else if (autoMode === "online") {
      setAutoStart("online");
    }
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

  const startQueue = useCallback(() => {
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

  const handleStartOnline = useCallback(() => {
    if (!serverAvailable) {
      // Try to connect first
      import("@/lib/socket").then(({ connectSocket }) => {
        const socket = connectSocket();
        const timeout = setTimeout(() => {
          if (!socket.connected) {
            socket.disconnect();
            setState("connection_error");
          }
        }, 4000);
        socket.on("connect", () => {
          clearTimeout(timeout);
          setServerAvailable(true);
          startQueue();
        });
        socket.on("connect_error", () => {
          clearTimeout(timeout);
          socket.disconnect();
          setState("connection_error");
        });
      });
      setMode("online");
      setState("queuing");
      return;
    }
    startQueue();
  }, [serverAvailable, startQueue]);

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

  // Auto-start effect for query param mode
  useEffect(() => {
    if (!player || !autoStart || autoStartedRef.current) return;
    autoStartedRef.current = true;
    if (autoStart === "bot") {
      handleStartBot();
    } else if (autoStart === "online") {
      handleStartOnline();
    }
  }, [player, autoStart, handleStartBot, handleStartOnline]);

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
                <RetroButton variant="primary" onClick={handleStartOnline}>
                  VS PLAYER
                </RetroButton>
                <RetroButton variant="success" onClick={handleStartBot}>
                  VS BOT
                </RetroButton>
              </div>
            </div>
          </div>
          <div className="text-xs text-[var(--text-dim)]">
            Challenge a real player or fight the bot
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

      {state === "connection_error" && (
        <div className="text-center slide-up">
          <div className="hacker-card hacker-card-red inline-block min-w-[300px]">
            <div className="text-[var(--accent-red)] glow-red text-sm mb-4 tracking-wider">
              CONNECTION FAILED
            </div>
            <div className="text-xs text-[var(--text-dim)] mb-4">
              Could not connect to the game server.
              <br />
              Make sure the server is running with{" "}
              <span className="text-[var(--text-primary)]">npm run dev</span>
            </div>
            <div className="flex justify-center gap-4">
              <RetroButton variant="primary" onClick={() => { setState("idle"); setMode("select"); handleStartOnline(); }}>
                RETRY
              </RetroButton>
              <RetroButton variant="error" onClick={() => { setState("idle"); setMode("select"); }}>
                BACK
              </RetroButton>
            </div>
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
              <div className="text-center">
                <div className="text-xs text-[var(--text-primary)] mb-1">{player.username}</div>
                {getTitleLabel(player.title) && (
                  <div className="text-[10px] text-[var(--accent-yellow)] tracking-wider mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>{getTitleLabel(player.title)}</div>
                )}
                <RankBadge rank={player.rank} size="md" />
              </div>
              <div className="text-[var(--accent-red)] text-xl pulse-glow font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>VS</div>
              <div className="text-center">
                <div className="text-xs text-[var(--text-dim)] mb-1">{opponent.username}</div>
                {getTitleLabel(opponent.title) && (
                  <div className="text-[10px] text-[var(--accent-yellow)] tracking-wider mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>{getTitleLabel(opponent.title)}</div>
                )}
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
