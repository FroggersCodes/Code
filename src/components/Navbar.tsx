"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )username=([^;]*)/);
    if (match) setUsername(decodeURIComponent(match[1]));
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-darker)] border-b-4 border-[var(--neon-blue)] px-4 py-2 flex items-center justify-between">
      <Link href="/" className="text-[var(--neon-green)] glow-green text-sm no-underline hover:text-[var(--neon-yellow)] transition-colors">
        BugRacer
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/lobby" className="text-[var(--neon-blue)] text-[10px] no-underline hover:text-[var(--neon-pink)] transition-colors">
          PLAY
        </Link>
        <Link href="/leaderboard" className="text-[var(--neon-blue)] text-[10px] no-underline hover:text-[var(--neon-pink)] transition-colors">
          RANKS
        </Link>
        {username ? (
          <Link href={`/profile/${username}`} className="text-[var(--neon-yellow)] text-[10px] no-underline hover:text-[var(--neon-pink)] transition-colors">
            {username}
          </Link>
        ) : (
          <Link href="/" className="text-[var(--text-dim)] text-[10px] no-underline">
            LOGIN
          </Link>
        )}
      </div>
    </nav>
  );
}
