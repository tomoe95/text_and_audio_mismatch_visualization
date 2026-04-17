import { useRef, useState } from react
import { useNavigate } from react-router-dom

export default function Recorder() {
    
    const navigate = useNavigate()

    const [isRecording, setIsRecording] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const [recordedURL, setRecordedURL] = useState()
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

    const mediaStream = useRef<MediaStream | null>(null)
    const mediaRecorder = useRef<MediaRecorder | null>(null)
    const chunks = useRef<Blob[]>([])
    const timerRef = useRef<number | null>(null)

    const startRecording = async () => {
        setIsRecording(true)
        setSeconds(0)
        chunks.current = []

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaStream.current = stream

            // Use WebM type
            const options = { mimeType: audio/webm }
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
                const blob = new Blob(chunks.current, { type: audio/webm })
                const url = URL.createObjectURL(blob)
                setRecordedURL(url)
                setAudioBlob(blob)
            }

            recorder.start()
        } catch (error) {
            console.error("Error accessing microphone:", error)
            setIsRecording(false)
        }
    }

    const stopRecording = () => {
        setIsRecording(false)
        if (timerRef.current) clearInterval(timerRef.current)

        if (mediaRecorder.current && mediaRecorder.current.state !== inactive) {
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

        const formData = new FormData()
        // file matches the parameter name in your FastAPI endpoint
        formData.append(file, audioBlob, recording.webm)

        try {
            const response = await fetch(http://127.0.0.1:8000/analyze, {
                method: "POST",
                body: formData,
            })
            
            // if response is not 20-
            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Server Error: ${errorText}`)
            }

            const result = await response.json()
            console.log("Server response:", result)
            alert("Upload sucessful!")
            // Jump to /analyze path
            navigate(/analyze, { state: {emotionsData: result } })
        } catch (error) {
            console.error("Upload failed:", error)
        }
    }

    return (
        <div style={{ padding: 20px, textAlign: center }}>
            <h2>{formatTimer(seconds)}</h2>

            {isRecording ? (
                <button onClick={stopRecording} style={{ color: red }}>
                    Stop Recording
                </button>
            ) : (
                <button onClick={startRecording}>
                    Start Recording
                </button>
            )}

            <div style={{ marginTop: 20px }}>
                {recordedURL && <audio controls src={recordedURL} />}
            </div>

            {recordedURL && !isRecording && (
                <button onClick={sendAudio} style={{ marginTop: 10px }}>
                    Submit
                </button>
            )}
        </div>
    )
}

