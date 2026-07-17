import os
from dotenv import load_dotenv

load_dotenv()

class Config:

    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    MODEL_NAME = os.getenv(
        "MODEL_NAME",
        "llama-3.3-70b-versatile"
    )

    CHROMA_DB_PATH = os.getenv(
        "CHROMA_DB_PATH",
        "backend/chroma_db"
    )

    PDF_FOLDER = os.getenv(
        "PDF_FOLDER",
        "backend/pdfs"
    )

    FLASK_HOST = os.getenv(
        "FLASK_HOST",
        "0.0.0.0"
    )

    FLASK_PORT = int(
        os.getenv(
            "FLASK_PORT",
            5000
        )
    )