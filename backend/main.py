import os
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from hume_setup import stream_file

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Server is running"}

@app.post("/analyze")
async def create_upload_file(file: UploadFile = File(...)):
    # file: UploadFile automatically handles the multipart/form-data
    upload_directory = "upload"
    if not os.path.exists(upload_directory) :
        os.makedirs(upload_directory)

    file_path = os.path.join(upload_directory, file.filename)

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    try:
        data = await stream_file(file_path)
    
        return {
            "filename": file.filename,
            "status": "received successfully",
            "path": file_path,
            "data": data,
        }
    except Exception as e:
        return {
                "status": "error",
                "message": str(e),
            }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
