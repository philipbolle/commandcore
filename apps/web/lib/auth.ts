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
 * Fetch a required environment variable or throw at startup.
 * Ensures values are non-undefined, satisfying strict typing.
 */
const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable "${name}" is required but not set`);
  }
  return value;
};

// Mandatory credentials
const GOOGLE_CLIENT_ID = requireEnv("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = requireEnv("GOOGLE_CLIENT_SECRET");
const GITHUB_CLIENT_ID = requireEnv("GITHUB_CLIENT_ID");
const GITHUB_CLIENT_SECRET = requireEnv("GITHUB_CLIENT_SECRET");
const NEXTAUTH_SECRET = requireEnv("NEXTAUTH_SECRET");

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
