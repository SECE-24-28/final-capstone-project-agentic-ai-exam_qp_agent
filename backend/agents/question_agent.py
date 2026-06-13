import ollama

from agents.template_agent import TemplateAgent

template_agent = TemplateAgent()


class QuestionAgent:

    def generate_questions(
        self,
        context,
        template_name,
        one_marks,
        two_marks,
        three_marks,
        five_marks,
        seven_marks,
        ten_marks
    ):

        template_prompt = template_agent.load_prompt(
            template_name
        )

        prompt = f"""
{template_prompt}

Generate:

{one_marks} questions of 1 mark

{two_marks} questions of 2 marks

{three_marks} questions of 3 marks

{five_marks} questions of 5 marks

{seven_marks} questions of 7 marks

{ten_marks} questions of 10 marks

Use ONLY the context below.

Context:

{context}
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