"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CodeEditor } from "./CodeEditor";
import { PlayerCard } from "./PlayerCard";
import { Timer } from "./Timer";
import { RetroButton } from "./RetroButton";
import { submitCode, timeUp, setOnBotSolve } from "@/lib/gameEngine";
import {
  submitMultiplayerCode,
  sendTimeout,
  sendTypingStatus,
  setOnSubmitResult,
  setOnOpponentSolved,
  setOnOpponentTyping,
  setOnGameEnd,
  setOnOpponentDisconnected,
} from "@/lib/multiplayerEngine";
import { getPlayer } from "@/lib/storage";
import { BOT_PLAYER } from "@/lib/bot";
import { TITLES, getTitleLabel } from "@/lib/titles";
import type { LocalGameState, GameResult } from "@/lib/gameEngine";
import type { ChallengeData, OnlineOpponent, MultiplayerResult } from "@/types";

interface BotModeProps {
  game: LocalGameState;
  onGameResult: (result: GameResult) => void;
  multiplayerConfig?: undefined;
  challenge?: undefined;
  onMultiplayerResult?: undefined;
}

interface MultiplayerModeProps {
  game?: undefined;
  onGameResult?: undefined;
  multiplayerConfig: { roomId: string; opponent: OnlineOpponent };
  challenge: ChallengeData;
  onMultiplayerResult: (result: MultiplayerResult) => void;
}

type GameArenaProps = BotModeProps | MultiplayerModeProps;

export function GameArena(props: GameArenaProps) {
  const isMultiplayer = !!props.multiplayerConfig;
  const challengeData = isMultiplayer ? props.challenge! : props.game!.challenge;

  const [code, setCode] = useState(challengeData.buggyCode);
  const [submitted, setSubmitted] = useState(false);
  const [solved, setSolved] = useState(false);
  const [opponentSolved, setOpponentSolved] = useState(false);
  const [showError, setShowError] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [opponentTyping, setOpponentTyping] = useState(!isMultiplayer);
  const [disconnected, setDisconnected] = useState(false);
  const resultSent = useRef(false);
  const typingRef = useRef(false);

  const player = getPlayer();

  const opponentName = isMultiplayer
    ? props.multiplayerConfig!.opponent.username
    : BOT_PLAYER.username;
  const opponentElo = isMultiplayer
    ? props.multiplayerConfig!.opponent.elo
    : BOT_PLAYER.elo;
  const opponentRank = isMultiplayer
    ? props.multiplayerConfig!.opponent.rank
    : BOT_PLAYER.rank;
  const opponentTitle = isMultiplayer
    ? getTitleLabel(props.multiplayerConfig!.opponent.title)
    : null;
  const playerTitleLabel = player?.title
    ? (TITLES.find((t) => t.id === player.title)?.label ?? null)
    : null;

  useEffect(() => {
    if (isMultiplayer) return;

    const typingInterval = setInterval(() => {
      setOpponentTyping((prev) => !prev);
    }, 2000 + Math.random() * 3000);

    setOnBotSolve(() => {
      setOpponentSolved(true);
      setOpponentTyping(false);
      setTimeout(() => {
        if (!resultSent.current) {
          resultSent.current = true;
          setGameEnded(true);
          const result = timeUp();
          props.onGameResult!(result);
        }
      }, 1500);
    });

    return () => clearInterval(typingInterval);
  }, [isMultiplayer]);

  useEffect(() => {
    if (!isMultiplayer) return;

    const roomId = props.multiplayerConfig!.roomId;

    setOnSubmitResult((correct: boolean) => {
      if (correct) {
        setSolved(true);
      } else {
        setShowError(true);
        setSubmitted(false);
      }
    });

    setOnOpponentSolved(() => {
      setOpponentSolved(true);
      setOpponentTyping(false);
    });

    setOnOpponentTyping((typing: boolean) => {
      setOpponentTyping(typing);
    });

    setOnGameEnd((result: MultiplayerResult) => {
      if (!resultSent.current) {
        resultSent.current = true;
        setGameEnded(true);
        props.onMultiplayerResult!(result);
      }
    });

    setOnOpponentDisconnected(() => {
      setDisconnected(true);
      setOpponentTyping(false);
    });

    return () => {
      setOnSubmitResult(null);
      setOnOpponentSolved(null);
      setOnOpponentTyping(null);
      setOnGameEnd(null);
      setOnOpponentDisconnected(null);
    };
  }, [isMultiplayer]);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
    setShowError(false);

    if (isMultiplayer && props.multiplayerConfig) {
      const isTyping = value !== code;
      if (isTyping !== typingRef.current) {
        typingRef.current = isTyping;
        sendTypingStatus(props.multiplayerConfig.roomId, isTyping);
      }
    }
  }, [isMultiplayer, props.multiplayerConfig, code]);

  const handleSubmit = useCallback(() => {
    if (submitted && solved) return;
    if (gameEnded) return;

    setSubmitted(true);
    setShake(true);
    setTimeout(() => setShake(false), 500);

    if (isMultiplayer) {
      submitMultiplayerCode(props.multiplayerConfig!.roomId, code);
      setTimeout(() => {
        setSubmitted(false);
      }, 500);
    } else {
      const { correct, result } = submitCode(code);
      if (correct && result) {
        setSolved(true);
        resultSent.current = true;
        setGameEnded(true);
        props.onGameResult!(result);
      } else {
        setTimeout(() => {
          setShowError(true);
          setSubmitted(false);
        }, 300);
      }
    }
  }, [code, submitted, solved, gameEnded, isMultiplayer, props]);

  const handleTimeUp = useCallback(() => {
    if (!gameEnded && !resultSent.current) {
      if (isMultiplayer) {
        sendTimeout(props.multiplayerConfig!.roomId);
      } else {
        resultSent.current = true;
        setGameEnded(true);
        const result = timeUp();
        props.onGameResult!(result);
      }
    }
  }, [gameEnded, isMultiplayer, props]);

  return (
    <div className={`max-w-7xl mx-auto px-4 py-4 ${shake ? "shake" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <PlayerCard
          username={player?.username || "You"}
          elo={player?.elo || 1000}
          rank={player?.rank || "Silver"}
          title={playerTitleLabel}
          isYou={true}
          solved={solved}
        />

        <Timer duration={90} onTimeUp={handleTimeUp} started={true} />

        <PlayerCard
          username={opponentName}
          elo={opponentElo}
          rank={opponentRank}
          title={opponentTitle}
          isYou={false}
          solved={opponentSolved}
          typing={opponentTyping && !opponentSolved && !gameEnded}
        />
      </div>

      <div className="hacker-card hacker-card-red mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[var(--accent-red)] text-sm font-bold tracking-wider">
            {challengeData.title}
          </h2>
          <span className="text-xs text-[var(--text-dim)]">
            {challengeData.language.toUpperCase()} | {"*".repeat(challengeData.difficulty)}
          </span>
        </div>
        <p className="text-xs text-[var(--text-primary)] leading-relaxed">
          {challengeData.description}
        </p>
        {challengeData.hint && (
          <div className="mt-3">
            {showHint ? (
              <p className="text-xs text-[var(--accent-yellow)]">
                HINT: {challengeData.hint}
              </p>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-[var(--text-dim)] hover:text-[var(--accent-yellow)] transition-colors cursor-pointer bg-transparent border-none"
                style={{ fontFamily: "inherit" }}
              >
                [ SHOW HINT ]
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <CodeEditor
          value={code}
          language={challengeData.language}
          onChange={handleCodeChange}
          readOnly={gameEnded || solved}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          {showError && (
            <span className="text-xs text-[var(--accent-red)] glow-red flash font-bold">
              INCORRECT FIX — TRY AGAIN
            </span>
          )}
          {solved && (
            <span className="text-xs text-[var(--accent-green)] glow-green font-bold">
              BUG SQUASHED
            </span>
          )}
        </div>
        <RetroButton
          variant="success"
          onClick={handleSubmit}
          disabled={gameEnded || solved}
        >
          SUBMIT FIX
        </RetroButton>
      </div>

      {opponentSolved && !solved && !gameEnded && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="text-[var(--accent-red)] glow-red text-lg animate-bounce font-bold tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            OPPONENT SOLVED IT
          </div>
        </div>
      )}

      {disconnected && !gameEnded && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="text-[var(--accent-yellow)] text-lg animate-bounce font-bold tracking-wider">
            OPPONENT DISCONNECTED
          </div>
        </div>
      )}
    </div>
  );
}
