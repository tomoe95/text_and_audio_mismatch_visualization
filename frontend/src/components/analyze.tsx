import { useLocation, Link } from 'react-router-dom'

import RadarChart from './radarChart'
import './analyze.css'


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


function MatchScore({ percent }: { percent: number }) {
    const color = percent >= 70 ? '#10B981' : percent >= 40 ? '#F59E0B' : '#EF4444'
    const label = percent >= 70 ? 'High Match' : percent >= 40 ? 'Partial Match' : 'Low Match'

    return (
        <div className='match-score-wrapper'>
            <div className='match-score-number' style={{ color }}>
                {percent}%
            </div>
            <div className='match-score-label' style={{ color }}>
                {label}
            </div>
            <div className='match-score-sub'>
                Emotion Match
            </div>
        </div>
    )
}

function DiffTable({ diff }: { diff: FourEmotions }) {
    return (
        <div className='diff-table'>
            <h3 className='diff-title'>Emotion Difference (Audio - Text)</h3>
            {(Object.entries(diff) as [string, number][]).map(([key, val]) => (
                <div key={key} className='diff-row'>
                    <span className='diff-label'>{EMOTION_LABELS[key]}</span>
                    <span className='diff-value' style={{ color: val > 0 ? '#6366f1' : val < 0 ? '#f59e0b' : '#9ca3af' }} >
                        { val > 0 ? '+' : ''}{val.toFixed(1)}%
                    </span>
                </div>
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
            <div className='no-data'>
                <p>No analysis data found.</p>
                <Link to="/">Go back to Recorder</Link>
            </div>
        )
    }

    const isPartial = result.status == "partial"

    return (
        <div className='analyze-page'>
            <h2 className='analyze-title'>Analysis Result</h2>
            
            {result.transcript && (
                <div className='transcript-box'>
                    <strong>🎤 Transcript:</strong> {result.transcript}
                </div>
            )}

            {isPartial && result.note && (
                <div className='warning-box'>
                    ⚠️ {result.note}
                </div>
            )}

            {result.mismatch && <MatchScore percent={result.mismatch.match_percent} />}

            <div className='chart-section'>
                <RadarChart
                    audio={result.audio_emotions}
                    text={result.text_emotions || result.audio_emotions}
                />
            </div>

            {/* per-emotion diff */}
            {result.mismatch && <DiffTable diff={result.mismatch.per_emotion_diff} />}

            <Link className='back-link' to="/">⬅️ Record again</Link>
        </div>
    )
}

