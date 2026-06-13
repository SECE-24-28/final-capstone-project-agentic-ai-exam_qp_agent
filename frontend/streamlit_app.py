import streamlit as st
import requests

st.set_page_config(
    page_title="Question Paper Agent",
    layout="wide"
)

st.title("📚 Agentic AI Question Paper Generator")

uploaded_file = st.file_uploader(
    "Upload Notes PDF",
    type=["pdf"]
)

subject = st.text_input(
    "Subject Name"
)

template_name = st.selectbox(
    "Template",
    [
        "anna university",
        "cbse",
        "school"
    ]
)

total_marks = st.number_input(
    "Total Marks",
    value=100
)

col1, col2 = st.columns(2)

with col1:

    one_marks = st.number_input(
        "1 Mark Questions",
        value=5
    )

    two_marks = st.number_input(
        "2 Mark Questions",
        value=5
    )

    three_marks = st.number_input(
        "3 Mark Questions",
        value=3
    )

with col2:

    five_marks = st.number_input(
        "5 Mark Questions",
        value=3
    )

    seven_marks = st.number_input(
        "7 Mark Questions",
        value=2
    )

    ten_marks = st.number_input(
        "10 Mark Questions",
        value=1
    )

if st.button("Generate Question Paper"):

    if uploaded_file:

        files = {
            "file": uploaded_file
        }

        data = {

            "subject": subject,

            "template_name": template_name,

            "total_marks": total_marks,

            "one_marks": one_marks,

            "two_marks": two_marks,

            "three_marks": three_marks,

            "five_marks": five_marks,

            "seven_marks": seven_marks,

            "ten_marks": ten_marks
        }

        response = requests.post(
            "http://127.0.0.1:8000/generate-paper",
            files=files,
            data=data
        )

        result = response.json()

        st.subheader(
            "Analysis"
        )

        st.write(
            result["analysis"]
        )

        st.subheader(
            "Question Paper"
        )

        st.text_area(
            "",
            result["question_paper"],
            height=700
        )