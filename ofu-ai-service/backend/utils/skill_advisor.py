"""
For each missing skill, finds it in the ESCO KB,
adds a description, and ranks by relevance to the JD.
"""

import os, sys
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import SKILLS_CSV, MATCHER_MODEL_PATH, MAX_SKILL_RECS

_model    = None
_kb       = None   # DataFrame: preferredLabel, skillType, description


def _load():
    global _model, _kb
    if _model is None:
        _model = SentenceTransformer(MATCHER_MODEL_PATH)
    if _kb is None:
        df  = pd.read_csv(SKILLS_CSV, low_memory=False, on_bad_lines="skip")
        _kb = df[["preferredLabel", "skillType", "description"]].dropna(subset=["preferredLabel"])


def recommend(missing_skills: list, jd_text: str, top_n: int = None) -> list:
    """
    Returns list of skill objects:
        skill, type, description, relevance (0-100), priority (High/Medium/Low)
    """
    _load()
    if not missing_skills:
        return []
    if top_n is None:
        top_n = MAX_SKILL_RECS

    jd_emb = _model.encode([jd_text[:500]])[0]
    seen   = set()
    results = []

    for skill in missing_skills[:25]:   # cap to keep it fast
        sk_lower = skill.lower()
        if sk_lower in seen:
            continue
        seen.add(sk_lower)

        # Look up in ESCO KB
        row_match = _kb[_kb["preferredLabel"].str.lower() == sk_lower]

        skill_emb  = _model.encode([skill])[0]
        relevance  = float(cosine_similarity([jd_emb], [skill_emb])[0][0])

        if not row_match.empty:
            row = row_match.iloc[0]
            s_type = str(row.get("skillType", "skill/competence"))
            s_desc = str(row.get("description", ""))[:220]
        else:
            s_type = "skill/competence"
            s_desc = f"Skill required for this role: {skill}"

        results.append({
            "skill":       skill.title(),
            "type":        s_type,
            "description": s_desc,
            "relevance":   round(relevance * 100, 1),
            "priority":    "High" if relevance >= 0.7 else "Medium" if relevance >= 0.45 else "Low",
        })

    results.sort(key=lambda x: x["relevance"], reverse=True)
    return results[:top_n]
