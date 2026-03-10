"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/RetroButton";
import { getPlayer, signUp, login } from "@/lib/storage";

type AuthTab = "login" | "signup";

export default function HomePage() {
  const [tab, setTab] = useState<AuthTab>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      setLoggedIn(true);
      setCurrentUser(result.username);
    } else {
      const result = login(sanitized, password);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setLoggedIn(true);
      setCurrentUser(result.username);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
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
