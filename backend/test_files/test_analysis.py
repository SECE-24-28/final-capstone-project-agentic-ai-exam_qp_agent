from agents.document_agent import DocumentAgent
from agents.analysis_agent import AnalysisAgent

doc_agent = DocumentAgent()
analysis_agent = AnalysisAgent()

text = doc_agent.extract_pdf(
    r"D:\Question_paper_agent\backend\uploads\sample.pdf"
)

result = analysis_agent.analyze(text)

print(result)