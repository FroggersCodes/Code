import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const challenges = await prisma.challenge.findMany({
    select: {
      id: true,
      title: true,
      language: true,
      difficulty: true,
      category: true,
    },
  });
  return NextResponse.json({ challenges });
}
