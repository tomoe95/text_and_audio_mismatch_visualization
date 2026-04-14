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
        for prediction in prosody_predictions:
           sorted_emotions = sorted(prediction.emotions, key=lambda e: e.score, reverse=True)

           for emotion in sorted_emotions:
               print(f"{emotion.name}: {emotion.score:.3f}")

    return sorted_emotions


