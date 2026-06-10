[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/s7J27iqd)


# Agentic AI Exam Question Paper Generator

## Overview

The Agentic AI Exam Question Paper Generator is an intelligent system that automatically generates examination question papers from user-provided topics, syllabi, or learning materials. The project leverages Agentic AI workflows and Large Language Models (LLMs) to create structured, balanced, and customizable question papers while maintaining academic standards and difficulty distribution.

## Features

* Automated question paper generation using AI
* Support for multiple subjects and domains
* Difficulty-level customization (Easy, Medium, Hard)
* Bloom's Taxonomy-based question generation
* Topic-wise weightage allocation
* Multiple question formats:

  * Multiple Choice Questions (MCQs)
  * Short Answer Questions
  * Long Answer Questions
  * Descriptive Questions
* Custom marks distribution
* Export generated papers to PDF
* Faculty review and editing support
* Question bank management
* AI-powered validation and duplication checks

## Agentic AI Workflow

1. User provides syllabus, topics, or reference material.
2. AI Agent analyzes the content.
3. Topic Extraction Agent identifies key concepts.
4. Difficulty Planning Agent allocates questions across levels.
5. Question Generation Agent creates questions.
6. Review Agent validates quality, relevance, and duplication.
7. Formatting Agent structures the final question paper.
8. Export Agent generates downloadable output.

## System Architecture

Frontend:

* React.js / HTML / CSS / JavaScript

Backend:

* Python (FastAPI / Flask)

AI Layer:

* OpenAI GPT Models / LLM APIs
* LangChain
* Agentic Workflow Engine

Database:

* MySQL / PostgreSQL

Deployment:

* Docker
* Docker Compose

## Tech Stack

### Programming Languages

* Python
* JavaScript

### Frameworks & Libraries

* FastAPI / Flask
* React.js
* LangChain
* Pandas
* NumPy

### Tools

* VS Code
* GitHub
* Docker
* Jupyter Notebook

## Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/agentic-ai-question-generator.git
cd agentic-ai-question-generator
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Application

```bash
python app.py
```

### Docker Deployment

```bash
docker-compose up --build
```

## Usage

1. Upload syllabus or enter topics.
2. Select examination type.
3. Configure marks distribution.
4. Choose difficulty levels.
5. Generate question paper.
6. Review and download output.

## Future Enhancements

* Adaptive question generation
* Multi-language support
* Institution-specific templates
* Automatic answer key generation
* Question quality scoring
* LMS integration

## Project Outcomes

* Reduces manual effort in question paper preparation
* Ensures balanced assessment coverage
* Supports scalable academic content generation
* Enhances consistency and fairness in examinations

## Authors

Priyavarshini V
Shubhaharini S
Swetha P

## License

This project is developed for educational and research purposes.
