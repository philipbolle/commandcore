import { getServerSession as nextAuthGetServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";
import type { NextApiRequest, NextApiResponse } from "next";

export function getServerSession(req?: NextApiRequest, res?: NextApiResponse) {
  if (req && res) {
    return nextAuthGetServerSession(req, res, authOptions);
  }
  return nextAuthGetServerSession(authOptions);
} 