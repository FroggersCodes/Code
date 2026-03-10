"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  duration: number;
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
      <div className="text-xs text-[var(--text-dim)] mb-1 tracking-wider">TIME</div>
      <div
        className={`text-2xl font-bold tracking-widest ${
          isCritical
            ? "text-[var(--accent-red)] glow-red"
            : isLow
            ? "text-[var(--accent-yellow)] pulse-glow"
            : "text-[var(--text-primary)]"
        }`}
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
    </div>
  );
}
