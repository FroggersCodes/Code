"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/RetroButton";
import { MatchmakingQueue } from "@/components/MatchmakingQueue";
import { RankBadge } from "@/components/RankBadge";
import { getSocket, disconnectSocket } from "@/lib/socket";
import type { GameState, Player } from "@/types";

type LobbyState = "idle" | "queuing" | "matched" | "playing";

export default function LobbyPage() {
  const [state, setState] = useState<LobbyState>("idle");
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");
  const [queuePosition, setQueuePosition] = useState(1);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [matchId, setMatchId] = useState<number | null>(null);
  const [mode, setMode] = useState<"pvp" | "bot">("bot");
  const router = useRouter();

  useEffect(() => {
    const uidMatch = document.cookie.match(/(?:^|; )userId=([^;]*)/);
    const unameMatch = document.cookie.match(/(?:^|; )username=([^;]*)/);

    if (!uidMatch || !unameMatch) {
      router.push("/");
      return;
    }

    setUserId(parseInt(uidMatch[1]));
    setUsername(decodeURIComponent(unameMatch[1]));
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    socket.on("queue_position", (pos) => {
      setQueuePosition(pos);
    });

    socket.on("match_found", (data) => {
      setState("matched");
      setOpponent(data.opponent);
      setMatchId(data.matchId);
    });

    socket.on("game_start", (_state: GameState) => {
      if (matchId) {
        router.push(`/game/${matchId}`);
      }
    });

    return () => {
      socket.off("queue_position");
      socket.off("match_found");
      socket.off("game_start");
    };
  }, [userId, matchId, router]);

  const handleJoinQueue = useCallback(() => {
    if (!userId) return;
    setState("queuing");

    const socket = getSocket();
    socket.emit("join_queue", { userId, mode });
  }, [userId, mode]);

  const handleCancel = useCallback(() => {
    setState("idle");
    const socket = getSocket();
    socket.emit("leave_queue");
  }, []);

  // When match found, redirect to game after animation
  useEffect(() => {
    if (state === "matched" && matchId) {
      const timer = setTimeout(() => {
        router.push(`/game/${matchId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, matchId, router]);

  if (!userId) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <h1 className="text-xl text-[var(--neon-green)] glow-green mb-8">
        BATTLE LOBBY
      </h1>

      {state === "idle" && (
        <div className="text-center slide-up">
          <div className="nes-container is-dark mb-6">
            <div className="text-[10px] text-[var(--text-dim)] mb-2">PLAYER</div>
            <div className="text-[var(--neon-yellow)] text-sm mb-4">{username}</div>

            {/* Mode selection */}
            <div className="mb-6">
              <div className="text-[8px] text-[var(--text-dim)] mb-3">SELECT MODE</div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setMode("bot")}
                  className={`p-3 border-4 cursor-pointer text-[10px] transition-all ${
                    mode === "bot"
                      ? "border-[var(--neon-green)] text-[var(--neon-green)] glow-box-green bg-transparent"
                      : "border-[var(--text-dim)] text-[var(--text-dim)] bg-transparent"
                  }`}
                  style={{ fontFamily: "inherit" }}
                >
                  VS BOT
                </button>
                <button
                  onClick={() => setMode("pvp")}
                  className={`p-3 border-4 cursor-pointer text-[10px] transition-all ${
                    mode === "pvp"
                      ? "border-[var(--neon-pink)] text-[var(--neon-pink)] glow-box-pink bg-transparent"
                      : "border-[var(--text-dim)] text-[var(--text-dim)] bg-transparent"
                  }`}
                  style={{ fontFamily: "inherit" }}
                >
                  VS PLAYER
                </button>
              </div>
            </div>

            <RetroButton variant="success" onClick={handleJoinQueue}>
              {mode === "bot" ? "FIGHT BOT" : "FIND MATCH"}
            </RetroButton>
          </div>

          <div className="text-[8px] text-[var(--text-dim)]">
            {mode === "bot"
              ? "Bot difficulty scales with your rank"
              : "Matched by ELO rating (+-200)"}
          </div>
        </div>
      )}

      {state === "queuing" && (
        <MatchmakingQueue
          queuePosition={queuePosition}
          onCancel={handleCancel}
          mode={mode}
        />
      )}

      {state === "matched" && opponent && (
        <div className="text-center slide-up">
          <div className="text-[var(--neon-yellow)] text-lg glow-blue mb-6 flash">
            MATCH FOUND!
          </div>
          <div className="nes-container is-dark">
            <div className="flex items-center justify-between gap-8">
              <div>
                <div className="text-[10px] text-[var(--neon-blue)] mb-2">{username}</div>
                <RankBadge rank="Silver" size="md" />
              </div>
              <div className="text-[var(--neon-yellow)] text-xl pulse-neon">VS</div>
              <div>
                <div className="text-[10px] text-[var(--neon-pink)] mb-2">{opponent.username}</div>
                <RankBadge rank={opponent.rank} size="md" />
              </div>
            </div>
          </div>
          <div className="mt-4 text-[8px] text-[var(--neon-green)] pulse-neon">
            LOADING CHALLENGE...
          </div>
        </div>
      )}
    </div>
  );
}
