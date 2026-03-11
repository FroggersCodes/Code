"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/RetroButton";
import { RankBadge } from "@/components/RankBadge";
import { getPlayer, getMatches, signUp, login, loginAsGuest, type StoredMatch } from "@/lib/storage";
import { RANK_THRESHOLDS, RANK_COLORS, type RankTier } from "@/types";
import type { Player } from "@/types";

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

  const radius = 62;
  const stroke = 11;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 168, height: 168 }}>
        <svg width="168" height="168" viewBox="0 0 168 168">
          {/* Outer decorative ring */}
          <circle
            cx="84" cy="84" r={radius + 10}
            fill="none"
            stroke={color}
            strokeWidth={1}
            opacity={0.18}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
          {/* Background track */}
          <circle
            cx="84" cy="84" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={stroke}
          />
          {/* Progress arc */}
          <circle
            cx="84" cy="84" r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 84 84)"
            style={{
              filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 22px ${color}90)`,
              transition: "stroke-dashoffset 0.8s ease-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <RankBadge rank={player.rank} size="md" />
          <div className="text-xl font-bold mt-1" style={{ color, textShadow: `0 0 10px ${color}, 0 0 24px ${color}80` }}>
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
  const router = useRouter();

  useEffect(() => {
    const p = getPlayer();
    if (p) {
      setLoggedIn(true);
      setPlayer(p);
      setRecentMatches(getMatches().slice(0, 5));
    }
  }, []);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="text-center mb-8 slide-up">
        <h1
          className="text-5xl text-[var(--accent-red)] glow-red mb-3 font-black tracking-wider"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          BUGRACER
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
              <RetroButton variant="warning" disabled className="w-full" onClick={() => {}}>
                PRACTICE (COMING SOON)
              </RetroButton>
            </div>
          </div>

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

          {/* Leaderboard + Profile links */}
          <div className="flex gap-3">
            <RetroButton variant="primary" onClick={() => router.push("/leaderboard")} className="flex-1">
              LEADERBOARD
            </RetroButton>
            <RetroButton variant="primary" onClick={() => router.push("/profile")} className="flex-1">
              MY PROFILE
            </RetroButton>
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
            <div className="text-[var(--text-dim)]">$ javascript &amp; python challenges</div>
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
