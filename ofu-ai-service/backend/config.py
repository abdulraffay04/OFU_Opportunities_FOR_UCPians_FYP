import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR    = os.path.join(BASE_DIR, "data")
MODELS_DIR  = os.path.join(BASE_DIR, "models")
UPLOAD_DIR  = os.path.join(BASE_DIR, "uploads")

RESUME_CSV  = os.path.join(DATA_DIR, "resume_data.csv")
COURSES_CSV = os.path.join(DATA_DIR, "courses.csv")
SKILLS_CSV  = os.path.join(DATA_DIR, "skills_en.csv")

ATS_MODEL_PATH     = os.path.join(MODELS_DIR, "ats_distilbert")
MATCHER_MODEL_PATH = os.path.join(MODELS_DIR, "matcher_sentence_transformer")

ALLOWED_EXTENSIONS    = {"pdf", "docx", "txt"}
MAX_COURSES           = 5
MAX_SKILL_RECS        = 10
