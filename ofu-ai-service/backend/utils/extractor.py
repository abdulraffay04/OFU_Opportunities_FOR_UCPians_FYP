"""
Extracts text from PDF / DOCX / TXT files.
Extracts skills using spaCy NLP + ESCO skill vocabulary.
"""

import os, re, sys
import pandas as pd
import fitz          # PyMuPDF
import docx
import spacy

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import SKILLS_CSV

# ─── spaCy ────────────────────────────────────────────────────────────────────
# Uses en_core_web_sm if installed; falls back to a blank English model.
# The blank model won't give NER, but vocabulary matching still runs fine.

try:
    nlp = spacy.load("en_core_web_sm")
    _SPACY_NER = True
except OSError:
    try:
        nlp = spacy.blank("en")          # lightweight fallback
    except Exception:
        nlp = None
    _SPACY_NER = False

# ─── ESCO skill vocabulary ────────────────────────────────────────────────────

def _build_vocab():
    df  = pd.read_csv(SKILLS_CSV, low_memory=False, on_bad_lines="skip")
    vocab = set()
    for lbl in df["preferredLabel"].dropna():
        vocab.add(str(lbl).lower().strip())
    for row in df["altLabels"].dropna():
        for alt in str(row).split("\n"):
            t = alt.strip().lower()
            if t:
                vocab.add(t)
    # Remove noise: single chars, stopwords
    vocab = {v for v in vocab if len(v) > 2}
    return vocab

SKILL_VOCAB = _build_vocab()

# Pre-sort longest first so multi-word skills match before sub-strings
_SORTED_VOCAB = sorted(SKILL_VOCAB, key=len, reverse=True)


# ─── File reading ─────────────────────────────────────────────────────────────

def extract_text(filepath: str) -> str:
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".pdf":
        return _read_pdf(filepath)
    elif ext == ".docx":
        return _read_docx(filepath)
    elif ext == ".txt":
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    raise ValueError(f"Unsupported file type: {ext}")


def _read_pdf(path: str) -> str:
    text = ""
    with fitz.open(path) as doc:
        for page in doc:
            text += page.get_text()
    return text


def _read_docx(path: str) -> str:
    d = docx.Document(path)
    return "\n".join(p.text for p in d.paragraphs)


# ─── Skill extraction ─────────────────────────────────────────────────────────

def extract_skills(text: str) -> list:
    """Return sorted unique list of skills found in text."""
    text_lower = text.lower()
    found = set()

    # 1. Vocabulary match (longest-first prevents false sub-string hits)
    for skill in _SORTED_VOCAB:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            found.add(skill.title())

    # 2. spaCy entity recognition for extra coverage (only if full model loaded)
    if _SPACY_NER and nlp is not None:
        doc = nlp(text[:80_000])
        for ent in doc.ents:
            if ent.label_ in ("ORG", "PRODUCT", "WORK_OF_ART"):
                cand = ent.text.strip()
                if 2 < len(cand) < 50 and cand.lower() in SKILL_VOCAB:
                    found.add(cand.title())

    return sorted(found)


# ─── Contact / structure info (used for ATS hints) ────────────────────────────

def extract_meta(text: str) -> dict:
    return {
        "has_email":          bool(re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}", text)),
        "has_phone":          bool(re.search(r"(\+?\d[\d\s\-(). ]{6,}\d)", text)),
        "has_linkedin":       bool(re.search(r"linkedin\.com", text, re.I)),
        "has_github":         bool(re.search(r"github\.com",   text, re.I)),
        "has_summary":        bool(re.search(r"\b(summary|objective|profile|about me)\b", text, re.I)),
        "has_experience":     bool(re.search(r"\b(experience|work history|employment|worked at)\b", text, re.I)),
        "has_education":      bool(re.search(r"\b(education|degree|university|college|bachelor|master|b\.?tech|m\.?tech|phd)\b", text, re.I)),
        "has_certifications": bool(re.search(r"\b(certif|certified|license|accredited)\b", text, re.I)),
        "has_dates":          bool(re.search(r"\b(19|20)\d{2}\b", text)),
        "word_count":         len(text.split()),
    }
