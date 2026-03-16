"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/RetroButton";
import { RankBadge } from "@/components/RankBadge";
import { getPlayer } from "@/lib/storage";
import { RANK_COLORS, type RankTier } from "@/types";

interface LeaderboardEntry {
  username: string;
  elo: number;
  rank: string;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  title: string | null;
  avatar: string | null;
}

interface SeasonInfo { season: number; daysLeft: number; endsAt: string }

type LeaderboardTab = "elo" | "streaks";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [lbTab, setLbTab] = useState<LeaderboardTab>("elo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [season, setSeason] = useState<SeasonInfo | null>(null);
  const router = useRouter();
  const [player] = useState(() => getPlayer());

  const fetchLeaderboard = useCallback(() => {
    setLoading(true);
    setError(false);

    import("@/lib/socket").then(({ connectSocket }) => {
      const socket = connectSocket();

      const timeout = setTimeout(() => {
        if (!socket.connected) {
          socket.disconnect();
          setLoading(false);
          setError(true);
        }
      }, 5000);

      const handleData = (data: LeaderboardEntry[]) => {
        clearTimeout(timeout);
        setEntries(data);
        setLoading(false);
        socket.off("leaderboard:data", handleData);
      };

      socket.on("leaderboard:data", handleData);
      socket.on("season:info", (data: SeasonInfo) => setSeason(data));

      const reportStats = () => {
        if (player) {
          socket.emit("leaderboard:update", {
            username: player.username,
            elo: player.elo,
            rank: player.rank,
            wins: player.wins,
            losses: player.losses,
            draws: player.draws,
            winStreak: player.winStreak ?? 0,
            title: player.title ?? null,
            avatar: player.avatar ?? null,
            isGuest: player.passwordHash === "",
          });
        }
        socket.emit("leaderboard:get");
        socket.emit("season:info");
      };

      if (socket.connected) {
        reportStats();
      } else {
        socket.on("connect", () => {
          clearTimeout(timeout);
          reportStats();
        });
        socket.on("connect_error", () => {
          clearTimeout(timeout);
          socket.disconnect();
          setLoading(false);
          setError(true);
        });
      }
    }).catch(() => {
      setLoading(false);
      setError(true);
    });
  }, [player]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-3 sm:px-4 py-6 sm:py-8">
      <h1
        className="text-lg text-[var(--accent-red)] glow-red mb-3 tracking-widest font-bold"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        LEADERBOARD
      </h1>

      {season && (
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-6 px-4 py-2 border border-[var(--accent-yellow)] bg-[rgba(255,204,0,0.04)] rounded text-center w-full max-w-lg"
          style={{ boxShadow: "0 0 12px rgba(255,204,0,0.15)" }}
        >
          <div>
            <div className="text-[10px] text-[var(--text-dim)] tracking-widest">CURRENT SEASON</div>
            <div className="text-sm font-bold text-[var(--accent-yellow)]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              SEASON ALPHA
            </div>
          </div>
          <div className="flex gap-4">
            <div className="sm:border-l sm:border-[var(--border-color)] sm:pl-4">
              <div className="text-[10px] text-[var(--text-dim)] tracking-widest">ENDS IN</div>
              <div className="text-sm font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                {season.daysLeft}d
              </div>
            </div>
            <div className="sm:border-l sm:border-[var(--border-color)] sm:pl-4">
              <div className="text-[10px] text-[var(--text-dim)] tracking-widest">TOP 3 ARE</div>
              <div className="text-[10px] text-[var(--accent-yellow)]">Season Champions</div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-lg">
        {loading && (
          <div className="hacker-card hacker-card-red text-center">
            <div className="text-xs text-[var(--accent-red)] tracking-wider pulse-glow">
              LOADING RANKINGS...
            </div>
          </div>
        )}

        {error && (
          <div className="hacker-card hacker-card-red text-center">
            <div className="text-xs text-[var(--text-dim)] mb-4">
              Could not connect to the server to fetch leaderboard data.
            </div>
            <div className="flex justify-center gap-3">
              <RetroButton variant="primary" onClick={fetchLeaderboard}>
                RETRY
              </RetroButton>
              <RetroButton variant="error" onClick={() => router.push("/")}>
                BACK
              </RetroButton>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Tab switcher */}
            <div className="flex border-b border-[var(--border-color)] mb-4">
              {(["elo", "streaks"] as LeaderboardTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setLbTab(t)}
                  className={`flex-1 py-2 text-xs tracking-wider transition-all ${
                    lbTab === t
                      ? "text-[var(--accent-red)] border-b-2 border-[var(--accent-red)]"
                      : "text-[var(--text-dim)] border-b-2 border-transparent hover:text-[var(--text-primary)]"
                  }`}
                >
                  {t === "elo" ? "ELO RANKINGS" : "WIN STREAKS"}
                </button>
              ))}
            </div>

            {entries.length === 0 ? (
              <div className="hacker-card hacker-card-red text-center">
                <div className="text-xs text-[var(--text-dim)]">
                  No players on the leaderboard yet. Play a match to appear here!
                </div>
              </div>
            ) : lbTab === "elo" ? (
              <div className="hacker-card hacker-card-red">
                <div className="flex items-center text-xs text-[var(--text-dim)] tracking-wider pb-2 mb-2 border-b border-[var(--border-color)]">
                  <span className="w-6 sm:w-8 text-center">#</span>
                  <span className="flex-1 ml-1 sm:ml-2">PLAYER</span>
                  <span className="w-8 sm:w-14 text-center">W</span>
                  <span className="w-8 sm:w-14 text-center">L</span>
                  <span className="w-12 sm:w-16 text-right">ELO</span>
                </div>
                {entries.map((entry, i) => {
                  const isYou = player && entry.username.toLowerCase() === player.username.toLowerCase();
                  const color = RANK_COLORS[entry.rank as RankTier] || "#666";
                  const posColor = i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "var(--text-dim)";
                  return (
                    <div key={entry.username} className="flex items-center py-2"
                      style={{ backgroundColor: isYou ? "rgba(255,0,60,0.08)" : undefined, borderLeft: isYou ? "2px solid var(--accent-red)" : "2px solid transparent", paddingLeft: isYou ? "6px" : "8px" }}
                    >
                      <span className="w-6 sm:w-8 text-center text-xs font-bold" style={{ color: posColor }}>{i + 1}</span>
                      <div className="flex-1 ml-1 sm:ml-2 flex items-center gap-1 sm:gap-2 min-w-0">
                        <RankBadge rank={entry.rank} size="sm" />
                        <span className="text-xs text-[var(--text-primary)] truncate">
                          {entry.username}
                          {isYou && <span className="text-[var(--accent-red)] ml-1">(YOU)</span>}
                          {i < 3 && season && <span className="text-[var(--accent-yellow)] ml-1" title="Season Champion">♛</span>}
                        </span>
                      </div>
                      <span className="w-8 sm:w-14 text-center text-xs" style={{ color: "#00ff41" }}>{entry.wins}</span>
                      <span className="w-8 sm:w-14 text-center text-xs" style={{ color: "var(--accent-red)" }}>{entry.losses}</span>
                      <span className="w-12 sm:w-16 text-right text-xs font-bold" style={{ color, textShadow: `0 0 4px ${color}` }}>{entry.elo}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="hacker-card hacker-card-red">
                <div className="text-[10px] text-[var(--text-muted)] mb-3 tracking-wider">ALL-TIME · NEVER RESETS</div>
                <div className="flex items-center text-xs text-[var(--text-dim)] tracking-wider pb-2 mb-2 border-b border-[var(--border-color)]">
                  <span className="w-6 sm:w-8 text-center">#</span>
                  <span className="flex-1 ml-1 sm:ml-2">PLAYER</span>
                  <span className="w-12 sm:w-20 text-center">WINS</span>
                  <span className="w-14 sm:w-20 text-right">STREAK</span>
                </div>
                {[...entries]
                  .filter((e) => (e.winStreak ?? 0) > 0)
                  .sort((a, b) => (b.winStreak ?? 0) - (a.winStreak ?? 0))
                  .slice(0, 50)
                  .map((entry, i) => {
                    const isYou = player && entry.username.toLowerCase() === player.username.toLowerCase();
                    const posColor = i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "var(--text-dim)";
                    const streakColor = entry.winStreak >= 10 ? "#ff00cc" : entry.winStreak >= 5 ? "#ff6600" : "#ffdd00";
                    return (
                      <div key={entry.username} className="flex items-center py-2"
                        style={{ backgroundColor: isYou ? "rgba(255,0,60,0.08)" : undefined, borderLeft: isYou ? "2px solid var(--accent-red)" : "2px solid transparent", paddingLeft: isYou ? "6px" : "8px" }}
                      >
                        <span className="w-6 sm:w-8 text-center text-xs font-bold" style={{ color: posColor }}>{i + 1}</span>
                        <div className="flex-1 ml-1 sm:ml-2 flex items-center gap-1 sm:gap-2 min-w-0">
                          <RankBadge rank={entry.rank} size="sm" />
                          <span className="text-xs text-[var(--text-primary)] truncate">
                            {entry.username}
                            {isYou && <span className="text-[var(--accent-red)] ml-1">(YOU)</span>}
                          </span>
                        </div>
                        <span className="w-12 sm:w-20 text-center text-xs" style={{ color: "#00ff41" }}>{entry.wins}</span>
                        <span className="w-14 sm:w-20 text-right text-xs font-bold" style={{ color: streakColor, textShadow: `0 0 6px ${streakColor}` }}>
                          🔥 {entry.winStreak}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="mt-4 flex justify-center">
              <RetroButton variant="primary" onClick={() => router.push("/")}>
                BACK TO HOME
              </RetroButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
