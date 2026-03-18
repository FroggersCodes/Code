import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { addFulfilledOrder } from "@/lib/fulfilled-orders";

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("LEMONSQUEEZY_WEBHOOK_SECRET not set");
    return NextResponse.json({}, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("X-Signature");

  // Verify HMAC signature
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (
    !signature ||
    !crypto.timingSafeEqual(
      Buffer.from(digest, "utf8"),
      Buffer.from(signature, "utf8")
    )
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const data = JSON.parse(rawBody);
  const eventName: string = data?.meta?.event_name;

  if (eventName === "order_created") {
    const customData = data?.meta?.custom_data;
    const username: string | undefined = customData?.username;
    const productId: string | undefined = customData?.product_id;
    const status: string = data?.data?.attributes?.status;

    if (username && productId && status === "paid") {
      addFulfilledOrder(productId, username);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
