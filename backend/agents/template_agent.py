class TemplateAgent:

    def load_prompt(self, template_name):

        mapping = {
            "anna": "prompts/anna_template.txt",
            "cbse": "prompts/cbse_template.txt",
            "school": "prompts/school_template.txt"
        }

        path = mapping.get(
            template_name,
            "prompts/school_template.txt"
        )

        with open(path, "r", encoding="utf-8") as f:
            return f.read()