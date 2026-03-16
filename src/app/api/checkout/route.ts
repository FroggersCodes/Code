import {
  lemonSqueezySetup,
  createCheckout,
} from "@lemonsqueezy/lemonsqueezy.js";
import { NextRequest, NextResponse } from "next/server";

// Map our product types to LemonSqueezy variant IDs (set in env)
const VARIANT_MAP: Record<string, string | undefined> = {
  avatar_pack: process.env.LEMONSQUEEZY_VARIANT_AVATAR_PACK,
  title_pack: process.env.LEMONSQUEEZY_VARIANT_TITLE_PACK,
  ultimate_bundle: process.env.LEMONSQUEEZY_VARIANT_BUNDLE,
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;

  if (!apiKey || !storeId) {
    return NextResponse.json(
      { error: "LemonSqueezy not configured" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { productId, username } = body as {
    productId: string;
    username: string;
  };

  if (!productId || !username) {
    return NextResponse.json(
      { error: "Missing productId or username" },
      { status: 400 }
    );
  }

  const variantId = VARIANT_MAP[productId];
  if (!variantId) {
    return NextResponse.json(
      { error: "Unknown product" },
      { status: 400 }
    );
  }

  lemonSqueezySetup({ apiKey });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutOptions: {
      embed: false,
      media: true,
      logo: true,
      dark: true,
    },
    checkoutData: {
      custom: {
        username,
        product_id: productId,
      },
    },
    productOptions: {
      redirectUrl: `${appUrl}/store?purchased=${productId}`,
    },
  });

  if (error) {
    console.error("LemonSqueezy checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }

  const checkoutUrl = data?.data.attributes.url;

  return NextResponse.json({ url: checkoutUrl });
}
