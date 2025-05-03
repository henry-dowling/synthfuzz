"use client";

import { useState } from "react";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudio, setProcessedAudio] = useState<string | null>(null);

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
    if (!selectedFile) return;
    
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', selectedFile);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Real Boy
          </h1>
          <p className="text-xl text-gray-300">
            Upload an audio file to demo
          </p>
        </header>

        <main className="max-w-3xl mx-auto">
          <div 
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
              isDragging ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Choose different file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg">Drag and drop your audio file here</p>
                <p className="text-sm text-gray-400">or</p>
                <label className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer transition-colors">
                  Browse Files
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="mt-8 text-center space-y-6">
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  isProcessing
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Process Audio'
                )}
              </button>

              {processedAudio && (
                <div className="mt-8 p-6 bg-gray-800 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Processed Audio</h3>
                  <audio 
                    controls 
                    className="w-full"
                    src={processedAudio}
                  >
                    Your browser does not support the audio element.
                  </audio>
                  <p className="mt-4 text-sm text-gray-400">
                    The processed file has been automatically downloaded. You can also play it above.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="mt-32 text-center text-gray-400">
          <p>© 2024 SynthFuzz. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
