"""
Fine-tunes Sentence-Transformer (all-MiniLM-L6-v2) with CosineSimilarityLoss
so it learns to score how well resume skills match JD skills.

Run:  python training/train_matcher.py
"""

import os, sys, json, random
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import MODELS_DIR, MATCHER_MODEL_PATH

TRAIN_DATA  = os.path.join(MODELS_DIR, "matcher_train_data.json")
BASE_MODEL  = "sentence-transformers/all-MiniLM-L6-v2"
EPOCHS      = 3
BATCH_SIZE  = 32
WARMUP      = 100
MAX_SAMPLES = 15_000


def train():
    print(f"Loading {TRAIN_DATA} …")
    with open(TRAIN_DATA) as f:
        records = json.load(f)

    random.shuffle(records)
    if len(records) > MAX_SAMPLES:
        records = records[:MAX_SAMPLES]

    examples = []
    for r in records:
        rs = r["resume_skills"].strip()
        js = r["jd_skills"].strip()
        if rs and js:
            examples.append(InputExample(texts=[rs, js], label=float(r["match_score"])))

    print(f"Training pairs: {len(examples)}")

    model       = SentenceTransformer(BASE_MODEL)
    loader      = DataLoader(examples, shuffle=True, batch_size=BATCH_SIZE)
    loss_fn     = losses.CosineSimilarityLoss(model)

    os.makedirs(MATCHER_MODEL_PATH, exist_ok=True)

    model.fit(
        train_objectives=[(loader, loss_fn)],
        epochs=EPOCHS,
        warmup_steps=WARMUP,
        output_path=MATCHER_MODEL_PATH,
        show_progress_bar=True,
    )

    print(f"\n✅  Matcher model saved → {MATCHER_MODEL_PATH}")


if __name__ == "__main__":
    train()
