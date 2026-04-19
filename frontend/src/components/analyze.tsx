import { useLocation, Link } from 'react-router-dom'

interface FourEmotions {
    joy: number
    optimism: number
    anger: number
    sadness: number
}

interface MismatchResult {
    match_percent: number
    distance: number
    per_emotion_diff: FourEmotions
}

interface AnalyzeResult {
    status: string
    note?: string
    transcript?: string
    audio_emotions: FourEmotions
    text_emotions?: FourEmotions
    mismatch?: MismatchResult
}

const EMOTION_COLORS: Record<string, string> = {
    joy: '#F59E0B',       // amber
    optimism: '#10B981',  // teal
    anger: '#EF4444',     // red
    sadness: '#3B82F6',   // blue
}

const EMOTION_LABELS: Record<string, string> = {
    joy: '😄 Joy',
    optimism: '🌿 Optimism',
    anger: '🔥 Anger',
    sadness: '💧 Sadness',
}


function EmotionBar({ label, value }: {label: string; value: number; color: string}) {
    return (
        <div>
            <span>{label}</span>
            <span>{value.toFixed(1)}%</span>
        </div>
    )
}

function EmotionCard({ title, emotions }: { title: string; emotions: FourEmotions }) {
    if (!emotions) return null;

    return (
        <div>
            <h3>{title}</h3>
            {(Object.keys(emotions) as Array<keyof FourEmotions>).map((key) => (
                <EmotionBar
                    key={key}
                    label={EMOTION_LABELS[key]}
                    value={emotions[key]}
                    color={EMOTION_COLORS[key]}
                />
            ))}
        </div>
    )
}


export default function Analyze() {
    // get the emotionData from recorder.tsx
    const location = useLocation()
    const state = location.state as any

    const result: AnalyzeResult | null = location.state?.emotionsData || (state?.audio_emotions ? state : null)
    
    if(!result) {
        return (
            <div>
                <p>No analysis data found.</p>
                <Link to="/">Go back to Recorder</Link>
            </div>
        )
    }

    const isPartial = result.status == "partial"

    return (
        <div>
            <h2>Analysis Result</h2>
            
            {result.transcript && (
                <div>
                    <strong>Transcript:</strong> {result.transcript}
                </div>
            )}

            {isPartial && result.note && (
                <div>
                    ⚠️ {result.note}
                </div>
            )}

            {result.mismatch && (
                <div>
                    {result.mismatch.match_percent}%
                    <div>
                        Emotion Match
                    </div>
                </div>
            )}

            {/* side-by-side emotion cards */}
            <div>
                <EmotionCard title="🎙️ Audio Emotions" emotions={result.audio_emotions} />
                {result.text_emotions && (
                    <EmotionCard title="📝 Text Emotions" emotions={result.text_emotions} />
                )}
            </div>

            {/* per-emotion diff */}
            {result.mismatch && (
                <div>
                    <h3>Emotion Difference (Audio - Text)</h3>
                    {(Object.entries(result.mismatch.per_emotion_diff) as [string, number][]).map(([key, diff]) => (
                        <div key={key}>
                            <span>{EMOTION_LABELS[key]}</span>
                            <span>{diff > 0 ? '+' :''}{diff.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            )}

            <Link to="/">Record again</Link>
        </div>
    )
}

