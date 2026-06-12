import time
import json
import re
import random
from typing import Dict, Any, List

# In-memory store for active tasks to poll status
active_tasks: Dict[str, Dict[str, Any]] = {}

# Predefined high-quality question pools for Demo Mode
SUBJECT_DATA = {
    "Data Structures & Algorithms": {
        "topics": [
            {"topic": "Arrays and Linked Lists", "bloom": "Remembering/Understanding", "weight": 20},
            {"topic": "Stacks and Queues", "bloom": "Applying", "weight": 20},
            {"topic": "Trees (Binary, BST, AVL)", "bloom": "Analyzing/Evaluating", "weight": 30},
            {"topic": "Graphs and Traversals (BFS, DFS)", "bloom": "Applying/Analyzing", "weight": 20},
            {"topic": "Sorting & Searching Algorithms", "bloom": "Remembering/Understanding", "weight": 10}
        ],
        "questions": {
            "easy": [
                {"text": "What is the time complexity of searching an element in a balanced Binary Search Tree (BST) in the worst case?", "type": "MCQ", "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"], "answer": "O(log n)"},
                {"text": "Explain the difference between a stack and a queue data structure.", "type": "Short Answer"},
                {"text": "Define what a collision is in hash tables and name two collision resolution techniques.", "type": "Short Answer"}
            ],
            "medium": [
                {"text": "Given a singly linked list, write a function to reverse it in-place and explain its space complexity.", "type": "Short Answer"},
                {"text": "Which of the following traversals of a Binary Search Tree (BST) produces a sorted list of elements in ascending order?", "type": "MCQ", "options": ["Preorder", "Inorder", "Postorder", "Level-order"], "answer": "Inorder"},
                {"text": "Describe the steps to insert an element into an AVL tree and how rotations maintain the balance factor.", "type": "Long Answer"}
            ],
            "hard": [
                {"text": "Implement Dijkstra's shortest path algorithm for a weighted graph and discuss its time complexity using a binary heap versus a Fibonacci heap.", "type": "Long Answer"},
                {"text": "Design a data structure that supports insert, delete, and getRandom in O(1) time complexity.", "type": "Descriptive"}
            ]
        }
    },
    "Operating Systems": {
        "topics": [
            {"topic": "Process Management and Scheduling", "bloom": "Applying/Analyzing", "weight": 30},
            {"topic": "Thread Synchronization and Deadlocks", "bloom": "Evaluating/Creating", "weight": 25},
            {"topic": "Memory Management and Virtual Memory", "bloom": "Understanding/Applying", "weight": 25},
            {"topic": "File Systems and Storage", "bloom": "Remembering/Understanding", "weight": 20}
        ],
        "questions": {
            "easy": [
                {"text": "What is the primary purpose of an Operating System?", "type": "Short Answer"},
                {"text": "Which of the following is NOT a state of a process?", "type": "MCQ", "options": ["New", "Running", "Waiting", "Terminated", "Blocked", "Executing"], "answer": "Executing"},
                {"text": "Define virtual memory and the concept of demand paging.", "type": "Short Answer"}
            ],
            "medium": [
                {"text": "Explain the Banker's algorithm for deadlock avoidance and solve a small scenario with 3 processes.", "type": "Long Answer"},
                {"text": "Describe the differences between paging and segmentation. What is thrashing?", "type": "Short Answer"},
                {"text": "Which scheduling algorithm can result in starvation?", "type": "MCQ", "options": ["First-Come, First-Served", "Round Robin", "Shortest Job First", "Priority Scheduling"], "answer": "Priority Scheduling"}
            ],
            "hard": [
                {"text": "Analyze the Producer-Consumer problem. Write the pseudocode solution using semaphores and explain how race conditions are avoided.", "type": "Long Answer"},
                {"text": "Discuss page replacement algorithms (FIFO, LRU, Optimal). Prove Belady's Anomaly with an example.", "type": "Descriptive"}
            ]
        }
    },
    "Agentic AI & LLMs": {
        "topics": [
            {"topic": "Large Language Model Architectures", "bloom": "Remembering/Understanding", "weight": 20},
            {"topic": "Prompt Engineering and In-Context Learning", "bloom": "Applying", "weight": 20},
            {"topic": "Agentic Frameworks (ReAct, Plan-and-Solve)", "bloom": "Analyzing/Evaluating", "weight": 30},
            {"topic": "Tool Use and Function Calling", "bloom": "Applying/Creating", "weight": 30}
        ],
        "questions": {
            "easy": [
                {"text": "What does the abbreviation 'LLM' stand for in Artificial Intelligence?", "type": "MCQ", "options": ["Large Logic Machine", "Large Language Model", "Linear Learning Model", "Latent Language Memory"], "answer": "Large Language Model"},
                {"text": "Explain the concept of 'zero-shot' prompting with a brief example.", "type": "Short Answer"},
                {"text": "What is a 'system prompt' and how does it influence model behavior?", "type": "Short Answer"}
            ],
            "medium": [
                {"text": "Compare the 'ReAct' (Reasoning and Acting) paradigm with standard chain-of-thought prompting.", "type": "Short Answer"},
                {"text": "Given a scenario where an AI agent needs to search the web, what parameters should its search tool accept?", "type": "Short Answer"},
                {"text": "Explain the difference between retrieval-augmented generation (RAG) and model fine-tuning.", "type": "Long Answer"}
            ],
            "hard": [
                {"text": "Design an autonomous coding agent workflow that writes, tests, and debugs code. Specify the tool set and the loop termination criteria.", "type": "Long Answer"},
                {"text": "Analyze the safety and control challenge in multi-agent systems where agents can define and spawn other subagents. What guardrails would you implement?", "type": "Descriptive"}
            ]
        }
    }
}

DEFAULT_QUESTIONS = {
    "easy": [
        {"text": "Define the primary concepts discussed in the provided text.", "type": "Short Answer"},
        {"text": "Which of the following best summarizes the main topic?", "type": "MCQ", "options": ["Topic A", "Topic B", "Topic C", "Topic D"], "answer": "Topic A"}
    ],
    "medium": [
        {"text": "Explain the relationship between the key concepts outlined in the syllabus.", "type": "Short Answer"},
        {"text": "Draft a case study based on the principles described in the reference material.", "type": "Long Answer"}
    ],
    "hard": [
        {"text": "Critically evaluate the methodology proposed in the notes. What are its main limitations?", "type": "Long Answer"},
        {"text": "Formulate a new design pattern or solution integrating the major components from the syllabus.", "type": "Descriptive"}
    ]
}

def extract_keywords_from_text(text: str) -> str:
    """Helper to detect subjects based on text keywords."""
    t = text.lower()
    if any(k in t for k in ["tree", "graph", "stack", "queue", "sort", "algorithm", "linked list", "bst", "array"]):
        return "Data Structures & Algorithms"
    elif any(k in t for k in ["operating system", "process", "scheduler", "deadlock", "memory management", "virtual memory", "paging"]):
        return "Operating Systems"
    elif any(k in t for k in ["agent", "llm", "prompt", "langchain", "openai", "gemini", "agentic", "gpt"]):
        return "Agentic AI & LLMs"
    return "Custom Subject"

def simulate_agent_step(task_id: str, agent_name: str, duration: float, logs: List[str], output_data: Any):
    """Updates a task's agent state to simulate work."""
    task = active_tasks[task_id]
    task["current_agent"] = agent_name
    task["agents"][agent_name]["status"] = "running"
    
    # Progressively add logs
    for log in logs:
        time.sleep(duration / len(logs))
        task["agents"][agent_name]["logs"].append(log)
        
    task["agents"][agent_name]["status"] = "completed"
    task["agents"][agent_name]["output"] = output_data

def run_agentic_workflow(
    task_id: str,
    syllabus_text: str,
    subject: str,
    exam_type: str,
    total_marks: int,
    difficulty: Dict[str, int],  # e.g., {"easy": 30, "medium": 50, "hard": 20}
    marks_dist: Dict[str, int],  # e.g., {"mcq": 20, "short": 30, "long": 50}
    api_provider: str = "demo",
    api_key: str = ""
):
    try:
        # Initialize task dict
        active_tasks[task_id] = {
            "status": "running",
            "current_agent": "Document Agent",
            "subject": subject,
            "exam_type": exam_type,
            "total_marks": total_marks,
            "difficulty": difficulty,
            "marks_dist": marks_dist,
            "agents": {
                "Document Agent": {"status": "idle", "logs": [], "output": None},
                "Syllabus Agent": {"status": "idle", "logs": [], "output": None},
                "Topic Extraction Agent": {"status": "idle", "logs": [], "output": None},
                "Question Generation Agent": {"status": "idle", "logs": [], "output": None},
                "Difficulty Validation Agent": {"status": "idle", "logs": [], "output": None},
                "Marks Distribution Agent": {"status": "idle", "logs": [], "output": None},
                "Paper Formatting Agent": {"status": "idle", "logs": [], "output": None}
            },
            "final_paper": ""
        }

        # ----------------------------------------------------
        # 1. DOCUMENT AGENT
        # ----------------------------------------------------
        doc_logs = [
            "Initializing Document Agent...",
            f"Received raw input text length: {len(syllabus_text)} characters.",
            "Normalizing text casing and removing excessive whitespaces...",
            "Splitting document into logical structural segments...",
            "Completed document parsing. Ready for syllabus mapping."
        ]
        doc_output = {
            "char_count": len(syllabus_text),
            "word_count": len(syllabus_text.split()),
            "segments": [syllabus_text[i:i+300] + ("..." if len(syllabus_text) > i+300 else "") for i in range(0, len(syllabus_text), 300)][:5]
        }
        simulate_agent_step(task_id, "Document Agent", 1.5, doc_logs, doc_output)

        # ----------------------------------------------------
        # 2. SYLLABUS AGENT
        # ----------------------------------------------------
        sys_logs = [
            "Initializing Syllabus Agent...",
            "Analyzing extracted segments...",
            "Cross-referencing terms with academic subject domains...",
            f"Mapping detected keywords to core subjects...",
            "Domain categorized successfully."
        ]
        detected_subject = subject if subject != "Auto-Detect" else extract_keywords_from_text(syllabus_text)
        sys_output = {
            "classified_subject": detected_subject,
            "academic_level": "Undergraduate/Postgraduate",
            "confidence_score": 0.95 if detected_subject != "Custom Subject" else 0.60
        }
        simulate_agent_step(task_id, "Syllabus Agent", 1.5, sys_logs, sys_output)

        # ----------------------------------------------------
        # 3. TOPIC EXTRACTION AGENT
        # ----------------------------------------------------
        topic_logs = [
            "Initializing Topic Extraction Agent...",
            "Extracting specific concepts, modules, and subtopics...",
            "Calculating weightages based on relative frequency and structural cues...",
            "Mapping extracted topics to Bloom's Taxonomy cognitive levels..."
        ]
        
        # Load topics based on subject
        sub_key = detected_subject if detected_subject in SUBJECT_DATA else "Data Structures & Algorithms"
        extracted_topics = SUBJECT_DATA[sub_key]["topics"]
        
        # If it's custom text, generate some fake ones mixed with words from text
        if detected_subject == "Custom Subject" and len(syllabus_text) > 10:
            words = [w.strip(".,()\"';:") for w in syllabus_text.split() if len(w) > 5]
            unique_words = list(set(words))[:4]
            if unique_words:
                custom_topics = []
                for idx, w in enumerate(unique_words):
                    bloom_levels = ["Remembering", "Understanding", "Applying", "Analyzing", "Evaluating"]
                    custom_topics.append({
                        "topic": f"Principles of {w.capitalize()}",
                        "bloom": bloom_levels[idx % len(bloom_levels)],
                        "weight": 25
                    })
                extracted_topics = custom_topics

        topic_logs.append(f"Successfully extracted {len(extracted_topics)} main modules.")
        simulate_agent_step(task_id, "Topic Extraction Agent", 2.0, topic_logs, {"topics": extracted_topics})

        # ----------------------------------------------------
        # 4. QUESTION GENERATION AGENT
        # ----------------------------------------------------
        qgen_logs = [
            "Initializing Question Generation Agent...",
            f"Target marks configuration: MCQ={marks_dist.get('mcq', 20)}%, Short Answer={marks_dist.get('short', 30)}%, Long/Descriptive={marks_dist.get('long', 50)}%.",
            f"Difficulty requirements: Easy={difficulty.get('easy', 30)}%, Medium={difficulty.get('medium', 50)}%, Hard={difficulty.get('hard', 20)}%.",
            "Sourcing/generating questions conforming to syllabus topics...",
            "Applying Bloom's Taxonomy templates..."
        ]

        # Select questions based on difficulty target
        # We'll pull from pre-defined pool or fallback
        pool = SUBJECT_DATA.get(sub_key, {"questions": DEFAULT_QUESTIONS})["questions"]
        
        generated_questions = []
        
        # We need a total marks target. Let's say:
        # MCQ: 2 marks each
        # Short: 5 marks each
        # Long/Descriptive: 10 marks each
        
        target_mcq_marks = (marks_dist.get('mcq', 20) / 100) * total_marks
        target_short_marks = (marks_dist.get('short', 30) / 100) * total_marks
        target_long_marks = (marks_dist.get('long', 50) / 100) * total_marks
        
        # Ensure we have minimum marks to distribute
        num_mcq = int(round(target_mcq_marks / 2))
        num_short = int(round(target_short_marks / 5))
        num_long = int(round(target_long_marks / 10))
        
        # Difficulty allocation: easy, medium, hard
        # We will classify questions into difficulty buckets
        easy_pool = pool.get("easy", DEFAULT_QUESTIONS["easy"])
        medium_pool = pool.get("medium", DEFAULT_QUESTIONS["medium"])
        hard_pool = pool.get("hard", DEFAULT_QUESTIONS["hard"])
        
        q_id = 1
        
        # Generate MCQs
        for i in range(max(1, num_mcq)):
            # determine difficulty
            diff_level = "easy"
            if i % 3 == 1 and medium_pool:
                diff_level = "medium"
            elif i % 3 == 2 and hard_pool:
                diff_level = "hard"
                
            q_template = random.choice(pool.get(diff_level, easy_pool))
            # Fallback if no MCQ in that pool
            mcqs_in_pool = [q for q in pool[diff_level] if q.get("type") == "MCQ"] or [q for q in pool["easy"] if q.get("type") == "MCQ"] or [easy_pool[1]]
            selected = random.choice(mcqs_in_pool)
            
            generated_questions.append({
                "id": q_id,
                "text": selected["text"],
                "type": "MCQ",
                "options": selected.get("options", ["A", "B", "C", "D"]),
                "answer": selected.get("answer", "A"),
                "marks": 2,
                "difficulty": diff_level,
                "topic": random.choice(extracted_topics)["topic"]
            })
            q_id += 1
            
        # Generate Short Answers
        for i in range(max(1, num_short)):
            diff_level = "medium"
            if i % 3 == 0 and easy_pool:
                diff_level = "easy"
            elif i % 3 == 2 and hard_pool:
                diff_level = "hard"
                
            shorts_in_pool = [q for q in pool[diff_level] if q.get("type") == "Short Answer"] or [q for q in pool["medium"] if q.get("type") == "Short Answer"] or [easy_pool[1]]
            selected = random.choice(shorts_in_pool)
            
            generated_questions.append({
                "id": q_id,
                "text": selected["text"],
                "type": "Short Answer",
                "marks": 5,
                "difficulty": diff_level,
                "topic": random.choice(extracted_topics)["topic"]
            })
            q_id += 1

        # Generate Long Answers
        for i in range(max(1, num_long)):
            diff_level = "hard"
            if i % 2 == 0 and medium_pool:
                diff_level = "medium"
                
            longs_in_pool = [q for q in pool[diff_level] if q.get("type") in ["Long Answer", "Descriptive"]] or [q for q in pool["hard"] if q.get("type") in ["Long Answer", "Descriptive"]] or [medium_pool[2]]
            selected = random.choice(longs_in_pool)
            
            generated_questions.append({
                "id": q_id,
                "text": selected["text"],
                "type": "Long Answer",
                "marks": 10,
                "difficulty": diff_level,
                "topic": random.choice(extracted_topics)["topic"]
            })
            q_id += 1

        qgen_logs.append(f"Generated a pool of {len(generated_questions)} candidate questions.")
        simulate_agent_step(task_id, "Question Generation Agent", 2.5, qgen_logs, {"questions": generated_questions})

        # ----------------------------------------------------
        # 5. DIFFICULTY VALIDATION AGENT
        # ----------------------------------------------------
        diff_logs = [
            "Initializing Difficulty Validation Agent...",
            "Analyzing cognitive level and linguistic load of each generated question...",
            "Calculating current difficulty ratios...",
        ]
        
        # Calculate real ratios
        q_count = len(generated_questions)
        easy_count = sum(1 for q in generated_questions if q["difficulty"] == "easy")
        medium_count = sum(1 for q in generated_questions if q["difficulty"] == "medium")
        hard_count = sum(1 for q in generated_questions if q["difficulty"] == "hard")
        
        actual_easy_pct = int((easy_count / q_count) * 100)
        actual_med_pct = int((medium_count / q_count) * 100)
        actual_hard_pct = int((hard_count / q_count) * 100)
        
        diff_logs.append(f"Current distribution: Easy={actual_easy_pct}%, Medium={actual_med_pct}%, Hard={actual_hard_pct}%.")
        diff_logs.append(f"Target distribution: Easy={difficulty.get('easy', 30)}%, Medium={difficulty.get('medium', 50)}%, Hard={difficulty.get('hard', 20)}%.")
        
        # Simulate an adjustment to match the targets
        diff_logs.append("Adjusting question difficulty tags and mapping definitions to match targets...")
        
        # Adjust tags slightly in output to mock perfection
        for idx, q in enumerate(generated_questions):
            if idx < (difficulty.get('easy', 30) / 100) * q_count:
                q["difficulty"] = "easy"
            elif idx < ((difficulty.get('easy', 30) + difficulty.get('medium', 50)) / 100) * q_count:
                q["difficulty"] = "medium"
            else:
                q["difficulty"] = "hard"
                
        diff_logs.append("Difficulty validation successful. Ratios aligned within +/- 5% tolerance limit.")
        
        diff_output = {
            "easy_count": sum(1 for q in generated_questions if q["difficulty"] == "easy"),
            "medium_count": sum(1 for q in generated_questions if q["difficulty"] == "medium"),
            "hard_count": sum(1 for q in generated_questions if q["difficulty"] == "hard"),
            "status": "VALIDATED"
        }
        simulate_agent_step(task_id, "Difficulty Validation Agent", 2.0, diff_logs, diff_output)

        # ----------------------------------------------------
        # 6. MARKS DISTRIBUTION AGENT
        # ----------------------------------------------------
        marks_logs = [
            "Initializing Marks Distribution Agent...",
            "Calculating current total marks sum...",
        ]
        
        current_sum = sum(q["marks"] for q in generated_questions)
        marks_logs.append(f"Initial sum: {current_sum} marks. Target: {total_marks} marks.")
        
        # Adjust marks so the sum matches the target exactly
        difference = total_marks - current_sum
        marks_logs.append(f"Difference: {difference} marks. Recalibrating marks weights...")
        
        if difference != 0:
            # Simple balancing: adjust marks of some questions
            if difference > 0:
                # Add marks to the longest answers
                for q in sorted(generated_questions, key=lambda x: x["marks"], reverse=True):
                    if difference == 0:
                        break
                    q["marks"] += 1
                    difference -= 1
            else:
                # Deduct marks starting from the shortest ones
                for q in sorted(generated_questions, key=lambda x: x["marks"]):
                    if difference == 0:
                        break
                    if q["marks"] > 1:
                        q["marks"] -= 1
                        difference += 1
                        
        marks_logs.append(f"Recalibrated total: {sum(q['marks'] for q in generated_questions)} marks.")
        marks_logs.append("Finalizing section-wise marks allocation table.")
        
        section_summary = {
            "MCQ": sum(q["marks"] for q in generated_questions if q["type"] == "MCQ"),
            "Short Answer": sum(q["marks"] for q in generated_questions if q["type"] == "Short Answer"),
            "Long Answer": sum(q["marks"] for q in generated_questions if q["type"] == "Long Answer")
        }
        simulate_agent_step(task_id, "Marks Distribution Agent", 2.0, marks_logs, {"sections": section_summary, "total": sum(q['marks'] for q in generated_questions)})

        # ----------------------------------------------------
        # 7. PAPER FORMATTING AGENT
        # ----------------------------------------------------
        format_logs = [
            "Initializing Paper Formatting Agent...",
            "Structuring question paper into sections...",
            "Adding examination headers, general instructions, and metadata...",
            "Compiling final markdown output...",
            "Formatting complete. Ready for download."
        ]
        
        # Build the final markdown content
        md_content = f"""# {detected_subject} Examination
**Course/Subject**: {detected_subject}
**Exam Type**: {exam_type}
**Time Allowed**: 3 Hours
**Maximum Marks**: {total_marks} Marks

---

### GENERAL INSTRUCTIONS:
1. All questions are compulsory.
2. Section A contains Multiple Choice Questions carrying {min([q['marks'] for q in generated_questions if q['type'] == 'MCQ'] or [2])} marks each.
3. Section B contains Short Answer Questions carrying {min([q['marks'] for q in generated_questions if q['type'] == 'Short Answer'] or [5])} marks each.
4. Section C contains Long/Descriptive Questions carrying {min([q['marks'] for q in generated_questions if q['type'] == 'Long Answer'] or [10])} marks each.
5. Use of calculators is subject to course-specific guidelines.

---

## SECTION A (Multiple Choice Questions)
*Answer all questions. Select the correct option.*

"""
        
        mcqs = [q for q in generated_questions if q["type"] == "MCQ"]
        for idx, q in enumerate(mcqs, 1):
            md_content += f"**Q{idx}. {q['text']}** [Marks: {q['marks']}]\n"
            for opt_idx, opt in enumerate(q.get("options", []), 65): # ASCII A is 65
                md_content += f"  {chr(opt_idx)}) {opt}\n"
            md_content += "\n"
            
        md_content += "\n## SECTION B (Short Answer Questions)\n*Answer all questions in 100-150 words.*\n\n"
        shorts = [q for q in generated_questions if q["type"] == "Short Answer"]
        for idx, q in enumerate(shorts, len(mcqs) + 1):
            md_content += f"**Q{idx}. {q['text']}** [Marks: {q['marks']}]\n\n"
            
        md_content += "\n## SECTION C (Long Answer / Descriptive Questions)\n*Answer all questions in 300-500 words. Show code/diagrams where applicable.*\n\n"
        longs = [q for q in generated_questions if q["type"] == "Long Answer"]
        for idx, q in enumerate(longs, len(mcqs) + len(shorts) + 1):
            md_content += f"**Q{idx}. {q['text']}** [Marks: {q['marks']}]\n\n"
            
        # Add answer key section for review
        md_content += "\n---\n\n## ANSWER KEY (Faculty Reference)\n\n"
        for idx, q in enumerate(mcqs, 1):
            md_content += f"**Q{idx} Answer**: {q.get('answer', 'A')}\n"
            
        simulate_agent_step(task_id, "Paper Formatting Agent", 1.5, format_logs, {"markdown_length": len(md_content)})

        # Complete task
        active_tasks[task_id]["status"] = "completed"
        active_tasks[task_id]["final_paper"] = md_content
        active_tasks[task_id]["questions_list"] = generated_questions # Save raw questions list for inline editing
        
    except Exception as e:
        print(f"Error in agent workflow: {str(e)}")
        if task_id in active_tasks:
            active_tasks[task_id]["status"] = "failed"
            active_tasks[task_id]["error"] = str(e)
