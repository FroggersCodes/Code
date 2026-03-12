"use client";

import type { ChallengeData } from "@/types";
import { getRandomChallenge, validateCodeFix, type FullChallenge } from "./challenges";
import { getBotSolveDelay, shouldBotFail, BOT_PLAYER } from "./bot";
import { updateRatings, getRankFromElo } from "./elo";
import { getPlayer, updatePlayerAfterMatch, addMatch, checkAndUnlockTitles } from "./storage";

export interface LocalGameState {
  matchId: number;
  challenge: FullChallenge;
  startTime: number;
  botSolveTime: number | null;
  playerSolveTime: number | null;
  ended: boolean;
  isCotd?: boolean;
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
  buggyCode?: string;
  challengeTitle?: string;
}

let currentGame: LocalGameState | null = null;
let botTimeout: ReturnType<typeof setTimeout> | null = null;
let onBotSolve: (() => void) | null = null;

export function startBotGameWithChallenge(challenge: FullChallenge): LocalGameState {
  const player = getPlayer();
  if (!player) throw new Error("No player");
  return initBotGame(player.elo, challenge);
}

export function startCotdGame(challenge: FullChallenge): LocalGameState {
  const player = getPlayer();
  if (!player) throw new Error("No player");

  currentGame = {
    matchId: Date.now(),
    challenge,
    startTime: Date.now(),
    botSolveTime: null,
    playerSolveTime: null,
    ended: false,
    isCotd: true,
  };

  return currentGame;
}

export function startBotGame(): LocalGameState {
  const player = getPlayer();
  if (!player) throw new Error("No player");

  const challenge = getRandomChallenge();
  return initBotGame(player.elo, challenge);
}

function initBotGame(playerElo: number, challenge: FullChallenge): LocalGameState {
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

  const firstDelay = botFails ? botDelay * 0.4 : botDelay;
  botTimeout = setTimeout(() => {
    if (!currentGame || currentGame.ended) return;
    if (botFails) {
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

  const isCotd = currentGame.isCotd ?? false;
  const playerSolved = currentGame.playerSolveTime !== null;
  const botSolved = currentGame.botSolveTime !== null;

  let won = false;
  let draw = false;

  if (isCotd) {
    // COTD is solo: win if player solved, otherwise failed (no ELO penalty)
    won = playerSolved;
  } else if (playerSolved && botSolved) {
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

  // COTD: if player failed, treat as draw for ELO (zero change) but show as failed in UI
  const eloScore = isCotd && !won ? 0.5 : won ? 1 : draw ? 0.5 : 0;
  const { newRatingA, change } = updateRatings(player.elo, BOT_PLAYER.elo, eloScore);
  const newRank = getRankFromElo(newRatingA);

  updatePlayerAfterMatch(won, isCotd && !won ? true : draw, newRatingA);
  checkAndUnlockTitles();

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
    fixedCode: currentGame.challenge.fixedCode,
    buggyCode: currentGame.challenge.buggyCode,
    challengeTitle: currentGame.challenge.title,
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
