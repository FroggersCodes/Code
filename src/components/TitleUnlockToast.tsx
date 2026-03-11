"use client";

import { useEffect, useState } from "react";

interface Props {
  titles: string[];
  onDone: () => void;
}

export function TitleUnlockToast({ titles, onDone }: Props) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const show = setTimeout(() => setVisible(false), 3200);
    const next = setTimeout(() => {
      if (index + 1 < titles.length) {
        setIndex((i) => i + 1);
        setVisible(true);
      } else {
        onDone();
      }
    }, 3800);
    return () => { clearTimeout(show); clearTimeout(next); };
  }, [index, titles.length, onDone]);

  if (!titles[index]) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <div
        className="text-center px-10 py-8 border-2 border-[var(--accent-yellow)] bg-[rgba(0,0,0,0.88)]"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.5s ease",
          boxShadow: "0 0 40px rgba(255,204,0,0.4)",
        }}
      >
        <div
          className="text-[10px] tracking-[0.4em] text-[var(--accent-yellow)] mb-3"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          TITLE UNLOCKED
        </div>
        <div
          className="text-2xl font-black tracking-widest text-[var(--accent-yellow)]"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            textShadow: "0 0 20px rgba(255,204,0,0.8)",
          }}
        >
          {titles[index]}
        </div>
        <div className="mt-3 text-[10px] text-[var(--text-dim)] tracking-wider">
          Equip it from your profile
        </div>
      </div>
    </div>
  );
}
