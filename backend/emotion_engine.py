import math

## hume -> 4 bucket mapping

# Optimism weight: 1.0 = normal, 0.5 = half strength, 0.3 = 70% reduction, etc.
OPTIMISM_WEIGHT = 0.5

HUME_EMOTION_MAP = {
    "joy": [
        "Joy", "Amusement", "Excitement", "Ecstasy", "Elation",
        "Euphoria", "Pride", "Relief", "Satisfaction", "Triumph"
    ],
    
    "optimism": [
        "Admiration", "Adoration", "Aesthetic Appreciation", "Calmness",
        "Contentment", "Desire", "Hope", "Interest", "Love",
        "Nostalgia", "Romance", "Surprise (positive)", "Sympathy",
        "Awe", "Realization", "Entrancement", "Determination", 
                 "Contemplation", "Craving", "Concentration"
    ],
                 
    "anger": [
        "Anger", "Contempt", "Disgust", "Embarrassment", "Envy",
        "Frustration", "Horror", "Rage", "Shame", "Surprise (negative)"
    ],
                 
    "sadness": [
        "Anxiety", "Awkwardness", "Boredom", "Confusion", "Despair",
        "Disappointment", "Distress", "Doubt", "Fear", "Guilt",
        "Pain", "Sadness", "Tiredness", "Worry", "Empathic Pain"
    ],
}

def collapse_hume_to_4_emotions(hume_predictions: list[dict]) -> dict:
    # normalize the percentages for 4 emptoions that sum to 100
    buckets = {"joy": 0.0, "optimism": 0.0, "anger": 0.0, "sadness": 0.0}
    unmapped = []

    for predict in hume_predictions:
        name = predict["name"]
        score = predict["score"]
        placed = False
    
        for bucket, emotions in HUME_EMOTION_MAP.items():
            if name in emotions:
                buckets[bucket] += score
                placed = True
                break

        if not placed:
            unmapped.append(name)
    
    if unmapped:
        print(f"Unmapped Hume emotions: {unmapped}")

    # apply optimism weight
    buckets["optimism"] *= OPTIMISM_WEIGHT

    # normalize to percentage
    total = sum(buckets.values())
    if total == 0:
        return {"joy": 25.0, "optimism": 25.0, "anger": 25.0, "sadness": 25.0}

    result = {
        k: round((v / total) * 100, 4) for k, v in buckets.items()
    }

    return result

## NYTK sentiment -> 4 emotion mapping
# LABEL_0=negative, LABEL_1=neutral, LABEL_2=positive (NYTK Hungarian model)
NYTK_LABEL_MAP = {
    # label        joy    optimism  anger   sadness
    "LABEL_2":    (0.55,   0.45,    0.00,   0.00),  # positive
    "LABEL_1":    (0.10,   0.30,    0.10,   0.50),  # neutral
    "LABEL_0":    (0.00,   0.00,    0.50,   0.50),  # negative
}

def collapse_nytk_to_4emotions(nytk_scores: dict) -> dict:
    buckets = {"joy": 0.0, "optimism": 0.0, "anger": 0.0, "sadness": 0.0}
    keys = ["joy", "optimism", "anger", "sadness"]

    for label, score in nytk_scores.items():
        weights = NYTK_LABEL_MAP.get(label.upper())
        if weights is None:
            print(f"Unkown NYTK label: {label}")
            continue
        for i, key in enumerate(keys): # iterating value
            buckets[key] += score * weights[i]
    
    total = sum(buckets.values())
    if total == 0:
        return {"joy": 25.0, "optimism": 25.0, "anger": 25.0, "sadness": 25.0}
    
    result = {
        k: round((v / total) * 100, 4) for k, v in buckets.items()
    }
    return result


## caluclate the mismatch score
def calculate_mismatch(audio_emotions: dict, text_emotions: dict):
    keys = ["joy", "optimism", "anger", "sadness"]
    
    distance = math.sqrt(
            sum((audio_emotions[k] - text_emotions[k]) ** 2 for k in keys)
    )
    # worst case
    max_distance = 100 * math.sqrt(2)
    match_percent = round(100 - (distance / max_distance * 100), 1)

    emotion_diff = {
        k: round(audio_emotions[k] - text_emotions[k], 4) for k in keys
    }

    return {
        "match_percent": match_percent,
        "distance": round(distance, 4),
        "per_emotion_diff": emotion_diff,  
        # + = audio higher, - = text higher
    }

if __name__ == "__main__":
    test_hume = [
        {"name": "Joy",        "score": 0.72},
        {"name": "Excitement", "score": 0.18},
        {"name": "Anger",      "score": 0.06},
        {"name": "Sadness",    "score": 0.04},
    ]

    test_nytk = {"POSITIVE": 0.05, "NEUTRAL": 0.10, "NEGATIVE": 0.85}

    audio = collapse_hume_to_4_emotions(test_hume)
    text = collapse_nytk_to_4emotions(test_nytk)
    result = calculate_mismatch(audio, text)

    print("audio", audio)
    print("text", text)
    print("mismatch", result)
