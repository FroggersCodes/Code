import { NextRequest, NextResponse } from "next/server";
import { consumeFulfilledOrder } from "@/lib/fulfilled-orders";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Called by the client after redirect from LemonSqueezy checkout.
 * Checks if the webhook has confirmed payment for this user + product.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`verify:${ip}`, 10, 60_000).allowed) {
    return NextResponse.json({ verified: false }, { status: 429 });
  }

  const { username, productId } = (await request.json()) as {
    username: string;
    productId: string;
  };

  if (!username || !productId) {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  const verified = consumeFulfilledOrder(productId, username);
  return NextResponse.json({ verified });
}
