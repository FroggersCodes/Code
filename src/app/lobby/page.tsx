"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/RetroButton";
import { RankBadge } from "@/components/RankBadge";
import { getPlayer } from "@/lib/storage";
import { startBotGame } from "@/lib/gameEngine";
import { BOT_PLAYER } from "@/lib/bot";
import type { Player } from "@/types";

type LobbyState = "idle" | "queuing" | "matched";

export default function LobbyPage() {
  const [state, setState] = useState<LobbyState>("idle");
  const [player, setPlayer] = useState<Player | null>(null);
  const router = useRouter();

  useEffect(() => {
    const p = getPlayer();
    if (!p) {
      router.push("/");
      return;
    }
    setPlayer(p);
  }, [router]);

  const handleStartBot = useCallback(() => {
    setState("queuing");
    setTimeout(() => {
      setState("matched");
      setTimeout(() => {
        startBotGame();
        router.push("/game");
      }, 2000);
    }, 1500);
  }, [router]);

  if (!player) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <h1 className="text-xl text-[var(--neon-green)] glow-green mb-8">
        BATTLE LOBBY
      </h1>

      {state === "idle" && (
        <div className="text-center slide-up">
          <div className="nes-container is-dark mb-6">
            <div className="text-[10px] text-[var(--text-dim)] mb-2">PLAYER</div>
            <div className="text-[var(--neon-yellow)] text-sm mb-2">{player.username}</div>
            <div className="mb-4">
              <RankBadge rank={player.rank} size="md" />
              <span className="text-[10px] text-[var(--neon-yellow)] ml-2">{player.elo} ELO</span>
            </div>
            <div className="mb-4">
              <div className="text-[8px] text-[var(--text-dim)] mb-3">MODE</div>
              <div className="p-3 border-4 border-[var(--neon-green)] text-[var(--neon-green)] glow-box-green text-[10px] inline-block mb-4">
                VS BOT
              </div>
            </div>
            <RetroButton variant="success" onClick={handleStartBot}>
              FIGHT BOT
            </RetroButton>
          </div>
          <div className="text-[8px] text-[var(--text-dim)]">
            Bot difficulty scales with your rank
          </div>
        </div>
      )}

      {state === "queuing" && (
        <div className="text-center slide-up">
          <div className="nes-container is-dark mb-6 inline-block">
            <div className="text-[var(--neon-green)] glow-green text-sm mb-4">
              INITIALIZING BOT...
            </div>
            <div className="mb-4">
              <div className="flex justify-center gap-2 mb-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-4 h-4"
                    style={{
                      backgroundColor: "var(--neon-green)",
                      border: "2px solid var(--neon-green)",
                      animation: "pulse-neon 1s ease-in-out infinite",
                      animationDelay: i * 0.2 + "s",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {state === "matched" && (
        <div className="text-center slide-up">
          <div className="text-[var(--neon-yellow)] text-lg glow-blue mb-6 flash">
            MATCH FOUND!
          </div>
          <div className="nes-container is-dark">
            <div className="flex items-center justify-between gap-8">
              <div>
                <div className="text-[10px] text-[var(--neon-blue)] mb-2">{player.username}</div>
                <RankBadge rank={player.rank} size="md" />
              </div>
              <div className="text-[var(--neon-yellow)] text-xl pulse-neon">VS</div>
              <div>
                <div className="text-[10px] text-[var(--neon-pink)] mb-2">{BOT_PLAYER.username}</div>
                <RankBadge rank={BOT_PLAYER.rank} size="md" />
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
