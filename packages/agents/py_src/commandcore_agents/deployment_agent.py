"""
CommandCore SaaS Forge - Deployment Agent

This module provides a LangGraph workflow agent for SaaS product deployment.
The agent automates the deployment process to platforms like Vercel and Railway.
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
class DeploymentConfig(BaseModel):
    """Configuration for a SaaS product deployment."""
    
    platform: str = Field(..., description="Deployment platform (e.g., 'vercel', 'railway')")
    region: str = Field(..., description="Deployment region")
    environment_variables: Dict[str, str] = Field(
        default_factory=dict, description="Environment variables for the deployment"
    )
    resources: Dict[str, Any] = Field(
        default_factory=dict, description="Resource requirements (CPU, memory, etc.)"
    )
    scaling: Dict[str, Any] = Field(
        default_factory=dict, description="Scaling configuration"
    )


class DeploymentPlan(BaseModel):
    """Deployment plan for a SaaS product."""
    
    name: str = Field(..., description="Name of the deployment")
    description: str = Field(..., description="Description of the deployment")
    components: List[Dict[str, Any]] = Field(
        ..., description="Components to be deployed"
    )
    dependencies: List[Dict[str, Any]] = Field(
        ..., description="Dependencies required for deployment"
    )
    steps: List[Dict[str, Any]] = Field(
        ..., description="Step-by-step deployment process"
    )
    configuration: DeploymentConfig = Field(
        ..., description="Deployment configuration"
    )
    estimated_time: str = Field(
        ..., description="Estimated time for deployment"
    )
    post_deployment_tasks: List[Dict[str, Any]] = Field(
        ..., description="Tasks to perform after deployment"
    )


class DeploymentResult(BaseModel):
    """Result of a SaaS product deployment."""
    
    status: str = Field(..., description="Deployment status ('success', 'failed', 'in_progress')")
    url: Optional[str] = Field(None, description="URL of the deployed application")
    logs: List[str] = Field(default_factory=list, description="Deployment logs")
    metrics: Dict[str, Any] = Field(
        default_factory=dict, description="Deployment metrics"
    )
    issues: List[Dict[str, Any]] = Field(
        default_factory=list, description="Issues encountered during deployment"
    )
    recommendations: List[str] = Field(
        default_factory=list, description="Recommendations for improvement"
    )


# Define the state for the deployment agent workflow
class DeploymentAgentState(TypedDict):
    """State maintained throughout the deployment agent workflow."""
    
    # Input parameters
    product_spec: Dict[str, Any]
    target_platform: str
    environment_variables: Optional[Dict[str, str]]
    domain: Optional[str]
    
    # Intermediate and output data
    deployment_plan: Optional[Dict[str, Any]]
    deployment_config: Optional[Dict[str, Any]]
    deployment_result: Optional[Dict[str, Any]]
    
    # Control flow
    next: Optional[str]
    error: Optional[str]


# Define system prompts for different stages
DEPLOYMENT_PLAN_PROMPT = """You are an expert DevOps engineer specializing in SaaS deployments.
Your task is to create a detailed deployment plan for the following product:

{product_spec_json}

Target platform: {target_platform}
Domain (if specified): {domain}

Create a comprehensive deployment plan that includes:
1. Components to be deployed (frontend, backend, database, etc.)
2. Dependencies required for deployment
3. Step-by-step deployment process
4. Configuration for the target platform
5. Estimated time for deployment
6. Post-deployment tasks (monitoring, testing, etc.)

Be specific and practical. Focus on creating a plan that could be executed by a DevOps team.
Return your plan in a structured format that matches the DeploymentPlan model.
"""

DEPLOYMENT_CONFIG_PROMPT = """You are an expert DevOps engineer specializing in {target_platform} deployments.
Your task is to create a detailed deployment configuration based on the following deployment plan:

{deployment_plan_json}

Environment variables to include:
{environment_variables_json}

Create a comprehensive deployment configuration that includes:
1. Platform-specific settings
2. Environment variables
3. Resource requirements
4. Scaling configuration
5. Networking and security settings

Be specific and practical. Focus on creating a configuration that could be used for automated deployment.
Return your configuration in a structured format that matches the DeploymentConfig model.
"""

DEPLOYMENT_EXECUTION_PROMPT = """You are an expert DevOps engineer specializing in {target_platform} deployments.
Your task is to simulate the execution of a deployment based on the following plan and configuration:

Deployment Plan:
{deployment_plan_json}

Deployment Configuration:
{deployment_config_json}

Simulate the deployment process and provide:
1. Deployment status
2. URL of the deployed application (use a placeholder if needed)
3. Deployment logs
4. Metrics (build time, deployment time, etc.)
5. Any issues encountered
6. Recommendations for improvement

Be realistic in your simulation. Consider potential issues and how they might be resolved.
Return your result in a structured format that matches the DeploymentResult model.
"""


# Define the workflow nodes
def create_deployment_plan(state: DeploymentAgentState) -> DeploymentAgentState:
    """Create a deployment plan based on the product specification."""
    try:
        product_spec = state.get("product_spec")
        target_platform = state.get("target_platform")
        domain = state.get("domain")
        
        if not product_spec or not target_platform:
            logger.error("Missing required information for deployment plan creation")
            return {
                **state, 
                "error": "Missing product specification or target platform", 
                "next": END
            }
        
        logger.info(f"Creating deployment plan for platform: {target_platform}")
        
        # Create the LLM
        llm = ChatOpenAI(model="gpt-4o", temperature=0.3)
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=DEPLOYMENT_PLAN_PROMPT),
            HumanMessage(content="Please create a deployment plan based on the provided information."),
        ])
        
        # Format the prompt
        formatted_prompt = prompt.format(
            product_spec_json=json.dumps(product_spec, indent=2),
            target_platform=target_platform,
            domain=domain or "Not specified",
        )
        
        # Generate deployment plan
        response = llm.invoke([SystemMessage(content=formatted_prompt)])
        
        # Parse the response
        try:
            # Try to extract JSON if the model enclosed it in code blocks
            content = response.content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                deployment_plan = json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                deployment_plan = json.loads(json_str)
            else:
                # Fallback to treating the entire response as JSON
                deployment_plan = json.loads(content)
            
            logger.info(f"Successfully created deployment plan for {target_platform}")
            return {
                **state, 
                "deployment_plan": deployment_plan, 
                "next": "create_deployment_config"
            }
        except json.JSONDecodeError:
            logger.error("Failed to parse deployment plan as JSON")
            return {
                **state, 
                "error": "Failed to parse deployment plan", 
                "next": END
            }
    except Exception as e:
        logger.error(f"Error in create_deployment_plan: {str(e)}")
        return {**state, "error": str(e), "next": END}


def create_deployment_config(state: DeploymentAgentState) -> DeploymentAgentState:
    """Create deployment configuration based on the deployment plan."""
    try:
        deployment_plan = state.get("deployment_plan")
        target_platform = state.get("target_platform")
        environment_variables = state.get("environment_variables") or {}
        
        if not deployment_plan or not target_platform:
            logger.error("Missing required information for deployment configuration creation")
            return {
                **state, 
                "error": "Missing deployment plan or target platform", 
                "next": END
            }
        
        logger.info(f"Creating deployment configuration for platform: {target_platform}")
        
        # Create the LLM
        llm = ChatOpenAI(model="gpt-4o", temperature=0.3)
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=DEPLOYMENT_CONFIG_PROMPT),
            HumanMessage(content="Please create a deployment configuration based on the provided plan."),
        ])
        
        # Format the prompt
        formatted_prompt = prompt.format(
            deployment_plan_json=json.dumps(deployment_plan, indent=2),
            target_platform=target_platform,
            environment_variables_json=json.dumps(environment_variables, indent=2),
        )
        
        # Generate deployment configuration
        response = llm.invoke([SystemMessage(content=formatted_prompt)])
        
        # Parse the response
        try:
            # Try to extract JSON if the model enclosed it in code blocks
            content = response.content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                deployment_config = json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                deployment_config = json.loads(json_str)
            else:
                # Fallback to treating the entire response as JSON
                deployment_config = json.loads(content)
            
            logger.info(f"Successfully created deployment configuration for {target_platform}")
            return {
                **state, 
                "deployment_config": deployment_config, 
                "next": "execute_deployment"
            }
        except json.JSONDecodeError:
            logger.error("Failed to parse deployment configuration as JSON")
            return {
                **state, 
                "error": "Failed to parse deployment configuration", 
                "next": END
            }
    except Exception as e:
        logger.error(f"Error in create_deployment_config: {str(e)}")
        return {**state, "error": str(e), "next": END}


def execute_deployment(state: DeploymentAgentState) -> DeploymentAgentState:
    """Execute deployment based on the deployment plan and configuration."""
    try:
        deployment_plan = state.get("deployment_plan")
        deployment_config = state.get("deployment_config")
        target_platform = state.get("target_platform")
        
        if not deployment_plan or not deployment_config or not target_platform:
            logger.error("Missing required information for deployment execution")
            return {
                **state, 
                "error": "Missing deployment plan, configuration, or target platform", 
                "next": END
            }
        
        logger.info(f"Executing deployment for platform: {target_platform}")
        
        # Create the LLM
        llm = ChatOpenAI(model="gpt-4o", temperature=0.3)
        
        # Create the prompt
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=DEPLOYMENT_EXECUTION_PROMPT),
            HumanMessage(content="Please simulate the execution of the deployment based on the provided plan and configuration."),
        ])
        
        # Format the prompt
        formatted_prompt = prompt.format(
            deployment_plan_json=json.dumps(deployment_plan, indent=2),
            deployment_config_json=json.dumps(deployment_config, indent=2),
            target_platform=target_platform,
        )
        
        # Simulate deployment execution
        response = llm.invoke([SystemMessage(content=formatted_prompt)])
        
        # Parse the response
        try:
            # Try to extract JSON if the model enclosed it in code blocks
            content = response.content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                deployment_result = json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                deployment_result = json.loads(json_str)
            else:
                # Fallback to treating the entire response as JSON
                deployment_result = json.loads(content)
            
            logger.info(f"Successfully simulated deployment for {target_platform}")
            return {**state, "deployment_result": deployment_result, "next": END}
        except json.JSONDecodeError:
            logger.error("Failed to parse deployment result as JSON")
            return {
                **state, 
                "error": "Failed to parse deployment result", 
                "next": END
            }
    except Exception as e:
        logger.error(f"Error in execute_deployment: {str(e)}")
        return {**state, "error": str(e), "next": END}


# Define the router function to determine the next node
def router(state: DeploymentAgentState) -> Union[Literal["create_deployment_plan", "create_deployment_config", "execute_deployment"], Literal[END]]:
    """Route to the next node in the workflow based on the state."""
    if state.get("error"):
        return END
    
    next_node = state.get("next")
    if next_node == "create_deployment_config":
        return "create_deployment_config"
    elif next_node == "execute_deployment":
        return "execute_deployment"
    elif next_node == END:
        return END
    else:
        return "create_deployment_plan"


@AgentRegistry.register("deployment_agent")
def create_deployment_agent(
    model: str = "gpt-4o",
    temperature: float = 0.3,
    streaming: bool = False,
    checkpoint_saver: Optional[MemorySaver] = None,
    **kwargs: Any,
) -> StateGraph:
    """
    Create a LangGraph workflow agent for SaaS product deployment.
    
    Args:
        model: The OpenAI model to use for the agent
        temperature: The temperature setting for the model
        streaming: Whether to enable streaming responses
        checkpoint_saver: Optional MemorySaver for checkpointing
        **kwargs: Additional arguments to pass to the agent
        
    Returns:
        A configured StateGraph workflow for product deployment
    """
    # Create the workflow graph
    workflow = StateGraph(DeploymentAgentState)
    
    # Add nodes
    workflow.add_node("create_deployment_plan", create_deployment_plan)
    workflow.add_node("create_deployment_config", create_deployment_config)
    workflow.add_node("execute_deployment", execute_deployment)
    
    # Add edges
    workflow.add_edge("create_deployment_plan", router)
    workflow.add_edge("create_deployment_config", router)
    workflow.add_edge("execute_deployment", router)
    
    # Set the entry point
    workflow.set_entry_point("create_deployment_plan")
    
    # Compile the workflow
    return workflow.compile(checkpointer=checkpoint_saver)


# Example usage
if __name__ == "__main__":
    # Create the deployment agent
    deployment_agent = create_deployment_agent()
    
    # Example product specification from the product agent
    example_product_spec = {
        "name": "RemoteCollab",
        "description": "A comprehensive platform for remote team collaboration",
        "features": [
            {"name": "Async Video Messaging", "priority": "high"},
            {"name": "AI Meeting Summaries", "priority": "medium"},
            {"name": "Virtual Office Spaces", "priority": "high"},
            {"name": "Document Collaboration", "priority": "high"},
            {"name": "Task Management", "priority": "medium"}
        ],
        "tech_stack": {
            "frontend": ["Next.js", "React", "TypeScript", "Tailwind CSS"],
            "backend": ["FastAPI", "Python", "PostgreSQL"],
            "infrastructure": ["Docker", "Kubernetes"]
        }
    }
    
    # Run the agent with initial state
    result = deployment_agent.invoke({
        "product_spec": example_product_spec,
        "target_platform": "vercel",
        "environment_variables": {
            "DATABASE_URL": "postgresql://user:password@db.example.com:5432/remotecollabdb",
            "OPENAI_API_KEY": "sk-xxxxxxxxxxxx",
            "NEXTAUTH_SECRET": "your-secret-key"
        },
        "domain": "remotecollabapp.com"
    })
    
    # Print the result
    if result.get("deployment_result"):
        print(f"Deployment status: {result['deployment_result']['status']}")
        if result['deployment_result'].get('url'):
            print(f"Deployment URL: {result['deployment_result']['url']}")
    else:
        print(f"Error: {result.get('error')}")
