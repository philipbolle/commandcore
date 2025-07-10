import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// Centralized NextAuth configuration
import { authOptions } from "../../../lib/auth";
// Use the Prisma client generated to the custom output path configured in
// prisma/schema.prisma (`output = "../generated/prisma"`). From this file we
// need to go up five levels (../../../../../) to reach the repository root.
import { PrismaClient } from "../../../../../generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      user: { email: session.user.email },
      status: { in: ["active", "trialing"] },
    },
  });

  if (!subscription) {
    return NextResponse.json({ plan: "free", status: "none" });
  }

  return NextResponse.json({
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
  });
} 