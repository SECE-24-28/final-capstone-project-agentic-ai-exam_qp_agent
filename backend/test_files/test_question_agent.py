from agents.question_agent import QuestionAgent
from rag.retriever import retrieve_context

agent = QuestionAgent()

context = retrieve_context(
    "machine learning"
)

paper = agent.generate_questions(
    context=context,
    template_name="anna",
    one_marks=3,
    two_marks=2,
    three_marks=2,
    five_marks=1,
    seven_marks=1,
    ten_marks=1
)

print(paper)