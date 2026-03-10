"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/RetroButton";
import { getPlayer, createPlayer } from "@/lib/storage";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const player = getPlayer();
    if (player) {
      setLoggedIn(true);
      setCurrentUser(player.username);
    }
  }, []);

  const handleLogin = () => {
    const trimmed = username.trim();
    if (!trimmed) return;
    if (trimmed.length < 2 || trimmed.length > 20) {
      setError("Username must be 2-20 characters");
      return;
    }
    const sanitized = trimmed.replace(/[^a-zA-Z0-9_-]/g, "");
    if (!sanitized) {
      setError("Invalid characters");
      return;
    }
    createPlayer(sanitized);
    setLoggedIn(true);
    setCurrentUser(sanitized);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="text-center mb-12 slide-up">
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

      {loggedIn ? (
        <div className="text-center slide-up w-full max-w-sm">
          <div className="hacker-card hacker-card-red mb-6">
            <div className="text-xs text-[var(--text-dim)] mb-1 tracking-wider">WELCOME BACK</div>
            <div className="text-[var(--accent-red)] text-lg mb-6 font-bold">{currentUser}</div>
            <div className="flex flex-col gap-3">
              <RetroButton variant="success" onClick={() => router.push("/lobby")}>
                PLAY NOW
              </RetroButton>
              <RetroButton variant="primary" onClick={() => router.push("/profile")}>
                MY PROFILE
              </RetroButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center slide-up w-full max-w-sm">
          <div className="hacker-card hacker-card-red">
            <div className="text-xs text-[var(--text-dim)] mb-4 tracking-wider">
              ENTER CALLSIGN
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="username_"
                maxLength={20}
                className="hacker-input"
              />
            </div>
            {error && (
              <div className="text-xs text-[var(--accent-red)] mb-3">{error}</div>
            )}
            <RetroButton
              variant="success"
              onClick={handleLogin}
              disabled={!username.trim()}
              className="w-full"
            >
              INITIALIZE
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
