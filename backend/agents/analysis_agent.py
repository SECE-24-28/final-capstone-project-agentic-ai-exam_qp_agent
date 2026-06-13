import ollama


class AnalysisAgent:

    def analyze(self, text):

        prompt = f"""
You are an academic syllabus analyzer.

Analyze the following notes.

Return:

1. Main Topics
2. Important Concepts
3. Difficulty Level (Easy/Medium/Hard)
4. Question-worthy Areas

Notes:

{text[:6000]}
"""

        response = ollama.chat(
            model="hf.co/bartowski/Llama-3.2-1B-Instruct-GGUF:latest",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response["message"]["content"]