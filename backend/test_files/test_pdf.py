from agents.document_agent import DocumentAgent

agent = DocumentAgent()

pdf_path = r"D:\Question_paper_agent\backend\uploads\sample.pdf"

text = agent.extract_pdf(pdf_path)

print(text[:1000])