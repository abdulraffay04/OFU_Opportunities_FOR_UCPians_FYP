"""
Reads resume_data.csv and builds two training datasets:
  1. ats_train_data.json   → (resume_text, label)  label=0/1/2
  2. matcher_train_data.json → (resume_skills, jd_skills, match_score)

Run:  python training/prepare_data.py
"""

import os, sys, ast, json
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import RESUME_CSV, MODELS_DIR

os.makedirs(MODELS_DIR, exist_ok=True)


# ─── helpers ────────────────────────────────────────────────────────────────

def safe_list(val):
    """Parse a Python-list string like "['Python','SQL']" → ['Python','SQL']."""
    if pd.isna(val) or str(val).strip() in ("", "None", "N/A", "nan"):
        return []
    try:
        result = ast.literal_eval(str(val))
        if isinstance(result, list):
            return [s.strip() for s in result if s and str(s).strip() not in ("None", "N/A")]
        return [str(result).strip()]
    except Exception:
        return [str(val).strip()]


def build_resume_text(row):
    parts = []

    obj = str(row.get("career_objective", "")).strip()
    if obj and obj not in ("nan", "None", "N/A"):
        parts.append(obj)

    skills = safe_list(row.get("skills"))
    if skills:
        parts.append("Skills: " + ", ".join(skills))

    degrees = safe_list(row.get("degree_names"))
    if degrees:
        parts.append("Education: " + ", ".join(degrees))

    majors = safe_list(row.get("major_field_of_studies"))
    if majors:
        parts.append("Major: " + ", ".join(majors))

    positions = safe_list(row.get("positions"))
    if positions:
        parts.append("Positions: " + ", ".join(positions))

    resp = str(row.get("responsibilities", "")).strip()
    if resp and resp not in ("nan", "None"):
        parts.append("Responsibilities: " + resp[:400])

    certs = safe_list(row.get("certification_skills"))
    if certs:
        parts.append("Certifications: " + ", ".join(certs))

    langs = safe_list(row.get("languages"))
    if langs:
        parts.append("Languages: " + ", ".join(langs))

    return " | ".join(parts)


def score_to_label(score):
    try:
        s = float(score)
    except (ValueError, TypeError):
        return 1
    if s >= 0.75:
        return 2   # High
    elif s >= 0.45:
        return 1   # Medium
    return 0       # Low


# ─── ATS data ────────────────────────────────────────────────────────────────

def prepare_ats_data():
    print("[1/2] Building ATS training data …")
    df = pd.read_csv(RESUME_CSV, on_bad_lines="skip", low_memory=False)
    print(f"      Raw rows: {len(df)}")

    df["resume_text"] = df.apply(build_resume_text, axis=1)
    df["ats_label"]   = df["matched_score"].apply(score_to_label)

    df = df[df["resume_text"].str.len() > 50].dropna(subset=["resume_text", "ats_label"])
    print(f"      After filter: {len(df)} usable rows")

    records = df[["resume_text", "ats_label"]].to_dict(orient="records")
    out = os.path.join(MODELS_DIR, "ats_train_data.json")
    with open(out, "w") as f:
        json.dump(records, f)
    print(f"      Saved → {out}")

    dist = df["ats_label"].value_counts().to_dict()
    print(f"      Label distribution: Low={dist.get(0,0)}  Mid={dist.get(1,0)}  High={dist.get(2,0)}")


# ─── Matcher data ─────────────────────────────────────────────────────────────

def prepare_matcher_data():
    print("[2/2] Building Matcher training data …")
    df = pd.read_csv(RESUME_CSV, on_bad_lines="skip", low_memory=False)

    records = []
    for _, row in df.iterrows():
        resume_skills = safe_list(row.get("skills"))
        jd_skills     = safe_list(row.get("skills_required"))
        try:
            score = float(row.get("matched_score", 0.5))
        except (ValueError, TypeError):
            score = 0.5

        if resume_skills and jd_skills:
            records.append({
                "resume_skills": ", ".join(resume_skills),
                "jd_skills":     ", ".join(jd_skills),
                "match_score":   round(score, 4),
            })

    out = os.path.join(MODELS_DIR, "matcher_train_data.json")
    with open(out, "w") as f:
        json.dump(records, f)
    print(f"      Saved → {out}  ({len(records)} pairs)")


# ─── main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    prepare_ats_data()
    print()
    prepare_matcher_data()
    print("\n✅  Data preparation complete.")
