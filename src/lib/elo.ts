import type { RankTier } from "@/types";

const K = 32;

export function calculateExpected(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function updateRatings(
  ratingA: number,
  ratingB: number,
  scoreA: number // 1 = A wins, 0 = B wins, 0.5 = draw
): { newRatingA: number; newRatingB: number; change: number } {
  const expectedA = calculateExpected(ratingA, ratingB);
  const expectedB = calculateExpected(ratingB, ratingA);

  const change = Math.round(K * (scoreA - expectedA));
  const newRatingA = Math.max(0, ratingA + change);
  const newRatingB = Math.max(0, ratingB + Math.round(K * (1 - scoreA - expectedB)));

  return { newRatingA, newRatingB, change: Math.abs(change) };
}

export function getRankFromElo(elo: number): RankTier {
  if (elo >= 2000) return "Grandmaster";
  if (elo >= 1600) return "Diamond";
  if (elo >= 1400) return "Platinum";
  if (elo >= 1200) return "Gold";
  if (elo >= 1000) return "Silver";
  return "Bronze";
}
