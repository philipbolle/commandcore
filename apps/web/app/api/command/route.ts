import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { command } = await req.json()
    if (!command) {
      return NextResponse.json({ error: 'No command provided' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: command }],
      max_tokens: 300,
    })

    const responseText = completion.choices[0].message.content || 'No response'
    return NextResponse.json({ response: responseText })
  } catch (error: any) {
    console.error('GPT Command Error:', error)
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
