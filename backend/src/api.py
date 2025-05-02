from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import numpy as np
import tempfile
import os
from lib.utils import load_audio_file, save_audio_file
from main import main

app = FastAPI()

# Enable CORS for the frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process-audio")
async def process_audio(audio: UploadFile = File(...)):
    print("Processing audio file...")
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
            plot_offset=0
        )
        
        # Save the processed audio to a temporary file
        output_path = tempfile.mktemp(suffix='.wav')
        save_audio_file(transformed_signals[0], sr, output_path)

        # Clean up input temp file
        os.unlink(temp_file_path)

        # Create generator to stream the file
        def iterfile():
            with open(output_path, mode="rb") as file_like:
                yield from file_like
            # Clean up output temp file after streaming
            os.unlink(output_path)

        # Return a streaming response
        return StreamingResponse(
            iterfile(),
            media_type="audio/wav",
            headers={
                "Content-Disposition": f"attachment; filename=processed_audio.wav"
            }
        )
        
    except Exception as e:
        # Clean up temporary files in case of error
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 