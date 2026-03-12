"use client";

import { useState, useEffect } from "react";
import { getPlayer, savePlayer } from "@/lib/storage";
import { getRankFromElo } from "@/lib/elo";
import { TITLES, ADMIN_TITLES, ALL_TITLES } from "@/lib/titles";
import type { Player } from "@/types";

const PASSPHRASE = "FroggersSmiles0407";

function flash(set: (v: boolean) => void) {
  set(true);
  setTimeout(() => set(false), 2000);
}

function loadOtherPlayer(username: string): Player | null {
  if (typeof window === "undefined") return null;
  const key = `bugracer_player_${username.toLowerCase()}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) as Player : null;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Self stats
  const [player, setPlayer] = useState<Player | null>(null);
  const [saved, setSaved] = useState(false);
  const [elo, setElo] = useState("");
  const [wins, setWins] = useState("");
  const [losses, setLosses] = useState("");
  const [draws, setDraws] = useState("");
  const [winStreak, setWinStreak] = useState("");

  // Admin titles
  const [titleTarget, setTitleTarget] = useState("self");
  const [titleTargetUser, setTitleTargetUser] = useState("");
  const [selectedAdminTitle, setSelectedAdminTitle] = useState(ADMIN_TITLES[0].id);
  const [titleSaved, setTitleSaved] = useState(false);
  const [titleError, setTitleError] = useState("");

  // Other player editor
  const [otherUsername, setOtherUsername] = useState("");
  const [otherPlayer, setOtherPlayer] = useState<Player | null>(null);
  const [otherElo, setOtherElo] = useState("");
  const [otherError, setOtherError] = useState("");
  const [otherSaved, setOtherSaved] = useState(false);

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
    if (input.trim() === PASSPHRASE) { setAuthed(true); setAuthError(""); }
    else setAuthError("ACCESS DENIED");
  };

  // ── Self stats ────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!player) return;
    const newElo = Math.max(0, parseInt(elo) || 0);
    const updated: Player = {
      ...player,
      elo: newElo, rank: getRankFromElo(newElo),
      wins: Math.max(0, parseInt(wins) || 0),
      losses: Math.max(0, parseInt(losses) || 0),
      draws: Math.max(0, parseInt(draws) || 0),
      winStreak: Math.max(0, parseInt(winStreak) || 0),
    };
    savePlayer(updated); setPlayer(updated); flash(setSaved);
  };

  const maxOut = () => { setElo("2000"); setWins("100"); setLosses("10"); setDraws("5"); setWinStreak("10"); };

  const resetStats = () => {
    if (!player) return;
    const updated = { ...player, elo: 1000, rank: "Silver", wins: 0, losses: 0, draws: 0, winStreak: 0 };
    savePlayer(updated); setPlayer(updated);
    setElo("1000"); setWins("0"); setLosses("0"); setDraws("0"); setWinStreak("0");
    flash(setSaved);
  };

  const unlockAllTitles = () => {
    if (!player) return;
    const updated = { ...player, unlockedTitles: ALL_TITLES.map((t) => t.id) };
    savePlayer(updated); setPlayer(updated); flash(setSaved);
  };

  const lockAllTitles = () => {
    if (!player) return;
    const updated = { ...player, unlockedTitles: [], title: null };
    savePlayer(updated); setPlayer(updated); flash(setSaved);
  };

  const clearMatchHistory = () => {
    if (typeof window === "undefined" || !player) return;
    localStorage.removeItem("bugracer_matches");
    localStorage.removeItem(`bugracer_matches_${player.username.toLowerCase()}`);
    flash(setSaved);
  };

  // ── Admin title granting ──────────────────────────────────────────────────
  const grantAdminTitle = () => {
    setTitleError("");
    let target: Player | null = null;
    if (titleTarget === "self") {
      target = player;
    } else {
      const name = titleTargetUser.trim();
      if (!name) { setTitleError("Enter a username"); return; }
      target = loadOtherPlayer(name);
      if (!target) { setTitleError(`Player "${name}" not found on this device`); return; }
    }
    if (!target) { setTitleError("No player found"); return; }
    const already = target.unlockedTitles ?? [];
    if (!already.includes(selectedAdminTitle)) {
      const updated = { ...target, unlockedTitles: [...already, selectedAdminTitle] };
      savePlayer(updated);
      if (titleTarget === "self") setPlayer(updated);
    }
    flash(setTitleSaved);
  };

  const revokeAdminTitle = () => {
    setTitleError("");
    let target: Player | null = null;
    if (titleTarget === "self") {
      target = player;
    } else {
      const name = titleTargetUser.trim();
      if (!name) { setTitleError("Enter a username"); return; }
      target = loadOtherPlayer(name);
      if (!target) { setTitleError(`Player "${name}" not found on this device`); return; }
    }
    if (!target) { setTitleError("No player found"); return; }
    const updated = {
      ...target,
      unlockedTitles: (target.unlockedTitles ?? []).filter((id) => id !== selectedAdminTitle),
      title: target.title === selectedAdminTitle ? null : target.title,
    };
    savePlayer(updated);
    if (titleTarget === "self") setPlayer(updated);
    flash(setTitleSaved);
  };

  // ── Other player ELO ──────────────────────────────────────────────────────
  const lookupOtherPlayer = () => {
    setOtherError("");
    const name = otherUsername.trim();
    if (!name) return;
    const p = loadOtherPlayer(name);
    if (!p) { setOtherError(`"${name}" not found on this device`); setOtherPlayer(null); return; }
    setOtherPlayer(p);
    setOtherElo(String(p.elo));
  };

  const saveOtherElo = () => {
    if (!otherPlayer) return;
    const newElo = Math.max(0, parseInt(otherElo) || 0);
    const updated = { ...otherPlayer, elo: newElo, rank: getRankFromElo(newElo) };
    savePlayer(updated);
    setOtherPlayer(updated);
    flash(setOtherSaved);
  };

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="hacker-card hacker-card-red w-full max-w-sm text-center">
          <div className="text-[var(--accent-red)] glow-red text-sm font-bold tracking-widest mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            ADMIN ACCESS
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mb-6 tracking-wider">RESTRICTED ZONE — AUTHORIZED PERSONNEL ONLY</div>
          <input
            type="password" className="hacker-input w-full mb-3 text-center tracking-widest"
            placeholder="enter passphrase_" value={input}
            onChange={(e) => { setInput(e.target.value); setAuthError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            autoFocus
          />
          {authError && <div className="text-xs text-[var(--accent-red)] mb-3 tracking-wider">{authError}</div>}
          <button onClick={handleAuth}
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

  const AdminBtn = ({ onClick, color, children }: { onClick: () => void; color?: string; children: React.ReactNode }) => (
    <button onClick={onClick}
      className="flex-1 py-2 text-xs tracking-widest border rounded bg-transparent cursor-pointer transition-colors"
      style={{ borderColor: color ?? "var(--accent-red)", color: color ?? "var(--accent-red)", fontFamily: "'Orbitron', sans-serif" }}
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-sm text-[var(--accent-red)] glow-red font-bold tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif" }}>ADMIN PANEL</h1>
        <div className="text-xs text-[var(--text-muted)]">{player.username} · {player.rank}</div>
      </div>

      {/* ── Self stats ── */}
      <div className="hacker-card hacker-card-red mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-[var(--text-dim)] tracking-wider">MY STATS</div>
          {saved && <div className="text-xs text-[var(--accent-green)] tracking-wider">✓ SAVED</div>}
        </div>
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
              <input type="number" min="0" className="hacker-input w-full text-sm" value={value} onChange={(e) => set(e.target.value)} />
            </div>
          ))}
          <div>
            <div className="text-[10px] text-[var(--text-muted)] mb-1 tracking-wider">RANK (auto)</div>
            <div className="hacker-input w-full text-sm opacity-50" style={{ display: "flex", alignItems: "center", padding: "6px 10px" }}>
              {getRankFromElo(parseInt(elo) || 0)}
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <AdminBtn onClick={handleSave}>SAVE</AdminBtn>
          <AdminBtn onClick={maxOut} color="var(--accent-yellow)">MAX OUT</AdminBtn>
          <AdminBtn onClick={resetStats} color="var(--border-color)">RESET</AdminBtn>
        </div>
      </div>

      {/* ── Regular titles ── */}
      <div className="hacker-card mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-[var(--text-dim)] tracking-wider">
            TITLES — {player.unlockedTitles.length}/{ALL_TITLES.length} UNLOCKED
          </div>
          {saved && <div className="text-xs text-[var(--accent-green)] tracking-wider">✓ SAVED</div>}
        </div>
        <div className="space-y-1 mb-4">
          {ALL_TITLES.map((t) => {
            const unlocked = player.unlockedTitles.includes(t.id);
            return (
              <div key={t.id} className="flex items-center justify-between text-xs py-1">
                <span className={`${unlocked && t.adminOnly ? "admin-title" : unlocked ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                  {t.label}{t.adminOnly && <span className="text-[9px] text-[var(--text-muted)] ml-1">[admin]</span>}
                </span>
                <span className={`text-[10px] tracking-wider ${unlocked ? "text-[var(--accent-green)]" : "text-[var(--text-muted)]"}`}>
                  {unlocked ? "UNLOCKED" : "LOCKED"}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <AdminBtn onClick={unlockAllTitles} color="var(--accent-green)">UNLOCK ALL</AdminBtn>
          <AdminBtn onClick={lockAllTitles} color="var(--border-color)">LOCK ALL</AdminBtn>
        </div>
      </div>

      {/* ── Grant admin title ── */}
      <div className="hacker-card mb-4" style={{ borderColor: "rgba(255,204,0,0.3)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs tracking-wider admin-title" style={{ fontSize: "11px" }}>✦ GRANT ADMIN TITLE</div>
          {titleSaved && <div className="text-xs text-[var(--accent-green)] tracking-wider">✓ SAVED</div>}
        </div>

        <div className="mb-3">
          <div className="text-[10px] text-[var(--text-muted)] mb-1 tracking-wider">TITLE</div>
          <div className="flex gap-2">
            {ADMIN_TITLES.map((t) => (
              <button key={t.id} onClick={() => setSelectedAdminTitle(t.id)}
                className="flex-1 py-1.5 text-[10px] tracking-wider border rounded bg-transparent cursor-pointer transition-colors"
                style={{
                  borderColor: selectedAdminTitle === t.id ? "#ffd700" : "var(--border-color)",
                  color: selectedAdminTitle === t.id ? "#ffd700" : "var(--text-muted)",
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-[10px] text-[var(--text-muted)] mb-1 tracking-wider">TARGET</div>
          <div className="flex gap-2 mb-2">
            {["self", "other"].map((opt) => (
              <button key={opt} onClick={() => setTitleTarget(opt)}
                className="flex-1 py-1.5 text-[10px] tracking-wider border rounded bg-transparent cursor-pointer transition-colors"
                style={{
                  borderColor: titleTarget === opt ? "var(--accent-red)" : "var(--border-color)",
                  color: titleTarget === opt ? "var(--accent-red)" : "var(--text-muted)",
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                {opt === "self" ? `MYSELF (${player.username})` : "OTHER PLAYER"}
              </button>
            ))}
          </div>
          {titleTarget === "other" && (
            <input className="hacker-input w-full text-sm" placeholder="username_"
              value={titleTargetUser} onChange={(e) => { setTitleTargetUser(e.target.value); setTitleError(""); }}
            />
          )}
        </div>

        {titleError && <div className="text-xs text-[var(--accent-red)] mb-2">{titleError}</div>}
        <div className="flex gap-2">
          <AdminBtn onClick={grantAdminTitle} color="#ffd700">GRANT</AdminBtn>
          <AdminBtn onClick={revokeAdminTitle} color="var(--border-color)">REVOKE</AdminBtn>
        </div>
      </div>

      {/* ── Other player ELO ── */}
      <div className="hacker-card mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-[var(--text-dim)] tracking-wider">EDIT OTHER PLAYER</div>
          {otherSaved && <div className="text-xs text-[var(--accent-green)] tracking-wider">✓ SAVED</div>}
        </div>
        <div className="text-[10px] text-[var(--text-muted)] mb-3 leading-relaxed">
          Only works for players who have logged in on this device (shared localStorage).
        </div>
        <div className="flex gap-2 mb-3">
          <input className="hacker-input flex-1 text-sm" placeholder="username_"
            value={otherUsername}
            onChange={(e) => { setOtherUsername(e.target.value); setOtherError(""); setOtherPlayer(null); }}
            onKeyDown={(e) => e.key === "Enter" && lookupOtherPlayer()}
          />
          <AdminBtn onClick={lookupOtherPlayer}>FIND</AdminBtn>
        </div>
        {otherError && <div className="text-xs text-[var(--accent-red)] mb-2">{otherError}</div>}
        {otherPlayer && (
          <div className="space-y-3">
            <div className="text-xs text-[var(--accent-green)] tracking-wider">
              FOUND: {otherPlayer.username} · {otherPlayer.rank} · {otherPlayer.elo} ELO
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-muted)] mb-1 tracking-wider">NEW ELO</div>
              <input type="number" min="0" className="hacker-input w-full text-sm" value={otherElo}
                onChange={(e) => setOtherElo(e.target.value)}
              />
              <div className="text-[10px] text-[var(--text-muted)] mt-1">
                → Rank will become: {getRankFromElo(parseInt(otherElo) || 0)}
              </div>
            </div>
            <AdminBtn onClick={saveOtherElo}>SAVE CHANGES</AdminBtn>
          </div>
        )}
      </div>

      {/* ── Danger zone ── */}
      <div className="hacker-card">
        <div className="text-xs text-[var(--accent-red)] mb-3 tracking-wider">DANGER ZONE</div>
        <AdminBtn onClick={clearMatchHistory}>CLEAR MY MATCH HISTORY</AdminBtn>
      </div>
    </div>
  );
}
