"""
Unit tests for product_flow.py module.

These tests verify the functionality of the LangGraph product flow,
including both the full flow and individual nodes.
"""

# Standard library imports only (no pytest dependency)
import sys
from typing import Dict, Any

# Import the module to test
from product_flow import (
    run, 
    idea_scraper, 
    validator, 
    mvp_builder, 
    deployer, 
    seo_bot,
    ProductFlowState
)

def test_run_returns_complete_logs():
    """Test that run() returns a dict with all expected node keys."""
    result = run()
    
    # Check that the result contains logs for each node
    assert isinstance(result, dict)
    assert "idea_scraper" in result
    assert "validator" in result
    assert "mvp_builder" in result
    assert "deployer" in result
    assert "seo_bot" in result

def test_idea_scraper():
    """Test the idea_scraper node."""
    # Start with empty state
    initial_state: ProductFlowState = {}
    
    # Run the node
    result = idea_scraper(initial_state)
    
    # Verify structure and content
    assert "ideas" in result
    assert isinstance(result["ideas"], list)
    assert len(result["ideas"]) > 0
    assert "logs" in result
    assert "idea_scraper" in result["logs"]
    
    # Check log structure
    log = result["logs"]["idea_scraper"]
    assert "timestamp" in log
    assert "count" in log
    assert "ideas" in log
    assert log["count"] == len(log["ideas"])
    
    # Check idea structure
    for idea in result["ideas"]:
        assert "title" in idea
        assert "url" in idea

def test_validator():
    """Test the validator node."""
    # Create input state with ideas
    ideas = [
        {"title": "Test Idea 1", "url": "https://example.com/1"},
        {"title": "Test Idea 2", "url": "https://example.com/2"},
        {"title": "Test Idea 3", "url": "https://example.com/3"},
    ]
    initial_state: ProductFlowState = {"ideas": ideas}
    
    # Run the node
    result = validator(initial_state)
    
    # Verify structure
    assert "validated_ideas" in result
    assert isinstance(result["validated_ideas"], list)
    assert "logs" in result
    assert "validator" in result["logs"]
    
    # Check log structure
    log = result["logs"]["validator"]
    assert "timestamp" in log
    assert "input_count" in log
    assert "output_count" in log
    assert "validated_ideas" in log
    assert log["input_count"] == len(ideas)
    assert log["output_count"] == len(log["validated_ideas"])
    
    # Check validated idea structure
    for idea in result["validated_ideas"]:
        assert "title" in idea
        assert "url" in idea
        assert "score" in idea
        assert idea["score"] > 50  # Validation threshold

def test_mvp_builder():
    """Test the mvp_builder node."""
    # Create input state with validated ideas
    validated_ideas = [
        {"title": "Test Idea 1", "url": "https://example.com/1", "score": 75},
        {"title": "Test Idea 2", "url": "https://example.com/2", "score": 85},
    ]
    initial_state: ProductFlowState = {"validated_ideas": validated_ideas}
    
    # Run the node
    result = mvp_builder(initial_state)
    
    # Verify structure
    assert "built_ideas" in result
    assert isinstance(result["built_ideas"], list)
    assert "logs" in result
    assert "mvp_builder" in result["logs"]
    
    # Check log structure
    log = result["logs"]["mvp_builder"]
    assert "timestamp" in log
    assert "count" in log
    assert "built_ideas" in log
    assert log["count"] == len(log["built_ideas"])
    
    # Check built idea structure
    for idea in result["built_ideas"]:
        assert "title" in idea
        assert "url" in idea
        assert "score" in idea
        assert "status" in idea
        assert idea["status"] == "built"
        assert "repository" in idea

def test_deployer():
    """Test the deployer node."""
    # Create input state with built ideas
    built_ideas = [
        {
            "title": "Test Idea 1", 
            "url": "https://example.com/1", 
            "score": 75,
            "status": "built",
            "repository": "github.com/commandcore/test-idea-1"
        }
    ]
    initial_state: ProductFlowState = {"built_ideas": built_ideas}
    
    # Run the node
    result = deployer(initial_state)
    
    # Verify structure
    assert "deployed_ideas" in result
    assert isinstance(result["deployed_ideas"], list)
    assert "logs" in result
    assert "deployer" in result["logs"]
    
    # Check log structure
    log = result["logs"]["deployer"]
    assert "timestamp" in log
    assert "count" in log
    assert "deployed_ideas" in log
    assert log["count"] == len(log["deployed_ideas"])
    
    # Check deployed idea structure
    for idea in result["deployed_ideas"]:
        assert "title" in idea
        assert "url" in idea  # Original URL
        assert "score" in idea
        assert "status" in idea
        assert idea["status"] == "deployed"
        assert "repository" in idea

def test_seo_bot():
    """Test the seo_bot node."""
    # Create input state with deployed ideas
    deployed_ideas = [
        {
            "title": "Test Idea 1", 
            "url": "https://example.com/1", 
            "score": 75,
            "status": "deployed",
            "repository": "github.com/commandcore/test-idea-1",
            "url": "https://test-idea-1.vercel.app"
        }
    ]
    initial_state: ProductFlowState = {"deployed_ideas": deployed_ideas}
    
    # Run the node
    result = seo_bot(initial_state)
    
    # Verify structure
    assert "marketed_ideas" in result
    assert isinstance(result["marketed_ideas"], list)
    assert "logs" in result
    assert "seo_bot" in result["logs"]
    
    # Check log structure
    log = result["logs"]["seo_bot"]
    assert "timestamp" in log
    assert "count" in log
    assert "marketed_ideas" in log
    assert log["count"] == len(log["marketed_ideas"])
    
    # Check marketed idea structure
    for idea in result["marketed_ideas"]:
        assert "title" in idea
        assert "url" in idea
        assert "score" in idea
        assert "status" in idea
        assert idea["status"] == "marketed"
        assert "repository" in idea
        assert "seo_posts" in idea
        assert len(idea["seo_posts"]) == 3  # Should generate 3 SEO posts

def test_full_flow_integration():
    """Test the integration of all nodes in sequence."""
    # Start with empty state
    initial_state: ProductFlowState = {}
    
    # Run each node in sequence
    state1 = idea_scraper(initial_state)
    state2 = validator(state1)
    state3 = mvp_builder(state2)
    state4 = deployer(state3)
    final_state = seo_bot(state4)
    
    # Verify the final state contains all expected keys
    assert "ideas" in final_state
    assert "validated_ideas" in final_state
    assert "built_ideas" in final_state
    assert "deployed_ideas" in final_state
    assert "marketed_ideas" in final_state
    
    # Verify logs for all steps are present
    assert "logs" in final_state
    logs = final_state["logs"]
    assert "idea_scraper" in logs
    assert "validator" in logs
    assert "mvp_builder" in logs
    assert "deployer" in logs
    assert "seo_bot" in logs


# --------------------------------------------------------------------------- #
# Simple test runner (so we don't require the pytest package)
# --------------------------------------------------------------------------- #

def _run_all():
    """
    Discover and run all test functions in this module.
    A test function is any callable whose name starts with ``test_``.
    """
    current_module = sys.modules[__name__]
    tests = [
        getattr(current_module, attr)
        for attr in dir(current_module)
        if attr.startswith("test_") and callable(getattr(current_module, attr))
    ]

    failures = 0
    for test_fn in tests:
        name = test_fn.__name__
        try:
            test_fn()
            print(f"[PASS] {name}")
        except AssertionError as exc:
            failures += 1
            print(f"[FAIL] {name}: {exc}")
            break  # Stop on first failure for simplicity

    if failures:
        sys.exit(1)
    # Use plain ASCII to avoid Unicode issues on some consoles
    print(f"All {len(tests)} tests passed.")


if __name__ == "__main__":
    _run_all()
