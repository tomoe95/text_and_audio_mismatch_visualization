# text_worker.py — run as a subprocess, never imported directly
# to prevent mac OS crash
import os, sys, json

os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

import torch
torch.set_num_threads(1)
torch.set_num_interop_threads(1)

from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F

model_name = "NYTK/sentiment-ohb3-hubert-hungarian"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)
model.eval()
labels = [model.config.id2label[i] for i in range(len(model.config.id2label))]

text = sys.stdin.read().strip()
inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=256)
with torch.no_grad():
    logits = model(**inputs).logits
probs = F.softmax(logits, dim=-1)[0]
result = {labels[i].upper(): round(float(probs[i]), 6) for i in range(len(labels))}
print(json.dumps(result))
