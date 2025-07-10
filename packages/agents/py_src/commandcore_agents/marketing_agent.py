"""
CommandCore SaaS Forge - Marketing Agent

This module provides a LangGraph workflow agent for SaaS marketing content generation.
The agent can generate SEO content, social media posts, and marketing copy for SaaS products.
"""

import json
import logging
from typing import Any, Dict, List, Literal, Optional, TypedDict, Union, cast

from langchain.output_parsers import PydanticOutputParser
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langgraph.checkpoint import MemorySaver
from langgraph.graph import END, StateGraph
from pydantic import BaseModel, Field, validator

from . import AgentRegistry

# Configure logging
logger = logging.getLogger(__name__)


# Define Pydantic models for structured output
class SEOContent(BaseModel):
    """SEO content for a SaaS product."""
    
    title: str = Field(..., description="SEO-optimized page title")
    meta_description: str = Field(..., description="Meta description for search engines")
    keywords: List[str] = Field(..., description="Target keywords for SEO")
    h1: str = Field(..., description="Main heading (H1) for the page")
    page_sections: List[Dict[str, str]] = Field(
        ..., description="Page sections with headings and content"
    )
    blog_post_ideas: List[Dict[str, Any]] = Field(
        ..., description="Blog post ideas with titles and outlines"
    )
    faq_items: List[Dict[str, str]] = Field(
        ..., description="FAQ items with questions and answers"
    )


class SocialMediaContent(BaseModel):
    """Social media content for a SaaS product."""
    
    platforms: List[str] = Field(..., description="Target social media platforms")
    posts: List[Dict[str, Any]] = Field(
        ..., description="Social media posts with content and hashtags"
    )
    content_calendar: Dict[str, List[Dict[str, Any]]] = Field(
        ..., description="Content calendar with scheduled posts"
    )
    image_prompts: List[str] = Field(
        ..., description="Image generation prompts for social media posts"
    )


class MarketingCopy(BaseModel):
    """Marketing copy for a SaaS product."""
    
    tagline: str = Field(..., description="Short, catchy tagline")
    value_proposition: str = Field(..., description="Clear value proposition")
    product_description_short: str = Field(..., description="Short product description (1-2 sentences)")
    product_description_long: str = Field(..., description="Long product description (1-2 paragraphs)")
    feature_highlights: List[Dict[str, str]] = Field(
        ..., description="Feature highlights with titles and descriptions"
    )
    call_to_action: List[Dict[str, str]] = Field(
        ..., description="Call-to-action phrases for different contexts"
    )
    testimonial_templates: List[Dict[str, str]] = Field(
        ..., description="Templates for customer testimonials"
    )
    pricing_page_copy: Dict[str, Any] = Field(
        ..., description="Copy for pricing page"
    )


class MarketingStrategy(BaseModel):
    """Marketing strategy for a SaaS product."""
    
    target_audience: List[Dict[str, Any]] = Field(
        ..., description="Detailed target audience personas"
    )
    positioning_statement: str = Field(..., description="Product positioning statement")
    unique_selling_points: List[str] = Field(..., description="Unique selling points")
    marketing_channels: List[Dict[str, Any]] = Field(
        ..., description="Recommended marketing channels with rationale"
    )
    content_strategy: Dict[str, Any] = Field(
        ..., description="Content marketing strategy"
    )
    growth_tactics: List[Dict[str, str]] = Field(
        ..., description="Growth tactics with descriptions"
    )
    kpis: List[Dict[str, Any]] = Field(
        ..., description="Key performance indicators to track"
    )


# Define the state for the marketing agent workflow
class MarketingAgentState(TypedDict):
    """State maintained throughout the marketing agent workflow."""
    
    # Input parameters
    product: Dict[str, Any]
    target_audience: List[str]
    marketing_channels: Optional[List[str]]
    tone: Optional[str]
    campaign_goals: Optional[List[str]]
    
    # Intermediate and output data
    marketing_strategy: Optional[Dict[str, Any]]
    seo_content: Optional[Dict[str, Any]]
    social_media_content: Optional[Dict[str, Any]]
    marketing_copy: Optional[Dict[str, Any]]
    
    # Control flow
    next: Optional[str]
    error: Optional[str]


# Define system prompts for different stages
MARKETING_STRATEGY_PROMPT = """You are an expert SaaS marketing strategist.
Your task is to create a comprehensive marketing strategy for the following product:

{product_json}

Target audience:
{target_audience}

Marketing channels to consider:
{marketing_channels}

Campaign goals:
{campaign_goals}

Create a detailed marketing strategy that includes:
1. Target audience personas with demographics, pain points, and goals
2. Product positioning statement
3. Unique selling points
4. Recommended marketing channels with rationale
5. Content strategy
6. Growth tactics
7. Key performance indicators to track

Be specific and practical. Focus on creating a strategy that could be implemented by a marketing team.
Return your strategy in a structured format that matches the MarketingStrategy model.
"""

SEO_CONTENT_PROMPT = """You are an expert SEO content strategist for SaaS products.
Your task is to create comprehensive SEO content for the following product:

{product_json}

Marketing strategy:
{marketing_strategy_json}

Tone: {tone}

Create SEO-optimized content that includes:
1. Page title (50-60 characters)
2. Meta description (150-160 characters)
3. Target keywords (primary and secondary)
4. Main heading (H1)
5. Page sections with headings and content
6. Blog post ideas with titles and outlines
7. FAQ items with questions and answers

Focus on creating content that is both search engine optimized and valuable to the target audience.
Return your content in a structured format that matches the SEOContent model.
"""

SOCIAL_MEDIA_CONTENT_PROMPT = """You are an expert social media marketer for SaaS products.
Your task is to create engaging social media content for the following product:

{product_json}

Marketing strategy:
{marketing_strategy_json}

Target platforms: {marketing_channels}
Tone: {tone}

Create social media content that includes:
1. Platform-specific posts (at least 5 per platform)
2. Content calendar for the next 2 weeks
3. Image generation prompts for social media visuals
4. Hashtag recommendations

Be creative and engaging. Focus on creating content that will resonate with the target audience and drive engagement.
Return your content in a structured format that matches the SocialMediaContent model.
"""

MARKETING_COPY_PROMPT = """You are an expert copywriter for SaaS products.
Your task is to create compelling marketing copy for the following product:

{product_json}

Marketing strategy:
{marketing_strategy_json}

Tone: {tone}

Create marketing copy that includes:
1. Tagline (short and catchy)
2. Value proposition
3. Short product description (1-2 sentences)
4. Long product description (1-2 paragraphs)
5. Feature highlights with titles and descriptions
6. Call-to-action phrases for different contexts
7. Testimonial templates
8. Pricing page copy

Be persuasive and clear. Focus on communicating the value of the product to the target audience.
Return your copy in a structured format that matches the MarketingCopy model.
"""


# Define the workflow nodes
def create_marketing_strategy(state: MarketingAgentState) -> MarketingAgentState:
    """Create a marketing strategy based on the product and target audience."""
    try:
        product = state.get("product")
        target_audience = state.get("target_audience")
        marketing_channels = state.get("marketing_channels") or [
            "LinkedIn", "Twitter", "Facebook", "Instagram", "Email", "Content Marketing"
        ]
        campaign_goals = state.get("campaign_goals") or [
            "Increase brand awareness",
            "Generate leads",
            "Drive product sign-ups"
        ]
        
        if not product or not target_audience:
            logger.error("Missing required information for marketing strategy creation")
            return {
                **state, 
                "error": "Missing product information or target audience", 
                "next": END
            }
        
        logger.info(f"Creating marketing strategy for product: {product.get('name', 'Unknown')}")
        
        # Create the LLM
        llm = ChatOpenAI(model="gpt-4o", temperature=0.5)
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=MARKETING_STRATEGY_PROMPT),
            HumanMessage(content="Please create a marketing strategy based on the provided information."),
        ])
        
        # Format the prompt
        formatted_prompt = prompt.format(
            product_json=json.dumps(product, indent=2),
            target_audience="\n".join([f"- {audience}" for audience in target_audience]),
            marketing_channels="\n".join([f"- {channel}" for channel in marketing_channels]),
            campaign_goals="\n".join([f"- {goal}" for goal in campaign_goals]),
        )
        
        # Generate marketing strategy
        response = llm.invoke([SystemMessage(content=formatted_prompt)])
        
        # Parse the response
        try:
            # Try to extract JSON if the model enclosed it in code blocks
            content = response.content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                marketing_strategy = json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                marketing_strategy = json.loads(json_str)
            else:
                # Fallback to treating the entire response as JSON
                marketing_strategy = json.loads(content)
            
            logger.info(f"Successfully created marketing strategy for {product.get('name', 'Unknown')}")
            return {
                **state, 
                "marketing_strategy": marketing_strategy, 
                "next": "create_seo_content"
            }
        except json.JSONDecodeError:
            logger.error("Failed to parse marketing strategy as JSON")
            return {
                **state, 
                "error": "Failed to parse marketing strategy", 
                "next": END
            }
    except Exception as e:
        logger.error(f"Error in create_marketing_strategy: {str(e)}")
        return {**state, "error": str(e), "next": END}


def create_seo_content(state: MarketingAgentState) -> MarketingAgentState:
    """Create SEO content based on the marketing strategy."""
    try:
        product = state.get("product")
        marketing_strategy = state.get("marketing_strategy")
        tone = state.get("tone") or "Professional but approachable"
        
        if not product or not marketing_strategy:
            logger.error("Missing required information for SEO content creation")
            return {
                **state, 
                "error": "Missing product information or marketing strategy", 
                "next": END
            }
        
        logger.info(f"Creating SEO content for product: {product.get('name', 'Unknown')}")
        
        # Create the LLM
        llm = ChatOpenAI(model="gpt-4o", temperature=0.5)
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=SEO_CONTENT_PROMPT),
            HumanMessage(content="Please create SEO content based on the provided information."),
        ])
        
        # Format the prompt
        formatted_prompt = prompt.format(
            product_json=json.dumps(product, indent=2),
            marketing_strategy_json=json.dumps(marketing_strategy, indent=2),
            tone=tone,
        )
        
        # Generate SEO content
        response = llm.invoke([SystemMessage(content=formatted_prompt)])
        
        # Parse the response
        try:
            # Try to extract JSON if the model enclosed it in code blocks
            content = response.content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                seo_content = json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                seo_content = json.loads(json_str)
            else:
                # Fallback to treating the entire response as JSON
                seo_content = json.loads(content)
            
            logger.info(f"Successfully created SEO content for {product.get('name', 'Unknown')}")
            return {
                **state, 
                "seo_content": seo_content, 
                "next": "create_social_media_content"
            }
        except json.JSONDecodeError:
            logger.error("Failed to parse SEO content as JSON")
            return {
                **state, 
                "error": "Failed to parse SEO content", 
                "next": END
            }
    except Exception as e:
        logger.error(f"Error in create_seo_content: {str(e)}")
        return {**state, "error": str(e), "next": END}


def create_social_media_content(state: MarketingAgentState) -> MarketingAgentState:
    """Create social media content based on the marketing strategy."""
    try:
        product = state.get("product")
        marketing_strategy = state.get("marketing_strategy")
        marketing_channels = state.get("marketing_channels") or [
            "LinkedIn", "Twitter", "Facebook", "Instagram"
        ]
        tone = state.get("tone") or "Professional but approachable"
        
        if not product or not marketing_strategy:
            logger.error("Missing required information for social media content creation")
            return {
                **state, 
                "error": "Missing product information or marketing strategy", 
                "next": END
            }
        
        logger.info(f"Creating social media content for product: {product.get('name', 'Unknown')}")
        
        # Create the LLM
        llm = ChatOpenAI(model="gpt-4o", temperature=0.7)  # Higher temperature for creativity
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=SOCIAL_MEDIA_CONTENT_PROMPT),
            HumanMessage(content="Please create social media content based on the provided information."),
        ])
        
        # Format the prompt
        formatted_prompt = prompt.format(
            product_json=json.dumps(product, indent=2),
            marketing_strategy_json=json.dumps(marketing_strategy, indent=2),
            marketing_channels=", ".join(marketing_channels),
            tone=tone,
        )
        
        # Generate social media content
        response = llm.invoke([SystemMessage(content=formatted_prompt)])
        
        # Parse the response
        try:
            # Try to extract JSON if the model enclosed it in code blocks
            content = response.content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                social_media_content = json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                social_media_content = json.loads(json_str)
            else:
                # Fallback to treating the entire response as JSON
                social_media_content = json.loads(content)
            
            logger.info(f"Successfully created social media content for {product.get('name', 'Unknown')}")
            return {
                **state, 
                "social_media_content": social_media_content, 
                "next": "create_marketing_copy"
            }
        except json.JSONDecodeError:
            logger.error("Failed to parse social media content as JSON")
            return {
                **state, 
                "error": "Failed to parse social media content", 
                "next": END
            }
    except Exception as e:
        logger.error(f"Error in create_social_media_content: {str(e)}")
        return {**state, "error": str(e), "next": END}


def create_marketing_copy(state: MarketingAgentState) -> MarketingAgentState:
    """Create marketing copy based on the marketing strategy."""
    try:
        product = state.get("product")
        marketing_strategy = state.get("marketing_strategy")
        tone = state.get("tone") or "Professional but approachable"
        
        if not product or not marketing_strategy:
            logger.error("Missing required information for marketing copy creation")
            return {
                **state, 
                "error": "Missing product information or marketing strategy", 
                "next": END
            }
        
        logger.info(f"Creating marketing copy for product: {product.get('name', 'Unknown')}")
        
        # Create the LLM
        llm = ChatOpenAI(model="gpt-4o", temperature=0.6)
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=MARKETING_COPY_PROMPT),
            HumanMessage(content="Please create marketing copy based on the provided information."),
        ])
        
        # Format the prompt
        formatted_prompt = prompt.format(
            product_json=json.dumps(product, indent=2),
            marketing_strategy_json=json.dumps(marketing_strategy, indent=2),
            tone=tone,
        )
        
        # Generate marketing copy
        response = llm.invoke([SystemMessage(content=formatted_prompt)])
        
        # Parse the response
        try:
            # Try to extract JSON if the model enclosed it in code blocks
            content = response.content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                marketing_copy = json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                marketing_copy = json.loads(json_str)
            else:
                # Fallback to treating the entire response as JSON
                marketing_copy = json.loads(content)
            
            logger.info(f"Successfully created marketing copy for {product.get('name', 'Unknown')}")
            return {**state, "marketing_copy": marketing_copy, "next": END}
        except json.JSONDecodeError:
            logger.error("Failed to parse marketing copy as JSON")
            return {
                **state, 
                "error": "Failed to parse marketing copy", 
                "next": END
            }
    except Exception as e:
        logger.error(f"Error in create_marketing_copy: {str(e)}")
        return {**state, "error": str(e), "next": END}


# Define the router function to determine the next node
def router(state: MarketingAgentState) -> Union[Literal["create_marketing_strategy", "create_seo_content", "create_social_media_content", "create_marketing_copy"], Literal[END]]:
    """Route to the next node in the workflow based on the state."""
    if state.get("error"):
        return END
    
    next_node = state.get("next")
    if next_node == "create_seo_content":
        return "create_seo_content"
    elif next_node == "create_social_media_content":
        return "create_social_media_content"
    elif next_node == "create_marketing_copy":
        return "create_marketing_copy"
    elif next_node == END:
        return END
    else:
        return "create_marketing_strategy"


@AgentRegistry.register("marketing_agent")
def create_marketing_agent(
    model: str = "gpt-4o",
    temperature: float = 0.5,
    streaming: bool = False,
    checkpoint_saver: Optional[MemorySaver] = None,
    **kwargs: Any,
) -> StateGraph:
    """
    Create a LangGraph workflow agent for SaaS marketing content generation.
    
    Args:
        model: The OpenAI model to use for the agent
        temperature: The temperature setting for the model
        streaming: Whether to enable streaming responses
        checkpoint_saver: Optional MemorySaver for checkpointing
        **kwargs: Additional arguments to pass to the agent
        
    Returns:
        A configured StateGraph workflow for marketing content generation
    """
    # Create the workflow graph
    workflow = StateGraph(MarketingAgentState)
    
    # Add nodes
    workflow.add_node("create_marketing_strategy", create_marketing_strategy)
    workflow.add_node("create_seo_content", create_seo_content)
    workflow.add_node("create_social_media_content", create_social_media_content)
    workflow.add_node("create_marketing_copy", create_marketing_copy)
    
    # Add edges
    workflow.add_edge("create_marketing_strategy", router)
    workflow.add_edge("create_seo_content", router)
    workflow.add_edge("create_social_media_content", router)
    workflow.add_edge("create_marketing_copy", router)
    
    # Set the entry point
    workflow.set_entry_point("create_marketing_strategy")
    
    # Compile the workflow
    return workflow.compile(checkpointer=checkpoint_saver)


# Example usage
if __name__ == "__main__":
    # Create the marketing agent
    marketing_agent = create_marketing_agent()
    
    # Example product from the product agent
    example_product = {
        "name": "RemoteCollab",
        "description": "A comprehensive platform that integrates asynchronous communication, project management, and document collaboration for remote teams.",
        "features": [
            {"name": "Async Video Messaging", "description": "Record and share video messages that can be viewed anytime"},
            {"name": "AI Meeting Summaries", "description": "Automatically generate summaries and action items from meetings"},
            {"name": "Virtual Office Spaces", "description": "Digital spaces that simulate in-office collaboration"},
            {"name": "Document Collaboration", "description": "Real-time document editing with version control"},
            {"name": "Smart Task Management", "description": "AI-powered task prioritization and assignment"}
        ]
    }
    
    # Run the agent with initial state
    result = marketing_agent.invoke({
        "product": example_product,
        "target_audience": ["Remote-first companies", "Distributed teams", "Digital nomads", "Project managers"],
        "marketing_channels": ["LinkedIn", "Twitter", "Product Hunt", "Email"],
        "tone": "Professional but friendly",
        "campaign_goals": ["Increase brand awareness", "Generate leads", "Drive product sign-ups"]
    })
    
    # Print the result
    if result.get("marketing_strategy") and result.get("seo_content") and result.get("social_media_content") and result.get("marketing_copy"):
        print(f"Successfully generated marketing content for {example_product['name']}")
        print(f"Marketing strategy has {len(result['marketing_strategy']['unique_selling_points'])} USPs")
        print(f"SEO content has {len(result['seo_content']['keywords'])} keywords")
        print(f"Social media content has {len(result['social_media_content']['posts'])} posts")
        print(f"Marketing copy tagline: {result['marketing_copy']['tagline']}")
    else:
        print(f"Error: {result.get('error')}")
