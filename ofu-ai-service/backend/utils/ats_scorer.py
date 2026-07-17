"""
Loads fine-tuned DistilBERT and scores a resume text (0-100 ATS score).
Also generates rule-based improvement suggestions.
"""

import os, sys, re
import torch
import numpy as np
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import ATS_MODEL_PATH

DEVICE  = "cuda" if torch.cuda.is_available() else "cpu"
MAX_LEN = 256

_model     = None
_tokenizer = None


def _load():
    global _model, _tokenizer
    if _model is None:
        if not os.path.isdir(ATS_MODEL_PATH):
            raise FileNotFoundError(
                f"ATS model not found at {ATS_MODEL_PATH}. "
                "Run: python training/train_ats_model.py"
            )
        _tokenizer = DistilBertTokenizerFast.from_pretrained(ATS_MODEL_PATH)
        _model     = DistilBertForSequenceClassification.from_pretrained(ATS_MODEL_PATH).to(DEVICE)
        _model.eval()


def score(resume_text: str) -> dict:
    """
    Returns:
        score        : float 0-100
        grade        : "Low" | "Medium" | "High"
        confidence   : float 0-100
        probabilities: {low, medium, high} each 0-100
    """
    _load()

    enc = _tokenizer(
        resume_text, return_tensors="pt",
        truncation=True, padding=True, max_length=MAX_LEN
    ).to(DEVICE)

    with torch.no_grad():
        logits = _model(**enc).logits
        probs  = torch.softmax(logits, dim=1)[0].cpu().numpy()

    idx   = int(probs.argmax())
    grade = ["Low", "Medium", "High"][idx]

    # Weighted score: low→30, mid→65, high→95
    ats_score = round(float(probs[0] * 30 + probs[1] * 65 + probs[2] * 95), 1)

    return {
        "score":      ats_score,
        "grade":      grade,
        "confidence": round(float(probs[idx]) * 100, 1),
        "probabilities": {
            "low":    round(float(probs[0]) * 100, 1),
            "medium": round(float(probs[1]) * 100, 1),
            "high":   round(float(probs[2]) * 100, 1),
        },
    }


def improvements(meta: dict, skills: list, resume_text: str) -> list:
    """Rule-based ATS improvement suggestions based on resume metadata."""
    tips = []

    if not meta.get("has_email"):
        tips.append("Add your email address - ATS systems require contact info.")
    if not meta.get("has_phone"):
        tips.append("Add a phone number so recruiters can reach you.")
    if not meta.get("has_linkedin"):
        tips.append("Add your LinkedIn profile URL to boost credibility.")
    if not meta.get("has_github"):
        tips.append("Add your GitHub profile link (especially for tech roles).")
    if not meta.get("has_summary"):
        tips.append("Add a Professional Summary / Objective at the top - ATS tools look for it.")
    if not meta.get("has_experience"):
        tips.append("Work Experience section is missing or not clearly labeled.")
    if not meta.get("has_education"):
        tips.append("Education section is missing or not detected.")
    if not meta.get("has_certifications"):
        tips.append("Add certifications to increase ATS ranking.")
    if not meta.get("has_dates"):
        tips.append("Include dates (years) for your jobs and education - ATS expects them.")

    wc = meta.get("word_count", 0)
    if wc < 200:
        tips.append(f"Resume is too short ({wc} words). ATS favors 400-800 words.")
    elif wc > 1100:
        tips.append(f"Resume may be too long ({wc} words). Aim for 1-2 pages (about 800 words).")

    if len(skills) < 5:
        tips.append("Very few skills detected. Expand your Skills section with relevant keywords from the JD.")
    elif len(skills) > 35:
        tips.append("Trim your skill list - prioritize the most relevant skills for each role.")

    if not tips:
        tips.append("Resume covers all major ATS sections. Focus on tailoring keywords to each job description.")

    return tips
