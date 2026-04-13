import { useLocation, Link } from 'react-router-dom'

interface EmotionData {
    name: string;
    score: number;
}

export default function Analyze() {
    // get the emotionData from recorder.tsx
    const location = useLocation()
    const emotions: EmotionData[] = location.state?.emotionsData || []

    return (
        <div>
            <h2>Analysis Result</h2>
            
            {emotions.length === 0 ? (
                <div>
                    <p>Waiting for recording data...</p>
                    <Link to="/">Go back to Recorder</Link>
                </div>
            ) : (
                <ul>
                    {emotions.map((item, index) => (
                        <li key={index}>
                            <strong>{item.name}:</strong> {(item.score * 100).toFixed(1)}%
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
