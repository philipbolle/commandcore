import { NextResponse } from 'next/server'
import { runIdeaSpider } from '@agents/ideaSpider';



export async function GET() {
  console.log('🚀 Scheduler triggered: Running IdeaSpider...')
  try {
    const output = await runIdeaSpider()
    console.log('✅ IdeaSpider Output:', output)

    // Placeholder for saving output to a database in the future
    // e.g., await saveToDatabase(output)

    return NextResponse.json({ status: 'success', output })
  } catch (error: any) {
    console.error('❌ Scheduler Error:', error)
    return NextResponse.json({ status: 'error', message: error.message || 'Unknown error' }, { status: 500 })
  }
}
