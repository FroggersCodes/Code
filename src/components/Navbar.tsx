"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlayer } from "@/lib/storage";
import { ALL_TITLES, getTitleClass } from "@/lib/titles";
import { isMuted, toggleMute } from "@/lib/sounds";
import { getAvatarSvg } from "@/lib/avatars";
import { getBorderClass } from "@/lib/borders";

export function Navbar() {
  const [username, setUsername] = useState<string | null>(null);
  const [titleLabel, setTitleLabel] = useState<string | null>(null);
  const [titleId, setTitleId] = useState<string | null>(null);
  const [avatarSvg, setAvatarSvg] = useState<string | null>(null);
  const [borderClass, setBorderClass] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const player = getPlayer();
    if (player) {
      setUsername(player.username);
      if (player.title) {
        const t = ALL_TITLES.find((t) => t.id === player.title);
        setTitleLabel(t?.label ?? null);
        setTitleId(player.title);
      }
      setAvatarSvg(getAvatarSvg(player.avatar));
      setBorderClass(getBorderClass(player.equippedBorder));
    }
    setMuted(isMuted());
  }, []);

  // Close menu on route change
  useEffect(() => {
    const handleClick = () => setMenuOpen(false);
    window.addEventListener("popstate", handleClick);
    return () => window.removeEventListener("popstate", handleClick);
  }, []);

  const navLinks = (
    <>
      <Link
        href="/"
        className="text-[var(--text-dim)] text-xs tracking-wider no-underline hover:text-[var(--accent-red)] transition-colors uppercase"
        onClick={() => setMenuOpen(false)}
      >
        Play
      </Link>
      <Link
        href="/battlepass"
        className="text-[var(--text-dim)] text-xs tracking-wider no-underline hover:text-[var(--accent-red)] transition-colors uppercase"
        onClick={() => setMenuOpen(false)}
      >
        Battle Pass
      </Link>
      <Link
        href="/achievements"
        className="text-[var(--text-dim)] text-xs tracking-wider no-underline hover:text-[var(--accent-red)] transition-colors uppercase"
        onClick={() => setMenuOpen(false)}
      >
        Achievements
      </Link>
      <Link
        href="/leaderboard"
        className="text-[var(--text-dim)] text-xs tracking-wider no-underline hover:text-[var(--accent-red)] transition-colors uppercase"
        onClick={() => setMenuOpen(false)}
      >
        Rankings
      </Link>
      <Link
        href="/announcements"
        className="text-[var(--text-dim)] text-xs tracking-wider no-underline hover:text-[var(--accent-red)] transition-colors uppercase"
        onClick={() => setMenuOpen(false)}
      >
        News
      </Link>
      <Link
        href="/store"
        className="text-[var(--accent-yellow)] text-xs tracking-wider no-underline hover:text-[#ffe066] transition-colors uppercase"
        onClick={() => setMenuOpen(false)}
      >
        Store
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
          onClick={() => setMenuOpen(false)}
        >
          {avatarSvg ? (
            <div
              className={`w-6 h-6 rounded overflow-hidden flex-shrink-0 ${borderClass ?? "border border-[var(--accent-red)]"}`}
              dangerouslySetInnerHTML={{ __html: avatarSvg }}
            />
          ) : (
            <span className="w-2 h-2 rounded-full bg-[var(--accent-red)] inline-block" />
          )}
          <span className="flex flex-col items-end leading-tight">
            <span>{username}</span>
            {titleLabel && (
              <span
                className={`text-[10px] tracking-wider ${getTitleClass(titleId) ?? "text-[var(--accent-yellow)]"}`}
                style={getTitleClass(titleId) ? undefined : { fontFamily: "'Orbitron', sans-serif" }}
              >
                {titleLabel}
              </span>
            )}
          </span>
        </Link>
      ) : (
        <Link
          href="/"
          className="text-[var(--text-dim)] text-xs no-underline hover:text-[var(--text-primary)] transition-colors"
          onClick={() => setMenuOpen(false)}
        >
          Login
        </Link>
      )}
    </>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-color)] px-4 sm:px-6 py-3 flex items-center justify-between backdrop-blur-sm" style={{ backgroundColor: "rgba(17,17,17,0.92)" }}>
        <Link
          href="/"
          className="text-[var(--accent-red)] text-sm font-bold tracking-widest no-underline hover:text-[var(--accent-red-bright)] transition-colors"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          BUGRACER
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          {navLinks}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-[var(--text-dim)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <>
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </>
            ) : (
              <>
                <line x1="3" y1="5" x2="17" y2="5" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="15" x2="17" y2="15" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="fixed top-[49px] left-0 right-0 z-50 border-b border-[var(--border-color)] flex flex-col gap-4 px-4 py-4 slide-up"
            style={{ backgroundColor: "rgba(17,17,17,0.96)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks}
          </div>
        </div>
      )}
    </>
  );
}
