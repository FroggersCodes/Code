"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayer } from "@/lib/storage";
import { TITLES } from "@/lib/titles";
import { isMuted, toggleMute } from "@/lib/sounds";
import { getAvatarSvg } from "@/lib/avatars";

export function Navbar() {
  const [username, setUsername] = useState<string | null>(null);
  const [titleLabel, setTitleLabel] = useState<string | null>(null);
  const [avatarSvg, setAvatarSvg] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const player = getPlayer();
    if (player) {
      setUsername(player.username);
      if (player.title) {
        const t = TITLES.find((t) => t.id === player.title);
        setTitleLabel(t?.label ?? null);
      }
      setAvatarSvg(getAvatarSvg(player.avatar));
    }
    setMuted(isMuted());
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
          href="/"
          className="text-[var(--text-dim)] text-xs tracking-wider no-underline hover:text-[var(--accent-red)] transition-colors uppercase"
        >
          Play
        </Link>
        <Link
          href="/leaderboard"
          className="text-[var(--text-dim)] text-xs tracking-wider no-underline hover:text-[var(--accent-red)] transition-colors uppercase"
        >
          Rankings
        </Link>
        <button
          onClick={() => setMuted(toggleMute())}
          className="text-[var(--text-dim)] text-xs hover:text-[var(--text-primary)] transition-colors bg-transparent border-none cursor-pointer"
          title={muted ? "Unmute" : "Mute"}
          style={{ fontFamily: "inherit" }}
        >
          {muted ? "[ SOUND OFF ]" : "[ SOUND ON ]"}
        </button>
        {username ? (
          <Link
            href="/profile"
            className="text-[var(--text-primary)] text-xs no-underline hover:text-[var(--accent-red)] transition-colors flex items-center gap-2"
          >
            {avatarSvg ? (
              <div
                className="w-6 h-6 rounded overflow-hidden flex-shrink-0 border border-[var(--accent-red)]"
                dangerouslySetInnerHTML={{ __html: avatarSvg }}
              />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[var(--accent-red)] inline-block" />
            )}
            <span className="flex flex-col items-end leading-tight">
              <span>{username}</span>
              {titleLabel && (
                <span className="text-[10px] text-[var(--accent-yellow)] tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  {titleLabel}
                </span>
              )}
            </span>
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
