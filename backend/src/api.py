from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import numpy as np
import tempfile
import os
import base64
from lib.utils import load_audio_file, save_audio_file
from main import main

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the frontend directory
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

@app.post("/process-audio")
async def process_audio(audio: UploadFile = File(...)):
    # Create a temporary file to store the uploaded audio
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio.filename)[1]) as temp_file:
        content = await audio.read()
        temp_file.write(content)
        temp_file_path = temp_file.name

    try:
        # Load the audio file
        signal, sr = load_audio_file(temp_file_path)
        
        # Process the audio using your main function
        time, transformed_signals = main(
            signal,
            sample_rate=sr,
            window_size=10000,
            plot_length=1000,
            plot_offset=0
        )
        
        # Save the processed audio to a temporary file
        output_path = tempfile.mktemp(suffix='.wav')
        save_audio_file(transformed_signals[0], sr, output_path)
        
        # Read the processed audio file and encode as base64
        with open(output_path, 'rb') as f:
            audio_bytes = f.read()
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        # Clean up temporary files
        os.unlink(temp_file_path)
        os.unlink(output_path)
        
        return {
            "status": "success",
            "audio": audio_base64
        }
        
    except Exception as e:
        # Clean up temporary file in case of error
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 