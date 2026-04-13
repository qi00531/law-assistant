from __future__ import annotations

import sys

from app.config import CHROMA_PERSIST_DIR
from app.rag.embedding import embed_query


COLLECTION_NAME = "laws"


def _get_collection():
    import chromadb

    client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIR))
    return client.get_or_create_collection(name=COLLECTION_NAME)


def retrieve_relevant_chunks(question: str, limit: int = 3) -> list[str]:
    normalized = question.strip()
    if not normalized:
        return []

    try:
        collection = _get_collection()
        if collection.count() == 0:
            return []

        query_embedding = embed_query(normalized)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            include=["documents", "metadatas"],
        )
    except Exception:
        return []

    documents = results.get("documents", [[]])
    metadatas = results.get("metadatas", [[]])
    top_documents = documents[0] if documents else []
    top_metadatas = metadatas[0] if metadatas else []

    chunks: list[str] = []
    for index, document in enumerate(top_documents):
        if not isinstance(document, str):
            continue

        metadata = top_metadatas[index] if index < len(top_metadatas) else {}
        source = ""
        if isinstance(metadata, dict):
            source = str(metadata.get("source_file", "")).strip()

        content = document.strip()
        if not content:
            continue

        if source:
            chunks.append(f"[{source}] {content}")
        else:
            chunks.append(content)

    return chunks


def main() -> int:
    if len(sys.argv) < 2:
        print('Usage: python -m app.rag.retriever "你的问题"')
        return 1

    question = sys.argv[1].strip()
    chunks = retrieve_relevant_chunks(question)
    if not chunks:
        print("No chunks found.")
        return 0

    for index, chunk in enumerate(chunks, start=1):
        print(f"[{index}] {chunk}\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
