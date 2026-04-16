import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BASE_DIR.parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'law_assistant.db'}"


def _load_dotenv_file() -> None:
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")

        if key and (key not in os.environ or not os.environ[key].strip()):
            os.environ[key] = value


_load_dotenv_file()


def _resolve_path(raw_value: str, default_path: Path) -> Path:
    value = raw_value.strip()
    if not value:
        return default_path

    candidate = Path(value)
    if candidate.is_absolute():
        return candidate
    return REPO_ROOT / candidate


def _split_csv_env(raw_value: str) -> list[str]:
    return [item.strip() for item in raw_value.split(",") if item.strip()]

LLM_ENABLED = os.getenv("LLM_ENABLED", "false").lower() == "true"
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai_compatible")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "")
LLM_MODEL = os.getenv("LLM_MODEL", "")
LLM_TIMEOUT_SECONDS = int(os.getenv("LLM_TIMEOUT_SECONDS", "30"))
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))
OPENAI_EMBEDDING_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
CHROMA_PERSIST_DIR = _resolve_path(
    os.getenv("CHROMA_PERSIST_DIR", ""),
    BASE_DIR / "data" / "chroma",
)
LAWS_SOURCE_DIR = REPO_ROOT / "data" / "laws"
CORS_ALLOW_ORIGINS = _split_csv_env(os.getenv("CORS_ALLOW_ORIGINS", ""))
CORS_ALLOW_ORIGIN_REGEX = os.getenv(
    "CORS_ALLOW_ORIGIN_REGEX",
    r"^https?://(127\.0\.0\.1|localhost|0\.0\.0\.0|(\d{1,3}\.){3}\d{1,3}|[A-Za-z0-9.-]+)(:\d+)?$",
)
