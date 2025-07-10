"""
Configuration settings for the CommandCore SaaS Forge API.

This module provides a centralized configuration system using Pydantic's
BaseSettings, which loads values from environment variables or .env files.
"""

import secrets
from typing import Any, Dict, List, Optional, Union

from loguru import logger
from pydantic import (
    AnyHttpUrl,
    EmailStr,
    Field,
    PostgresDsn,
    SecretStr,
    field_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "CommandCore SaaS Forge API"
    DEBUG: bool = False
    VERSION: str = "0.1.0"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "https://commandcore.app"]
    )

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Database Configuration
    DATABASE_URL: PostgresDsn
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False
    DB_SCHEMA: str = "public"
    
    # Security
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    ALGORITHM: str = "HS256"
    
    # OpenAI Configuration
    OPENAI_API_KEY: SecretStr
    OPENAI_MODEL: str = "gpt-4o"
    
    # Email Configuration
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[SecretStr] = None
    EMAILS_FROM_EMAIL: Optional[EmailStr] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # LangGraph Configuration
    LANGGRAPH_TRACING_ENABLED: bool = False
    LANGGRAPH_TRACING_URL: Optional[str] = None
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "{time} | {level} | {message}"
    
    # Deployment Environment
    ENVIRONMENT: str = "development"  # development, staging, production
    
    # Admin User
    FIRST_SUPERUSER_EMAIL: Optional[EmailStr] = None
    FIRST_SUPERUSER_PASSWORD: Optional[SecretStr] = None
    
    # Vercel Integration
    VERCEL_API_TOKEN: Optional[SecretStr] = None
    VERCEL_TEAM_ID: Optional[str] = None
    
    # Railway Integration
    RAILWAY_API_TOKEN: Optional[SecretStr] = None
    RAILWAY_PROJECT_ID: Optional[str] = None
    
    # Supabase Configuration
    SUPABASE_URL: Optional[AnyHttpUrl] = None
    SUPABASE_KEY: Optional[SecretStr] = None
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_TIMESPAN: int = 60  # seconds
    
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        case_sensitive=True,
        extra="ignore",
    )
    
    def configure_logging(self) -> None:
        """Configure loguru logger based on settings."""
        log_level = self.LOG_LEVEL.upper()
        logger.remove()  # Remove default handler
        logger.add(
            "logs/api.log",
            rotation="20 MB",
            retention="1 week",
            level=log_level,
            format=self.LOG_FORMAT,
            backtrace=True,
            diagnose=True,
        )
        logger.add(
            "logs/errors.log",
            rotation="10 MB",
            retention="1 week",
            level="ERROR",
            format=self.LOG_FORMAT,
            backtrace=True,
            diagnose=True,
        )
        # Console logger
        logger.add(
            sink=lambda msg: print(msg),
            colorize=True,
            level=log_level,
            format=self.LOG_FORMAT,
            backtrace=True,
            diagnose=self.DEBUG,
        )
        logger.info(f"Logging configured with level: {log_level}")
    
    def get_database_connection_parameters(self) -> Dict[str, Any]:
        """Get database connection parameters for SQLAlchemy."""
        return {
            "url": str(self.DATABASE_URL).replace("postgresql://", "postgresql+asyncpg://"),
            "echo": self.DB_ECHO,
            "pool_size": self.DB_POOL_SIZE,
            "max_overflow": self.DB_MAX_OVERFLOW,
        }


# Create global settings instance
settings = Settings()
