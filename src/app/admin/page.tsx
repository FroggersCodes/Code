"use client";

import { useState, useEffect } from "react";
import { getPlayer, savePlayer } from "@/lib/storage";
import { getRankFromElo } from "@/lib/elo";
import { TITLES, ADMIN_TITLES, ALL_TITLES } from "@/lib/titles";
import { connectSocket } from "@/lib/socket";
import type { Player } from "@/types";

interface BugReport { id: string; username: string; challengeTitle: string; reason: string; description: string; createdAt: string; }
interface Suggestion { id: string; username: string; text: string; createdAt: string; }
interface Announcement { id: string; title: string; body: string; createdAt: string; }

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

  // Other player editor
  const [otherUsername, setOtherUsername] = useState("");
  const [otherPlayer, setOtherPlayer] = useState<Player | null>(null);
  const [otherElo, setOtherElo] = useState("");
  const [otherError, setOtherError] = useState("");
  const [otherSaved, setOtherSaved] = useState(false);

  // Bug reports
  const [bugReports, setBugReports] = useState<BugReport[]>([]);

  // Suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // Messaging + grant codes
  const [msgTarget, setMsgTarget] = useState("");
  const [msgText, setMsgText] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [codeTitle, setCodeTitle] = useState(ADMIN_TITLES[0].id);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  // Announcements
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  useEffect(() => {
    if (!authed) return;
    const p = getPlayer();
    setPlayer(p);
    if (p) {
      setElo(String(p.elo));
      setWins(String(p.wins));
      setLosses(String(p.losses));
      setDraws(String(p.draws));
      setWinStreak(String(p.winStreak ?? 0));
    }

    const socket = connectSocket();
    // Fetch suggestions, reports, and announcements from server
    socket.emit("suggestions:get");
    socket.emit("reports:get");
    socket.emit("announcements:get");

    socket.on("suggestions:data", (data: Suggestion[]) => setSuggestions(data));
    socket.on("reports:data", (data: BugReport[]) => setBugReports(data));
    socket.on("announcements:data", (data: Announcement[]) => setAnnouncementsList(data));
    socket.on("admin:code-generated", ({ code }: { code: string }) => {
      setGeneratedCode(code);
      setMsgText(`Your title grant code: ${code} — redeem it in Profile → Titles.`);
    });
    socket.on("admin:message-sent", ({ ok }: { ok: boolean }) => {
      if (ok) flash(setMsgSent);
    });
    return () => {
      socket.off("admin:code-generated");
      socket.off("admin:message-sent");
      socket.off("suggestions:data");
      socket.off("reports:data");
      socket.off("announcements:data");
    };
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

      {/* ── Bug Reports ── */}
      <div className="hacker-card mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-[var(--accent-green)] tracking-wider">⚑ BUG REPORTS ({bugReports.length})</div>
          <button
            onClick={() => connectSocket().emit("reports:get")}
            className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer tracking-wider"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            REFRESH
          </button>
        </div>
        {bugReports.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)] tracking-wider">No reports yet.</div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {bugReports.map((r) => (
              <div key={r.id} className="border border-[var(--border-color)] rounded p-2 text-xs">
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1">
                  <span className="text-[var(--accent-yellow)]">{r.username}</span>
                  <div className="flex items-center gap-2">
                    <span>{new Date(r.createdAt).toLocaleString()}</span>
                    <button
                      onClick={() => connectSocket().emit("report:delete", { id: r.id, passphrase: PASSPHRASE })}
                      className="text-[10px] text-[var(--accent-red)] hover:text-red-400 bg-transparent border-none cursor-pointer tracking-wider transition-colors"
                      style={{ fontFamily: "'Share Tech Mono', monospace" }}
                      title="Delete report"
                    >
                      [DELETE]
                    </button>
                  </div>
                </div>
                <div className="text-[var(--text-primary)] mb-0.5">{r.challengeTitle}</div>
                <div className="text-[var(--accent-red)] mb-0.5">{r.reason}</div>
                {r.description && <div className="text-[var(--text-dim)] italic">{r.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Messaging + Grant Codes ── */}
      <div className="hacker-card mb-4" style={{ borderColor: "rgba(0,212,255,0.3)" }}>
        <div className="text-xs text-[var(--accent-green)] tracking-wider mb-4">✉ SEND PLAYER MESSAGE</div>

        {/* Code generator */}
        <div className="mb-4">
          <div className="text-[10px] text-[var(--text-muted)] mb-2 tracking-wider">GRANT TITLE CODE</div>
          <div className="flex gap-2 mb-2 flex-wrap">
            {ADMIN_TITLES.map((t) => (
              <button key={t.id} onClick={() => { setCodeTitle(t.id); setGeneratedCode(null); }}
                className="flex-1 py-1 text-[10px] tracking-wider border rounded bg-transparent cursor-pointer transition-colors"
                style={{
                  borderColor: codeTitle === t.id ? "#00d4ff" : "var(--border-color)",
                  color: codeTitle === t.id ? "#00d4ff" : "var(--text-muted)",
                  fontFamily: "'Orbitron', sans-serif",
                  minWidth: "60px",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <AdminBtn onClick={() => {
              const socket = connectSocket();
              socket.emit("admin:generate-code", { passphrase: PASSPHRASE, titleId: codeTitle });
            }} color="#00d4ff">GENERATE CODE</AdminBtn>
            {generatedCode && (
              <>
                <span className="text-sm font-bold tracking-widest text-[#00d4ff]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  {generatedCode}
                </span>
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedCode); setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000); }}
                  className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer tracking-wider"
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}
                >
                  {codeCopied ? "✓ COPIED" : "COPY"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Message form */}
        <div className="mb-3">
          <div className="text-[10px] text-[var(--text-muted)] mb-1 tracking-wider">TO USERNAME</div>
          <input
            className="hacker-input w-full text-sm"
            placeholder="username_"
            value={msgTarget}
            onChange={(e) => setMsgTarget(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <div className="text-[10px] text-[var(--text-muted)] mb-1 tracking-wider">MESSAGE</div>
          <textarea
            className="hacker-input w-full text-xs resize-none"
            rows={3}
            placeholder="Write a message..."
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <AdminBtn onClick={() => {
            if (!msgTarget.trim() || !msgText.trim()) return;
            const socket = connectSocket();
            socket.emit("admin:send-message", { passphrase: PASSPHRASE, toUsername: msgTarget.trim(), text: msgText.trim() });
          }} color="#00d4ff">SEND MESSAGE</AdminBtn>
          {msgSent && <span className="text-xs text-[var(--accent-green)] tracking-wider">✓ SENT</span>}
        </div>
      </div>

      {/* ── Suggestions ── */}
      <div className="hacker-card mb-4" style={{ borderColor: "rgba(255,204,0,0.3)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-[var(--accent-yellow)] tracking-wider">💡 SUGGESTIONS ({suggestions.length})</div>
          <button
            onClick={() => connectSocket().emit("suggestions:get")}
            className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer tracking-wider"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            REFRESH
          </button>
        </div>
        {suggestions.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)] tracking-wider">No suggestions yet.</div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {suggestions.map((s) => (
              <div key={s.id} className="border border-[var(--border-color)] rounded p-2 text-xs">
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1">
                  <span className="text-[var(--accent-yellow)]">{s.username}</span>
                  <div className="flex items-center gap-2">
                    <span>{new Date(s.createdAt).toLocaleString()}</span>
                    <button
                      onClick={() => connectSocket().emit("suggestion:delete", { id: s.id, passphrase: PASSPHRASE })}
                      className="text-[10px] text-[var(--accent-red)] hover:text-red-400 bg-transparent border-none cursor-pointer tracking-wider transition-colors"
                      style={{ fontFamily: "'Share Tech Mono', monospace" }}
                    >
                      [DELETE]
                    </button>
                  </div>
                </div>
                <div className="text-[var(--text-primary)] leading-relaxed">{s.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Announcements ── */}
      <div className="hacker-card mb-4" style={{ borderColor: "rgba(0,212,255,0.3)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-[#00d4ff] tracking-wider">📢 ANNOUNCEMENTS ({announcementsList.length})</div>
          {announcementSaved && <div className="text-xs text-[var(--accent-green)] tracking-wider">✓ PUBLISHED</div>}
        </div>

        <div className="mb-3">
          <div className="text-[10px] text-[var(--text-muted)] mb-1 tracking-wider">TITLE</div>
          <input
            className="hacker-input w-full text-sm"
            placeholder="Announcement title..."
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
            maxLength={200}
          />
        </div>
        <div className="mb-3">
          <div className="text-[10px] text-[var(--text-muted)] mb-1 tracking-wider">BODY</div>
          <textarea
            className="hacker-input w-full text-xs resize-none"
            rows={4}
            placeholder="Write announcement..."
            value={announcementBody}
            onChange={(e) => setAnnouncementBody(e.target.value)}
            maxLength={2000}
          />
        </div>
        <AdminBtn onClick={() => {
          if (!announcementTitle.trim() || !announcementBody.trim()) return;
          connectSocket().emit("announcement:add", {
            passphrase: PASSPHRASE,
            title: announcementTitle.trim(),
            body: announcementBody.trim(),
          });
          setAnnouncementTitle("");
          setAnnouncementBody("");
          flash(setAnnouncementSaved);
        }} color="#00d4ff">PUBLISH ANNOUNCEMENT</AdminBtn>

        {announcementsList.length > 0 && (
          <div className="space-y-3 max-h-80 overflow-y-auto mt-4 pt-4 border-t border-[var(--border-color)]">
            {announcementsList.map((a) => (
              <div key={a.id} className="border border-[var(--border-color)] rounded p-2 text-xs">
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1">
                  <span className="text-[#00d4ff] font-bold">{a.title}</span>
                  <div className="flex items-center gap-2">
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
                    <button
                      onClick={() => connectSocket().emit("announcement:delete", { id: a.id, passphrase: PASSPHRASE })}
                      className="text-[10px] text-[var(--accent-red)] hover:text-red-400 bg-transparent border-none cursor-pointer tracking-wider transition-colors"
                      style={{ fontFamily: "'Share Tech Mono', monospace" }}
                    >
                      [DELETE]
                    </button>
                  </div>
                </div>
                <div className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{a.body}</div>
              </div>
            ))}
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
