from rag.vectorstore import collection
from rag.embedding import get_embedding


def retrieve_context(query, top_k=5):

    query_embedding = get_embedding(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    docs = results["documents"][0]

    return "\n".join(docs)
