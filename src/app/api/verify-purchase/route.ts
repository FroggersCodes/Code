import { NextRequest, NextResponse } from "next/server";
import { consumeFulfilledOrder } from "@/lib/fulfilled-orders";

/**
 * Called by the client after redirect from LemonSqueezy checkout.
 * Checks if the webhook has confirmed payment for this user + product.
 */
export async function POST(request: NextRequest) {
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
