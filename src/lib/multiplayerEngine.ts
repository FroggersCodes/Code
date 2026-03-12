"use client";

import type { ChallengeData, OnlineOpponent, MultiplayerResult } from "@/types";
import { connectSocket, disconnectSocket, getSocket } from "./socket";
import { getPlayer, updatePlayerAfterMatch, addMatch, checkAndUnlockTitles } from "./storage";

export interface MultiplayerGameState {
  roomId: string;
  opponent: OnlineOpponent;
  challenge: ChallengeData | null;
  startTime: number;
  timeLimit: number;
  playerSolveTime: number | null;
  opponentSolveTime: number | null;
  ended: boolean;
}

let currentGame: MultiplayerGameState | null = null;
let onMatchFound: ((game: MultiplayerGameState) => void) | null = null;
let onGameStart: ((game: MultiplayerGameState) => void) | null = null;
let onSubmitResult: ((correct: boolean) => void) | null = null;
let onOpponentSolved: ((opponentTime: number) => void) | null = null;
let onOpponentTyping: ((typing: boolean) => void) | null = null;
let onGameEnd: ((result: MultiplayerResult) => void) | null = null;
let onOpponentDisconnected: (() => void) | null = null;
let onQueueStatus: ((data: { position: number; queueSize: number }) => void) | null = null;
let onReaction: ((msg: string) => void) | null = null;
let listenersSetup = false;

function setupListeners(): void {
  if (listenersSetup) return;
  const socket = getSocket();

  socket.on("match:found", (data: { roomId: string; opponent: OnlineOpponent }) => {
    currentGame = {
      roomId: data.roomId,
      opponent: data.opponent,
      challenge: null,
      startTime: 0,
      timeLimit: 90000,
      playerSolveTime: null,
      opponentSolveTime: null,
      ended: false,
    };
    onMatchFound?.(currentGame);
  });

  socket.on("game:start", (data: { roomId: string; challenge: ChallengeData; timeLimit: number }) => {
    if (currentGame && currentGame.roomId === data.roomId) {
      currentGame.challenge = data.challenge;
      currentGame.startTime = Date.now();
      currentGame.timeLimit = data.timeLimit;
      onGameStart?.(currentGame);
    }
  });

  socket.on("game:submit-result", (data: { correct: boolean }) => {
    onSubmitResult?.(data.correct);
  });

  socket.on("game:opponent-solved", (data: { opponentTime: number }) => {
    if (currentGame) {
      currentGame.opponentSolveTime = data.opponentTime;
    }
    onOpponentSolved?.(data.opponentTime);
  });

  socket.on("game:opponent-typing", (data: { typing: boolean }) => {
    onOpponentTyping?.(data.typing);
  });

  socket.on("game:end", (data: MultiplayerResult) => {
    if (currentGame) {
      currentGame.ended = true;
      currentGame.playerSolveTime = data.playerTime;
      currentGame.opponentSolveTime = data.opponentTime;

      // Store match locally
      const player = getPlayer();
      if (player) {
        updatePlayerAfterMatch(data.won, data.draw, data.newElo);
        checkAndUnlockTitles();
        addMatch({
          id: Date.now(),
          challengeTitle: currentGame.challenge?.title ?? "Unknown",
          challengeLanguage: currentGame.challenge?.language ?? "javascript",
          opponentName: data.opponentName,
          isVsBot: false,
          won: data.won,
          draw: data.draw,
          eloChange: data.eloChange,
          playerTime: data.playerTime,
          opponentTime: data.opponentTime,
          createdAt: new Date().toISOString(),
        });
      }
    }
    onGameEnd?.(data);
  });

  socket.on("game:opponent-disconnected", () => {
    onOpponentDisconnected?.();
  });

  socket.on("queue:status", (data: { position: number; queueSize: number }) => {
    onQueueStatus?.(data);
  });

  socket.on("match:reaction", (data: { msg: string }) => {
    onReaction?.(data.msg);
  });

  listenersSetup = true;
}

export function joinQueue(): void {
  const player = getPlayer();
  if (!player) return;

  const socket = connectSocket();
  setupListeners();

  socket.emit("queue:join", {
    username: player.username,
    elo: player.elo,
    rank: player.rank,
    title: player.title ?? null,
  });
}

export function leaveQueue(): void {
  const socket = getSocket();
  socket.emit("queue:leave");
}

export function signalReady(roomId: string): void {
  const socket = getSocket();
  socket.emit("game:ready", { roomId });
}

export function submitMultiplayerCode(roomId: string, code: string): void {
  const socket = getSocket();
  socket.emit("game:submit", { roomId, code });
}

export function sendTimeout(roomId: string): void {
  const socket = getSocket();
  socket.emit("game:timeout", { roomId });
}

export function sendTypingStatus(roomId: string, typing: boolean): void {
  const socket = getSocket();
  socket.emit("game:typing", { roomId, typing });
}

export function getCurrentMultiplayerGame(): MultiplayerGameState | null {
  return currentGame;
}

export function cleanupMultiplayerGame(): void {
  currentGame = null;
}

// Callback setters
export function setOnMatchFound(cb: ((game: MultiplayerGameState) => void) | null): void {
  onMatchFound = cb;
}
export function setOnGameStart(cb: ((game: MultiplayerGameState) => void) | null): void {
  onGameStart = cb;
}
export function setOnSubmitResult(cb: ((correct: boolean) => void) | null): void {
  onSubmitResult = cb;
}
export function setOnOpponentSolved(cb: ((opponentTime: number) => void) | null): void {
  onOpponentSolved = cb;
}
export function setOnOpponentTyping(cb: ((typing: boolean) => void) | null): void {
  onOpponentTyping = cb;
}
export function setOnGameEnd(cb: ((result: MultiplayerResult) => void) | null): void {
  onGameEnd = cb;
}
export function setOnReaction(cb: ((msg: string) => void) | null): void {
  onReaction = cb;
}

export function sendReaction(roomId: string, msg: string): void {
  const socket = getSocket();
  socket.emit("match:reaction", { roomId, msg });
}

export function setOnOpponentDisconnected(cb: (() => void) | null): void {
  onOpponentDisconnected = cb;
}
export function setOnQueueStatus(cb: ((data: { position: number; queueSize: number }) => void) | null): void {
  onQueueStatus = cb;
}
