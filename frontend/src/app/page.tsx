"use client";

import { useState } from "react";

// Sample audio data
const SAMPLE_AUDIO_FILES = [
  {
    id: 'electric',
    name: 'Electric Guitar',
    description: 'Clean electric guitar preset',
    path: '/audio-samples/clean-guitar.wav'
  },
  {
    id: 'acoustic',
    name: 'Acoustic Guitar',
    description: 'Acoustic guitar preset',
    path: '/audio-samples/acoustic.wav'
  },
  {
    id: 'piano',
    name: 'Piano',
    description: 'Piano preset',
    path: '/audio-samples/piano.wav'
  }
];

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudio, setProcessedAudio] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile && !selectedSample) return;
    
    setIsProcessing(true);
    try {
      const formData = new FormData();
      
      if (selectedFile) {
        formData.append('audio', selectedFile);
      } else if (selectedSample) {
        // Fetch the sample audio file and append it to the form data
        const sampleFile = SAMPLE_AUDIO_FILES.find(s => s.id === selectedSample);
        if (!sampleFile) throw new Error('Sample file not found');
        
        const response = await fetch(sampleFile.path);
        const blob = await response.blob();
        formData.append('audio', blob, sampleFile.name + '.wav');
      }

      console.log('[API CALL]', 'Requesting:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/process-audio`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/process-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      // Handle streaming response
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      setProcessedAudio(audioUrl);
      
      // Create a download link
      const downloadUrl = document.createElement('a');
      downloadUrl.href = audioUrl;
      downloadUrl.download = 'processed_audio.wav';
      document.body.appendChild(downloadUrl);
      downloadUrl.click();
      document.body.removeChild(downloadUrl);
      
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Paper Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6">
            SynthFuzz: High-Fidelity Synth Pedal
          </h1>
          <div className="mb-8">
          </div>
          <div className="flex justify-center space-x-4 text-sm">
            <a href="#" className="text-blue-600 hover:underline">Blog</a>
            <a href="https://github.com/yourusername/synthfuzz" className="text-blue-600 hover:underline">Code</a>
            <a href="#" className="text-blue-600 hover:underline">Purchase</a>
          </div>
        </header>

        {/* Demo Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Interactive Demo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {SAMPLE_AUDIO_FILES.map((sample) => (
              <div
                key={sample.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedSample === sample.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => {
                  setSelectedSample(sample.id);
                  setSelectedFile(null);
                  setProcessedAudio(null);
                }}
              >
                <h4 className="font-medium mb-1">{sample.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{sample.description}</p>
                {selectedSample === sample.id && (
                  <audio className="w-full" controls src={sample.path}>
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            ))}

            {/* Upload Card */}
            <div
              className={`p-4 rounded-lg border transition-all ${
                selectedFile ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <>
                  <h4 className="font-medium mb-1">Selected File</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mb-3">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setSelectedSample(null);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Choose different file
                  </button>
                </>
              ) : (
                <>
                  <h4 className="font-medium mb-1">Upload Audio</h4>
                  <p className="text-sm text-gray-600 mb-3">Try your own audio file</p>
                  <label className="inline-block px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded cursor-pointer transition-colors">
                    Choose File
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </>
              )}
            </div>
          </div>

          {(selectedFile || selectedSample) && (
            <div className="text-center">
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className={`px-6 py-2 rounded font-medium transition-all text-white ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Process Audio'}
              </button>

              {processedAudio && (
                <div className="mt-8 p-4 bg-gray-50 rounded border border-gray-200">
                  <audio 
                    controls 
                    className="w-full"
                    src={processedAudio}
                  >
                    Your browser does not support the audio element.
                  </audio>
                  <p className="mt-2 text-sm text-gray-600">
                    The processed file has been automatically downloaded
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        <footer className="mt-16 text-center text-gray-600 text-sm">
          <p>© 2025 Willowmere Research. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
