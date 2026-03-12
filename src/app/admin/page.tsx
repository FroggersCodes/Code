"use client";

import { useState, useEffect } from "react";
import { getPlayer, savePlayer, getMatches } from "@/lib/storage";
import { getRankFromElo } from "@/lib/elo";
import { TITLES } from "@/lib/titles";
import type { Player } from "@/types";

const PASSPHRASE = "frogger";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [player, setPlayer] = useState<Player | null>(null);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [elo, setElo] = useState("");
  const [wins, setWins] = useState("");
  const [losses, setLosses] = useState("");
  const [draws, setDraws] = useState("");
  const [winStreak, setWinStreak] = useState("");

  useEffect(() => {
    if (authed) {
      const p = getPlayer();
      setPlayer(p);
      if (p) {
        setElo(String(p.elo));
        setWins(String(p.wins));
        setLosses(String(p.losses));
        setDraws(String(p.draws));
        setWinStreak(String(p.winStreak ?? 0));
      }
    }
  }, [authed]);

  const handleAuth = () => {
    if (input.trim().toLowerCase() === PASSPHRASE) {
      setAuthed(true);
      setError("");
    } else {
      setError("ACCESS DENIED");
    }
  };

  const handleSave = () => {
    if (!player) return;
    const newElo = Math.max(0, parseInt(elo) || 0);
    const updated: Player = {
      ...player,
      elo: newElo,
      rank: getRankFromElo(newElo),
      wins: Math.max(0, parseInt(wins) || 0),
      losses: Math.max(0, parseInt(losses) || 0),
      draws: Math.max(0, parseInt(draws) || 0),
      winStreak: Math.max(0, parseInt(winStreak) || 0),
    };
    savePlayer(updated);
    setPlayer(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const unlockAllTitles = () => {
    if (!player) return;
    const updated = { ...player, unlockedTitles: TITLES.map((t) => t.id) };
    savePlayer(updated);
    setPlayer(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const lockAllTitles = () => {
    if (!player) return;
    const updated = { ...player, unlockedTitles: [], title: null };
    savePlayer(updated);
    setPlayer(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetStats = () => {
    if (!player) return;
    const updated = { ...player, elo: 1000, rank: "Silver", wins: 0, losses: 0, draws: 0, winStreak: 0 };
    savePlayer(updated);
    setPlayer(updated);
    setElo("1000");
    setWins("0");
    setLosses("0");
    setDraws("0");
    setWinStreak("0");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const maxOut = () => {
    setElo("2000");
    setWins("100");
    setLosses("10");
    setDraws("5");
    setWinStreak("10");
  };

  const clearMatchHistory = () => {
    if (typeof window === "undefined" || !player) return;
    localStorage.removeItem("bugracer_matches");
    localStorage.removeItem(`bugracer_matches_${player.username.toLowerCase()}`);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!authed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="hacker-card hacker-card-red w-full max-w-sm text-center">
          <div
            className="text-[var(--accent-red)] glow-red text-sm font-bold tracking-widest mb-1"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            ADMIN ACCESS
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mb-6 tracking-wider">
            RESTRICTED ZONE — AUTHORIZED PERSONNEL ONLY
          </div>
          <input
            type="password"
            className="hacker-input w-full mb-3 text-center tracking-widest"
            placeholder="enter passphrase_"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            autoFocus
          />
          {error && (
            <div className="text-xs text-[var(--accent-red)] mb-3 tracking-wider">{error}</div>
          )}
          <button
            onClick={handleAuth}
            className="w-full py-2 text-xs tracking-widest border border-[var(--accent-red)] text-[var(--accent-red)] hover:bg-[rgba(255,0,51,0.1)] transition-colors rounded bg-transparent cursor-pointer"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            AUTHENTICATE
          </button>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-xs text-[var(--text-muted)] tracking-wider">
          NO PLAYER LOGGED IN — <a href="/" className="text-[var(--accent-red)]">GO HOME</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-sm text-[var(--accent-red)] glow-red font-bold tracking-widest"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          ADMIN PANEL
        </h1>
        <div className="text-xs text-[var(--text-muted)]">
          {player.username} · {player.rank}
        </div>
      </div>

      {saved && (
        <div className="mb-4 text-xs text-[var(--accent-green)] tracking-wider text-center border border-[var(--accent-green)] rounded py-2">
          ✓ SAVED
        </div>
      )}

      {/* Stats editor */}
      <div className="hacker-card hacker-card-red mb-4">
        <div className="text-xs text-[var(--text-dim)] mb-4 tracking-wider">PLAYER STATS</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "ELO", value: elo, set: setElo },
            { label: "WINS", value: wins, set: setWins },
            { label: "LOSSES", value: losses, set: setLosses },
            { label: "DRAWS", value: draws, set: setDraws },
            { label: "WIN STREAK", value: winStreak, set: setWinStreak },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <div className="text-[10px] text-[var(--text-muted)] mb-1 tracking-wider">{label}</div>
              <input
                type="number"
                min="0"
                className="hacker-input w-full text-sm"
                value={value}
                onChange={(e) => set(e.target.value)}
              />
            </div>
          ))}
          <div className="flex items-end">
            <div className="text-[10px] text-[var(--text-muted)] mb-1 tracking-wider">
              RANK (auto)
            </div>
            <div
              className="hacker-input w-full text-sm opacity-50 cursor-not-allowed"
              style={{ display: "flex", alignItems: "center", padding: "6px 10px" }}
            >
              {getRankFromElo(parseInt(elo) || 0)}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSave}
            className="flex-1 py-2 text-xs tracking-widest border border-[var(--accent-red)] text-[var(--accent-red)] hover:bg-[rgba(255,0,51,0.1)] transition-colors rounded bg-transparent cursor-pointer"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            SAVE
          </button>
          <button
            onClick={maxOut}
            className="flex-1 py-2 text-xs tracking-widest border border-[var(--accent-yellow)] text-[var(--accent-yellow)] hover:bg-[rgba(255,204,0,0.08)] transition-colors rounded bg-transparent cursor-pointer"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            MAX OUT
          </button>
          <button
            onClick={resetStats}
            className="flex-1 py-2 text-xs tracking-widest border border-[var(--border-color)] text-[var(--text-dim)] hover:border-[var(--accent-red)] transition-colors rounded bg-transparent cursor-pointer"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            RESET
          </button>
        </div>
      </div>

      {/* Titles */}
      <div className="hacker-card mb-4">
        <div className="text-xs text-[var(--text-dim)] mb-3 tracking-wider">
          TITLES — {player.unlockedTitles.length}/{TITLES.length} UNLOCKED
        </div>
        <div className="space-y-1 mb-4">
          {TITLES.map((t) => {
            const unlocked = player.unlockedTitles.includes(t.id);
            return (
              <div key={t.id} className="flex items-center justify-between text-xs py-1">
                <span className={unlocked ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}>
                  {t.label}
                </span>
                <span className={`text-[10px] tracking-wider ${unlocked ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"}`}>
                  {unlocked ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <button
            onClick={unlockAllTitles}
            className="flex-1 py-2 text-xs tracking-widest border border-[var(--accent-green)] text-[var(--accent-green)] hover:bg-[rgba(0,255,65,0.06)] transition-colors rounded bg-transparent cursor-pointer"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            UNLOCK ALL
          </button>
          <button
            onClick={lockAllTitles}
            className="flex-1 py-2 text-xs tracking-widest border border-[var(--border-color)] text-[var(--text-dim)] hover:border-[var(--accent-red)] transition-colors rounded bg-transparent cursor-pointer"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            LOCK ALL
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="hacker-card">
        <div className="text-xs text-[var(--accent-red)] mb-3 tracking-wider">DANGER ZONE</div>
        <button
          onClick={clearMatchHistory}
          className="w-full py-2 text-xs tracking-widest border border-[var(--accent-red)] text-[var(--accent-red)] hover:bg-[rgba(255,0,51,0.1)] transition-colors rounded bg-transparent cursor-pointer"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          CLEAR MATCH HISTORY
        </button>
      </div>
    </div>
  );
}
