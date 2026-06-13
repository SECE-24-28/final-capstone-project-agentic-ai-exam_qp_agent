class PaperAgent:

    def build_paper(
        self,
        subject,
        total_marks,
        template_name,
        generated_questions
    ):

        paper = f"""
==================================================

QUESTION PAPER

Subject : {subject}

Pattern : {template_name.upper()}

Total Marks : {total_marks}

==================================================

{generated_questions}

==================================================
END OF QUESTION PAPER
==================================================
"""

        return paper