"""
DEBUG version of app.py
Replace your app.py with this temporarily.
Every step prints to the terminal so you can see exactly where it fails.
"""

import os, sys, traceback, io
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Fix Windows encoding so special characters don't crash the server
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import UPLOAD_DIR, ALLOWED_EXTENSIONS

from utils.extractor          import extract_text, extract_skills, extract_meta
from utils.ats_scorer         import score as ats_score, improvements as ats_improvements
from utils.matcher            import match as compute_match
from utils.skill_advisor      import recommend as skill_recommend
from utils.course_recommender import recommend as course_recommend

app = Flask(__name__)
CORS(app)
app.config["UPLOAD_FOLDER"]      = UPLOAD_DIR
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024
app.config["JSON_AS_ASCII"]      = False

os.makedirs(UPLOAD_DIR, exist_ok=True)


def _allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/analyze", methods=["POST"])
def analyze():
    resume_path = None
    try:
        print("\n" + "="*60)
        print("STEP 1: Request received")
        print("  Files :", list(request.files.keys()))
        print("  Form  :", list(request.form.keys()))

        # ── validate ──────────────────────────────────────────────────────
        if "resume" not in request.files:
            print("  ERROR: 'resume' key missing from files")
            return jsonify({"error": "resume file is required"}), 400

        f = request.files["resume"]
        print(f"  File  : name='{f.filename}'  content_type='{f.content_type}'")

        if not f or f.filename == "":
            return jsonify({"error": "no file selected"}), 400
        if not _allowed(f.filename):
            return jsonify({"error": "unsupported file type - use PDF, DOCX, or TXT"}), 400

        jd_text = request.form.get("job_description", "").strip()
        print(f"  JD    : {len(jd_text)} characters")

        # ── save ──────────────────────────────────────────────────────────
        print("\nSTEP 2: Saving file")
        filename    = secure_filename(f.filename)
        resume_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        f.save(resume_path)
        size = os.path.getsize(resume_path)
        print(f"  Saved : {resume_path}  ({size} bytes)")

        if size == 0:
            return jsonify({"error": "uploaded file is empty - 0 bytes received"}), 400

        # ── extract text ──────────────────────────────────────────────────
        print("\nSTEP 3: Extracting text")
        resume_text = extract_text(resume_path)
        print(f"  Length: {len(resume_text)} chars")
        print(f"  Preview: {repr(resume_text[:150])}")

        if len(resume_text.strip()) < 40:
            return jsonify({
                "error": f"could not extract meaningful text - only got {len(resume_text.strip())} chars. "
                         f"Make sure the file has actual text content."
            }), 400

        # ── extract skills ────────────────────────────────────────────────
        print("\nSTEP 4: Extracting skills")
        resume_skills = extract_skills(resume_text)
        print(f"  Resume skills ({len(resume_skills)}): {resume_skills[:8]}")

        jd_skills = []
        if jd_text:
            jd_skills = extract_skills(jd_text)
            print(f"  JD skills ({len(jd_skills)}): {jd_skills[:8]}")

        meta = extract_meta(resume_text)
        print(f"  Meta  : {meta}")

        # ── ATS score ─────────────────────────────────────────────────────
        print("\nSTEP 5: ATS scoring")
        ats_result = ats_score(resume_text)
        print(f"  ATS   : {ats_result}")

        improve_tips = ats_improvements(meta, resume_skills, resume_text)
        print(f"  Tips  : {len(improve_tips)} suggestions")

        # ── match ─────────────────────────────────────────────────────────
        match_result = None
        skill_recs   = []
        course_recs  = []

        if jd_text:
            print("\nSTEP 6: JD matching")
            match_result = compute_match(resume_skills, jd_skills, resume_text, jd_text)
            print(f"  Match : {match_result}")

            missing = match_result.get("missing_skills", [])
            print(f"  Missing skills ({len(missing)}): {missing[:6]}")

            print("\nSTEP 7: Skill recommendations")
            skill_recs = skill_recommend(missing, jd_text)
            print(f"  Recs  : {len(skill_recs)}")

            print("\nSTEP 8: Course recommendations")
            course_recs = course_recommend(missing)
            print(f"  Courses: {len(course_recs)}")

        # ── respond ───────────────────────────────────────────────────────
        print("\nSTEP 9: Building response")
        resp = {
            "success":               True,
            "resume_skills":         resume_skills,
            "jd_skills":             jd_skills,
            "contact_info":          meta,
            "ats":                   ats_result,
            "improvements":          improve_tips,
            "match":                 match_result,
            "skill_recommendations": skill_recs,
            "courses":               course_recs,
        }
        print("  Sending 200 OK")
        print("=" * 60 + "\n")
        return jsonify(resp)

    except FileNotFoundError as e:
        print(f"\nFILENOTFOUND ERROR: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 503

    except Exception as e:
        print(f"\nUNHANDLED EXCEPTION: {type(e).__name__}: {e}")
        traceback.print_exc()
        return jsonify({"error": f"{type(e).__name__}: {str(e)}"}), 500

    finally:
        if resume_path and os.path.exists(resume_path):
            os.remove(resume_path)
            print(f"  Cleaned up temp file: {resume_path}")


if __name__ == "__main__":
    print("\n  Resume Analyzer API  [DEBUG MODE]")
    print("   POST http://localhost:8000/analyze")
    print("   GET  http://localhost:8000/health\n")
    app.run(debug=False, host="0.0.0.0", port=8000)