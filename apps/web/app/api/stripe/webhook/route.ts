import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

const prisma = new PrismaClient();

// Disable default body parsing -- Next 14 route uses Web Streams so we manually decode

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const buf = await req.arrayBuffer();
    const text = new TextDecoder().decode(buf);
    event = stripe.webhooks.constructEvent(text, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
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
          currentPeriodEnd: new Date((sub.current_period_end ?? 0) * 1000),
        },
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
} 