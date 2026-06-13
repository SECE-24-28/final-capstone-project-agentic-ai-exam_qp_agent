from rag.vectorstore import collection
from rag.embedding import get_embedding
import uuid


def chunk_text(text, chunk_size=500):

    chunks = []

    for i in range(0, len(text), chunk_size):

        chunks.append(
            text[i:i+chunk_size]
        )

    return chunks


def ingest_document(text):

    chunks = chunk_text(text)

    for idx, chunk in enumerate(chunks):

        embedding = get_embedding(chunk)

        collection.add(
            ids=[str(uuid.uuid4())],
            documents=[chunk],
            embeddings=[embedding]
        )

    return len(chunks)
