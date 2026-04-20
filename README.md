# Text and Audio Emotion Mismatch Visualization

A web application that analyzes the emotional mismatch between spoken audio and transcribed text. Built with React (frontend) and FastAPI (backend).

## Project Status

**Work in Progress** - This project is under active development.

### Current Features
- Record audio through the browser
- Analyze audio emotions using Hume AI
- Analyze text emotions using NYTK (Hungarian sentiment analysis)
- Normalize both outputs to a shared 4-emotion schema (joy, optimism, anger, sadness)
- Calculate and visualize emotion mismatch between audio and text

### Planned Features
- Automatic speech-to-text transcription (currently requires manual transcript input)
- Enhanced mismatch visualization
- Support for additional languages beyond Hungarian

## Architecture

```
┌─────────────────┐     ┌─────────────────────────────────────────┐
│   React Frontend│     │           FastAPI Backend               │
│   (Vite + Babel)│────▶│  - Hume AI (audio emotion analysis)     │
│                 │     │  - NYTK (text sentiment analysis)       │
│                 │     │  - Whisper (transcription - planned)    │
└─────────────────┘     └─────────────────────────────────────────┘
```

## Emotion Mapping

Both audio and text emotions are normalized to 4 categories:

| Audio (Hume) | Text (NYTK) |
|--------------|-------------|
| Joy, Amusement, Excitement, etc. | POSITIVE → joy + optimism |
| Admiration, Hope, Love, etc. | NEUTRAL → mostly sadness |
| Anger, Contempt, Disgust, etc. | NEGATIVE → anger + sadness |
| Anxiety, Fear, Sadness, etc. | |

## Project Structure

```
.
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── recorder.tsx    # Audio recording UI
│   │   │   └── analyze.tsx     # Results visualization
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/
│   ├── main.py                 # FastAPI server
│   ├── emotion_engine.py       # Emotion normalization & mismatch calculation
│   ├── hume_setup.py           # Hume AI integration
│   ├── transcript.py           # Text sentiment analysis
│   ├── text.py                 # Whisper transcription
│   └── text_worker.py          # NYTK worker process
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- Hume AI API key (configure in `backend/hume_setup.py`)

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The server runs on `http://127.0.0.1:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`

## API Endpoints

### POST /analyze

Upload an audio file for emotion analysis.

**Request:**
- `file`: Audio file (WebM format)
- `transcript`: Optional text transcript for comparison

**Response:**
```json
{
  "status": "ok",
  "transcript": "transcribed text",
  "audio_emotions": { "joy": 45.2, "optimism": 30.1, "anger": 10.5, "sadness": 14.2 },
  "text_emotions": { "joy": 40.0, "optimism": 35.0, "anger": 5.0, "sadness": 20.0 },
  "mismatch": {
    "match_percent": 85.3,
    "distance": 12.4,
    "per_emotion_diff": { "joy": 5.2, "optimism": -4.9, "anger": 5.5, "sadness": -5.8 }
  }
}
```

## Technologies

- **Frontend**: React, TypeScript, Vite, React Router
- **Backend**: FastAPI, uvicorn
- **AI/ML**:
  - Hume AI (audio emotion detection)
  - NYTK / HuggingFace (Hungarian text sentiment)
  - Whisper (speech-to-text transcription)

## License

MIT
