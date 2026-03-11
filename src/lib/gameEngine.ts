"use client";

import type { ChallengeData } from "@/types";
import type { FullChallenge } from "./challenges";
import { getRandomChallenge, validateCodeFix } from "./challenges";
import { getBotSolveDelay, shouldBotFail, BOT_PLAYER } from "./bot";
import { updateRatings, getRankFromElo } from "./elo";
import { getPlayer, updatePlayerAfterMatch, addMatch } from "./storage";

export interface LocalGameState {
  matchId: number;
  challenge: FullChallenge;
  startTime: number;
  botSolveTime: number | null;
  playerSolveTime: number | null;
  ended: boolean;
}

export interface GameResult {
  won: boolean;
  draw: boolean;
  playerTime: number | null;
  botTime: number | null;
  opponentTime: number | null;
  opponentName: string;
  eloChange: number;
  newElo: number;
  newRank: string;
  fixedCode?: string;
}

let currentGame: LocalGameState | null = null;
let botTimeout: ReturnType<typeof setTimeout> | null = null;
let onBotSolve: (() => void) | null = null;

export function startBotGame(): LocalGameState {
  const player = getPlayer();
  if (!player) throw new Error("No player");

  const challenge = getRandomChallenge();
  const playerElo = player.elo;

  // Calculate bot solve delay
  const botDelay = getBotSolveDelay(playerElo, challenge.difficulty);
  const botFails = shouldBotFail(playerElo);

  currentGame = {
    matchId: Date.now(),
    challenge,
    startTime: Date.now(),
    botSolveTime: null,
    playerSolveTime: null,
    ended: false,
  };

  // Schedule bot solve
  const firstDelay = botFails ? botDelay * 0.4 : botDelay;
  botTimeout = setTimeout(() => {
    if (!currentGame || currentGame.ended) return;
    if (botFails) {
      // Bot failed first attempt, retry
      botTimeout = setTimeout(() => {
        if (!currentGame || currentGame.ended) return;
        currentGame.botSolveTime = Date.now() - currentGame.startTime;
        onBotSolve?.();
      }, botDelay * 0.6);
    } else {
      currentGame.botSolveTime = Date.now() - currentGame.startTime;
      onBotSolve?.();
    }
  }, firstDelay);

  return currentGame;
}

export function setOnBotSolve(callback: () => void): void {
  onBotSolve = callback;
}

export function submitCode(code: string): { correct: boolean; result?: GameResult } {
  if (!currentGame || currentGame.ended) return { correct: false };

  const correct = validateCodeFix(code, currentGame.challenge.fixedCode);
  if (!correct) return { correct: false };

  currentGame.playerSolveTime = Date.now() - currentGame.startTime;
  return { correct: true, result: endGame() };
}

export function timeUp(): GameResult {
  return endGame();
}

function endGame(): GameResult {
  if (!currentGame) throw new Error("No game");
  currentGame.ended = true;

  if (botTimeout) {
    clearTimeout(botTimeout);
    botTimeout = null;
  }

  const player = getPlayer();
  if (!player) throw new Error("No player");

  const playerSolved = currentGame.playerSolveTime !== null;
  const botSolved = currentGame.botSolveTime !== null;

  let won = false;
  let draw = false;

  if (playerSolved && botSolved) {
    if (currentGame.playerSolveTime! < currentGame.botSolveTime!) won = true;
    else if (currentGame.playerSolveTime! > currentGame.botSolveTime!) won = false;
    else draw = true;
  } else if (playerSolved) {
    won = true;
  } else if (botSolved) {
    won = false;
  } else {
    draw = true;
  }

  const score = won ? 1 : draw ? 0.5 : 0;
  const { newRatingA, change } = updateRatings(player.elo, BOT_PLAYER.elo, score);
  const newRank = getRankFromElo(newRatingA);

  updatePlayerAfterMatch(won, draw, newRatingA);

  addMatch({
    id: currentGame.matchId,
    challengeTitle: currentGame.challenge.title,
    challengeLanguage: currentGame.challenge.language,
    opponentName: BOT_PLAYER.username,
    isVsBot: true,
    won,
    draw,
    eloChange: won ? change : draw ? 0 : -change,
    playerTime: currentGame.playerSolveTime,
    opponentTime: currentGame.botSolveTime,
    createdAt: new Date().toISOString(),
  });

  const fixedCode = currentGame.challenge.fixedCode;

  const result: GameResult = {
    won,
    draw,
    playerTime: currentGame.playerSolveTime,
    botTime: currentGame.botSolveTime,
    opponentTime: currentGame.botSolveTime,
    opponentName: BOT_PLAYER.username,
    eloChange: change,
    newElo: newRatingA,
    newRank,
    fixedCode,
  };

  currentGame = null;
  return result;
}

export function getCurrentGame(): LocalGameState | null {
  return currentGame;
}

export function cleanupGame(): void {
  if (botTimeout) {
    clearTimeout(botTimeout);
    botTimeout = null;
  }
  currentGame = null;
  onBotSolve = null;
}
