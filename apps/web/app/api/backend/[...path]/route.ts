import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001/api";

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params);
}
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params);
}
export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params);
}
export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return handle(req, params);
}

async function handle(req: NextRequest, params: { path: string[] }) {
  const targetUrl = `${BACKEND_URL}/${params.path.join("/")}`;
  const method = req.method;
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!["host", "cookie", "authorization"].includes(key.toLowerCase())) {
      headers[key] = value;
    }
  });
  const body = method === "GET" ? undefined : await req.text();
  const resp = await fetch(targetUrl, {
    method,
    headers,
    body,
  });
  const data = await resp.text();
  return new NextResponse(data, {
    status: resp.status,
    headers: resp.headers,
  });
} 