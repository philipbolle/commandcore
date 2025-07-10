"""
CommandCore SaaS Forge - Idea Agent

This module provides a LangGraph workflow agent for SaaS idea generation and validation.
The agent can generate new SaaS product ideas, validate them, and provide market analysis.
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
class MarketAnalysis(BaseModel):
    """Market analysis for a SaaS idea."""
    
    market_size: str = Field(..., description="Estimated market size (e.g., '$1-5B')")
    growth_potential: int = Field(
        ..., description="Growth potential score from 1-10", ge=1, le=10
    )
    competition_level: int = Field(
        ..., description="Competition level score from 1-10 (1=low, 10=high)", ge=1, le=10
    )
    barriers_to_entry: int = Field(
        ..., description="Barriers to entry score from 1-10 (1=low, 10=high)", ge=1, le=10
    )
    
    @validator("growth_potential", "competition_level", "barriers_to_entry")
    def validate_score(cls, v):
        if not 1 <= v <= 10:
            raise ValueError("Score must be between 1 and 10")
        return v


class SaaSIdea(BaseModel):
    """Represents a SaaS product idea with validation metrics."""
    
    name: str = Field(..., description="Name of the SaaS product")
    tagline: str = Field(..., description="Short, catchy tagline (5-10 words)")
    description: str = Field(..., description="Detailed description (1-2 paragraphs)")
    target_audience: List[str] = Field(
        ..., description="List of target audience segments"
    )
    key_features: List[str] = Field(
        ..., description="List of key features (3-5 items)"
    )
    potential_revenue_streams: List[str] = Field(
        ..., description="Potential revenue streams and monetization strategies"
    )
    validation_score: int = Field(
        ..., description="Overall validation score from 1-100", ge=1, le=100
    )
    market_analysis: MarketAnalysis = Field(..., description="Market analysis")
    technical_complexity: int = Field(
        ..., description="Technical complexity score from 1-10 (1=simple, 10=complex)", ge=1, le=10
    )
    time_to_mvp: str = Field(
        ..., description="Estimated time to build MVP (e.g., '2-4 weeks')"
    )
    recommended_tech_stack: List[str] = Field(
        ..., description="Recommended technology stack"
    )
    risks: List[str] = Field(..., description="Potential risks and challenges")
    opportunities: List[str] = Field(..., description="Unique opportunities")


# Define the state for the idea agent workflow
class IdeaAgentState(TypedDict):
    """State maintained throughout the idea agent workflow."""
    
    # Input parameters
    market_segment: str
    user_requirements: Optional[List[str]]
    trends_to_consider: Optional[List[str]]
    
    # Intermediate and output data
    generated_ideas: Optional[List[Dict[str, Any]]]
    validated_ideas: Optional[List[SaaSIdea]]
    selected_idea: Optional[SaaSIdea]
    
    # Control flow
    next: Optional[str]
    error: Optional[str]


# Define system prompts for different stages
IDEA_GENERATION_PROMPT = """You are an expert SaaS product strategist and idea generator.
Your task is to generate innovative SaaS product ideas for the {market_segment} market segment.

Consider these market trends and insights:
{trends_to_consider}

And these specific user requirements or constraints:
{user_requirements}

Generate {num_ideas} unique and viable SaaS product ideas. For each idea, provide:
1. Product name
2. Short tagline (5-10 words)
3. Brief description (2-3 sentences)
4. Target audience
5. Key problem it solves

Be creative but practical. Focus on ideas with real market potential and solving genuine pain points.
"""

IDEA_VALIDATION_PROMPT = """You are an expert SaaS market analyst and product validator.
Your task is to thoroughly analyze and validate the following SaaS product ideas:

{ideas_json}

For each idea, provide a comprehensive validation including:
1. Overall validation score (1-100)
2. Market analysis:
   - Estimated market size
   - Growth potential (1-10)
   - Competition level (1-10)
   - Barriers to entry (1-10)
3. Technical complexity score (1-10)
4. Estimated time to build MVP
5. Recommended technology stack
6. Potential risks and challenges
7. Unique opportunities

Base your analysis on current market trends, technical feasibility, and business viability.
Be honest in your assessment - not all ideas will be equally strong.

Return your analysis in a structured format that matches the SaaSIdea model specification.
"""

IDEA_SELECTION_PROMPT = """You are an expert SaaS product strategist.
Your task is to select the most promising SaaS product idea from the validated ideas below:

{validated_ideas_json}

Consider these factors in your selection:
1. Overall validation score
2. Market opportunity and growth potential
3. Technical feasibility and time to market
4. Competitive advantage
5. Alignment with specified requirements

Select the single best idea and explain your reasoning in 2-3 sentences.
Return only the selected idea in the exact same JSON format as provided, with your reasoning added as a new field called "selection_reasoning".
"""


# Define the workflow nodes
def generate_ideas(state: IdeaAgentState) -> IdeaAgentState:
    """Generate initial SaaS product ideas based on market segment and requirements."""
    try:
        logger.info(f"Generating ideas for market segment: {state['market_segment']}")
        
        # Default values if not provided
        trends = state.get("trends_to_consider") or ["Remote work", "AI automation", "Sustainability"]
        requirements = state.get("user_requirements") or ["Scalable", "User-friendly"]
        
        # Create the LLM
        llm = ChatOpenAI(model="gpt-4o", temperature=0.7)
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=IDEA_GENERATION_PROMPT),
            HumanMessage(content="Please generate SaaS product ideas based on the provided information."),
        ])
        
        # Format the prompt
        formatted_prompt = prompt.format(
            market_segment=state["market_segment"],
            trends_to_consider="\n".join([f"- {trend}" for trend in trends]),
            user_requirements="\n".join([f"- {req}" for req in requirements]),
            num_ideas=5,
        )
        
        # Generate ideas
        response = llm.invoke([SystemMessage(content=formatted_prompt)])
        
        # Parse the response - in a real implementation, we would use a more robust parser
        # For now, we'll assume the LLM returns a well-formatted JSON string
        try:
            # Try to extract JSON if the model enclosed it in ```json blocks
            content = response.content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                ideas = json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                ideas = json.loads(json_str)
            else:
                # Fallback to treating the entire response as JSON
                ideas = json.loads(content)
            
            # Ensure ideas is a list
            if not isinstance(ideas, list):
                ideas = [ideas]
            
            logger.info(f"Successfully generated {len(ideas)} ideas")
            return {**state, "generated_ideas": ideas, "next": "validate_ideas"}
        except json.JSONDecodeError:
            # If JSON parsing fails, use a more lenient approach
            logger.warning("Failed to parse JSON response, using text extraction")
            
            # Re-query with a more explicit instruction for JSON format
            structured_prompt = prompt.format(
                market_segment=state["market_segment"],
                trends_to_consider="\n".join([f"- {trend}" for trend in trends]),
                user_requirements="\n".join([f"- {req}" for req in requirements]),
                num_ideas=3,  # Reduce to make it easier
            )
            
            structured_prompt += "\n\nReturn your response as a valid JSON array of objects."
            
            response = llm.invoke([SystemMessage(content=structured_prompt)])
            
            # Try again with the more explicit instruction
            try:
                content = response.content
                if "```json" in content:
                    json_str = content.split("```json")[1].split("```")[0].strip()
                    ideas = json.loads(json_str)
                elif "```" in content:
                    json_str = content.split("```")[1].split("```")[0].strip()
                    ideas = json.loads(json_str)
                else:
                    # Fallback to treating the entire response as JSON
                    ideas = json.loads(content)
                
                # Ensure ideas is a list
                if not isinstance(ideas, list):
                    ideas = [ideas]
                
                logger.info(f"Successfully generated {len(ideas)} ideas on second attempt")
                return {**state, "generated_ideas": ideas, "next": "validate_ideas"}
            except json.JSONDecodeError:
                logger.error("Failed to parse ideas as JSON even with explicit instruction")
                return {
                    **state, 
                    "error": "Failed to parse generated ideas", 
                    "next": END
                }
    except Exception as e:
        logger.error(f"Error in generate_ideas: {str(e)}")
        return {**state, "error": str(e), "next": END}


def validate_ideas(state: IdeaAgentState) -> IdeaAgentState:
    """Validate and analyze the generated SaaS ideas."""
    try:
        ideas = state.get("generated_ideas")
        if not ideas:
            logger.error("No ideas to validate")
            return {**state, "error": "No ideas to validate", "next": END}
        
        logger.info(f"Validating {len(ideas)} ideas")
        
        # Create the LLM with lower temperature for more consistent analysis
        llm = ChatOpenAI(model="gpt-4o", temperature=0.2)
        
        # Create output parser for structured output
        parser = PydanticOutputParser(pydantic_object=SaaSIdea)
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=IDEA_VALIDATION_PROMPT),
            HumanMessage(content="Please validate the provided SaaS ideas."),
        ])
        
        # Format the prompt with ideas in JSON format
        formatted_prompt = prompt.format(
            ideas_json=json.dumps(ideas, indent=2)
        )
        
        # Validate ideas
        response = llm.invoke([SystemMessage(content=formatted_prompt)])
        
        # Parse the response
        try:
            content = response.content
            
            # Try to extract JSON if the model enclosed it in code blocks
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                validated_ideas_raw = json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                validated_ideas_raw = json.loads(json_str)
            else:
                # Fallback to treating the entire response as JSON
                validated_ideas_raw = json.loads(content)
            
            # Ensure we have a list
            if not isinstance(validated_ideas_raw, list):
                validated_ideas_raw = [validated_ideas_raw]
            
            # Convert to Pydantic models for validation
            validated_ideas = []
            for idea_dict in validated_ideas_raw:
                try:
                    # Ensure market_analysis is properly structured
                    if isinstance(idea_dict.get("market_analysis"), dict):
                        market_analysis = MarketAnalysis(**idea_dict["market_analysis"])
                        idea_dict["market_analysis"] = market_analysis.dict()
                    
                    # Create and validate the SaaSIdea
                    validated_idea = SaaSIdea(**idea_dict)
                    validated_ideas.append(validated_idea.dict())
                except Exception as e:
                    logger.warning(f"Failed to validate idea: {str(e)}")
                    # Skip invalid ideas
                    continue
            
            logger.info(f"Successfully validated {len(validated_ideas)} ideas")
            
            if validated_ideas:
                return {
                    **state, 
                    "validated_ideas": validated_ideas, 
                    "next": "select_best_idea"
                }
            else:
                logger.error("No ideas passed validation")
                return {
                    **state, 
                    "error": "No ideas passed validation", 
                    "next": END
                }
        except json.JSONDecodeError:
            logger.error("Failed to parse validated ideas as JSON")
            return {
                **state, 
                "error": "Failed to parse validated ideas", 
                "next": END
            }
    except Exception as e:
        logger.error(f"Error in validate_ideas: {str(e)}")
        return {**state, "error": str(e), "next": END}


def select_best_idea(state: IdeaAgentState) -> IdeaAgentState:
    """Select the best idea from the validated ideas."""
    try:
        validated_ideas = state.get("validated_ideas")
        if not validated_ideas:
            logger.error("No validated ideas to select from")
            return {**state, "error": "No validated ideas to select from", "next": END}
        
        logger.info(f"Selecting best idea from {len(validated_ideas)} validated ideas")
        
        # If there's only one idea, select it directly
        if len(validated_ideas) == 1:
            logger.info("Only one validated idea, selecting it automatically")
            selected_idea = validated_ideas[0]
            selected_idea["selection_reasoning"] = "This was the only validated idea."
            return {**state, "selected_idea": selected_idea, "next": END}
        
        # Create the LLM
        llm = ChatOpenAI(model="gpt-4o", temperature=0.3)
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=IDEA_SELECTION_PROMPT),
            HumanMessage(content="Please select the best SaaS idea from the validated options."),
        ])
        
        # Format the prompt
        formatted_prompt = prompt.format(
            validated_ideas_json=json.dumps(validated_ideas, indent=2)
        )
        
        # Select the best idea
        response = llm.invoke([SystemMessage(content=formatted_prompt)])
        
        # Parse the response
        try:
            content = response.content
            
            # Try to extract JSON
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                selected_idea = json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                selected_idea = json.loads(json_str)
            else:
                # Fallback to treating the entire response as JSON
                selected_idea = json.loads(content)
            
            logger.info(f"Successfully selected best idea: {selected_idea.get('name')}")
            return {**state, "selected_idea": selected_idea, "next": END}
        except json.JSONDecodeError:
            logger.error("Failed to parse selected idea as JSON")
            
            # Fallback: just select the idea with the highest validation score
            best_idea = max(validated_ideas, key=lambda x: x.get("validation_score", 0))
            best_idea["selection_reasoning"] = "Selected based on highest validation score due to parsing error."
            
            logger.info(f"Fallback selection of idea with highest score: {best_idea.get('name')}")
            return {**state, "selected_idea": best_idea, "next": END}
    except Exception as e:
        logger.error(f"Error in select_best_idea: {str(e)}")
        return {**state, "error": str(e), "next": END}


# Define the router function to determine the next node
def router(state: IdeaAgentState) -> Union[Literal["generate_ideas", "validate_ideas", "select_best_idea"], Literal[END]]:
    """Route to the next node in the workflow based on the state."""
    if state.get("error"):
        return END
    
    next_node = state.get("next")
    if next_node == "validate_ideas":
        return "validate_ideas"
    elif next_node == "select_best_idea":
        return "select_best_idea"
    elif next_node == END:
        return END
    else:
        return "generate_ideas"


@AgentRegistry.register("idea_agent")
def create_idea_agent(
    model: str = "gpt-4o",
    temperature: float = 0.7,
    streaming: bool = False,
    checkpoint_saver: Optional[MemorySaver] = None,
    **kwargs: Any,
) -> StateGraph:
    """
    Create a LangGraph workflow agent for SaaS idea generation and validation.
    
    Args:
        model: The OpenAI model to use for the agent
        temperature: The temperature setting for the model
        streaming: Whether to enable streaming responses
        checkpoint_saver: Optional MemorySaver for checkpointing
        **kwargs: Additional arguments to pass to the agent
        
    Returns:
        A configured StateGraph workflow for idea generation and validation
    """
    # Create the workflow graph
    workflow = StateGraph(IdeaAgentState)
    
    # Add nodes
    workflow.add_node("generate_ideas", generate_ideas)
    workflow.add_node("validate_ideas", validate_ideas)
    workflow.add_node("select_best_idea", select_best_idea)
    
    # Add edges
    workflow.add_edge("generate_ideas", router)
    workflow.add_edge("validate_ideas", router)
    workflow.add_edge("select_best_idea", router)
    
    # Set the entry point
    workflow.set_entry_point("generate_ideas")
    
    # Compile the workflow
    return workflow.compile(checkpointer=checkpoint_saver)


# Example usage
if __name__ == "__main__":
    # Create the idea agent
    idea_agent = create_idea_agent()
    
    # Run the agent with initial state
    result = idea_agent.invoke({
        "market_segment": "remote work collaboration tools",
        "user_requirements": ["Must integrate with existing tools", "Focus on async communication"],
        "trends_to_consider": ["AI-powered productivity", "Hybrid work models", "Digital wellbeing"]
    })
    
    # Print the result
    if result.get("selected_idea"):
        print(f"Selected idea: {result['selected_idea']['name']}")
        print(f"Validation score: {result['selected_idea']['validation_score']}/100")
        print(f"Description: {result['selected_idea']['description']}")
    else:
        print(f"Error: {result.get('error')}")
