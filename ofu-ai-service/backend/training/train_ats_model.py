"""
Fine-tunes DistilBERT on resume texts to predict ATS quality (0=Low, 1=Medium, 2=High).

Run:  python training/train_ats_model.py
"""

import os, sys, json, random
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForSequenceClassification,
    get_linear_schedule_with_warmup,
)
from torch.optim import AdamW
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import MODELS_DIR, ATS_MODEL_PATH

TRAIN_DATA = os.path.join(MODELS_DIR, "ats_train_data.json")
NUM_LABELS  = 3
MAX_LEN     = 256
BATCH_SIZE  = 16
EPOCHS      = 4
LR          = 2e-5
MAX_SAMPLES = 20_000          # cap so training doesn't take forever on CPU
DEVICE      = "cuda" if torch.cuda.is_available() else "cpu"


# ─── Dataset ─────────────────────────────────────────────────────────────────

class ResumeDataset(Dataset):
    def __init__(self, texts, labels, tokenizer):
        self.enc    = tokenizer(texts, truncation=True, padding=True,
                                max_length=MAX_LEN, return_tensors="pt")
        self.labels = torch.tensor(labels, dtype=torch.long)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {k: v[idx] for k, v in self.enc.items()}
        item["labels"] = self.labels[idx]
        return item


# ─── Training ─────────────────────────────────────────────────────────────────

def train():
    print(f"Device: {DEVICE}")
    print(f"Loading {TRAIN_DATA} …")

    with open(TRAIN_DATA) as f:
        data = json.load(f)

    texts  = [d["resume_text"] for d in data]
    labels = [d["ats_label"]   for d in data]

    # Cap dataset size
    if len(texts) > MAX_SAMPLES:
        combined = list(zip(texts, labels))
        random.shuffle(combined)
        combined = combined[:MAX_SAMPLES]
        texts, labels = zip(*combined)
        texts, labels = list(texts), list(labels)

    print(f"Training on {len(texts)} samples  (capped at {MAX_SAMPLES})")

    X_train, X_val, y_train, y_val = train_test_split(
        texts, labels, test_size=0.1, random_state=42, stratify=labels
    )
    print(f"Train: {len(X_train)}   Val: {len(X_val)}")

    tokenizer    = DistilBertTokenizerFast.from_pretrained("distilbert-base-uncased")
    train_loader = DataLoader(ResumeDataset(X_train, y_train, tokenizer),
                              batch_size=BATCH_SIZE, shuffle=True)
    val_loader   = DataLoader(ResumeDataset(X_val,   y_val,   tokenizer),
                              batch_size=BATCH_SIZE)

    model = DistilBertForSequenceClassification.from_pretrained(
        "distilbert-base-uncased", num_labels=NUM_LABELS
    ).to(DEVICE)

    optimizer     = AdamW(model.parameters(), lr=LR, weight_decay=0.01)
    total_steps   = len(train_loader) * EPOCHS
    scheduler     = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=max(1, total_steps // 10),
        num_training_steps=total_steps,
    )

    best_acc = 0.0
    os.makedirs(ATS_MODEL_PATH, exist_ok=True)

    for epoch in range(1, EPOCHS + 1):
        # ── train ──
        model.train()
        total_loss = 0.0
        for batch in train_loader:
            optimizer.zero_grad()
            out  = model(input_ids      = batch["input_ids"].to(DEVICE),
                         attention_mask = batch["attention_mask"].to(DEVICE),
                         labels         = batch["labels"].to(DEVICE))
            out.loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()
            total_loss += out.loss.item()

        avg_loss = total_loss / len(train_loader)

        # ── validate ──
        model.eval()
        preds_all, true_all = [], []
        with torch.no_grad():
            for batch in val_loader:
                out   = model(input_ids      = batch["input_ids"].to(DEVICE),
                              attention_mask = batch["attention_mask"].to(DEVICE))
                preds = torch.argmax(out.logits, dim=1).cpu().numpy()
                preds_all.extend(preds)
                true_all.extend(batch["labels"].numpy())

        acc = np.mean(np.array(preds_all) == np.array(true_all))
        print(f"Epoch {epoch}/{EPOCHS}  loss={avg_loss:.4f}  val_acc={acc:.4f}")

        if acc > best_acc:
            best_acc = acc
            model.save_pretrained(ATS_MODEL_PATH)
            tokenizer.save_pretrained(ATS_MODEL_PATH)
            print(f"  ✓ Best model saved  (val_acc={best_acc:.4f})")

    print("\nClassification Report (last epoch val set):")
    print(classification_report(true_all, preds_all,
                                target_names=["Low", "Medium", "High"]))
    print(f"\n✅  Training complete. Best val_acc = {best_acc:.4f}")
    print(f"    Model saved → {ATS_MODEL_PATH}")


if __name__ == "__main__":
    train()
