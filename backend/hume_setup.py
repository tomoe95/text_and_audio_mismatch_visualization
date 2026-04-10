import asyncio, os
from hume import AsyncHumeClient
from hume.expression_measurement.stream import Config

async def stream_file():
    client = AsyncHumeClient(api_key=os.getenv("HUME_API_KEY"))

    async with client.expression_measurement.stream.connect() as socket:
        result = await socket.send_file(
            "audio.wav",
            config=Config(prosody={}),
        )

        print(result)

        prosody_predictions = result.prosody.predictions
        for prediction in prosody_predictions:
           top_emotions = sorted(prediction.emotions, key=lambda e: e.score, reverse=True)[:5]

           for emotion in top_emotions:
               print(f"  {emotion.name}: {emotion.score:.3f}")


asyncio.run(stream_file())


