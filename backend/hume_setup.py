import os
from hume import AsyncHumeClient
from hume.expression_measurement.stream import Config
from dotenv import load_dotenv

async def stream_file(file_path):
    load_dotenv()
    client = AsyncHumeClient(api_key=os.getenv("VITE_HUME_API_KEY")
)

    async with client.expression_measurement.stream.connect() as socket:
        result = await socket.send_file(
            file_path,
            config=Config(prosody={}),
        )
        print(result)

        prosody_predictions = result.prosody.predictions

        # collect all emotions across all predictions
        emotion_totals: dict[str, float] = {}
        emotion_counts: dict[str, int] = {}

        for prediction in prosody_predictions:
           for emotion in prediction.emotions:
               name = emotion.name
               emotion_totals[name] = emotion_totals.get(name, 0.0) + emotion.score
               emotion_counts[name] = emotion_counts.get(name, 0) + 1

        averaged = [
               {"name": name, "score": round(emotion_totals[name] / emotion_counts[name], 6)}
                for name in emotion_totals
            ]
        averaged.sort(key=lambda e: e["score"], reverse=True)               

    return averaged


