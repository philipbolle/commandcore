import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { agentName: string } }
) {
  // Mark the request as intentionally unused to satisfy `noUnusedParameters`
  void req;
  const { agentName } = params;
  // Placeholder: In the future, dispatch to the correct agent
  return NextResponse.json({ status: "Agent executed successfully.", agent: agentName });
} 