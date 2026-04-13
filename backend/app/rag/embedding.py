from __future__ import annotations

import httpx

from app.config import LLM_API_KEY, LLM_BASE_URL, LLM_TIMEOUT_SECONDS, OPENAI_EMBEDDING_MODEL


class EmbeddingServiceError(Exception):
    """Raised when the embedding service cannot be used."""


def _validate_embedding_config() -> None:
    missing_fields: list[str] = []

    if not LLM_BASE_URL:
        missing_fields.append("LLM_BASE_URL")
    if not LLM_API_KEY:
        missing_fields.append("LLM_API_KEY")
    if not OPENAI_EMBEDDING_MODEL:
        missing_fields.append("OPENAI_EMBEDDING_MODEL")

    if missing_fields:
        joined = ", ".join(missing_fields)
        raise EmbeddingServiceError(f"Missing embedding config: {joined}")


def embed_texts(texts: list[str]) -> list[list[float]]:
    normalized = [text.strip() for text in texts if text.strip()]
    if not normalized:
        return []

    _validate_embedding_config()

    payload = {
        "model": OPENAI_EMBEDDING_MODEL,
        "input": normalized,
    }

    try:
        with httpx.Client(timeout=LLM_TIMEOUT_SECONDS) as client:
            response = client.post(
                f"{LLM_BASE_URL.rstrip('/')}/embeddings",
                headers={
                    "Authorization": f"Bearer {LLM_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
    except httpx.HTTPError as exc:
        raise EmbeddingServiceError(f"Embedding service unavailable: {exc}") from exc

    if response.status_code >= 400:
        body_preview = response.text.strip()
        if len(body_preview) > 500:
            body_preview = f"{body_preview[:500]}..."
        raise EmbeddingServiceError(
            f"Embedding upstream error {response.status_code}: {body_preview}"
        )

    try:
        data = response.json()
        items = data["data"]
    except (ValueError, KeyError, TypeError) as exc:
        raise EmbeddingServiceError("Embedding upstream returned invalid JSON") from exc

    embeddings: list[list[float]] = []
    for item in items:
        embedding = item.get("embedding")
        if not isinstance(embedding, list):
            raise EmbeddingServiceError("Embedding response missing vectors")
        embeddings.append(embedding)

    if len(embeddings) != len(normalized):
        raise EmbeddingServiceError("Embedding response count mismatch")

    return embeddings


def embed_query(text: str) -> list[float]:
    embeddings = embed_texts([text])
    if not embeddings:
        raise EmbeddingServiceError("Embedding response was empty")
    return embeddings[0]
