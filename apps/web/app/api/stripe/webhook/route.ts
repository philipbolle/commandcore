import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
// Use the generated Prisma client output path defined in prisma/schema.prisma.
// From this file (`apps/web/app/api/stripe/webhook/route.ts`) we go up seven
// levels to reach the repository root, then down to `generated/prisma`.
import { PrismaClient } from "../../../../../../generated/prisma";

const prisma = new PrismaClient();

// Disable default body parsing -- Next 14 route uses Web Streams so we manually decode

export async function POST(req: NextRequest) {
  /* ------------------------------------------------------------------
   * Lazily create Stripe client. This avoids executing at build time
   * (when env vars may be absent) and provides explicit error handling.
   * ------------------------------------------------------------------ */
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecret || !webhookSecret) {
    console.error(
      "Stripe environment variables missing. " +
        "Ensure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set."
    );
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecret, {
    // Keep SDK/api version consistent across codebase
    apiVersion: "2025-06-30.basil",
  });

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const buf = await req.arrayBuffer();
    const text = new TextDecoder().decode(buf);
    event = stripe.webhooks.constructEvent(text, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (!session.customer || !session.customer_email) break;
      const user = await prisma.user.findFirst({ where: { email: session.customer_email } });
      if (!user) break;
      const subscriptionId = (session.subscription as string) ?? "";
      const plan = session.metadata?.plan ?? "pro";
      try {
        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: subscriptionId },
          update: {
            status: "active",
            plan,
            currentPeriodEnd: new Date(((session.expires_at ?? 0) * 1000) || Date.now()),
          },
          create: {
            userId: user.id,
            plan,
            status: "active",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscriptionId,
            currentPeriodEnd: new Date(((session.expires_at ?? 0) * 1000) || Date.now()),
          },
        });
      } catch (e) {
        console.error("Failed to upsert subscription", e);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: sub.status ?? "unknown",
          // With API version 2025-06-30.basil the period fields moved to the
          // first subscription-item.  Safely read it and convert to JS Date.
          currentPeriodEnd: new Date(
            ((sub.items?.data?.[0]?.current_period_end ?? 0) as number) * 1000,
          ),
        },
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
} 