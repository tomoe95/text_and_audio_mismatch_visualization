import os
import asyncio
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import transformers

from hume_setup import stream_file
from emotion_engine import (
        collapse_hume_to_4_emotions, 
        collapse_nytk_to_4emotions, 
        calculate_mismatch
    )
from text import get_text_sentiment

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Server is running"}

@app.post("/analyze")
async def create_upload_file(file: UploadFile = File(...), transcript: str=""):
    ## 1. save uplad audio
    # file: UploadFile automatically handles the multipart/form-data
    upload_directory = "upload"
    if not os.path.exists(upload_directory) :
        os.makedirs(upload_directory)

    file_path = os.path.join(upload_directory, file.filename)

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    ## 2. run hume and nytk in  parallel
    try:
        hume_raw, nytk_raw = await asyncio.gather(
                stream_file(file_path),
                asyncio.to_thread(get_text_sentiment, transcript) if transcript
                else asyncio.sleep(0, result=None),
            )
    except Exception as e:
        return {
                "status": "error",
                "message": str(e),
            }

    ## 3. collapse to 4 emotions
    audio_emotions = collapse_hume_to_4_emotions(hume_raw)

    if not transcript or nytk_raw is None:
        return {
                "status": "partial",
                "note": "No transcript provided (I will add feature later)",
                "audio_emotions": audio_emotions,
                "hume_raw": hume_raw[:10], # top 10 for debuging
            }

    text_emotions = collapse_nytk_to_4emotions(nytk_raw)

    ## 4. calculate mismath
    mismatch = calculate_mismatch(audio_emotions, text_emotions)

    ## 5. return everything
    return {
            "status": "ok",
            "transcript": transcript,
            "audio_emotions": audio_emotions,
            "text_emotions": text_emotions,
            "hume_raw": hume_raw,
            "mismatch": mismatch,
    }



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
