"""
Recommends courses from courses.csv that cover the most missing skills,
ranked by cosine similarity between missing-skill text and course skill text.
"""

import os, sys
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import COURSES_CSV, MATCHER_MODEL_PATH, MAX_COURSES

_model       = None
_courses_df  = None
_course_embs = None


def _parse_skills(val):
    """Parse the messy JSON-like skills column in courses.csv."""
    if pd.isna(val):
        return []
    try:
        cleaned = str(val).strip('{}').replace('""', '"')
        items   = [s.strip().strip('"').strip() for s in cleaned.split(",")]
        return [i for i in items if i]
    except Exception:
        return []


def _load():
    global _model, _courses_df, _course_embs
    if _model is None:
        _model = SentenceTransformer(MATCHER_MODEL_PATH)
    if _courses_df is None:
        df = pd.read_csv(COURSES_CSV, on_bad_lines="skip")
        df["skills_list"] = df["skills"].apply(_parse_skills)
        df["skills_text"] = df["skills_list"].apply(lambda x: ", ".join(x))
        df = df[df["skills_text"].str.len() > 0].reset_index(drop=True)
        _courses_df  = df
        _course_embs = _model.encode(df["skills_text"].tolist(), show_progress_bar=False)


def recommend(missing_skills: list, top_n: int = None) -> list:
    """
    Returns list of course objects sorted by relevance to missing skills.
    """
    _load()
    if not missing_skills:
        return []
    if top_n is None:
        top_n = MAX_COURSES

    query_text = ", ".join(missing_skills)
    query_emb  = _model.encode([query_text])
    sims       = cosine_similarity(query_emb, _course_embs)[0]
    top_idx    = np.argsort(sims)[::-1][:top_n]

    results = []
    for idx in top_idx:
        row    = _courses_df.iloc[idx]
        c_skls = row["skills_list"]
        covered = [s for s in missing_skills
                   if any(s.lower() in cs.lower() for cs in c_skls)]

        results.append({
            "course":           str(row.get("course", "")).strip(),
            "provider":         str(row.get("partner", "")).strip(),
            "rating":           str(row.get("rating", "N/A")),
            "level":            str(row.get("level", "")).strip(),
            "duration":         str(row.get("duration", "")).strip(),
            "certificate_type": str(row.get("certificatetype", "")).strip(),
            "skills_covered":   covered,
            "all_skills":       c_skls[:8],
            "similarity":       round(float(sims[idx]) * 100, 1),
        })

    return results
