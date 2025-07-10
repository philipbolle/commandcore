"""
LangGraph Product Flow MVP

This module implements a LangGraph flow for product development:
1. Scrape ideas from Reddit and HackerNews
2. Validate ideas based on keyword volume
3. Build MVP for validated ideas
4. Deploy the MVP
5. Generate SEO content for the product
"""

import json
import random
from typing import Dict, Any
from datetime import datetime

# Import LangGraph components
# LangGraph is optional; fall back to a simple sequential runner if not installed.
try:
    from langgraph.graph import StateGraph, END

    _HAS_LANGGRAPH = True
except ModuleNotFoundError:  # pragma: no cover
    _HAS_LANGGRAPH = False
    StateGraph = None  # type: ignore
    END = None  # type: ignore

# Type definitions
class ProductFlowState(Dict[str, Any]):
    """State for the product flow graph."""
    pass

# Node 1: Idea Scraper
def idea_scraper(state: ProductFlowState) -> ProductFlowState:
    """
    Simulate scraping top posts from Reddit and HackerNews.
    
    Returns:
        ProductFlowState with ideas added
    """
    # In a real implementation, this would use APIs to fetch actual data
    reddit_ideas = [
        {"title": "Build a tool that converts any website to an API", "url": "https://reddit.com/r/programming/123"},
        {"title": "AI-powered code review assistant for small teams", "url": "https://reddit.com/r/programming/456"},
        {"title": "Privacy-focused alternative to Google Analytics", "url": "https://reddit.com/r/webdev/789"},
    ]
    
    hackernews_ideas = [
        {"title": "Open source Figma alternative with real-time collaboration", "url": "https://news.ycombinator.com/item?id=123"},
        {"title": "Self-hosted email marketing platform for developers", "url": "https://news.ycombinator.com/item?id=456"},
    ]
    
    # Combine ideas
    all_ideas = reddit_ideas + hackernews_ideas
    
    # Add timestamp for logging
    timestamp = datetime.now().isoformat()
    
    return {
        **state,
        "ideas": all_ideas,
        "logs": {
            **(state.get("logs", {})),
            "idea_scraper": {
                "timestamp": timestamp,
                "count": len(all_ideas),
                "ideas": all_ideas
            }
        }
    }

# Node 2: Validator
def validator(state: ProductFlowState) -> ProductFlowState:
    """
    Validate ideas by simulating Google Trends API check.
    Filter ideas with score > 50.
    
    Returns:
        ProductFlowState with validated ideas
    """
    ideas = state.get("ideas", [])
    validated_ideas = []
    
    for idea in ideas:
        # Simulate Google Trends API call with random score
        score = random.randint(10, 100)
        idea_with_score = {**idea, "score": score}
        
        if score > 50:
            validated_ideas.append(idea_with_score)
    
    # Add timestamp for logging
    timestamp = datetime.now().isoformat()
    
    return {
        **state,
        "validated_ideas": validated_ideas,
        "logs": {
            **(state.get("logs", {})),
            "validator": {
                "timestamp": timestamp,
                "input_count": len(ideas),
                "output_count": len(validated_ideas),
                "validated_ideas": validated_ideas
            }
        }
    }

# Node 3: MVP Builder
def mvp_builder(state: ProductFlowState) -> ProductFlowState:
    """
    Build MVP for validated ideas.
    
    Returns:
        ProductFlowState with built MVPs
    """
    validated_ideas = state.get("validated_ideas", [])
    built_ideas = []
    
    for idea in validated_ideas:
        # Simulate building MVP
        title = idea["title"]
        print(f"Scaffolding {title}...")
        
        # In a real implementation, this might call a code generator or template system
        built_idea = {
            **idea,
            "status": "built",
            "repository": f"github.com/commandcore/{title.lower().replace(' ', '-')}"
        }
        built_ideas.append(built_idea)
    
    # Add timestamp for logging
    timestamp = datetime.now().isoformat()
    
    return {
        **state,
        "built_ideas": built_ideas,
        "logs": {
            **(state.get("logs", {})),
            "mvp_builder": {
                "timestamp": timestamp,
                "count": len(built_ideas),
                "built_ideas": built_ideas
            }
        }
    }

# Node 4: Deployer
def deployer(state: ProductFlowState) -> ProductFlowState:
    """
    Deploy built MVPs.
    
    Returns:
        ProductFlowState with deployed MVPs
    """
    built_ideas = state.get("built_ideas", [])
    deployed_ideas = []
    
    for idea in built_ideas:
        # Simulate deployment
        title = idea["title"]
        print(f"Deploying {title} to Vercel/Railway...")
        
        # In a real implementation, this might use Vercel/Railway APIs
        deployed_idea = {
            **idea,
            "status": "deployed",
            "url": f"https://{title.lower().replace(' ', '-')}.vercel.app"
        }
        deployed_ideas.append(deployed_idea)
    
    # Add timestamp for logging
    timestamp = datetime.now().isoformat()
    
    return {
        **state,
        "deployed_ideas": deployed_ideas,
        "logs": {
            **(state.get("logs", {})),
            "deployer": {
                "timestamp": timestamp,
                "count": len(deployed_ideas),
                "deployed_ideas": deployed_ideas
            }
        }
    }

# Node 5: SEO Bot
def seo_bot(state: ProductFlowState) -> ProductFlowState:
    """
    Generate SEO content for deployed MVPs.
    
    Returns:
        ProductFlowState with SEO content
    """
    deployed_ideas = state.get("deployed_ideas", [])
    marketed_ideas = []
    
    for idea in deployed_ideas:
        # Simulate SEO content generation
        title = idea["title"]
        print(f"Publishing 3 SEO posts for {title}...")
        
        # In a real implementation, this might use an LLM to generate content
        seo_posts = [
            f"10 Ways {title} Can Revolutionize Your Workflow",
            f"Why {title} is the Next Big Thing in Tech",
            f"How to Get Started with {title} in 5 Minutes"
        ]
        
        marketed_idea = {
            **idea,
            "status": "marketed",
            "seo_posts": seo_posts
        }
        marketed_ideas.append(marketed_idea)
    
    # Add timestamp for logging
    timestamp = datetime.now().isoformat()
    
    return {
        **state,
        "marketed_ideas": marketed_ideas,
        "logs": {
            **(state.get("logs", {})),
            "seo_bot": {
                "timestamp": timestamp,
                "count": len(marketed_ideas),
                "marketed_ideas": marketed_ideas
            }
        }
    }

# Build the graph
def build_graph() -> StateGraph:
    """
    Build the LangGraph product flow *if LangGraph is available*.

    Returns:
        Compiled StateGraph or ``None`` when LangGraph is not installed.
    """
    if not _HAS_LANGGRAPH:
        return None

    # Create a new graph
    graph: StateGraph = StateGraph(ProductFlowState)  # type: ignore[func-returns-value]

    # Add nodes
    graph.add_node("idea_scraper", idea_scraper)
    graph.add_node("validator", validator)
    graph.add_node("mvp_builder", mvp_builder)
    graph.add_node("deployer", deployer)
    graph.add_node("seo_bot", seo_bot)

    # Wire edges
    graph.add_edge("idea_scraper", "validator")
    graph.add_edge("validator", "mvp_builder")
    graph.add_edge("mvp_builder", "deployer")
    graph.add_edge("deployer", "seo_bot")
    graph.add_edge("seo_bot", END)  # type: ignore[arg-type]

    # Entry point
    graph.set_entry_point("idea_scraper")

    return graph.compile()

# Main execution function
def run() -> Dict[str, Any]:
    """
    Execute the full product flow.
    
    Returns:
        Dict containing logs from each step of the process
    """
    if _HAS_LANGGRAPH:
        # Build & execute LangGraph pipeline
        graph = build_graph()
        if graph is None:  # Safety check
            raise RuntimeError("Unexpected: build_graph() returned None while LangGraph is present.")
        result = graph.invoke({})
        return result.get("logs", {})

    # --------------------------------------------------------------------- #
    # Fallback: sequential execution (no LangGraph dependency)
    # --------------------------------------------------------------------- #
    state: ProductFlowState = {}
    state = idea_scraper(state)
    state = validator(state)
    state = mvp_builder(state)
    state = deployer(state)
    state = seo_bot(state)
    return state.get("logs", {})

# For direct execution
if __name__ == "__main__":
    result = run()
    print(json.dumps(result, indent=2))
