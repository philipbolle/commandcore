import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

const priceMap: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

export async function POST(req: NextRequest) {
  /* --------------------------------------------------------------
   * Create Stripe client lazily so this file can be imported during
   * Next.js build without requiring secret env vars to be present.
   * -------------------------------------------------------------- */
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    console.error("Missing STRIPE_SECRET_KEY environment variable");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    );
  }
  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2025-06-30.basil",
  });

  const body = await req.json();
  const plan: string = body.plan;
  const priceId = priceMap[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Only include customer_email when it actually exists to satisfy
      // exactOptionalPropertyTypes and Stripe type definitions.
      ...(session?.user?.email ? { customer_email: session.user.email } : {}),
      metadata: { plan },
      success_url: `${req.headers.get("origin")}/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
    });
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error("Stripe error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 