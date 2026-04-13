from __future__ import annotations

from pathlib import Path

from app.config import CHROMA_PERSIST_DIR, LAWS_SOURCE_DIR
from app.rag.embedding import embed_texts
from app.rag.retriever import COLLECTION_NAME


CHUNK_SIZE = 500


def split_text_into_chunks(text: str, chunk_size: int = CHUNK_SIZE) -> list[str]:
    normalized = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    if not normalized:
        return []

    paragraphs = normalized.split("\n")
    chunks: list[str] = []
    current = ""

    for paragraph in paragraphs:
        candidate = f"{current}\n{paragraph}".strip() if current else paragraph
        if len(candidate) <= chunk_size:
            current = candidate
            continue

        if current:
            chunks.append(current)
            current = ""

        while len(paragraph) > chunk_size:
            chunks.append(paragraph[:chunk_size].strip())
            paragraph = paragraph[chunk_size:].strip()

        current = paragraph

    if current:
        chunks.append(current)

    return chunks


def _source_files() -> list[Path]:
    LAWS_SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    return sorted(path for path in LAWS_SOURCE_DIR.rglob("*.txt") if path.is_file())


def _get_collection(rebuild: bool):
    import chromadb

    CHROMA_PERSIST_DIR.mkdir(parents=True, exist_ok=True)

    client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIR))
    if rebuild:
        try:
            client.delete_collection(COLLECTION_NAME)
        except Exception:
            pass
    return client.get_or_create_collection(name=COLLECTION_NAME)


def ingest_documents(rebuild: bool = True) -> int:
    source_files = _source_files()
    collection = _get_collection(rebuild=rebuild)

    total_chunks = 0
    for path in source_files:
        content = path.read_text(encoding="utf-8").strip()
        chunks = split_text_into_chunks(content)
        if not chunks:
            continue

        embeddings = embed_texts(chunks)
        relative_source = path.relative_to(LAWS_SOURCE_DIR.parent.parent)
        source_key = str(relative_source).replace("/", "-").replace("\\", "-")

        collection.add(
            ids=[f"{source_key}-{index}" for index in range(len(chunks))],
            documents=chunks,
            embeddings=embeddings,
            metadatas=[
                {
                    "source_file": str(relative_source),
                    "chunk_index": index,
                }
                for index in range(len(chunks))
            ],
        )
        total_chunks += len(chunks)

    return total_chunks


def main() -> int:
    total_chunks = ingest_documents(rebuild=True)
    print(
        f"Ingested {total_chunks} chunk(s) from {LAWS_SOURCE_DIR} into {CHROMA_PERSIST_DIR}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
