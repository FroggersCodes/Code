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
  const [opponentTyping, setOpponentTyping] = useState(!isMultiplayer); // bot starts "typing"
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

  // Bot mode effects
  useEffect(() => {
    if (isMultiplayer) return;

    // Simulate bot typing
    const typingInterval = setInterval(() => {
      setOpponentTyping((prev) => !prev);
    }, 2000 + Math.random() * 3000);

    // Listen for bot solving
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

  // Multiplayer mode effects
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

    // Send typing status in multiplayer mode
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
      // Result comes via socket event (setOnSubmitResult)
      // Reset submitted after a brief delay if not solved
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
        // Game end comes via socket event
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
          isYou={true}
          solved={solved}
        />

        <Timer duration={90} onTimeUp={handleTimeUp} started={true} />

        <PlayerCard
          username={opponentName}
          elo={opponentElo}
          rank={opponentRank}
          isYou={false}
          solved={opponentSolved}
          typing={opponentTyping && !opponentSolved && !gameEnded}
        />
      </div>

      <div className="nes-container is-dark mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[var(--neon-yellow)] text-xs">
            {challengeData.title}
          </h2>
          <span className="text-[8px] text-[var(--text-dim)]">
            {challengeData.language.toUpperCase()} | DIFF: {"*".repeat(challengeData.difficulty)}
          </span>
        </div>
        <p className="text-[10px] text-[var(--text-primary)] leading-relaxed">
          {challengeData.description}
        </p>
        {challengeData.hint && (
          <div className="mt-2">
            {showHint ? (
              <p className="text-[8px] text-[var(--neon-purple)]">
                HINT: {challengeData.hint}
              </p>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="text-[8px] text-[var(--text-dim)] hover:text-[var(--neon-purple)] transition-colors cursor-pointer bg-transparent border-none"
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
            <span className="text-[10px] text-[var(--neon-pink)] glow-pink flash">
              INCORRECT FIX! TRY AGAIN
            </span>
          )}
          {solved && (
            <span className="text-[10px] text-[var(--neon-green)] glow-green">
              BUG SQUASHED!
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
          <div className="text-[var(--neon-pink)] glow-pink text-lg animate-bounce">
            OPPONENT SOLVED IT!
          </div>
        </div>
      )}

      {disconnected && !gameEnded && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="text-[var(--neon-yellow)] glow-blue text-lg animate-bounce">
            OPPONENT DISCONNECTED!
          </div>
        </div>
      )}
    </div>
  );
}
