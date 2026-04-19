from faster_whisper import WhisperModel

_model = None

def transcribe(file_path: str) -> str:
    global _model
    if _model is None:
        # "base" is fast and good enough; use "large-v2" for better Hungarian accuracy
        _model = WhisperModel("base", device="cpu", compute_type="int8")
    
    segments, _ = _model.transcribe(file_path, language="hu")
    return " ".join(segment.text.strip() for segment in segments)

if __name__ == "__main__":
    print(transcribe("upload/recording.webm"))
