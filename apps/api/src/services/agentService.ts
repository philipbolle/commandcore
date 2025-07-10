import { logger } from '../utils/logger'

export interface Agent {
  name: string
  description: string
  status: 'idle' | 'running' | 'completed' | 'failed'
  lastRun?: Date
  result?: any
}

export class AgentService {
  private agents: Map<string, Agent> = new Map()

  constructor() {
    // Initialize available agents
    this.agents.set('ideaSpider', {
      name: 'IdeaSpider',
      description: 'Scans Reddit and Hacker News for trending ideas',
      status: 'idle'
    })
    
    this.agents.set('productGenerator', {
      name: 'ProductGenerator',
      description: 'Generates MVP code from validated ideas',
      status: 'idle'
    })
    
    this.agents.set('seoBot', {
      name: 'SEOBot',
      description: 'Generates SEO content and blog posts',
      status: 'idle'
    })
    
    this.agents.set('listingBot', {
      name: 'ListingBot',
      description: 'Submits products to directories',
      status: 'idle'
    })
  }

  async runAgent(agentName: string, input: any): Promise<any> {
    try {
      const agent = this.agents.get(agentName)
      if (!agent) {
        throw new Error(`Agent ${agentName} not found`)
      }

      agent.status = 'running'
      agent.lastRun = new Date()

      let result: any

      switch (agentName) {
        case 'ideaSpider':
          result = await this.runIdeaSpider(input)
          break
        case 'productGenerator':
          result = await this.runProductGenerator(input)
          break
        case 'seoBot':
          result = await this.runSEOBot(input)
          break
        case 'listingBot':
          result = await this.runListingBot(input)
          break
        default:
          throw new Error(`Unknown agent: ${agentName}`)
      }

      agent.status = 'completed'
      agent.result = result

      return result
    } catch (error) {
      const agent = this.agents.get(agentName)
      if (agent) {
        agent.status = 'failed'
      }
      logger.error(`Error running agent ${agentName}:`, error)
      throw error
    }
  }

  async getAgentStatus(agentName: string): Promise<Agent | null> {
    return this.agents.get(agentName) || null
  }

  async listAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values())
  }

  private async runIdeaSpider(input: any): Promise<any> {
    // Import and run the idea spider
    const { runIdeaSpider } = await import('../../../packages/agents/ideaSpider')
    return await runIdeaSpider()
  }

  private async runProductGenerator(input: any): Promise<any> {
    // Mock implementation for now
    return {
      success: true,
      message: 'Product generation started',
      productId: `prod_${Date.now()}`
    }
  }

  private async runSEOBot(input: any): Promise<any> {
    // Mock implementation for now
    return {
      success: true,
      message: 'SEO content generated',
      articles: ['article1.md', 'article2.md']
    }
  }

  private async runListingBot(input: any): Promise<any> {
    // Mock implementation for now
    return {
      success: true,
      message: 'Product submitted to directories',
      submissions: ['betalist', 'producthunt']
    }
  }
} 