"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/RetroButton";
import { RankBadge } from "@/components/RankBadge";
import { getPlayer, getMatches, signUp, login, loginAsGuest, getCotdRecord, savePlayer, type StoredMatch } from "@/lib/storage";
import { getChallengeOfTheDay } from "@/lib/challenges";
import { getCurrentTier, getXPForNextTier, TOTAL_TIERS } from "@/lib/battlepass";
import { refreshMissions } from "@/lib/missions";
import { RANK_THRESHOLDS, RANK_COLORS, type RankTier } from "@/types";
import type { Player } from "@/types";

interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

type AuthTab = "login" | "signup";

const RANK_ORDER: RankTier[] = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Grandmaster"];

function RankCircle({ player }: { player: Player }) {
  const rank = player.rank as RankTier;
  const thresholds = RANK_THRESHOLDS[rank];
  const color = RANK_COLORS[rank] || "#666";

  const rankIdx = RANK_ORDER.indexOf(rank);
  const nextRank = rankIdx < RANK_ORDER.length - 1 ? RANK_ORDER[rankIdx + 1] : null;

  let progress: number;
  let progressLabel: string;

  if (!nextRank || thresholds.max === Infinity) {
    // Grandmaster — no cap
    progress = 1;
    progressLabel = "MAX RANK";
  } else {
    const range = thresholds.max - thresholds.min + 1;
    const current = player.elo - thresholds.min;
    progress = Math.min(1, Math.max(0, current / range));
    const eloToNext = thresholds.max + 1 - player.elo;
    progressLabel = `${eloToNext} ELO to ${nextRank}`;
  }

  const isGm = rank === "Grandmaster";
  const radius = 72;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[148px] h-[148px] sm:w-[196px] sm:h-[196px]">
        <svg width="100%" height="100%" viewBox="0 0 196 196">
          {/* Outer decorative ring */}
          <circle
            cx="98" cy="98" r={radius + 10}
            fill="none"
            stroke={isGm ? undefined : color}
            strokeWidth={1}
            opacity={0.22}
            className={isGm ? "gm-stroke-rainbow" : undefined}
            style={isGm ? undefined : { filter: `drop-shadow(0 0 6px ${color})` }}
          />
          {/* Background track */}
          <circle
            cx="98" cy="98" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={stroke}
          />
          {/* Progress arc */}
          <circle
            cx="98" cy="98" r={radius}
            fill="none"
            stroke={isGm ? undefined : color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 98 98)"
            className={isGm ? "gm-stroke-rainbow" : undefined}
            style={{
              filter: isGm ? undefined : `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 22px ${color}90)`,
              transition: "stroke-dashoffset 0.8s ease-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div style={isGm ? { transform: "scale(0.8)", transformOrigin: "center" } : undefined}>
            <RankBadge rank={player.rank} size={isGm ? "sm" : "md"} />
          </div>
          <div
            className={`text-xl font-bold mt-1 ${isGm ? "gm-rainbow" : ""}`}
            style={isGm ? undefined : { color, textShadow: `0 0 10px ${color}, 0 0 24px ${color}80` }}
          >
            {player.elo}
          </div>
        </div>
      </div>
      <div className="text-xs text-[var(--text-dim)] mt-2 tracking-wider">
        {progressLabel}
      </div>
    </div>
  );
}

function MatchHistoryRow({ match }: { match: StoredMatch }) {
  const resultColor = match.draw ? "var(--accent-yellow)" : match.won ? "#00ff41" : "var(--accent-red)";
  const resultText = match.draw ? "DRAW" : match.won ? "WIN" : "LOSS";
  const eloPrefix = match.eloChange >= 0 ? "+" : "";

  return (
    <div
      className="flex items-center justify-between py-2 px-3"
      style={{ borderLeft: `2px solid ${resultColor}` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-bold w-10 tracking-wider"
          style={{ color: resultColor }}
        >
          {resultText}
        </span>
        <span className="text-xs text-[var(--text-dim)]">
          vs {match.opponentName}
        </span>
      </div>
      <span
        className="text-xs font-bold"
        style={{ color: match.eloChange >= 0 ? "#00ff41" : "var(--accent-red)" }}
      >
        {eloPrefix}{match.eloChange}
      </span>
    </div>
  );
}

export default function HomePage() {
  const [tab, setTab] = useState<AuthTab>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [recentMatches, setRecentMatches] = useState<StoredMatch[]>([]);
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [suggestionText, setSuggestionText] = useState("");
  const [suggestionSent, setSuggestionSent] = useState(false);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState<Announcement[]>([]);
  const router = useRouter();

  useEffect(() => {
    const p = getPlayer();
    if (p) {
      setLoggedIn(true);
      setPlayer(p);
      setRecentMatches(getMatches().slice(0, 5));
    }
  }, []);

  // Fetch unread announcements once logged in
  useEffect(() => {
    if (!loggedIn) return;
    const seen: string[] = JSON.parse(localStorage.getItem("seenAnnouncements") ?? "[]");
    import("@/lib/socket").then(({ connectSocket }) => {
      const socket = connectSocket();
      const handler = (data: Announcement[]) => {
        const unread = data.filter((a) => !seen.includes(a.id));
        if (unread.length > 0) setUnreadAnnouncements(unread);
      };
      socket.on("announcements:data", handler);
      if (socket.connected) {
        socket.emit("announcements:get");
      } else {
        socket.once("connect", () => socket.emit("announcements:get"));
      }
      return () => { socket.off("announcements:data", handler); };
    });
  }, [loggedIn]);

  const handleLogin = (p: Player) => {
    setLoggedIn(true);
    setPlayer(p);
    setRecentMatches(getMatches().slice(0, 5));
  };

  const handleSubmit = () => {
    setError("");
    const trimmed = username.trim();
    if (!trimmed) return;

    if (trimmed.length < 2 || trimmed.length > 20) {
      setError("Username must be 2-20 characters");
      return;
    }
    const sanitized = trimmed.replace(/[^a-zA-Z0-9_-]/g, "");
    if (!sanitized) {
      setError("Invalid characters in username");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (tab === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      const result = signUp(sanitized, password);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      handleLogin(result);
      setShowWelcome(true);
    } else {
      const result = login(sanitized, password);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      handleLogin(result);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const dismissAnnouncements = () => {
    const seen: string[] = JSON.parse(localStorage.getItem("seenAnnouncements") ?? "[]");
    const toAdd = unreadAnnouncements.map((a) => a.id).filter((id) => !seen.includes(id));
    const newSeen = [...seen, ...toAdd];
    localStorage.setItem("seenAnnouncements", JSON.stringify(newSeen));
    setUnreadAnnouncements([]);
  };

  const handleSuggestionSubmit = () => {
    const trimmed = suggestionText.trim();
    if (!trimmed || !player) return;
    import("@/lib/socket").then(({ connectSocket }) => {
      const socket = connectSocket();
      socket.emit("suggestion:add", { username: player.username, text: trimmed });
    });
    setSuggestionText("");
    setSuggestionSent(true);
    setTimeout(() => setSuggestionSent(false), 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      {/* Announcement popup — shows once per announcement per user */}
      {unreadAnnouncements.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.88)" }}
        >
          <div
            className="hacker-card max-w-sm w-full slide-up"
            style={{ borderColor: "rgba(0,212,255,0.45)", boxShadow: "0 0 22px rgba(0,212,255,0.2)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="text-xs font-bold tracking-widest"
                style={{ color: "#00d4ff", fontFamily: "'Orbitron', sans-serif" }}
              >
                📢 ANNOUNCEMENT{unreadAnnouncements.length > 1 ? "S" : ""}
              </div>
              {unreadAnnouncements.length > 1 && (
                <span
                  className="text-[9px] tracking-widest border rounded px-1.5 py-0.5"
                  style={{ color: "#00d4ff", borderColor: "rgba(0,212,255,0.4)" }}
                >
                  {unreadAnnouncements.length} NEW
                </span>
              )}
            </div>
            <div className="space-y-3">
              {unreadAnnouncements.map((a, i) => (
                <div
                  key={a.id}
                  className={i > 0 ? "pt-3 border-t border-[var(--border-color)]" : ""}
                >
                  <div className="text-xs font-bold text-[var(--text-primary)] mb-1 tracking-wider">{a.title}</div>
                  <div className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap mb-1">{a.body}</div>
                  <div className="text-[9px] text-[var(--text-muted)]">
                    {new Date(a.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>
              ))}
            </div>
            <RetroButton variant="primary" onClick={dismissAnnouncements} className="w-full mt-4">
              GOT IT
            </RetroButton>
          </div>
        </div>
      )}

      {/* Welcome modal for new sign-ups */}
      {showWelcome && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
        >
          <div className="hacker-card hacker-card-red max-w-sm w-full text-center slide-up">
            <div
              className="text-2xl font-black text-[var(--accent-red)] glow-red mb-2 tracking-wider"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              WELCOME TO BUGRACERS!
            </div>
            <div className="text-xs text-[var(--accent-yellow)] mb-4 tracking-widest">— ALPHA —</div>
            <p className="text-sm text-[var(--text-primary)] mb-3 leading-relaxed">
              We appreciate you signing up! You've been awarded the{" "}
              <span className="text-[var(--accent-yellow)] font-bold">α Alpha Tester</span> title for joining early.
            </p>
            <p className="text-xs text-[var(--text-dim)] mb-5 leading-relaxed">
              Please remember that we are in alpha, which means glitches may happen from time to time.
              Feel free to report bugs — you may earn a special title for it!
            </p>
            <RetroButton variant="success" onClick={() => setShowWelcome(false)} className="w-full">
              LET&apos;S RACE!
            </RetroButton>
          </div>
        </div>
      )}
      <div className="text-center mb-8 slide-up">
        <h1
          className="text-3xl sm:text-5xl text-[var(--accent-red)] glow-red mb-3 font-black tracking-wider"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          BUGRACERS
        </h1>
        <div className="text-xs text-[var(--text-dim)] tracking-[0.3em] uppercase">
          Competitive Bug Fixing
        </div>
      </div>

      {loggedIn && player ? (
        <div className="slide-up w-full max-w-lg">
          {/* Welcome + Rank Circle */}
          <div className="hacker-card hacker-card-red mb-4">
            <div className="text-xs text-[var(--text-dim)] mb-1 tracking-wider text-center">WELCOME BACK</div>
            <div className="text-[var(--accent-red)] text-lg mb-4 font-bold text-center">{player.username}</div>
            <RankCircle player={player} />
          </div>

          {/* Play Buttons */}
          <div className="hacker-card hacker-card-red mb-4">
            <div className="text-xs text-[var(--text-dim)] mb-4 tracking-wider text-center">SELECT MODE</div>
            <div className="flex flex-col gap-3">
              <RetroButton variant="success" onClick={() => router.push("/lobby?mode=online")} className="w-full">
                PLAY ONLINE
              </RetroButton>
              <RetroButton variant="primary" onClick={() => router.push("/lobby?mode=bot")} className="w-full">
                PLAY BOT
              </RetroButton>
              <RetroButton variant="warning" className="w-full" onClick={() => router.push("/practice")}>
                PRACTICE
              </RetroButton>
            </div>
          </div>

          {/* Challenge of the Day */}
          {(() => {
            const cotd = getChallengeOfTheDay();
            const record = getCotdRecord();
            const diffStars = "★".repeat(cotd.difficulty) + "☆".repeat(3 - cotd.difficulty);
            return (
              <div className="hacker-card hacker-card-red mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-[var(--accent-yellow)] tracking-wider font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    CHALLENGE OF THE DAY
                  </div>
                  <span className="text-[10px] text-[var(--text-dim)] tracking-widest">
                    {new Date().toISOString().slice(0, 10)}
                  </span>
                </div>
                <div className="text-sm text-[var(--text-primary)] font-bold mb-1">{cotd.title}</div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] text-[var(--accent-yellow)]">{diffStars}</span>
                  <span className="text-[10px] text-[var(--text-dim)] uppercase">{cotd.language}</span>
                  {record && (
                    <span className="text-[10px] text-[var(--accent-green)]">
                      {record.bestTime ? `PB: ${(record.bestTime / 1000).toFixed(1)}s` : "Attempted"}
                      {` · ${record.attempts}x`}
                    </span>
                  )}
                </div>
                {record?.won ? (
                  <div className="text-center">
                    <div className="text-xs text-[var(--accent-green)] glow-green font-bold mb-1">
                      COMPLETED ✓
                    </div>
                    {record.bestTime && (
                      <div className="text-[10px] text-[var(--text-dim)]">
                        Solved in {(record.bestTime / 1000).toFixed(1)}s
                      </div>
                    )}
                  </div>
                ) : (
                  <RetroButton
                    variant="success"
                    className="w-full"
                    onClick={() => {
                      router.push("/game?mode=cotd");
                    }}
                  >
                    PLAY
                  </RetroButton>
                )}
              </div>
            );
          })()}

          {/* Battle Pass Progress */}
          {(() => {
            const tier = getCurrentTier(player.xp);
            const xpInfo = getXPForNextTier(player.xp);
            const pct = tier >= TOTAL_TIERS ? 100 : xpInfo.tierXP > 0 ? Math.round((xpInfo.current / xpInfo.tierXP) * 100) : 0;
            return (
              <div
                className="hacker-card hacker-card-red mb-4 cursor-pointer hover:border-[var(--accent-red)] transition-colors"
                onClick={() => router.push("/battlepass")}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs tracking-wider font-bold" style={{ color: "#aa44ff", fontFamily: "'Orbitron', sans-serif" }}>
                    BATTLE PASS
                  </div>
                  <span className="text-xs text-[var(--text-dim)]">
                    Tier {tier >= TOTAL_TIERS ? "MAX" : tier}/{TOTAL_TIERS}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full border border-[var(--border-color)] overflow-hidden mb-1" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #aa44ff, var(--accent-red))" }} />
                </div>
                <div className="text-[10px] text-[var(--text-dim)] text-right">
                  {tier >= TOTAL_TIERS ? "MAX TIER" : `${xpInfo.needed} XP to next tier`}
                </div>
              </div>
            );
          })()}

          {/* Daily Missions Preview */}
          {(() => {
            // Refresh missions if needed
            refreshMissions(player);
            savePlayer(player);
            const missions = player.dailyMissions;
            if (!missions || missions.length === 0) return null;
            return (
              <div className="hacker-card hacker-card-red mb-4">
                <div className="text-xs text-[var(--accent-yellow)] tracking-wider font-bold mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  DAILY MISSIONS
                </div>
                <div className="flex flex-col gap-2">
                  {missions.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-[10px]">
                      <span className={m.completed ? "text-[var(--accent-green)] line-through" : "text-[var(--text-dim)]"}>
                        {m.description}
                      </span>
                      <span className={m.completed ? "text-[var(--accent-green)]" : "text-[var(--text-dim)]"}>
                        {m.completed ? "✓" : `${m.current}/${m.target}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Recent Matches */}
          <div className="hacker-card hacker-card-red mb-4">
            <div className="text-xs text-[var(--text-dim)] mb-3 tracking-wider text-center">RECENT MATCHES</div>
            {recentMatches.length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] text-center py-4">
                No matches yet. Start playing!
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {recentMatches.map((m) => (
                  <MatchHistoryRow key={m.id} match={m} />
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard + Profile + Announcements links */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <RetroButton variant="primary" onClick={() => router.push("/leaderboard")} className="w-full">
              LEADERBOARD
            </RetroButton>
            <RetroButton variant="primary" onClick={() => router.push("/profile")} className="w-full">
              MY PROFILE
            </RetroButton>
            <RetroButton variant="warning" onClick={() => router.push("/announcements")} className="w-full">
              ANNOUNCEMENTS
            </RetroButton>
            <RetroButton variant="warning" onClick={() => router.push("/store")} className="w-full">
              STORE
            </RetroButton>
          </div>

          {/* Suggestion Box */}
          <div className="hacker-card hacker-card-red mb-4">
            <div className="text-xs text-[var(--accent-yellow)] mb-1 tracking-wider font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              💡 SUGGESTION BOX
            </div>
            <div className="text-[10px] text-[var(--text-dim)] mb-3 tracking-wide">
              Got an idea to improve BugRacers? Let us know!
            </div>
            <textarea
              value={suggestionText}
              onChange={(e) => setSuggestionText(e.target.value)}
              placeholder="Type your suggestion here..."
              rows={3}
              className="w-full bg-transparent border border-[var(--border-color)] rounded px-3 py-2 text-xs text-[var(--text-primary)] resize-none outline-none focus:border-[var(--accent-yellow)] transition-colors mb-3"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
              maxLength={500}
            />
            {suggestionSent ? (
              <div className="text-xs text-[var(--accent-green)] glow-green text-center py-1">
                ✓ Suggestion submitted — thanks!
              </div>
            ) : (
              <RetroButton variant="warning" onClick={handleSuggestionSubmit} className="w-full" disabled={!suggestionText.trim()}>
                SUBMIT
              </RetroButton>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center slide-up w-full max-w-sm">
          <div className="hacker-card hacker-card-red">
            {/* Tab switcher */}
            <div className="flex mb-6 border-b border-[var(--border-color)]">
              <button
                onClick={() => { setTab("login"); setError(""); }}
                className={`flex-1 pb-2 text-xs tracking-wider transition-colors ${
                  tab === "login"
                    ? "text-[var(--accent-red)] border-b-2 border-[var(--accent-red)]"
                    : "text-[var(--text-dim)] hover:text-[var(--text-primary)]"
                }`}
              >
                LOG IN
              </button>
              <button
                onClick={() => { setTab("signup"); setError(""); }}
                className={`flex-1 pb-2 text-xs tracking-wider transition-colors ${
                  tab === "signup"
                    ? "text-[var(--accent-red)] border-b-2 border-[var(--accent-red)]"
                    : "text-[var(--text-dim)] hover:text-[var(--text-primary)]"
                }`}
              >
                SIGN UP
              </button>
            </div>

            <div className="text-xs text-[var(--text-dim)] mb-4 tracking-wider">
              {tab === "signup" ? "CREATE ACCOUNT" : "ENTER CREDENTIALS"}
            </div>

            <div className="mb-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="username_"
                maxLength={20}
                className="hacker-input"
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="password_"
                className="hacker-input"
              />
            </div>

            {tab === "signup" && (
              <div className="mb-3">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="confirm_password_"
                  className="hacker-input"
                />
              </div>
            )}

            {error && (
              <div className="text-xs text-[var(--accent-red)] mb-3">{error}</div>
            )}

            <RetroButton
              variant="success"
              onClick={handleSubmit}
              disabled={!username.trim() || !password}
              className="w-full"
            >
              {tab === "signup" ? "CREATE ACCOUNT" : "INITIALIZE"}
            </RetroButton>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 border-t border-[var(--border-color)]" />
              <span className="text-xs text-[var(--text-dim)] tracking-wider">OR</span>
              <div className="flex-1 border-t border-[var(--border-color)]" />
            </div>
            <RetroButton
              variant="primary"
              onClick={() => {
                const guest = loginAsGuest();
                handleLogin(guest);
              }}
              className="w-full max-w-sm"
            >
              PLAY AS GUEST
            </RetroButton>
          </div>

          <div className="mt-8 text-xs text-[var(--text-muted)] space-y-1.5">
            <div className="text-[var(--text-dim)]">$ fix bugs faster than the bot</div>
            <div className="text-[var(--text-dim)]">$ climb the elo rankings</div>
            <div className="text-[var(--text-dim)]">$ python challenges</div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 left-0 right-0 text-center">
        <div className="text-xs text-[var(--text-muted)] pulse-glow tracking-widest">
          READY_
        </div>
      </div>
    </div>
  );
}
