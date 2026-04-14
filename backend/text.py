import os

# --- macOS / Apple Silicon Crash Fixes ---
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

import torch
from transformers import pipeline

# Force PyTorch to single-thread
torch.set_num_threads(1)

# Global variable to store the model in memory
_sentiment_pipeline = None

def get_text_sentiment(text: str) -> dict:
    global _sentiment_pipeline
    
    # Only load the model if it hasn't been loaded yet
    if _sentiment_pipeline is None:
        print("Loading NYTK NLP model into memory...")
        _sentiment_pipeline = pipeline(
            task="sentiment-analysis",
            model="NYTK/sentiment-ohb3-hubert-hungarian",
            device="cpu" # Crucial for Mac
        )
        
    # Run the text through the AI
    result = _sentiment_pipeline(text)[0]
    
    # Return a clean dictionary for your math engine
    return {
        "label": result["label"],
        "score": round(result["score"], 4)
    }

# --- This block only runs if you execute text.py directly for testing ---
if __name__ == "__main__":
    print("Testing locally...")
    print(get_text_sentiment("Köszönöm"))
    
    print(get_text_sentiment("Ez szörnyű."))
