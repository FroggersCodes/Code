import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const players = await prisma.user.findMany({
    orderBy: { elo: "desc" },
    take: 100,
    select: {
      id: true,
      username: true,
      elo: true,
      rank: true,
      wins: true,
      losses: true,
      draws: true,
    },
  });
  return NextResponse.json({ players });
}
