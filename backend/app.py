import uuid
import threading
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
import json

from database import init_db, get_db, QuestionPaper
from agents_workflow import active_tasks, run_agentic_workflow

app = FastAPI(title="Agentic AI Exam Question Paper Generator API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Pydantic models for request bodies
class DifficultyConfig(BaseModel):
    easy: int
    medium: int
    hard: int

class MarksConfig(BaseModel):
    mcq: int
    short: int
    long: int

class GenerateRequest(BaseModel):
    syllabus_text: str
    subject: str
    exam_type: str
    total_marks: int
    difficulty: DifficultyConfig
    marks_dist: MarksConfig
    api_provider: str
    api_key: Optional[str] = ""

class SavePaperRequest(BaseModel):
    title: str
    subject: str
    exam_type: str
    total_marks: int
    difficulty_config: Dict[str, int]
    marks_config: Dict[str, int]
    syllabus_text: str
    content: str

class UpdatePaperRequest(BaseModel):
    title: str
    content: str

@app.post("/api/generate")
def generate_paper(request: GenerateRequest):
    task_id = str(uuid.uuid4())
    
    # Start the workflow in a background thread to prevent blocking
    thread = threading.Thread(
        target=run_agentic_workflow,
        args=(
            task_id,
            request.syllabus_text,
            request.subject,
            request.exam_type,
            request.total_marks,
            request.difficulty.model_dump(),
            request.marks_dist.model_dump(),
            request.api_provider,
            request.api_key
        )
    )
    thread.daemon = True
    thread.start()
    
    return {"task_id": task_id}

@app.get("/api/status/{task_id}")
def get_task_status(task_id: str, db: Session = Depends(get_db)):
    if task_id not in active_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task_data = active_tasks[task_id]
    
    # If completed and not yet saved in database, save it!
    # We check if a DB save flag is already set to prevent double saves.
    if task_data["status"] == "completed" and not task_data.get("saved_to_db", False):
        try:
            # Save the paper to DB automatically
            new_paper = QuestionPaper(
                title=f"{task_data['subject']} {task_data['exam_type']}",
                subject=task_data["subject"],
                exam_type=task_data["exam_type"],
                total_marks=task_data["total_marks"],
                difficulty_config=json.dumps(task_data["difficulty"]),
                marks_config=json.dumps(task_data["marks_dist"]),
                syllabus_text="See details", # Keep lightweight
                content=task_data["final_paper"]
            )
            db.add(new_paper)
            db.commit()
            db.refresh(new_paper)
            task_data["saved_to_db"] = True
            task_data["db_id"] = new_paper.id
        except Exception as db_err:
            print(f"Error saving paper to DB: {str(db_err)}")
            
    return task_data

@app.get("/api/papers")
def get_all_papers(db: Session = Depends(get_db)):
    papers = db.query(QuestionPaper).order_by(QuestionPaper.created_at.desc()).all()
    result = []
    for paper in papers:
        result.append({
            "id": paper.id,
            "title": paper.title,
            "subject": paper.subject,
            "exam_type": paper.exam_type,
            "total_marks": paper.total_marks,
            "difficulty_config": json.loads(paper.difficulty_config) if paper.difficulty_config else {},
            "marks_config": json.loads(paper.marks_config) if paper.marks_config else {},
            "created_at": paper.created_at.isoformat()
        })
    return result

@app.get("/api/papers/{paper_id}")
def get_paper_details(paper_id: int, db: Session = Depends(get_db)):
    paper = db.query(QuestionPaper).filter(QuestionPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
        
    return {
        "id": paper.id,
        "title": paper.title,
        "subject": paper.subject,
        "exam_type": paper.exam_type,
        "total_marks": paper.total_marks,
        "difficulty_config": json.loads(paper.difficulty_config) if paper.difficulty_config else {},
        "marks_config": json.loads(paper.marks_config) if paper.marks_config else {},
        "syllabus_text": paper.syllabus_text,
        "content": paper.content,
        "created_at": paper.created_at.isoformat()
    }

@app.put("/api/papers/{paper_id}")
def update_paper(paper_id: int, request: UpdatePaperRequest, db: Session = Depends(get_db)):
    paper = db.query(QuestionPaper).filter(QuestionPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
        
    paper.title = request.title
    paper.content = request.content
    db.commit()
    return {"message": "Paper updated successfully"}

@app.delete("/api/papers/{paper_id}")
def delete_paper(paper_id: int, db: Session = Depends(get_db)):
    paper = db.query(QuestionPaper).filter(QuestionPaper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
        
    db.delete(paper)
    db.commit()
    return {"message": "Paper deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
