"""
Computes semantic match between resume and job description
using the fine-tuned Sentence Transformer.
"""

import os, sys
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import MATCHER_MODEL_PATH

_model = None


def _load():
    global _model
    if _model is None:
        if not os.path.isdir(MATCHER_MODEL_PATH):
            raise FileNotFoundError(
                f"Matcher model not found at {MATCHER_MODEL_PATH}. "
                "Run: python training/train_matcher.py"
            )
        _model = SentenceTransformer(MATCHER_MODEL_PATH)


def match(resume_skills: list, jd_skills: list,
          resume_text: str, jd_text: str) -> dict:
    """
    Returns:
        match_score      : 0-100 weighted score
        skill_similarity : 0-100 skill-text cosine sim
        text_similarity  : 0-100 full-text cosine sim
        keyword_overlap  : 0-100 exact keyword overlap %
        matched_skills   : skills present in both
        missing_skills   : JD skills absent from resume
        total_jd_skills  : how many distinct skills the JD requires
        matched_count    : how many of those the resume covers
    """
    _load()

    # Text representations
    rs_text = ", ".join(resume_skills) if resume_skills else resume_text[:600]
    jd_text_skills = ", ".join(jd_skills) if jd_skills else jd_text[:600]

    # Encode
    emb_rs  = _model.encode([rs_text])
    emb_jds = _model.encode([jd_text_skills])
    emb_rf  = _model.encode([resume_text[:1000]])
    emb_jdf = _model.encode([jd_text[:1000]])

    skill_sim = float(cosine_similarity(emb_rs,  emb_jds)[0][0])
    text_sim  = float(cosine_similarity(emb_rf,  emb_jdf)[0][0])

    # Exact keyword overlap
    rs_set  = {s.lower() for s in resume_skills}
    jd_set  = {s.lower() for s in jd_skills}
    overlap = (len(rs_set & jd_set) / len(jd_set)) if jd_set else 0.0

    # Weighted final
    final = 0.45 * skill_sim + 0.35 * text_sim + 0.20 * overlap
    final = min(final, 1.0)

    matched = sorted(rs_set & jd_set)
    missing = sorted(jd_set - rs_set)

    return {
        "match_score":      round(final * 100, 1),
        "skill_similarity": round(skill_sim * 100, 1),
        "text_similarity":  round(text_sim  * 100, 1),
        "keyword_overlap":  round(overlap   * 100, 1),
        "matched_skills":   [s.title() for s in matched],
        "missing_skills":   [s.title() for s in missing],
        "total_jd_skills":  len(jd_set),
        "matched_count":    len(matched),
    }
