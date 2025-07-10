/**
 * CommandCore SaaS Forge - LangGraph Workflow Agents
 * 
 * This package provides TypeScript interfaces to LangGraph-based AI workflow agents
 * that automate various aspects of SaaS product development.
 */

import { z } from 'zod';

// ===== Type Definitions =====

/**
 * Market analysis for a SaaS idea
 */
export interface MarketAnalysis {
  marketSize: string;
  growthPotential: number;
  competitionLevel: number;
  barriersToEntry: number;
}

/**
 * Represents a validated SaaS product idea
 */
export interface SaaSIdea {
  name: string;
  tagline: string;
  description: string;
  targetAudience: string[];
  keyFeatures: string[];
  potentialRevenueStreams: string[];
  validationScore: number;
  marketAnalysis: MarketAnalysis;
  technicalComplexity: number;
  timeToMvp: string;
  recommendedTechStack: string[];
  risks: string[];
  opportunities: string[];
  selectionReasoning?: string;
}

/**
 * Input parameters for the idea generation agent
 */
export interface IdeaAgentParams {
  marketSegment: string;
  userRequirements?: string[];
  trendsToConsider?: string[];
}

/**
 * Result from the idea generation agent
 */
export interface IdeaAgentResult {
  generatedIdeas?: Record<string, any>[];
  validatedIdeas?: SaaSIdea[];
  selectedIdea?: SaaSIdea;
  error?: string;
}

/**
 * Product specification for the product generation agent
 */
export interface ProductSpec {
  name: string;
  description: string;
  features: string[];
  techStack: string[];
  architecture: string;
  dataModel: Record<string, any>;
}

/**
 * Input parameters for the product generation agent
 */
export interface ProductAgentParams {
  idea: SaaSIdea;
  additionalRequirements?: string[];
  constraints?: string[];
}

/**
 * Result from the product generation agent
 */
export interface ProductAgentResult {
  productSpec?: ProductSpec;
  codebase?: {
    structure: Record<string, any>;
    generatedFiles: string[];
  };
  error?: string;
}

/**
 * Input parameters for the deployment agent
 */
export interface DeploymentAgentParams {
  productSpec: ProductSpec;
  targetPlatform: 'vercel' | 'railway' | 'aws' | 'gcp' | 'azure';
  environmentVariables?: Record<string, string>;
  domain?: string;
}

/**
 * Result from the deployment agent
 */
export interface DeploymentAgentResult {
  deploymentUrl?: string;
  deploymentLogs?: string[];
  status: 'success' | 'failed' | 'in_progress';
  error?: string;
}

/**
 * Input parameters for the marketing agent
 */
export interface MarketingAgentParams {
  product: ProductSpec;
  targetAudience: string[];
  marketingChannels?: string[];
  tone?: string;
  campaignGoals?: string[];
}

/**
 * Result from the marketing agent
 */
export interface MarketingAgentResult {
  seoContent?: {
    title: string;
    description: string;
    keywords: string[];
    blogPosts: Array<{
      title: string;
      outline: string[];
      content?: string;
    }>;
  };
  socialMedia?: {
    posts: Array<{
      platform: string;
      content: string;
      hashtags?: string[];
      imagePrompt?: string;
    }>;
  };
  error?: string;
}

// ===== Agent Configuration =====

/**
 * Common configuration options for all agents
 */
export interface AgentConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  streaming?: boolean;
  maxTokens?: number;
  baseUrl?: string;
}

// ===== Validation Schemas =====

/**
 * Zod schema for validating idea agent parameters
 */
export const ideaAgentParamsSchema = z.object({
  marketSegment: z.string().min(3),
  userRequirements: z.array(z.string()).optional(),
  trendsToConsider: z.array(z.string()).optional(),
});

// ===== Agent Functions =====

/**
 * Creates and runs an idea generation agent workflow
 * 
 * @param params Parameters for the idea generation process
 * @param config Agent configuration options
 * @returns A promise resolving to the idea agent result
 */
export async function runIdeaAgent(
  params: IdeaAgentParams,
  config?: AgentConfig
): Promise<IdeaAgentResult> {
  try {
    // Validate input parameters
    ideaAgentParamsSchema.parse(params);
    
    // In a real implementation, this would call the Python LangGraph agent
    // For now, we'll just return a mock implementation
    console.log('Running idea agent with params:', params);
    
    // Make API call to the backend which runs the Python agent
    const response = await fetch('/api/agents/idea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ params, config }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error running idea agent:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Creates and runs a product generation agent workflow
 * 
 * @param params Parameters for the product generation process
 * @param config Agent configuration options
 * @returns A promise resolving to the product agent result
 */
export async function runProductAgent(
  params: ProductAgentParams,
  config?: AgentConfig
): Promise<ProductAgentResult> {
  try {
    // In a real implementation, this would call the Python LangGraph agent
    console.log('Running product agent with params:', params);
    
    // Make API call to the backend which runs the Python agent
    const response = await fetch('/api/agents/product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ params, config }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error running product agent:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Creates and runs a deployment agent workflow
 * 
 * @param params Parameters for the deployment process
 * @param config Agent configuration options
 * @returns A promise resolving to the deployment agent result
 */
export async function runDeploymentAgent(
  params: DeploymentAgentParams,
  config?: AgentConfig
): Promise<DeploymentAgentResult> {
  try {
    console.log('Running deployment agent with params:', params);
    
    // Make API call to the backend which runs the Python agent
    const response = await fetch('/api/agents/deployment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ params, config }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error running deployment agent:', error);
    return { 
      status: 'failed',
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Creates and runs a marketing agent workflow
 * 
 * @param params Parameters for the marketing content generation
 * @param config Agent configuration options
 * @returns A promise resolving to the marketing agent result
 */
export async function runMarketingAgent(
  params: MarketingAgentParams,
  config?: AgentConfig
): Promise<MarketingAgentResult> {
  try {
    console.log('Running marketing agent with params:', params);
    
    // Make API call to the backend which runs the Python agent
    const response = await fetch('/api/agents/marketing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ params, config }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error running marketing agent:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

// ===== Utility Functions =====

/**
 * Validates a SaaS idea against predefined criteria
 * 
 * @param idea The SaaS idea to validate
 * @returns A validation score between 0-100
 */
export function validateIdea(idea: Partial<SaaSIdea>): number {
  // Simple validation logic - in a real implementation this would be more sophisticated
  let score = 0;
  const maxScore = 100;
  
  // Check for required fields
  if (idea.name) score += 10;
  if (idea.description && idea.description.length > 20) score += 10;
  if (idea.targetAudience && idea.targetAudience.length > 0) score += 10;
  if (idea.keyFeatures && idea.keyFeatures.length > 0) score += 10;
  
  // Check market analysis if available
  if (idea.marketAnalysis) {
    if (idea.marketAnalysis.growthPotential > 5) score += 15;
    if (idea.marketAnalysis.competitionLevel < 7) score += 15;
  }
  
  // Check technical feasibility
  if (idea.technicalComplexity && idea.technicalComplexity < 8) score += 15;
  if (idea.timeToMvp && idea.timeToMvp.includes('week')) score += 15;
  
  return Math.min(score, maxScore);
}

/**
 * Formats an agent error into a user-friendly message
 * 
 * @param error The error object or message
 * @returns A formatted error message
 */
export function formatAgentError(error: unknown): string {
  if (error instanceof Error) {
    return `Agent error: ${error.message}`;
  }
  if (typeof error === 'string') {
    return `Agent error: ${error}`;
  }
  return 'An unknown error occurred while running the agent';
}
