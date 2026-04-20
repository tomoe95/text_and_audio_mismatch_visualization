import subprocess, sys, json

def get_text_sentiment(text: str) -> dict:
    result = subprocess.run(
        [sys.executable, "text_worker.py"],
        input=text,
        capture_output=True,
        text=True,
        timeout=60,
    )
    if result.returncode != 0:
        raise RuntimeError(f"text_worker failed: {result.stderr}")
    return json.loads(result.stdout)

