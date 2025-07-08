import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function runIdeaSpider(): Promise<string> {
  const prompt = `
You're IdeaSpider, an autonomous agent scanning Reddit and Hacker News for trending AI tools, questions, and complaints.

Simulate what you'd find if you searched:
- "New AI tools" on Hacker News
- "AI pain points" on Reddit
- "What AI tools are you using?"

Return a concise report with:
- 🔥 3 trending tool ideas
- 😩 2 user complaints or gaps in the market
- 📈 1 opportunity that could make money this week

Format your output with markdown-style headers and short bullets.
  `

  const result = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
  })

  const output = result.choices[0].message.content?.trim() || 'No results'
  return output
} 