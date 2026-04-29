# Text and Audio Emotion Mismatch Visualization

  A web application that analyzes the emotional mismatch between spoken audio and transcribed text. Built with React (frontend)
   and FastAPI (backend).

  ## Features

  ### Current Features
  - **Audio recording** directly in the browser with microphone permission handling
  - **Speech transcription** using Whisper (Hungarian language support)
  - **Audio emotion analysis** using Hume AI
  - **Text sentiment analysis** using NYTK (Hungarian sentiment analysis)
  - **Normalize both outputs** to a shared 4-emotion schema (joy, optimism, anger, sadness)
  - **Calculate and visualize** emotion mismatch between audio and text
  - **Radar chart visualization** with dynamic scaling for comparing audio vs text emotions
  - **Match score display** with color-coded thresholds (High/Partial/Low match)
  - **Per-emotion difference table** showing signed differences with color indicators
  - **Error handling** for:
    - Microphone permission denied or not found
    - No speech detected in audio (quiet or non-Hungarian)
    - Server connection issues
  - **Loading states** with spinner during audio analysis

  ### Planned Features
  - Support for additional languages beyond Hungarian
  - Historical comparison and trend analysis

  ## Architecture

```
  ┌───────────────────┐     ┌─────────────────────────────────────────┐
  │   React Frontend  │     │           FastAPI Backend               │
  │   (Vite + Babel)  │────▶│  - Hume AI (audio emotion analysis)     │
  │                   │     │  - NYTK (text sentiment analysis)       │
  │                   │     │  - Whisper (transcription)              │
  └───────────────────┘     └─────────────────────────────────────────┘
```

  ## Emotion Mapping

  Both audio and text emotions are normalized to 4 categories:

  | Audio (Hume) | Text (NYTK) |
  |--------------|-------------|
  | Joy, Amusement, Excitement, etc. | LABEL_2 (positive) → joy + optimism |
  | Admiration, Hope, Love, etc. | LABEL_1 (neutral) → mostly sadness |
  | Anger, Contempt, Disgust, etc. | LABEL_0 (negative) → anger + sadness |
  | Anxiety, Fear, Sadness, etc. | |

  ### Configurable Weighting

  The optimism bucket can be weighted in `backend/emotion_engine.py`:

  ```python
  OPTIMISM_WEIGHT = 0.5  # 0.0-1.0, lower = less optimism influence
```

  ### Project Structure
```
  .
  ├── frontend/
  │   ├── src/
  │   │   ├── components/
  │   │   │   ├── recorder.tsx      # Audio recording UI with error handling
  │   │   │   ├── recorder.css      # Styles including error boxes, spinner, icons
  │   │   │   ├── analyze.tsx       # Results visualization with match score & diff table
  │   │   │   ├── analyze.css       # Styles for analyze page
  │   │   │   ├── radarChart.tsx    # D3-based radar chart component
  │   │   │   └── radarChart.css    # Styles for radar chart
  │   │   ├── App.tsx
  │   │   └── main.tsx
  │   └── package.json
  ├── backend/
  │   ├── main.py                   # FastAPI server with transcription error handling
  │   ├── emotion_engine.py         # Emotion normalization & mismatch calculation
  │   ├── hume_setup.py             # Hume AI integration
  │   ├── text.py                   # Text sentiment analysis (NYTK worker launcher)
  │   ├── text_worker.py            # NYTK worker process (sentiment analysis)
  │   ├── transcript.py             # Whisper transcription (Hungarian)
  │   └── requirements.txt          # Python dependencies
  └── README.md
```

  ## Setup

  ### Prerequisites
```
  - Node.js 18+
  - Python 3.10+
  - Hume AI API key (configure in backend/hume_setup.py)
```
  ### Backend
```
  cd backend
  pip install -r requirements.txt
  python main.py

  The server runs on http://127.0.0.1:8000
```

  ### Frontend
```
  cd frontend
  npm install
  npm run dev

  The frontend runs on http://localhost:5173
```

  ### API Endpoints
```
  POST /analyze

  Upload an audio file for emotion analysis.

  Request:
  - file: Audio file (WebM format)
  - transcript: Optional text transcript for comparison

  Response:
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

  Error Response:
  {
    "status": "error",
    "message": "No speech detected. The audio may be too quiet or not in Hungarian."
  }
```

  ## Technologies
```
  - Frontend: React, TypeScript, Vite, React Router, D3.js
  - Backend: FastAPI, uvicorn
  - AI/ML:
    - Hume AI (audio emotion detection)
    - NYTK / HuggingFace (Hungarian text sentiment)
    - Whisper (speech-to-text transcription)
```

  ## Troubleshooting

  NYTK returns equal 25% for all emotions

  This happens when the sentiment model returns unexpected labels. Check that emotion_engine.py has the correct label mapping
  for your model (LABEL_0/LABEL_1/LABEL_2).

  Optimism always dominates audio output

  Adjust OPTIMISM_WEIGHT in backend/emotion_engine.py to reduce optimism influence (default: 0.5).

  No speech detected error

  This error appears when:
  - The audio is too quiet or contains no speech
  - The audio is not in Hungarian (Whisper Hungarian model is used)
  - Background noise overwhelms the speech signal

  Microphone access denied

  - Check browser permissions for microphone access
  - Ensure no other application is exclusively using the microphone
  - Try a different browser if the issue persists

  Cannot reach the server

  - Verify the backend is running on port 8000
  - Check for firewall or network issues
  - Ensure no other process is blocking port 8000

  ### License
  MIT
