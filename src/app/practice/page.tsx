"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RetroButton } from "@/components/RetroButton";
import { RankBadge } from "@/components/RankBadge";
import { PracticeArena } from "@/components/PracticeArena";
import {
  startPractice,
  cleanupPractice,
  getChallengeForPractice,
  type PracticeResult,
} from "@/lib/practiceEngine";
import { getPlayer } from "@/lib/storage";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import type { FullChallenge } from "@/lib/challenges";
import type { PracticeConfig, PracticeOpponent } from "@/types";

type PageState = "setup" | "waiting" | "countdown" | "playing" | "results";
type SetupSubview = "main" | "join_input";

const TIME_OPTIONS = [
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
  { label: "3 min", value: 180 },
];

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs tracking-wider border transition-all duration-150 ${
        active
          ? "border-[var(--accent-red)] text-[var(--accent-red)] bg-[rgba(255,0,51,0.12)]"
          : "border-[var(--border-color)] text-[var(--text-dim)] hover:border-[var(--accent-red)] hover:text-[var(--text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

function PracticePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const joinCode = searchParams.get("join");

  const [player] = useState(() => getPlayer());
  const [pageState, setPageState] = useState<PageState>("setup");
  const [config, setConfig] = useState<PracticeConfig>({
    language: "javascript",
    difficulty: null,
    timeLimit: 90,
    mode: "solo",
  });

  // Countdown
  const [countdown, setCountdown] = useState(3);

  // Solo practice
  const [practiceChallenge, setPracticeChallenge] = useState<FullChallenge | null>(null);
  const [practiceResult, setPracticeResult] = useState<PracticeResult | null>(null);

  // Invite/friend mode
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [opponent, setOpponent] = useState<PracticeOpponent | null>(null);
  const [friendChallenge, setFriendChallenge] = useState<FullChallenge | null>(null);
  const [opponentSolved, setOpponentSolved] = useState(false);
  const [opponentTime, setOpponentTime] = useState<number | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copyDone, setCopyDone] = useState(false);
  const [setupSubview, setSetupSubview] = useState<SetupSubview>("main");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null);
  const friendResultCallback = useRef<((correct: boolean, result?: PracticeResult) => void) | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!player) router.push("/");
  }, [player, router]);

  // Auto-join from URL ?join=CODE
  useEffect(() => {
    if (joinCode && player) {
      setConfig((c) => ({ ...c, mode: "invite" }));
      handleJoinRoom(joinCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinCode, player]);

  const setupSocket = useCallback(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    socket.off("practice:created");
    socket.off("practice:opponent-joined");
    socket.off("practice:begin");
    socket.off("practice:submit-result");
    socket.off("practice:opponent-solved");
    socket.off("practice:end");
    socket.off("practice:error");

    socket.on("practice:created", (data: { code: string; roomId: string }) => {
      setRoomCode(data.code);
      setRoomId(data.roomId);
      setIsHost(true);
      setPageState("waiting");
    });

    socket.on(
      "practice:opponent-joined",
      (data: { username: string; elo: number; rank: string }) => {
        setOpponent(data);
      }
    );

    socket.on(
      "practice:begin",
      (data: { challenge: FullChallenge; timeLimit: number; roomId: string }) => {
        setFriendChallenge(data.challenge);
        setRoomId(data.roomId);
        setCountdown(3);
        setPageState("countdown");
      }
    );

    socket.on("practice:submit-result", (data: { correct: boolean }) => {
      if (data.correct && friendChallenge) {
        const result: PracticeResult = {
          solved: true,
          timeMs: Date.now(), // placeholder — actual time tracked in arena
          challenge: friendChallenge,
        };
        friendResultCallback.current?.(true, result);
      } else {
        friendResultCallback.current?.(false);
      }
    });

    socket.on("practice:opponent-solved", (data: { time: number }) => {
      setOpponentSolved(true);
      setOpponentTime(data.time);
    });

    socket.on("practice:end", () => {
      setPageState("results");
    });

    socket.on("practice:error", (data: { message: string }) => {
      setJoinError(data.message);
    });

    return socket;
  }, [friendChallenge]);

  const handleCreateRoom = useCallback(() => {
    if (!player) return;
    const socket = setupSocket();
    socket.emit("practice:create", {
      language: config.language,
      difficulty: config.difficulty,
      timeLimit: config.timeLimit,
      username: player.username,
      elo: player.elo,
      rank: player.rank,
    });
  }, [player, config, setupSocket]);

  const handleJoinRoom = useCallback(
    (code: string) => {
      if (!player) return;
      const socket = setupSocket();
      socket.emit("practice:join", {
        code: code.toUpperCase(),
        username: player.username,
        elo: player.elo,
        rank: player.rank,
      });
      setPageState("waiting");
      setIsHost(false);
    },
    [player, setupSocket]
  );

  const handleStartGame = useCallback(() => {
    if (!roomId || !socketRef.current) return;
    socketRef.current.emit("practice:start", { roomId });
  }, [roomId]);

  // Countdown → playing
  useEffect(() => {
    if (pageState !== "countdown") return;
    if (countdown <= 0) {
      if (config.mode === "solo") {
        const session = startPractice(config.language, config.difficulty, config.timeLimit);
        setPracticeChallenge(session.challenge);
      }
      setPageState("playing");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [pageState, countdown, config]);

  const handleSoloStart = useCallback(() => {
    setCountdown(3);
    setPageState("countdown");
  }, []);

  const handlePracticeFinished = useCallback((result: PracticeResult) => {
    setPracticeResult(result);
    setPageState("results");
  }, []);

  const handleRetry = useCallback(() => {
    cleanupPractice();
    setPracticeResult(null);
    setOpponentSolved(false);
    setOpponentTime(null);
    if (config.mode === "solo") {
      // Retry same challenge
      const session = startPractice(
        config.language,
        config.difficulty,
        config.timeLimit,
        practiceChallenge ?? undefined
      );
      setPracticeChallenge(session.challenge);
      setPageState("playing");
    } else {
      setPageState("setup");
    }
  }, [config, practiceChallenge]);

  const handleNext = useCallback(() => {
    cleanupPractice();
    setPracticeResult(null);
    setOpponentSolved(false);
    setOpponentTime(null);
    setCountdown(3);
    setPageState("countdown");
  }, []);

  const handleCopyLink = useCallback(() => {
    if (!roomCode) return;
    const url = `${window.location.origin}/practice?join=${roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    });
  }, [roomCode]);

  const handleFriendSubmit = useCallback(
    (code: string) => {
      if (!roomId || !socketRef.current) return;
      socketRef.current.emit("practice:submit", { roomId, code });
    },
    [roomId]
  );

  const handleFriendTimeout = useCallback(() => {
    if (!roomId || !socketRef.current) return;
    socketRef.current.emit("practice:timeout", { roomId });
  }, [roomId]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      cleanupPractice();
      if (socketRef.current) {
        socketRef.current.off("practice:created");
        socketRef.current.off("practice:opponent-joined");
        socketRef.current.off("practice:begin");
        socketRef.current.off("practice:submit-result");
        socketRef.current.off("practice:opponent-solved");
        socketRef.current.off("practice:end");
        socketRef.current.off("practice:error");
      }
    };
  }, []);

  if (!player) return null;

  // ─── SETUP ────────────────────────────────────────────────────────────────
  if (pageState === "setup") {
    return (
      <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 py-8">
        <h1
          className="text-lg text-[var(--accent-red)] glow-red mb-6 tracking-widest font-bold"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          PRACTICE MODE
        </h1>

        <div className="w-full max-w-md space-y-4">
          {/* Language */}
          <div className="hacker-card hacker-card-red">
            <div className="text-xs text-[var(--text-dim)] mb-3 tracking-wider">LANGUAGE</div>
            <div className="flex gap-2">
              <OptionButton
                active={config.language === "javascript"}
                onClick={() => setConfig((c) => ({ ...c, language: "javascript" }))}
              >
                JAVASCRIPT
              </OptionButton>
              <OptionButton
                active={config.language === "python"}
                onClick={() => setConfig((c) => ({ ...c, language: "python" }))}
              >
                PYTHON
              </OptionButton>
            </div>
          </div>

          {/* Difficulty */}
          <div className="hacker-card hacker-card-red">
            <div className="text-xs text-[var(--text-dim)] mb-3 tracking-wider">DIFFICULTY</div>
            <div className="flex gap-2 flex-wrap">
              <OptionButton
                active={config.difficulty === null}
                onClick={() => setConfig((c) => ({ ...c, difficulty: null }))}
              >
                ANY
              </OptionButton>
              <OptionButton
                active={config.difficulty === 1}
                onClick={() => setConfig((c) => ({ ...c, difficulty: 1 }))}
              >
                EASY ★
              </OptionButton>
              <OptionButton
                active={config.difficulty === 2}
                onClick={() => setConfig((c) => ({ ...c, difficulty: 2 }))}
              >
                MEDIUM ★★
              </OptionButton>
              <OptionButton
                active={config.difficulty === 3}
                onClick={() => setConfig((c) => ({ ...c, difficulty: 3 }))}
              >
                HARD ★★★
              </OptionButton>
            </div>
          </div>

          {/* Time limit */}
          <div className="hacker-card hacker-card-red">
            <div className="text-xs text-[var(--text-dim)] mb-3 tracking-wider">TIME LIMIT</div>
            <div className="flex gap-2 flex-wrap">
              {TIME_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  active={config.timeLimit === opt.value}
                  onClick={() => setConfig((c) => ({ ...c, timeLimit: opt.value }))}
                >
                  {opt.label}
                </OptionButton>
              ))}
            </div>
          </div>

          {/* Join code input subview */}
          {setupSubview === "join_input" && (
            <div className="hacker-card hacker-card-red">
              <div className="text-xs text-[var(--text-dim)] mb-3 tracking-wider">ENTER ROOM CODE</div>
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => {
                  setJoinCodeInput(e.target.value.toUpperCase().slice(0, 6));
                  setJoinError(null);
                }}
                placeholder="ABC123"
                maxLength={6}
                className="w-full bg-transparent border border-[var(--border-color)] text-[var(--accent-red)] text-center text-2xl tracking-[0.4em] py-2 mb-3 outline-none focus:border-[var(--accent-red)] font-mono"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && joinCodeInput.length === 6) {
                    setConfig((c) => ({ ...c, mode: "invite" }));
                    handleJoinRoom(joinCodeInput);
                  }
                }}
              />
              {joinError && (
                <div className="text-xs text-[var(--accent-red)] tracking-wider text-center mb-3">
                  {joinError}
                </div>
              )}
              <div className="flex gap-2">
                <RetroButton
                  variant="error"
                  onClick={() => { setSetupSubview("main"); setJoinCodeInput(""); setJoinError(null); }}
                  className="flex-1"
                >
                  BACK
                </RetroButton>
                <RetroButton
                  variant="success"
                  onClick={() => {
                    if (joinCodeInput.length < 3) return;
                    setConfig((c) => ({ ...c, mode: "invite" }));
                    handleJoinRoom(joinCodeInput);
                  }}
                  className="flex-1"
                  disabled={joinCodeInput.length < 3}
                >
                  JOIN
                </RetroButton>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {setupSubview === "main" && (
            <div className="space-y-2">
              <div className="flex gap-3">
                <RetroButton variant="error" onClick={() => router.push("/")} className="flex-1">
                  BACK
                </RetroButton>
                <RetroButton variant="success" onClick={handleSoloStart} className="flex-1">
                  SOLO PRACTICE
                </RetroButton>
              </div>
              <div className="flex gap-3">
                <RetroButton variant="primary" onClick={handleCreateRoom} className="flex-1">
                  CREATE ROOM
                </RetroButton>
                <RetroButton
                  variant="primary"
                  onClick={() => setSetupSubview("join_input")}
                  className="flex-1"
                >
                  JOIN ROOM
                </RetroButton>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── WAITING (invite mode) ─────────────────────────────────────────────────
  if (pageState === "waiting") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-sm">
          <div className="hacker-card hacker-card-red text-center mb-4">
            <div className="text-xs text-[var(--text-dim)] mb-3 tracking-wider">
              {isHost ? "SHARE THIS CODE WITH A FRIEND" : "WAITING FOR HOST TO START"}
            </div>
            {roomCode && (
              <>
                <div
                  className="text-4xl font-bold text-[var(--accent-red)] glow-red tracking-[0.3em] mb-4"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  {roomCode}
                </div>
                <RetroButton variant="primary" onClick={handleCopyLink} className="w-full mb-4">
                  {copyDone ? "LINK COPIED!" : "COPY INVITE LINK"}
                </RetroButton>
              </>
            )}

            {!opponent && (
              <div className="text-xs text-[var(--text-dim)] pulse-glow tracking-widest">
                WAITING FOR OPPONENT...
              </div>
            )}

            {opponent && (
              <div className="mt-3">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <RankBadge rank={opponent.rank} size="sm" />
                  <span className="text-sm text-[var(--text-primary)] font-bold">
                    {opponent.username}
                  </span>
                  <span className="text-xs text-[var(--text-dim)]">{opponent.elo} ELO</span>
                </div>
                {isHost && (
                  <RetroButton variant="success" onClick={handleStartGame} className="w-full">
                    START GAME
                  </RetroButton>
                )}
                {!isHost && (
                  <div className="text-xs text-[var(--text-dim)] pulse-glow tracking-widest">
                    WAITING FOR HOST TO START...
                  </div>
                )}
              </div>
            )}
          </div>
          <RetroButton variant="error" onClick={() => { setPageState("setup"); setRoomCode(null); setOpponent(null); }} className="w-full">
            CANCEL
          </RetroButton>
        </div>
      </div>
    );
  }

  // ─── COUNTDOWN ────────────────────────────────────────────────────────────
  if (pageState === "countdown") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div
          className="text-8xl font-black text-[var(--accent-red)] glow-red"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          {countdown > 0 ? countdown : "GO!"}
        </div>
        <div className="text-xs text-[var(--text-dim)] mt-4 tracking-widest">PRACTICE MODE</div>
      </div>
    );
  }

  // ─── PLAYING ──────────────────────────────────────────────────────────────
  if (pageState === "playing") {
    const challenge = config.mode === "invite" ? friendChallenge : practiceChallenge;
    if (!challenge) return null;

    return (
      <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] py-4">
        <PracticeArena
          challenge={challenge}
          timeLimit={config.timeLimit}
          onFinished={handlePracticeFinished}
          friendMode={
            config.mode === "invite" && opponent && roomId
              ? {
                  roomId,
                  opponent,
                  onSubmit: handleFriendSubmit,
                  onTimeout: handleFriendTimeout,
                  opponentSolved,
                  opponentTime,
                }
              : undefined
          }
        />
      </div>
    );
  }

  // ─── RESULTS ──────────────────────────────────────────────────────────────
  if (pageState === "results" && practiceResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-sm space-y-4">
          <div className="hacker-card hacker-card-red text-center">
            <div
              className={`text-2xl font-bold tracking-widest mb-2 ${
                practiceResult.solved
                  ? "text-[#00ff41] glow-green"
                  : "text-[var(--accent-red)] glow-red"
              }`}
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {practiceResult.solved ? "BUG FIXED!" : "TIME UP"}
            </div>
            {practiceResult.solved && practiceResult.timeMs !== null && (
              <div className="text-sm text-[var(--text-dim)] mb-1">
                Time: {(practiceResult.timeMs / 1000).toFixed(2)}s
              </div>
            )}
            <div className="text-xs text-[var(--accent-yellow)] tracking-wider">
              NO ELO CHANGE — PRACTICE MODE
            </div>
          </div>

          <div className="flex gap-3">
            {config.mode === "solo" && (
              <RetroButton variant="primary" onClick={handleRetry} className="flex-1">
                RETRY
              </RetroButton>
            )}
            {config.mode === "solo" && (
              <RetroButton variant="success" onClick={handleNext} className="flex-1">
                NEXT
              </RetroButton>
            )}
            <RetroButton variant="error" onClick={() => { cleanupPractice(); router.push("/"); }} className="flex-1">
              HOME
            </RetroButton>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function PracticePage() {
  return (
    <Suspense>
      <PracticePageInner />
    </Suspense>
  );
}
