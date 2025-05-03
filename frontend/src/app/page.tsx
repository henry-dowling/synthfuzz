"use client";

import { useState } from "react";

// Sample audio data
const SAMPLE_AUDIO_FILES = [
  {
    id: 'electric',
    name: 'Electric Guitar',
    description: 'Straten Marshall',
    path: '/audio-samples/shred.mp3'
  },
  {
    id: 'acoustic',
    name: 'Acoustic Guitar',
    description: 'Matt Fish',
    path: '/audio-samples/acoustic.mp3'
  },
  {
    id: 'piano',
    name: 'Piano',
    description: 'Art Tatum',
    path: '/audio-samples/piano.mp3'
  }
];

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudio, setProcessedAudio] = useState<string | null>(null);
  const [fullPlot, setFullPlot] = useState<string | null>(null);
  const [zoomedPlot, setZoomedPlot] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile && !selectedSample) return;
    
    setIsProcessing(true);
    setProcessedAudio(null);
    setFullPlot(null);
    setZoomedPlot(null);
    
    try {
      const formData = new FormData();
      
      if (selectedFile) {
        formData.append('audio', selectedFile);
        formData.append('preset', 'custom'); // Add preset info for uploaded files
      } else if (selectedSample) {
        // Fetch the sample audio file and append it to the form data
        const sampleFile = SAMPLE_AUDIO_FILES.find(s => s.id === selectedSample);
        if (!sampleFile) throw new Error('Sample file not found');
        
        // Add preset information
        formData.append('preset', sampleFile.id);
        
        // Fetch and append the sample audio
        const response = await fetch(sampleFile.path);
        if (!response.ok) throw new Error('Failed to fetch sample audio');
        const blob = await response.blob();
        formData.append('audio', blob, `${sampleFile.id}.wav`);
      }

      console.log('[API CALL]', 'Requesting:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/process-audio`, 
        'with preset:', formData.get('preset'));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/process-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      // Handle multipart response
      const data = await response.json();
      
      // Set processed audio
      const audioBlob = await fetch(data.audio).then(r => r.blob());
      const audioUrl = URL.createObjectURL(audioBlob);
      setProcessedAudio(audioUrl);
      
      // Set plot images
      const fullPlotBlob = await fetch(data.fullPlot).then(r => r.blob());
      const fullPlotUrl = URL.createObjectURL(fullPlotBlob);
      setFullPlot(fullPlotUrl);

      const zoomedPlotBlob = await fetch(data.zoomedPlot).then(r => r.blob());
      const zoomedPlotUrl = URL.createObjectURL(zoomedPlotBlob);
      setZoomedPlot(zoomedPlotUrl);
      
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
                  setFullPlot(null);
                  setZoomedPlot(null);
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
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                selectedFile ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <input
                type="file"
                id="fileInput"
                accept="audio/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <>
                  <h4 className="font-medium mb-1">Selected File</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mb-3">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setSelectedSample(null);
                      setProcessedAudio(null);
                      setFullPlot(null);
                      setZoomedPlot(null);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Choose different file
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <h4 className="font-medium mb-1">Upload Audio</h4>
                  <p className="text-sm text-gray-600">Click to choose an audio file.</p>
                </div>
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
                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Process Audio'}
              </button>

              {processedAudio && (
                <div className="mt-8 space-y-8">
                  <div className="p-4 bg-gray-50 rounded border border-gray-200">
                    <h3 className="text-lg font-medium mb-4">Processed Audio</h3>
                    <audio 
                      controls 
                      className="w-full"
                      src={processedAudio}
                    >
                      Your browser does not support the audio element.
                    </audio>
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => {
                          const downloadUrl = document.createElement('a');
                          downloadUrl.href = processedAudio;
                          downloadUrl.download = 'processed_audio.wav';
                          document.body.appendChild(downloadUrl);
                          downloadUrl.click();
                          document.body.removeChild(downloadUrl);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Download Processed Audio
                      </button>
                    </div>
                  </div>

                  {fullPlot && (
                    <div className="p-4 bg-gray-50 rounded border border-gray-200">
                      <h3 className="text-lg font-medium mb-4">Full Signal Analysis</h3>
                      <img 
                        src={fullPlot} 
                        alt="Full signal analysis plot"
                        className="w-full h-auto rounded"
                      />
                    </div>
                  )}

                  {zoomedPlot && (
                    <div className="p-4 bg-gray-50 rounded border border-gray-200">
                      <h3 className="text-lg font-medium mb-4">Zoomed-in Signal Analysis</h3>
                      <img 
                        src={zoomedPlot} 
                        alt="Zoomed signal analysis plot"
                        className="w-full h-auto rounded"
                      />
                    </div>
                  )}
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
