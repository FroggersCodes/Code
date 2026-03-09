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
        <h1 className="text-4xl text-[var(--neon-green)] glow-green mb-4">
          BugRacer
        </h1>
        <div className="text-[10px] text-[var(--neon-blue)] glow-blue mb-2">
          COMPETITIVE BUG FIXING
        </div>
        <div className="text-[8px] text-[var(--text-dim)]">
          RACE TO SQUASH THE BUGS
        </div>
      </div>

      {loggedIn ? (
        <div className="text-center slide-up">
          <div className="nes-container is-dark mb-6">
            <div className="text-[10px] text-[var(--text-dim)] mb-2">WELCOME BACK</div>
            <div className="text-[var(--neon-yellow)] text-sm mb-4">{currentUser}</div>
            <div className="flex flex-col gap-3">
              <RetroButton variant="success" onClick={() => router.push("/lobby")}>
                PLAY NOW
              </RetroButton>
              <RetroButton variant="warning" onClick={() => router.push("/profile")}>
                MY PROFILE
              </RetroButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center slide-up">
          <div className="nes-container is-dark">
            <div className="text-[10px] text-[var(--neon-blue)] mb-4">
              ENTER YOUR CALLSIGN
            </div>
            <div className="mb-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Username"
                maxLength={20}
                className="w-full bg-[var(--bg-dark)] border-4 border-[var(--neon-blue)] text-[var(--neon-green)] p-2 text-[10px] focus:outline-none focus:border-[var(--neon-green)]"
                style={{ fontFamily: "inherit" }}
              />
            </div>
            {error && (
              <div className="text-[8px] text-[var(--neon-pink)] mb-2">{error}</div>
            )}
            <RetroButton
              variant="success"
              onClick={handleLogin}
              disabled={!username.trim()}
            >
              START
            </RetroButton>
          </div>
          <div className="mt-8 text-[8px] text-[var(--text-dim)]">
            <div>{">>>"} FIX BUGS FASTER THAN THE BOT</div>
            <div>{">>>"} CLIMB THE ELO RANKINGS</div>
            <div>{">>>"} JAVASCRIPT &amp; PYTHON CHALLENGES</div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 left-0 right-0 text-center">
        <div className="text-[8px] text-[var(--text-dim)] pulse-neon">
          INSERT COIN TO CONTINUE
        </div>
      </div>
    </div>
  );
}
