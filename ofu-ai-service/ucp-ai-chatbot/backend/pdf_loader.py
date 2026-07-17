import os

from pypdf import PdfReader

from config import Config


def extract_pdf_text(pdf_path):

    text = ""

    try:

        reader = PdfReader(pdf_path)

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

    except Exception as e:

        print(
            f"Error reading {pdf_path}: {e}"
        )

    return text


def load_all_pdfs():

    documents = []

    pdf_folder = Config.PDF_FOLDER

    if not os.path.exists(pdf_folder):

        print("PDF folder not found")

        return []

    for file in os.listdir(pdf_folder):

        if file.endswith(".pdf"):

            pdf_path = os.path.join(
                pdf_folder,
                file
            )

            print(
                f"Loading: {file}"
            )

            text = extract_pdf_text(
                pdf_path
            )

            documents.append(
                {
                    "filename": file,
                    "content": text
                }
            )

    return documents