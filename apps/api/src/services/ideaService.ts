import { OpenAI } from 'openai'
import { logger } from '../utils/logger'

export interface Idea {
  id: string
  title: string
  description: string
  targetAudience?: string
  monetizationStrategy?: string
  validationScore: number
  searchVolume?: number
  competitionLevel?: string
  estimatedRevenue?: number
}

export interface IdeaValidation {
  score: number
  searchVolume: number
  competitionLevel: string
  estimatedRevenue: number
  recommendations: string[]
}

export class IdeaService {
  async getTrendingIdeas(): Promise<Idea[]> {
    try {
      const { runIdeaSpider } = await import('../ideaSpider')
      const spiderResults = await runIdeaSpider()
      
      // Parse the results and convert to structured data
      const ideas: Idea[] = []
      
      // For now, return mock data based on spider results
      // In production, this would parse the actual results
      ideas.push({
        id: '1',
        title: 'AI Dev Job Scraper',
        description: 'Automated job application system for developers',
        targetAudience: 'Software developers',
        monetizationStrategy: 'SaaS subscription',
        validationScore: 85,
        searchVolume: 12000,
        competitionLevel: 'Medium',
        estimatedRevenue: 5000
      })
      
      return ideas
    } catch (error) {
      logger.error('Error getting trending ideas:', error)
      throw error
    }
  }

  async validateIdea(data: {
    title: string
    description: string
    targetAudience?: string
    monetizationStrategy?: string
  }): Promise<IdeaValidation> {
    try {
      console.log('OPENAI_API_KEY in validateIdea:', process.env.OPENAI_API_KEY)
      // Create the OpenAI client here, after dotenv is loaded
      const { OpenAI } = await import('openai')
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
      const prompt = `
Analyze this SaaS idea for market potential:

Title: ${data.title}
Description: ${data.description}
Target Audience: ${data.targetAudience || 'Not specified'}
Monetization: ${data.monetizationStrategy || 'Not specified'}

Provide a validation score (0-100) and analysis including:
- Search volume estimate
- Competition level (Low/Medium/High)
- Estimated monthly revenue potential
- Recommendations for improvement

Return as JSON:
{
  "score": number,
  "searchVolume": number,
  "competitionLevel": "Low|Medium|High",
  "estimatedRevenue": number,
  "recommendations": ["string"]
}
      `

      const result = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      })

      const content = result.choices[0].message.content
      const validation = JSON.parse(content || '{}')
      
      return validation
    } catch (error) {
      logger.error('Error validating idea:', error)
      throw error
    }
  }

  async createPreorderPage(ideaId: string, email: string): Promise<{ url: string; stripeLink: string }> {
    try {
      // In production, this would create a landing page and Stripe checkout
      const preorderUrl = `https://commandcore.com/preorder/${ideaId}`
      const stripeLink = `https://checkout.stripe.com/pay/${ideaId}`
      
      return { url: preorderUrl, stripeLink }
    } catch (error) {
      logger.error('Error creating preorder page:', error)
      throw error
    }
  }
} 