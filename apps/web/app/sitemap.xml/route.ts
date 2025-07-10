import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://commandcore.ai";
  const routes = ["/", "/pricing", "/faq"];
  const pages = routes
    .map((path) => `<url><loc>${baseUrl}${path}</loc><changefreq>weekly</changefreq></url>`) 
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages}
  </urlset>`;
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
} 