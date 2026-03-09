import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      elo: true,
      rank: true,
      wins: true,
      losses: true,
      draws: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ player1Id: user.id }, { player2Id: user.id }],
      status: "completed",
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      player1: { select: { username: true, elo: true } },
      player2: { select: { username: true, elo: true } },
      challenge: { select: { title: true, language: true } },
    },
  });

  return NextResponse.json({ user, matches });
}
