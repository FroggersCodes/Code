"use client";

import { useEffect, useState } from "react";
import { RetroButton } from "./RetroButton";

interface MatchmakingQueueProps {
  queuePosition: number;
  onCancel: () => void;
  mode: "pvp" | "bot";
}

const SEARCHING_FRAMES = ["SEARCHING.", "SEARCHING..", "SEARCHING...", "SEARCHING...."];

export function MatchmakingQueue({ queuePosition, onCancel, mode }: MatchmakingQueueProps) {
  const [frame, setFrame] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const frameInterval = setInterval(() => {
      setFrame((prev) => (prev + 1) % SEARCHING_FRAMES.length);
    }, 500);

    const timeInterval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(frameInterval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="text-center slide-up">
      <div className="nes-container is-dark mb-6 inline-block">
        <div className="text-[var(--neon-green)] glow-green text-sm mb-4">
          {mode === "bot" ? "INITIALIZING BOT..." : SEARCHING_FRAMES[frame]}
        </div>

        <div className="mb-4">
          <div className="flex justify-center gap-2 mb-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-4 h-4"
                style={{
                  backgroundColor: i <= frame ? "var(--neon-green)" : "var(--bg-dark)",
                  border: "2px solid var(--neon-green)",
                  animation: i <= frame ? "pulse-neon 1s ease-in-out infinite" : "none",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        {mode === "pvp" && (
          <>
            <div className="text-[8px] text-[var(--text-dim)] mb-2">
              QUEUE POSITION: <span className="text-[var(--neon-yellow)]">{queuePosition}</span>
            </div>
            <div className="text-[8px] text-[var(--text-dim)] mb-4">
              TIME: <span className="text-[var(--neon-blue)]">{elapsed}s</span>
            </div>
          </>
        )}

        <RetroButton variant="error" onClick={onCancel}>
          CANCEL
        </RetroButton>
      </div>
    </div>
  );
}
