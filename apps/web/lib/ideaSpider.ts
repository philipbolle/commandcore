// apps/web/lib/ideaSpider.ts

import OpenAI from "openai";
const openai = new OpenAI();

export async function runIdeaSpider(prompt: string) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-preview",
        messages: [{ role: "user", content: prompt }],
    });

    return completion.choices[0].message.content;
}
