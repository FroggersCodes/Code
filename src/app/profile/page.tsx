"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RankBadge } from "@/components/RankBadge";
import { RetroButton } from "@/components/RetroButton";
import { getPlayer, getMatches, logout, checkAndUnlockTitles, equipTitle, getFriends, addFriend, removeFriend, getFriendStats, type FriendStats } from "@/lib/storage";
import { TITLES, getTitleLabel } from "@/lib/titles";
import type { Player } from "@/types";
import type { StoredMatch } from "@/lib/storage";

type Tab = "stats" | "history" | "titles" | "friends";

function EloChart({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 300;
  const h = 60;
  const pts = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--accent-red)" strokeWidth="1.5" strokeLinejoin="round" />
      {/* start and end dots */}
      <circle cx={(0).toFixed(1)} cy={(h - ((points[0] - min) / range) * (h - 4) - 2).toFixed(1)} r="2.5" fill="var(--accent-red)" opacity="0.6" />
      <circle
        cx={w.toFixed(1)}
        cy={(h - ((points[points.length - 1] - min) / range) * (h - 4) - 2).toFixed(1)}
        r="3"
        fill="var(--accent-red)"
      />
    </svg>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-[var(--text-dim)] mb-1 tracking-wider">{label}</div>
      <div className="text-base font-bold" style={{ color: color ?? "var(--text-primary)", fontFamily: "'Orbitron', sans-serif" }}>
        {value}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [matches, setMatches] = useState<StoredMatch[]>([]);
  const [tab, setTab] = useState<Tab>("stats");
  const [friends, setFriends] = useState<string[]>([]);
  const [friendInput, setFriendInput] = useState("");
  const [friendError, setFriendError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const p = getPlayer();
    if (!p) {
      router.push("/");
      return;
    }
    checkAndUnlockTitles();
    setPlayer(getPlayer()!);
    setMatches(getMatches());
    setFriends(getFriends());
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!player) return null;

  const totalGames = player.wins + player.losses + player.draws;
  const winRate = totalGames > 0 ? Math.round((player.wins / totalGames) * 100) : 0;

  // Computed stats
  const winTimes = matches.filter((m) => m.won && m.playerTime != null).map((m) => m.playerTime!);
  const avgTime = winTimes.length > 0 ? (winTimes.reduce((a, b) => a + b, 0) / winTimes.length / 1000).toFixed(1) : null;

  let longestStreak = 0;
  let currentStreak = 0;
  for (const m of [...matches].reverse()) {
    if (m.won) { currentStreak++; longestStreak = Math.max(longestStreak, currentStreak); }
    else { currentStreak = 0; }
  }

  const jsGames = matches.filter((m) => m.challengeLanguage === "javascript").length;
  const pyGames = matches.filter((m) => m.challengeLanguage === "python").length;
  const botGames = matches.filter((m) => m.isVsBot).length;
  const onlineGames = matches.filter((m) => !m.isVsBot).length;

  // ELO history reconstruction (newest → oldest in matches array)
  const eloHistory: number[] = [player.elo];
  for (const match of matches) {
    eloHistory.unshift(eloHistory[0] - match.eloChange);
  }
  const peakElo = Math.max(...eloHistory);
  const chartPoints = eloHistory.slice(-21); // last 20 matches + current

  const TabBtn = ({ id, label }: { id: Tab; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex-1 py-2 text-xs tracking-wider transition-all ${
        tab === id
          ? "text-[var(--accent-red)] border-b-2 border-[var(--accent-red)]"
          : "text-[var(--text-dim)] border-b-2 border-transparent hover:text-[var(--text-primary)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Player header */}
      <div className="hacker-card hacker-card-red mb-4 text-center slide-up">
        <div className="text-lg text-[var(--text-primary)] mb-1 font-bold">{player.username}</div>
        {getTitleLabel(player.title) && (
          <div className="text-xs text-[var(--accent-yellow)] tracking-wider mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            {getTitleLabel(player.title)}
          </div>
        )}
        <div className="mb-3"><RankBadge rank={player.rank} size="lg" /></div>
        <div className="text-2xl text-[var(--accent-red)] glow-red mb-4 font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          {player.elo} <span className="text-sm text-[var(--text-dim)]">ELO</span>
        </div>
        <div className="grid grid-cols-4 gap-4 text-center mb-4">
          <StatCard label="WINS" value={player.wins} color="var(--accent-green)" />
          <StatCard label="LOSSES" value={player.losses} color="var(--accent-red)" />
          <StatCard label="DRAWS" value={player.draws} />
          <StatCard label="WIN %" value={`${winRate}%`} color="var(--accent-yellow)" />
        </div>
        <RetroButton variant="error" onClick={handleLogout}>LOGOUT</RetroButton>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-color)] mb-4">
        <TabBtn id="stats" label="STATS" />
        <TabBtn id="titles" label="TITLES" />
        <TabBtn id="friends" label="FRIENDS" />
        <TabBtn id="history" label="HISTORY" />
      </div>

      {/* STATS TAB */}
      {tab === "stats" && (
        <div className="space-y-4 slide-up">
          {/* ELO chart */}
          {chartPoints.length >= 2 && (
            <div className="hacker-card">
              <div className="text-xs text-[var(--text-dim)] mb-2 tracking-wider flex justify-between">
                <span>ELO TREND</span>
                <span className="text-[var(--accent-yellow)]">PEAK {peakElo}</span>
              </div>
              <EloChart points={chartPoints} />
              <div className="flex justify-between text-xs text-[var(--text-dim)] mt-1">
                <span>{chartPoints.length - 1} matches ago</span>
                <span>NOW</span>
              </div>
            </div>
          )}

          {/* Performance */}
          <div className="hacker-card">
            <div className="text-xs text-[var(--text-dim)] mb-3 tracking-wider">PERFORMANCE</div>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="WIN STREAK" value={longestStreak} color="var(--accent-green)" />
              <StatCard label="AVG SOLVE" value={avgTime ? `${avgTime}s` : "—"} color="var(--accent-yellow)" />
              <StatCard label="TOTAL GAMES" value={totalGames} />
            </div>
          </div>

          {/* Breakdown */}
          <div className="hacker-card">
            <div className="text-xs text-[var(--text-dim)] mb-3 tracking-wider">BREAKDOWN</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[var(--text-dim)] mb-2">LANGUAGE</div>
                <div className="space-y-1">
                  {[{ label: "JavaScript", count: jsGames }, { label: "Python", count: pyGames }].map(({ label, count }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="text-xs text-[var(--text-primary)] w-20">{label}</div>
                      <div className="flex-1 h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent-red)] rounded-full"
                          style={{ width: totalGames > 0 ? `${(count / totalGames) * 100}%` : "0%" }}
                        />
                      </div>
                      <div className="text-xs text-[var(--text-dim)] w-6 text-right">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-dim)] mb-2">MODE</div>
                <div className="space-y-1">
                  {[{ label: "vs Bot", count: botGames }, { label: "Online", count: onlineGames }].map(({ label, count }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="text-xs text-[var(--text-primary)] w-14">{label}</div>
                      <div className="flex-1 h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent-red)] rounded-full"
                          style={{ width: totalGames > 0 ? `${(count / totalGames) * 100}%` : "0%" }}
                        />
                      </div>
                      <div className="text-xs text-[var(--text-dim)] w-6 text-right">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TITLES TAB */}
      {tab === "titles" && (
        <div className="hacker-card slide-up">
          <div className="text-xs text-[var(--text-dim)] mb-4 tracking-wider">
            UNLOCKED {(player.unlockedTitles ?? []).length}/{TITLES.length} — CLICK TO EQUIP
          </div>
          <div className="space-y-2">
            {TITLES.map((t) => {
              const unlocked = (player.unlockedTitles ?? []).includes(t.id);
              const equipped = player.title === t.id;
              return (
                <button
                  key={t.id}
                  disabled={!unlocked}
                  onClick={() => {
                    equipTitle(equipped ? null : t.id);
                    setPlayer(getPlayer()!);
                  }}
                  className={`w-full text-left p-3 border rounded transition-all ${
                    equipped
                      ? "border-[var(--accent-yellow)] bg-[rgba(255,204,0,0.06)]"
                      : unlocked
                      ? "border-[var(--border-color)] hover:border-[var(--accent-red)] bg-[var(--bg-dark)] cursor-pointer"
                      : "border-[var(--border-color)] bg-[var(--bg-dark)] opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-xs font-bold mb-0.5 ${equipped ? "text-[var(--accent-yellow)]" : unlocked ? "text-[var(--text-primary)]" : "text-[var(--text-dim)]"}`}
                        style={{ fontFamily: equipped ? "'Orbitron', sans-serif" : undefined }}
                      >
                        {unlocked ? t.label : "???"}
                      </div>
                      <div className="text-[10px] text-[var(--text-dim)]">{t.description}</div>
                    </div>
                    {equipped && <span className="text-[10px] text-[var(--accent-yellow)] tracking-wider">EQUIPPED</span>}
                    {unlocked && !equipped && <span className="text-[10px] text-[var(--text-muted)]">EQUIP</span>}
                    {!unlocked && <span className="text-[10px] text-[var(--text-muted)]">LOCKED</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FRIENDS TAB */}
      {tab === "friends" && (
        <div className="hacker-card slide-up">
          <div className="text-xs text-[var(--text-dim)] mb-4 tracking-wider">
            {friends.length} FRIEND{friends.length !== 1 ? "S" : ""}
          </div>

          {/* Add friend */}
          <div className="flex gap-2 mb-4">
            <input
              className="hacker-input flex-1"
              placeholder="username_"
              value={friendInput}
              onChange={(e) => { setFriendInput(e.target.value); setFriendError(""); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const u = friendInput.trim();
                  if (!u) return;
                  if (u.toLowerCase() === player!.username.toLowerCase()) { setFriendError("That's you"); return; }
                  addFriend(u);
                  setFriends(getFriends());
                  setFriendInput("");
                }
              }}
              maxLength={20}
            />
            <RetroButton
              variant="success"
              onClick={() => {
                const u = friendInput.trim();
                if (!u) return;
                if (u.toLowerCase() === player!.username.toLowerCase()) { setFriendError("That's you"); return; }
                addFriend(u);
                setFriends(getFriends());
                setFriendInput("");
              }}
            >
              ADD
            </RetroButton>
          </div>
          {friendError && <div className="text-xs text-[var(--accent-red)] mb-3">{friendError}</div>}

          {friends.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] text-center py-4">
              No friends yet. Add someone by their username.
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((f) => {
                const stats: FriendStats | null = getFriendStats(f);
                return (
                  <div key={f} className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded bg-[var(--bg-dark)]">
                    <div className="flex items-center gap-3">
                      {stats ? <RankBadge rank={stats.rank} size="sm" /> : null}
                      <div>
                        <div className="text-xs text-[var(--text-primary)] font-bold">{stats?.username ?? f}</div>
                        {stats ? (
                          <div className="text-[10px] text-[var(--text-dim)]">
                            {stats.elo} ELO · {stats.wins}W {stats.losses}L
                          </div>
                        ) : (
                          <div className="text-[10px] text-[var(--text-muted)]">Stats unavailable on this device</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => { removeFriend(f); setFriends(getFriends()); }}
                      className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors bg-transparent border-none cursor-pointer"
                      style={{ fontFamily: "inherit" }}
                    >
                      REMOVE
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <div className="hacker-card slide-up">
          {matches.length === 0 ? (
            <div className="text-xs text-[var(--text-dim)] text-center py-4">NO MATCHES YET</div>
          ) : (
            <div className="space-y-1">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className={`flex items-center justify-between text-xs p-3 border-l-2 ${
                    match.won
                      ? "border-[var(--accent-green)] bg-[rgba(0,255,102,0.03)]"
                      : match.draw
                      ? "border-[var(--accent-yellow)] bg-[rgba(255,204,0,0.03)]"
                      : "border-[var(--accent-red)] bg-[rgba(255,0,51,0.03)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${match.won ? "text-[var(--accent-green)]" : match.draw ? "text-[var(--accent-yellow)]" : "text-[var(--accent-red)]"}`}>
                      {match.won ? "W" : match.draw ? "D" : "L"}
                    </span>
                    <span className="text-[var(--text-primary)]">vs {match.opponentName}</span>
                    <span className="text-[var(--text-muted)]">{match.isVsBot ? "BOT" : "ONLINE"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--text-dim)]">{match.challengeLanguage.toUpperCase()}</span>
                    <span className={`font-bold ${match.eloChange > 0 ? "text-[var(--accent-green)]" : match.eloChange < 0 ? "text-[var(--accent-red)]" : "text-[var(--text-dim)]"}`}>
                      {match.eloChange > 0 ? "+" : ""}{match.eloChange}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
