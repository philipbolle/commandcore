import { PrismaAdapter } from "@auth/prisma-adapter";
// Use the Prisma client generated to the custom output path configured in
// prisma/schema.prisma (`output = "../generated/prisma"`). The correct relative
// path from this file is three levels up: ../../../generated/prisma
import { PrismaClient } from "../../../generated/prisma";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import type { AuthOptions } from "next-auth";

const prisma = new PrismaClient();

/**
 * Detect when the file is being evaluated at build-time rather than at
 * run-time.  During a production build the variable `NEXT_PHASE` is set to
 * `"phase-production-build"`.  We also treat test environments as build-like
 * to avoid hard failures in CI.
 */
const isBuildTime =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.NODE_ENV === "test";

/**
 * Fetch an environment variable.  If it is missing _and_ we are currently
 * executing the file at build-time we return a harmless placeholder instead of
 * throwing.  At run-time the variable **must** be present, otherwise we throw
 * to surface the mis-configuration early.
 */
const getEnv = (name: string): string => {
  const value = process.env[name];
  if (value) return value;
  if (isBuildTime) {
    // Return a deterministic placeholder so Next.js can finish the build.
    return `__MISSING_${name}__`;
  }
  throw new Error(`Environment variable "${name}" is required but not set`);
};

// Mandatory credentials
const GOOGLE_CLIENT_ID = getEnv("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = getEnv("GOOGLE_CLIENT_SECRET");
const GITHUB_CLIENT_ID = getEnv("GITHUB_CLIENT_ID");
const GITHUB_CLIENT_SECRET = getEnv("GITHUB_CLIENT_SECRET");
const NEXTAUTH_SECRET = getEnv("NEXTAUTH_SECRET");

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Build provider list with a single literal so TS infers a union of all
  // provider config types and avoids the “EmailConfig not assignable” error.
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
    }),
    // Optional e-mail provider
    ...(process.env.EMAIL_SERVER && process.env.EMAIL_FROM
      ? [
          EmailProvider({
            server: process.env.EMAIL_SERVER,
            from: process.env.EMAIL_FROM,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "database" as const,
  },
  secret: NEXTAUTH_SECRET,
};
