import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { agentName: string } }
) {
  const { agentName } = params;
  // Placeholder: In the future, dispatch to the correct agent
  return NextResponse.json({ status: "Agent executed successfully.", agent: agentName });
} 