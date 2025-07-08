import { NextResponse } from 'next/server'
import { runIdeaSpider } from '../../../../lib/ideaSpider'




export async function GET() {
  try {
    const report = await runIdeaSpider()
    return NextResponse.json({ report })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
