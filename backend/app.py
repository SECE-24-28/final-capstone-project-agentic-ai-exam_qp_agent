
from fastapi import FastAPI
from fastapi import UploadFile
from fastapi import File
from fastapi import Form

import shutil

from agents.document_agent import DocumentAgent
from agents.analysis_agent import AnalysisAgent
from agents.question_agent import QuestionAgent
from agents.paper_agent import PaperAgent

from rag.ingest import ingest_document
from rag.retriever import retrieve_context

app = FastAPI()

doc_agent = DocumentAgent()
analysis_agent = AnalysisAgent()
question_agent = QuestionAgent()
paper_agent = PaperAgent()


@app.get("/")
def home():

    return {
        "message": "Question Paper Agent Running"
    }


@app.post("/generate-paper")
async def generate_paper(

    file: UploadFile = File(...),

    subject: str = Form(...),

    template_name: str = Form(...),

    total_marks: int = Form(...),

    one_marks: int = Form(...),

    two_marks: int = Form(...),

    three_marks: int = Form(...),

    five_marks: int = Form(...),

    seven_marks: int = Form(...),

    ten_marks: int = Form(...)
):

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    text = doc_agent.extract_pdf(
        file_path
    )

    analysis = analysis_agent.analyze(
        text
    )

    ingest_document(text)

    context = retrieve_context(
        subject
    )

    questions = question_agent.generate_questions(
        context=context,
        template_name=template_name,
        one_marks=one_marks,
        two_marks=two_marks,
        three_marks=three_marks,
        five_marks=five_marks,
        seven_marks=seven_marks,
        ten_marks=ten_marks
    )

    paper = paper_agent.build_paper(
        subject,
        total_marks,
        template_name,
        questions
    )

    return {
        "analysis": analysis,
        "question_paper": paper
    }