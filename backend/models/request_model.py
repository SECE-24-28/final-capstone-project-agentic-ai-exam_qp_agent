from pydantic import BaseModel


class QuestionPaperRequest(BaseModel):

    subject: str

    template_name: str

    total_marks: int

    one_marks: int

    two_marks: int

    three_marks: int

    five_marks: int

    seven_marks: int

    ten_marks: int