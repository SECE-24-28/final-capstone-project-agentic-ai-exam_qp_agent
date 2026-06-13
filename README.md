[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/s7J27iqd)
# 📚 Agentic AI Question Paper Generator

## Overview

The Agentic AI Question Paper Generator is an intelligent system that automatically generates structured examination question papers from uploaded study materials such as lecture notes, subject notes, and lesson PDFs.

The system uses a multi-agent architecture combined with Retrieval-Augmented Generation (RAG) to analyze educational content and generate question papers according to predefined examination templates.

---

## Features

* Upload PDF study materials
* Automatic content extraction
* Topic and concept analysis
* ChromaDB-based RAG pipeline
* AI-powered question generation
* Multiple examination templates
* Custom mark distribution
* Streamlit-based user interface
* FastAPI backend services
* CPU-friendly deployment using Ollama

---

## System Architecture

```text
Teacher Uploads Notes
          │
          ▼
Document Agent
          │
          ▼
Analysis Agent
          │
          ▼
RAG Ingestion
          │
          ▼
ChromaDB Vector Store
          │
          ▼
Retriever
          │
          ▼
Question Generation Agent
          │
          ▼
Template Agent
          │
          ▼
Paper Agent
          │
          ▼
Final Question Paper
```

---

## Agents Used

### 1. Document Agent

Responsibilities:

* Read uploaded PDF files
* Extract text content
* Prepare content for downstream processing

### 2. Analysis Agent

Responsibilities:

* Extract important topics
* Identify key concepts
* Determine content difficulty
* Find question-worthy sections

### 3. Question Agent

Responsibilities:

* Generate questions from retrieved context
* Follow mark distribution requirements
* Generate questions according to selected template

### 4. Paper Agent

Responsibilities:

* Assemble generated questions
* Apply selected examination format
* Generate final question paper

---

## RAG Pipeline

### Step 1: Content Extraction

PDF notes are converted into raw text using PyPDF.

### Step 2: Chunking

The extracted text is divided into smaller chunks for efficient retrieval.

### Step 3: Embedding Generation

Embeddings are generated using:

* BGE Base Embedding Model

```text
hf.co/CompendiumLabs/bge-base-en-v1.5-gguf:latest
```

### Step 4: Vector Storage

Embeddings are stored inside ChromaDB.

### Step 5: Retrieval

Relevant chunks are retrieved based on subject and question generation requirements.

### Step 6: Question Generation

Retrieved context is passed to the language model to generate examination questions.

---

## Models Used

### LLM

```text
hf.co/bartowski/Llama-3.2-1B-Instruct-GGUF:latest
```

Purpose:

* Topic Analysis
* Question Generation
* Examination Paper Creation

### Embedding Model

```text
hf.co/CompendiumLabs/bge-base-en-v1.5-gguf:latest
```

Purpose:

* Text Embeddings
* Semantic Search
* Context Retrieval

---

## Question Paper Templates

### Anna University Template

```text
PART - A
1 Mark Questions

PART - B
2 Mark Questions

PART - C
5 Mark Questions

PART - D
10 Mark Questions
```

### CBSE Template

```text
SECTION A
1 Mark Questions

SECTION B
2 Mark Questions

SECTION C
5 Mark Questions

SECTION D
10 Mark Questions
```

### School / College Template

```text
I.
1 Mark Questions

II.
2 Mark Questions

III.
5 Mark Questions

IV.
10 Mark Questions
```

---

## Supported Mark Categories

* 1 Mark
* 2 Marks
* 3 Marks
* 5 Marks
* 7 Marks
* 10 Marks

Users can customize the number of questions in each category.

---

## Project Structure

```text
exam-paper-agent/

├── backend/
│   ├── app.py
│   │
│   ├── agents/
│   │   ├── document_agent.py
│   │   ├── analysis_agent.py
│   │   ├── question_agent.py
│   │   ├── paper_agent.py
│   │   └── template_agent.py
│   │
│   ├── rag/
│   │   ├── embedding.py
│   │   ├── ingest.py
│   │   ├── retriever.py
│   │   └── vectorstore.py
│   │
│   ├── prompts/
│   │   ├── anna_template.txt
│   │   ├── cbse_template.txt
│   │   └── school_template.txt
│   │
│   └── uploads/
│
├── frontend/
│   └── streamlit_app.py
│
├── chroma_db/
│
├── requirements.txt
│
└── README.md
```

---

## Installation

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Environment

```bash
venv\Scripts\activate
>>>>>>> 3c70d23 (Frontend files,testing codes and template_agents code are committed)
```

### Install Dependencies

```bash
pip install -r requirements.txt
```
---

## Ollama Setup

Pull the required models:

```bash
ollama pull hf.co/bartowski/Llama-3.2-1B-Instruct-GGUF:latest
```

```bash
ollama pull hf.co/CompendiumLabs/bge-base-en-v1.5-gguf:latest
```

Start Ollama:

```bash
ollama serve
```

---

## Running the Backend

```bash
cd backend

uvicorn app:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger Documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Running the Frontend

```bash
cd frontend

streamlit run streamlit_app.py
```

---

## Future Enhancements

* DOCX support
* PDF export
* Bloom's Taxonomy integration
* Difficulty balancing
* Duplicate question detection
* Previous year question avoidance
* Automatic template extraction from uploaded question papers
* Multi-subject examination paper generation

---

## Technology Stack

* Python
* FastAPI
* Streamlit
* Ollama
* ChromaDB
* LangChain
* PyPDF
* RAG Architecture
* Agentic AI

---

## Author

Developed as an Agentic AI educational application for automated examination question paper generation using Retrieval-Augmented Generation and Multi-Agent Architecture.

## Team members
 Priyavarshini V
 Swetha P
 Shubhaharini S
