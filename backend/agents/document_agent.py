from pypdf import PdfReader


class DocumentAgent:

    def extract_pdf(self, file_path):

        text = ""

        reader = PdfReader(file_path)

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text