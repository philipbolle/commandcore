"""
CommandCore SaaS Forge - Product Agent

This module provides a LangGraph workflow agent for SaaS product generation.
The agent takes a validated SaaS idea and generates product specifications,
technical architecture, and code structure.
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
class DataModel(BaseModel):
    """Data model definition for a SaaS product."""
    
    name: str = Field(..., description="Name of the data model")
    description: str = Field(..., description="Description of what this model represents")
    fields: Dict[str, Dict[str, Any]] = Field(
        ..., description="Fields with their types and attributes"
    )
    relationships: List[Dict[str, str]] = Field(
        default_factory=list, description="Relationships to other models"
    )


class TechnicalArchitecture(BaseModel):
    """Technical architecture for a SaaS product."""
    
    frontend: Dict[str, Any] = Field(..., description="Frontend architecture details")
    backend: Dict[str, Any] = Field(..., description="Backend architecture details")
    database: Dict[str, Any] = Field(..., description="Database architecture details")
    deployment: Dict[str, Any] = Field(..., description="Deployment architecture details")
    integrations: List[Dict[str, Any]] = Field(
        default_factory=list, description="Third-party integrations"
    )


class ProductSpecification(BaseModel):
    """Detailed specification for a SaaS product."""
    
    name: str = Field(..., description="Name of the SaaS product")
    description: str = Field(..., description="Detailed description")
    features: List[Dict[str, Any]] = Field(
        ..., description="Detailed feature specifications"
    )
    user_stories: List[Dict[str, Any]] = Field(
        ..., description="User stories for key features"
    )
    tech_stack: Dict[str, List[str]] = Field(
        ..., description="Technology stack by component"
    )
    architecture: TechnicalArchitecture = Field(
        ..., description="Technical architecture"
    )
    data_models: List[DataModel] = Field(
        ..., description="Data models for the application"
    )
    api_endpoints: List[Dict[str, Any]] = Field(
        ..., description="API endpoint specifications"
    )
    ui_components: List[Dict[str, Any]] = Field(
        ..., description="UI component specifications"
    )


class CodeStructure(BaseModel):
    """Code structure for a SaaS product."""
    
    directory_structure: Dict[str, Any] = Field(
        ..., description="Directory structure of the codebase"
    )
    key_files: List[Dict[str, str]] = Field(
        ..., description="Key files with their purposes"
    )
    implementation_plan: List[Dict[str, Any]] = Field(
        ..., description="Implementation plan with phases"
    )


# Define the state for the product agent workflow
class ProductAgentState(TypedDict):
    """State maintained throughout the product agent workflow."""
    
    # Input parameters
    idea: Dict[str, Any]
    additional_requirements: Optional[List[str]]
    constraints: Optional[List[str]]
    
    # Intermediate and output data
    product_specification: Optional[Dict[str, Any]]
    technical_architecture: Optional[Dict[str, Any]]
    data_models: Optional[List[Dict[str, Any]]]
    code_structure: Optional[Dict[str, Any]]
    
    # Control flow
    next: Optional[str]
    error: Optional[str]


# Define system prompts for different stages
PRODUCT_SPEC_PROMPT = """You are an expert SaaS product architect and technical lead.
Your task is to create a detailed product specification based on the validated SaaS idea below:

{idea_json}

Additional requirements to consider:
{additional_requirements}

Constraints to respect:
{constraints}

Create a comprehensive product specification that includes:
1. Product name and description
2. Detailed feature specifications (at least 5-7 features)
3. User stories for key features
4. Recommended technology stack by component (frontend, backend, database, etc.)
5. High-level technical architecture
6. Data models with fields and relationships
7. API endpoint specifications
8. UI component specifications

Be specific and practical. Focus on creating a specification that could be implemented by a development team.
Return your specification in a structured format that matches the ProductSpecification model.
"""

TECHNICAL_ARCHITECTURE_PROMPT = """You are an expert SaaS technical architect.
Your task is to design a detailed technical architecture for the product specification below:

{product_spec_json}

Create a comprehensive technical architecture that includes:
1. Frontend architecture (components, state management, routing, etc.)
2. Backend architecture (API structure, services, middleware, etc.)
3. Database architecture (schema, relationships, indexes, etc.)
4. Deployment architecture (infrastructure, CI/CD, environments, etc.)
5. Third-party integrations and their purposes

Consider scalability, security, and maintainability in your design.
Return your architecture in a structured format that matches the TechnicalArchitecture model.
"""

CODE_STRUCTURE_PROMPT = """You are an expert SaaS developer and technical lead.
Your task is to create a detailed code structure for the product with the following specification and architecture:

Product Specification:
{product_spec_json}

Technical Architecture:
{technical_architecture_json}

Create a comprehensive code structure that includes:
1. Directory structure of the codebase (frontend and backend)
2. Key files with their purposes
3. Implementation plan with phases

Be specific and practical. Focus on creating a structure that could be implemented by a development team.
Return your code structure in a structured format that matches the CodeStructure model.
"""


# Define the workflow nodes
def generate_product_specification(state: ProductAgentState) -> ProductAgentState:
    """Generate product specification based on the validated SaaS idea."""
    try:
        idea = state.get("idea")
        if not idea:
            logger.error("No idea provided for product specification generation")
            return {**state, "error": "No idea provided", "next": END}
        
        logger.info(f"Generating product specification for idea: {idea.get('name', 'Unknown')}")
        
        # Default values if not provided
        additional_requirements = state.get("additional_requirements") or [
            "Must be scalable", 
            "Should have a modern UI",
            "Implement best security practices"
        ]
        constraints = state.get("constraints") or [
            "MVP should be buildable within 8 weeks",
            "Use standard open-source technologies where possible"
        ]
        
        # Create the LLM
        llm = ChatOpenAI(model="gpt-4o", temperature=0.3)
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=PRODUCT_SPEC_PROMPT),
            HumanMessage(content="Please generate a product specification based on the provided idea."),
        ])
        
        # Format the prompt
        formatted_prompt = prompt.format(
            idea_json=json.dumps(idea, indent=2),
            additional_requirements="\n".join([f"- {req}" for req in additional_requirements]),
            constraints="\n".join([f"- {constraint}" for constraint in constraints]),
        )
        
        # Generate product specification
        response = llm.invoke([SystemMessage(content=formatted_prompt)])
        
        # Parse the response
        try:
            # Try to extract JSON if the model enclosed it in ```json blocks
            content = response.content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                product_spec = json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                product_spec = json.loads(json_str)
            else:
                # Fallback to treating the entire response as JSON
                product_spec = json.loads(content)
            
            logger.info(f"Successfully generated product specification for {product_spec.get('name', 'Unknown')}")
            return {
                **state, 
                "product_specification": product_spec, 
                "next": "generate_technical_architecture"
            }
        except json.JSONDecodeError:
            logger.error("Failed to parse product specification as JSON")
            return {
                **state, 
                "error": "Failed to parse product specification", 
                "next": END
            }
    except Exception as e:
        logger.error(f"Error in generate_product_specification: {str(e)}")
        return {**state, "error": str(e), "next": END}


def generate_technical_architecture(state: ProductAgentState) -> ProductAgentState:
    """Generate detailed technical architecture based on the product specification."""
    try:
        product_spec = state.get("product_specification")
        if not product_spec:
            logger.error("No product specification provided for technical architecture generation")
            return {**state, "error": "No product specification provided", "next": END}
        
        logger.info(f"Generating technical architecture for: {product_spec.get('name', 'Unknown')}")
        
        # Create the LLM
        llm = ChatOpenAI(model="gpt-4o", temperature=0.3)
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=TECHNICAL_ARCHITECTURE_PROMPT),
            HumanMessage(content="Please generate a technical architecture based on the provided product specification."),
        ])
        
        # Format the prompt
        formatted_prompt = prompt.format(
            product_spec_json=json.dumps(product_spec, indent=2),
        )
        
        # Generate technical architecture
        response = llm.invoke([SystemMessage(content=formatted_prompt)])
        
        # Parse the response
        try:
            # Try to extract JSON if the model enclosed it in code blocks
            content = response.content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                technical_architecture = json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                technical_architecture = json.loads(json_str)
            else:
                # Fallback to treating the entire response as JSON
                technical_architecture = json.loads(content)
            
            logger.info(f"Successfully generated technical architecture for {product_spec.get('name', 'Unknown')}")
            return {
                **state, 
                "technical_architecture": technical_architecture, 
                "next": "generate_code_structure"
            }
        except json.JSONDecodeError:
            logger.error("Failed to parse technical architecture as JSON")
            return {
                **state, 
                "error": "Failed to parse technical architecture", 
                "next": END
            }
    except Exception as e:
        logger.error(f"Error in generate_technical_architecture: {str(e)}")
        return {**state, "error": str(e), "next": END}


def generate_code_structure(state: ProductAgentState) -> ProductAgentState:
    """Generate code structure based on the product specification and technical architecture."""
    try:
        product_spec = state.get("product_specification")
        technical_architecture = state.get("technical_architecture")
        
        if not product_spec or not technical_architecture:
            logger.error("Missing required information for code structure generation")
            return {
                **state, 
                "error": "Missing product specification or technical architecture", 
                "next": END
            }
        
        logger.info(f"Generating code structure for: {product_spec.get('name', 'Unknown')}")
        
        # Create the LLM
        llm = ChatOpenAI(model="gpt-4o", temperature=0.3)
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=CODE_STRUCTURE_PROMPT),
            HumanMessage(content="Please generate a code structure based on the provided specification and architecture."),
        ])
        
        # Format the prompt
        formatted_prompt = prompt.format(
            product_spec_json=json.dumps(product_spec, indent=2),
            technical_architecture_json=json.dumps(technical_architecture, indent=2),
        )
        
        # Generate code structure
        response = llm.invoke([SystemMessage(content=formatted_prompt)])
        
        # Parse the response
        try:
            # Try to extract JSON if the model enclosed it in code blocks
            content = response.content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                code_structure = json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                code_structure = json.loads(json_str)
            else:
                # Fallback to treating the entire response as JSON
                code_structure = json.loads(content)
            
            logger.info(f"Successfully generated code structure for {product_spec.get('name', 'Unknown')}")
            return {**state, "code_structure": code_structure, "next": END}
        except json.JSONDecodeError:
            logger.error("Failed to parse code structure as JSON")
            return {
                **state, 
                "error": "Failed to parse code structure", 
                "next": END
            }
    except Exception as e:
        logger.error(f"Error in generate_code_structure: {str(e)}")
        return {**state, "error": str(e), "next": END}


# Define the router function to determine the next node
def router(state: ProductAgentState) -> Union[Literal["generate_product_specification", "generate_technical_architecture", "generate_code_structure"], Literal[END]]:
    """Route to the next node in the workflow based on the state."""
    if state.get("error"):
        return END
    
    next_node = state.get("next")
    if next_node == "generate_technical_architecture":
        return "generate_technical_architecture"
    elif next_node == "generate_code_structure":
        return "generate_code_structure"
    elif next_node == END:
        return END
    else:
        return "generate_product_specification"


@AgentRegistry.register("product_agent")
def create_product_agent(
    model: str = "gpt-4o",
    temperature: float = 0.3,
    streaming: bool = False,
    checkpoint_saver: Optional[MemorySaver] = None,
    **kwargs: Any,
) -> StateGraph:
    """
    Create a LangGraph workflow agent for SaaS product generation.
    
    Args:
        model: The OpenAI model to use for the agent
        temperature: The temperature setting for the model
        streaming: Whether to enable streaming responses
        checkpoint_saver: Optional MemorySaver for checkpointing
        **kwargs: Additional arguments to pass to the agent
        
    Returns:
        A configured StateGraph workflow for product generation
    """
    # Create the workflow graph
    workflow = StateGraph(ProductAgentState)
    
    # Add nodes
    workflow.add_node("generate_product_specification", generate_product_specification)
    workflow.add_node("generate_technical_architecture", generate_technical_architecture)
    workflow.add_node("generate_code_structure", generate_code_structure)
    
    # Add edges
    workflow.add_edge("generate_product_specification", router)
    workflow.add_edge("generate_technical_architecture", router)
    workflow.add_edge("generate_code_structure", router)
    
    # Set the entry point
    workflow.set_entry_point("generate_product_specification")
    
    # Compile the workflow
    return workflow.compile(checkpointer=checkpoint_saver)


# Example usage
if __name__ == "__main__":
    # Create the product agent
    product_agent = create_product_agent()
    
    # Example idea from the idea agent
    example_idea = {
        "name": "RemoteCollab",
        "tagline": "Seamless collaboration for distributed teams",
        "description": "A comprehensive platform that integrates asynchronous communication, project management, and document collaboration for remote teams. Features AI-powered meeting summaries, smart task prioritization, and a digital workspace that simulates in-office collaboration.",
        "target_audience": ["Remote-first companies", "Distributed teams", "Digital nomads"],
        "key_features": [
            "Asynchronous video messaging",
            "AI meeting transcription and action items",
            "Virtual office spaces",
            "Document collaboration with version control",
            "Smart task management"
        ],
        "validation_score": 85,
        "technical_complexity": 7,
        "time_to_mvp": "6-8 weeks"
    }
    
    # Run the agent with initial state
    result = product_agent.invoke({
        "idea": example_idea,
        "additional_requirements": [
            "Must integrate with popular tools like Slack and Google Workspace",
            "Should support mobile and desktop platforms",
            "Must have strong privacy features"
        ],
        "constraints": [
            "MVP should be buildable within 8 weeks",
            "Initial focus on web platform, then mobile apps"
        ]
    })
    
    # Print the result
    if result.get("product_specification"):
        print(f"Generated product specification for: {result['product_specification']['name']}")
        print(f"Number of features: {len(result['product_specification']['features'])}")
        print(f"Number of data models: {len(result['product_specification']['data_models'])}")
    else:
        print(f"Error: {result.get('error')}")
