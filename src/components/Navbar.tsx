"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayer } from "@/lib/storage";

export function Navbar() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const player = getPlayer();
    if (player) setUsername(player.username);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-color)] px-6 py-3 flex items-center justify-between backdrop-blur-sm" style={{ backgroundColor: "rgba(17,17,17,0.92)" }}>
      <Link
        href="/"
        className="text-[var(--accent-red)] text-sm font-bold tracking-widest no-underline hover:text-[var(--accent-red-bright)] transition-colors"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        BUGRACER
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/lobby"
          className="text-[var(--text-dim)] text-xs tracking-wider no-underline hover:text-[var(--accent-red)] transition-colors uppercase"
        >
          Play
        </Link>
        {username ? (
          <Link
            href="/profile"
            className="text-[var(--text-primary)] text-xs no-underline hover:text-[var(--accent-red)] transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent-red)] inline-block" />
            {username}
          </Link>
        ) : (
          <Link
            href="/"
            className="text-[var(--text-dim)] text-xs no-underline hover:text-[var(--text-primary)] transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
