"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  started: boolean;
}

export function Timer({ duration, onTimeUp, started }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!started) return;
    setTimeLeft(duration);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started, duration, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLow = timeLeft <= 15;
  const isCritical = timeLeft <= 5;

  return (
    <div className={`text-center ${isCritical ? "shake" : ""}`}>
      <div className="text-[8px] text-[var(--text-dim)] mb-1">TIME</div>
      <div
        className={`text-2xl font-bold ${
          isCritical
            ? "text-[var(--neon-pink)] glow-pink"
            : isLow
            ? "text-[var(--neon-yellow)] pulse-neon"
            : "text-[var(--neon-green)] glow-green"
        }`}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
    </div>
  );
}
