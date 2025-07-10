"""
CommandCore SaaS Forge - LangGraph Workflow Agents

This package provides LangGraph-based AI workflow agents for the CommandCore SaaS Forge platform.
These agents automate various aspects of SaaS product development, from ideation to deployment.
"""

__version__ = "0.1.0"

import logging
from typing import Dict, List, Optional, Any

# Configure basic logging for the package
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Import core components that should be available at the package level
try:
    from langgraph.graph import StateGraph, END
    from langgraph.checkpoint import MemorySaver
    from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
    from langchain_openai import ChatOpenAI
except ImportError:
    logger.warning(
        "Some dependencies are not installed. "
        "Please install the package with 'pip install -e .[dev]' "
        "to ensure all dependencies are available."
    )

# Export public API
__all__ = [
    "create_idea_agent",
    "create_product_agent",
    "create_deployment_agent",
    "create_marketing_agent",
    "AgentRegistry",
]

# Agent registry to keep track of all available agents
class AgentRegistry:
    """Registry for all available LangGraph workflow agents."""
    
    _agents: Dict[str, Any] = {}
    
    @classmethod
    def register(cls, name: str, agent_factory: Any) -> Any:
        """Register an agent factory function with the registry."""
        cls._agents[name] = agent_factory
        return agent_factory
    
    @classmethod
    def get(cls, name: str) -> Optional[Any]:
        """Get an agent factory by name."""
        return cls._agents.get(name)
    
    @classmethod
    def list_agents(cls) -> List[str]:
        """List all registered agent names."""
        return list(cls._agents.keys())


# These will be implemented in separate modules and imported here
from .idea_agent import create_idea_agent
from .product_agent import create_product_agent
from .deployment_agent import create_deployment_agent
from .marketing_agent import create_marketing_agent
