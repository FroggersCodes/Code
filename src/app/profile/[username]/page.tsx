"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RankBadge } from "@/components/RankBadge";
import { RetroButton } from "@/components/RetroButton";
import { getAvatarSvg } from "@/lib/avatars";
import { getTitleLabel, getTitleClass } from "@/lib/titles";
import { RANK_COLORS, RANK_THRESHOLDS, type RankTier } from "@/types";

interface PublicProfile {
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

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = typeof params.username === "string" ? params.username : "";

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;

    import("@/lib/socket").then(({ connectSocket }) => {
      const socket = connectSocket();

      const timeout = setTimeout(() => {
        setLoading(false);
        setNotFound(true);
      }, 6000);

      const handleData = (data: PublicProfile | null) => {
        clearTimeout(timeout);
        if (data) {
          setProfile(data);
        } else {
          setNotFound(true);
        }
        setLoading(false);
        socket.off("profile:data", handleData);
      };

      socket.on("profile:data", handleData);

      const request = () => socket.emit("profile:get", { username });

      if (socket.connected) {
        request();
      } else {
        socket.on("connect", () => { clearTimeout(timeout); request(); });
        socket.on("connect_error", () => { clearTimeout(timeout); setLoading(false); setNotFound(true); });
      }
    });
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-xs text-[var(--accent-red)] tracking-wider pulse-glow">LOADING PROFILE...</div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
        <div className="text-xs text-[var(--text-dim)] tracking-wider">Player not found or has never played online.</div>
        <RetroButton variant="primary" onClick={() => router.back()}>GO BACK</RetroButton>
      </div>
    );
  }

  const totalGames = profile.wins + profile.losses + profile.draws;
  const winRate = totalGames > 0 ? Math.round((profile.wins / totalGames) * 100) : 0;
  const avatarSvg = getAvatarSvg(profile.avatar);
  const titleLabel = getTitleLabel(profile.title);
  const titleClass = getTitleClass(profile.title);
  const rankTier = profile.rank as RankTier;
  const rankRange = RANK_THRESHOLDS[rankTier];
  const rankProgress = rankRange && rankRange.max !== Infinity
    ? Math.min(100, Math.round(((profile.elo - rankRange.min) / (rankRange.max - rankRange.min)) * 100))
    : rankTier === "Grandmaster" ? 100 : 0;
  const rankColor = RANK_COLORS[rankTier] || "#666";

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="hacker-card hacker-card-red text-center slide-up">
        {/* Avatar */}
        {avatarSvg ? (
          <div
            className="mx-auto mb-3 w-16 h-16 rounded border-2 border-[var(--accent-red)] overflow-hidden"
            style={{ boxShadow: "0 0 12px rgba(255,0,51,0.4)" }}
            dangerouslySetInnerHTML={{ __html: avatarSvg }}
          />
        ) : (
          <div className="mx-auto mb-3 w-16 h-16 rounded border-2 border-dashed border-[var(--border-color)] flex items-center justify-center">
            <span className="text-[var(--text-muted)] text-xs">?</span>
          </div>
        )}

        <div className="text-lg text-[var(--text-primary)] mb-1 font-bold">{profile.username}</div>

        {titleLabel && (
          <div
            className={`text-xs tracking-wider mb-2 ${titleClass ?? "text-[var(--accent-yellow)]"}`}
            style={titleClass ? undefined : { fontFamily: "'Orbitron', sans-serif" }}
          >
            {titleLabel}
          </div>
        )}

        <div className="mb-3"><RankBadge rank={profile.rank} size="lg" /></div>

        <div className="text-2xl font-bold mb-1" style={{ color: rankColor, textShadow: `0 0 8px ${rankColor}`, fontFamily: "'Orbitron', sans-serif" }}>
          {profile.elo} <span className="text-sm text-[var(--text-dim)]">ELO</span>
        </div>

        {/* Rank progress */}
        <div className="mx-auto mb-4 max-w-[200px]">
          <div className="h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${rankProgress}%`, backgroundColor: rankColor, boxShadow: `0 0 6px ${rankColor}66` }} />
          </div>
          <div className="text-[9px] text-[var(--text-muted)] mt-0.5 text-right">{rankProgress}%</div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3 text-center mb-4">
          {[
            { label: "WINS",   value: profile.wins,   color: "var(--accent-green)" },
            { label: "LOSSES", value: profile.losses, color: "var(--accent-red)" },
            { label: "DRAWS",  value: profile.draws,  color: undefined },
            { label: "WIN %",  value: `${winRate}%`,  color: "var(--accent-yellow)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className="text-[10px] text-[var(--text-dim)] mb-1 tracking-wider">{label}</div>
              <div className="text-sm font-bold" style={{ color: color ?? "var(--text-primary)", fontFamily: "'Orbitron', sans-serif" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Win streak */}
        {(profile.winStreak ?? 0) > 0 && (
          <div className="mb-4 py-2 border border-[var(--accent-yellow)] border-opacity-30 rounded bg-[rgba(255,204,0,0.04)]">
            <div className="text-[10px] text-[var(--text-dim)] tracking-wider mb-1">CURRENT STREAK</div>
            <div className="text-base font-bold text-[var(--accent-yellow)]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              🔥 {profile.winStreak}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <RetroButton variant="primary" onClick={() => router.back()}>GO BACK</RetroButton>
      </div>
    </div>
  );
}
