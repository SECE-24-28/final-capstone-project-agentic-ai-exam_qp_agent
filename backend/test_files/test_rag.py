from agents.document_agent import DocumentAgent
from rag.ingest import ingest_document
from rag.retriever import retrieve_context

doc_agent = DocumentAgent()

text = doc_agent.extract_pdf(
    r"D:\Question_paper_agent\backend\uploads\sample.pdf"
)

count = ingest_document(text)

print("Chunks Added:", count)

result = retrieve_context(
    "important concepts"
)

print("\nRetrieved Context:\n")

print(result)