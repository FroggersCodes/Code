import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { username } = await req.json();

  if (!username || typeof username !== "string" || username.length < 2 || username.length > 20) {
    return NextResponse.json({ error: "Username must be 2-20 characters" }, { status: 400 });
  }

  const sanitized = username.replace(/[^a-zA-Z0-9_-]/g, "");

  try {
    // Try to find existing user, or create new one
    let user = await prisma.user.findUnique({ where: { username: sanitized } });

    if (!user) {
      user = await prisma.user.create({
        data: { username: sanitized },
      });
    }

    const response = NextResponse.json({ user });
    response.cookies.set("userId", String(user.id), {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    response.cookies.set("username", user.username, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
