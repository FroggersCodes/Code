"use client";

import { CHALLENGES, validateCodeFix, type FullChallenge } from "./challenges";

export interface PracticeSession {
  challenge: FullChallenge;
  startTime: number;
  timeLimitMs: number;
  ended: boolean;
  solveTime: number | null;
}

export interface PracticeResult {
  solved: boolean;
  timeMs: number | null;
  challenge: FullChallenge;
}

export function getChallengeForPractice(
  language: "javascript" | "python",
  difficulty: 1 | 2 | 3 | null,
  excludeId?: number
): FullChallenge {
  let pool = CHALLENGES.filter((c) => c.language === language);
  if (difficulty !== null) {
    pool = pool.filter((c) => c.difficulty === difficulty);
  }
  if (excludeId !== undefined) {
    const filtered = pool.filter((c) => c.id !== excludeId);
    if (filtered.length > 0) pool = filtered;
  }
  if (pool.length === 0) pool = CHALLENGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

let currentSession: PracticeSession | null = null;

export function startPractice(
  language: "javascript" | "python",
  difficulty: 1 | 2 | 3 | null,
  timeLimitSeconds: number,
  specificChallenge?: FullChallenge
): PracticeSession {
  const challenge =
    specificChallenge ??
    getChallengeForPractice(language, difficulty, currentSession?.challenge.id);

  currentSession = {
    challenge,
    startTime: Date.now(),
    timeLimitMs: timeLimitSeconds * 1000,
    ended: false,
    solveTime: null,
  };
  return currentSession;
}

export function submitPracticeCode(
  code: string
): { correct: boolean; result?: PracticeResult } {
  if (!currentSession || currentSession.ended) return { correct: false };

  const correct = validateCodeFix(code, currentSession.challenge.fixedCode);
  if (!correct) return { correct: false };

  currentSession.ended = true;
  currentSession.solveTime = Date.now() - currentSession.startTime;

  return {
    correct: true,
    result: {
      solved: true,
      timeMs: currentSession.solveTime,
      challenge: currentSession.challenge,
    },
  };
}

export function practiceTimeUp(): PracticeResult {
  if (!currentSession) throw new Error("No practice session");
  currentSession.ended = true;
  return {
    solved: false,
    timeMs: null,
    challenge: currentSession.challenge,
  };
}

export function getCurrentPracticeSession(): PracticeSession | null {
  return currentSession;
}

export function cleanupPractice(): void {
  currentSession = null;
}
