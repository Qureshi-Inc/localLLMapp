from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "CaseVault"
    app_version: str = "0.1.0"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/casevault"

    # Qdrant vector store
    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "document_embeddings"

    # Ollama LLM
    ollama_url: str = "http://localhost:11434"

    # Logging
    log_level: str = "INFO"
    log_format: str = "json"

    # JWT / auth (reserved for later issues)
    jwt_secret_key: str = "dev-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
