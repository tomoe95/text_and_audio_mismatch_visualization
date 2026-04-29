import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './recorder.css'

export default function Recorder() {
    
    const navigate = useNavigate()

    const [isRecording, setIsRecording] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const [recordedURL, setRecordedURL] = useState()
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

    const [isLoading, setIsLoading] = useState(false)
    const [micError, setMicError] = useState<string>('')
    const [uploadError, setUploadError] = useState<string>('')


    const mediaStream = useRef<MediaStream | null>(null)
    const mediaRecorder = useRef<MediaRecorder | null>(null)
    const chunks = useRef<Blob[]>([])
    const timerRef = useRef<number | null>(null)

    const startRecording = async () => {
        setMicError('')
        setUploadError('')
    
        setIsRecording(true)
        setSeconds(0)
        chunks.current = []

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaStream.current = stream

            // Use WebM type
            const options = { mimeType: "audio/webm" }
            const recorder = new MediaRecorder(stream, options)
            mediaRecorder.current = recorder

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.current.push(e.data)
                }
            }

            // Start the visual timer
            timerRef.current = window.setInterval(() => {
                setSeconds(prev => prev + 1)
            }, 1000)

            recorder.onstop = () => {
                // Create the blob with the correct mimeType
                const blob = new Blob(chunks.current, { type: "audio/webm" })
                const url = URL.createObjectURL(blob)
                setRecordedURL(url)
                setAudioBlob(blob)
            }

            recorder.start()

        } catch (error: any) {
            setIsRecording(false)

            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setMicError('Microphone access denied. Please allow microphone permission in your browser settings and try again.')
            } else if (error.name === 'NotFoundError') {
                setMicError('No microphone found. Please connect a microphone and try again.')
            } else {
                setMicError(`Microphone error: ${error.message}`)
            }
        }
    }

    const stopRecording = () => {
        setIsRecording(false)
        if (timerRef.current) clearInterval(timerRef.current)

        if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
            mediaRecorder.current.stop()
        }
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach(track => track.stop())
        }
    }

    const formatTimer = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60)
        const secs = totalSeconds % 60
        return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    }

    const sendAudio = async () => {
        if (!audioBlob) return alert("No audio to send!")

        setUploadError('')
        setIsLoading(true)

        const formData = new FormData()
        // file matches the parameter name in your FastAPI endpoint
        formData.append("file", audioBlob, "recording.webm")

        try {
            const response = await fetch('http://127.0.0.1:8000/analyze', {
                method: "POST",
                body: formData,
            })
            
            // if response is not 20-
            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Server Error: ${errorText}`)
            }

            const result = await response.json()

            if (result.status === 'error') {
                throw new Error(result.message || 'Analysis failed on the server.')
            }

            if (result.status === 'ok' && (!result.transcript || result.transcript.trim() === '')) {
                setUploadError('⚠️ No speech detected. The audio may be too quiet or not in Hungarian. Please try again.')
                setIsLoading(false)
                return
            }

            // Jump to /analyze path
            navigate('/analyze', { state: {emotionsData: result } })
        } catch (error: any) {
            if (error.message.includes('Failed to fetch')) {
                setUploadError('Cannot reach the server. Make sure the backend is running on port 8000.')
            } else {
                setUploadError(`Error: ${error.message}`)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='recorder-page'>
            <h2 className='recorder-title'>Emotion Recorder</h2>
            <p className='recorder-subtitle'>Speak in Hungarian -we'll analyze your emotion</p>
            
            <div className={`recorder-timer ${isRecording ? 'recording' : ''}`}>
                {formatTimer(seconds)}
            </div>

            {micError && (
                <div className='error-box'>
                    🎙️ {micError}
                </div>
            )}

            <div className='recorder-controls'>
                {isRecording ? (
                    <>
                        <button className='btn-record recording' onClick={stopRecording}>
                            <span className='btn-icon-stop' />
                        </button>
                        <span className='btn-label'>Stop</span>
                    </>
                ) : (
                    <>
                        <button className='btn-record' onClick={startRecording}>
                            <span className='btn-icon-mic' />
                        </button>
                        <span className='btn-label'>Record</span>
                    </>
                )}
            </div>
            
            {recordedURL && !isRecording && (
                <div className='recorder-playback'>
                    <audio controls src={recordedURL} />
                    
                    {uploadError && (
                        <div className='error-box'>{uploadError}</div>
                    )}

                    {isLoading ? (
                        <div className='loading-wrapper'>
                            <div className='spinner' />
                            <span className='loading-label'>Analyzing...</span>
                        </div>
                    ) : (
                        <button className='btn-submit' onClick={sendAudio} disabled={isLoading}>
                            Analyze →
                        </button>
                    )}
                </div>
            )}

            {!recordedURL && !isRecording && !micError && (
                <p className='recorder-hint'>Press the button above to start recording</p>    
            )}
        </div>
    )
}

