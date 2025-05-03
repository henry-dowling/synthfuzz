from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import numpy as np
import tempfile
import io
import base64
import os
from lib.utils import load_audio_file, save_audio_file
from main import main

app = FastAPI()

# Enable CORS for both development and production servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js default development server
        "https://synthfuzz.vercel.app",  # Vercel frontend
        "https://www.synthfuzz.com" # prod frontend
    ],
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
        time, transformed_signals, full_plot_bytes, zoomed_plot_bytes = main(
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

        # Read the processed audio file into memory
        with open(output_path, 'rb') as f:
            audio_bytes = f.read()
        
        # Clean up output temp file
        os.unlink(output_path)

        # Convert audio and plots to base64
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
        full_plot_b64 = base64.b64encode(full_plot_bytes).decode('utf-8')
        zoomed_plot_b64 = base64.b64encode(zoomed_plot_bytes).decode('utf-8')

        # Return JSON with audio and plot data
        return JSONResponse({
            "audio": f"data:audio/wav;base64,{audio_b64}",
            "fullPlot": f"data:image/png;base64,{full_plot_b64}",
            "zoomedPlot": f"data:image/png;base64,{zoomed_plot_b64}"
        })
        
    except Exception as e:
        # Clean up temporary files in case of error
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": str(e)
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 