import os

# --- macOS / Apple Silicon Crash Fixes ---
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"
os.environ["No_PROXY"] = "*" # prevent proxy related thread

import torch
# Force PyTorch to single-thread
torch.set_num_threads(1)
torch.set_num_interop_threads(1)

from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch.nn.functional as F

# Global cache
_tokenizer = None
_model = None
_labels = None

def _load_model():
    global _tokenizer, _model, _labels

    if _model is None:
        print("Loading NYTK model into memory...")
        model_name = "NYTK/sentiment-ohb3-hubert-hungarian"
        
        _tokenizer = AutoTokenizer.from_pretrained(model_name)
        _model = AutoModelForSequenceClassification.from_pretrained(model_name)
        _model.eval()

        # get label order from model config
        _labels = [
                _model.config.id2label[i] for i in range(len(_model.config.id2label))
            ]
        print(f"Model loaded. Labels: {_labels}")


def get_text_sentiment(text: str) -> dict:
    _load_model()

    inputs = _tokenizer(text, return_tensors="pt", truncation=True, max_length=512)

    with torch.no_grad():
        logits = _model(**inputs).logits

    probs = F.softmax(logits, dim=-1)[0]

    # Return a clean dictionary for your math engine
    return {
        label.upper(): round(float(probs[i]),6) for i, label in enumerate(_labels)
    }

# --- This block only runs if you execute text.py directly for testing ---
if __name__ == "__main__":
    print("Testing locally...")
    print(get_text_sentiment("Köszönöm"))
    
    print(get_text_sentiment("Ez szörnyű."))
