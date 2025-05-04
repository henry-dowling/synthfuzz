"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Math } from "../components/Math";
import { FMSynthDemo } from "../components/FMSynthDemo";

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
  const [selectedSample, setSelectedSample] = useState<string | null>('electric');
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [iterations, setIterations] = useState<number>(4); // Default to 4 iterations
  const [isUploadMode, setIsUploadMode] = useState(false); // New state for upload mode

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
        formData.append('iterations', iterations.toString());
      } else if (selectedSample) {
        // Fetch the sample audio file and append it to the form data
        const sampleFile = SAMPLE_AUDIO_FILES.find(s => s.id === selectedSample);
        if (!sampleFile) throw new Error('Sample file not found');
        
        // Add preset information
        formData.append('preset', sampleFile.id);
        formData.append('iterations', iterations.toString());
        
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
            Real Boy: High-Fidelity Fuzz Pedal for Synth
          </h1>
          <div className="mb-8">
          </div>
          <div className="flex justify-center space-x-4 text-sm">
            <Link href="/about" className="text-blue-600 hover:underline">About</Link>
            <a href="https://github.com/henry-dowling/synthfuzz" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Code</a>
          </div>
        </header>

        {/* Demo Section */}
        <section className="mb-12">
          <div className="flex justify-center mb-12">
            <Image
              src="/icon.png"
              alt="Real Boy Synth Icon"
              width={150}
              height={150}
            />
          </div>
          <h2 className="text-2xl mb-8">Audio Examples:</h2>
          
          <div className="space-y-1 max-w-2xl mx-auto mb-12 font-mono text-base">
            {SAMPLE_AUDIO_FILES.map((sample) => (
              <label
                key={sample.id}
                className="block cursor-pointer whitespace-pre"
              >
                <span className="inline-flex items-center">
                  <span className="mr-1">[{selectedSample === sample.id && !isUploadMode ? "x" : " "}]</span>
                  <input
                    type="radio"
                    name="audioExample"
                    value={sample.id}
                    checked={selectedSample === sample.id && !isUploadMode}
                    onChange={() => {
                      setSelectedSample(sample.id);
                      setSelectedFile(null);
                      setIsUploadMode(false);
                      setProcessedAudio(null);
                      setFullPlot(null);
                      setZoomedPlot(null);
                    }}
                    className="sr-only"
                  />
                  {sample.name} – {sample.description}
                </span>
              </label>
            ))}

            {/* Upload option */}
            <label className="block cursor-pointer whitespace-pre">
              <span className="inline-flex items-center">
                <span className="mr-1">[{isUploadMode ? "x" : " "}]</span>
                <input
                  type="radio"
                  name="audioExample"
                  checked={isUploadMode}
                  onChange={() => {
                    setIsUploadMode(true);
                    setSelectedSample(null);
                    document.getElementById('fileInput')?.click();
                  }}
                  className="sr-only"
                />
                Upload your own
              </span>
              <input
                type="file"
                id="fileInput"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    setSelectedSample(null);
                    setIsUploadMode(true);
                  }
                }}
              />
            </label>
          </div>

          {/* Show UI when either a file is selected, sample is selected, or we're in upload mode */}
          {(selectedFile !== null || selectedSample !== null || isUploadMode) && (
            <div className="text-center font-mono">
              <div className="mb-12 max-w-md mx-auto">
                <div className="mb-1">Iteration depth: {iterations}</div>
                <div className="flex items-center justify-center">
                  <input
                    type="range"
                    id="iterations"
                    min="1"
                    max="10"
                    value={iterations}
                    onChange={(e) => setIterations(parseInt(e.target.value))}
                    className="w-48 h-px bg-gray-300 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2">More iterations preserve harmonic detail</div>
              </div>
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="font-mono hover:underline cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 mb-12"
              >
                {isProcessing ? '... processing' : '→ Run approximation'}
              </button>
              {isProcessing && (
                <p className="mt-4 text-xs text-gray-500">This usually takes about 60 seconds</p>
              )}

              {processedAudio && (
                <div className="mt-8 space-y-8">
                  {/* Audio Players Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Input Audio */}
                    <div className="p-4 bg-gray-50 rounded border border-gray-200">
                      <div className="font-mono mb-4">Input Audio</div>
                      <audio 
                        controls 
                        className="w-full"
                        src={selectedFile ? URL.createObjectURL(selectedFile) : selectedSample ? SAMPLE_AUDIO_FILES.find(s => s.id === selectedSample)?.path : undefined}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>

                    {/* Processed Audio */}
                    <div className="p-4 bg-gray-50 rounded border border-gray-200">
                      <div className="font-mono mb-4">Processed Audio</div>
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
                          className="font-mono hover:underline cursor-pointer"
                        >
                          → Download result
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Signal Analysis Plots */}
                  {fullPlot && (
                    <div className="p-4 bg-gray-50 rounded border border-gray-200">
                      <div className="font-mono mb-4">Full Signal Analysis</div>
                      <Image 
                        src={fullPlot} 
                        alt="Full signal analysis plot"
                        width={800}
                        height={400}
                        className="w-full h-auto rounded"
                      />
                    </div>
                  )}

                  {zoomedPlot && (
                    <div className="p-4 bg-gray-50 rounded border border-gray-200">
                      <div className="font-mono mb-4">Zoomed-in Signal Analysis</div>
                      <Image 
                        src={zoomedPlot} 
                        alt="Zoomed signal analysis plot"
                        width={800}
                        height={400}
                        className="w-full h-auto rounded"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <button
            onClick={() => setIsFaqOpen(!isFaqOpen)}
            className="w-full text-left flex justify-between items-center mb-4 cursor-pointer hover:text-gray-600 transition-colors"
          >
            <h2 className="text-2xl font-bold">How it Works</h2>
            <svg
              className={`w-6 h-6 transform transition-transform ${isFaqOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isFaqOpen && (
            <div className="prose max-w-none">
              <div className="mb-8">
                <p className="text-gray-600 mb-4">
                  The <strong>Real Boy</strong> is a concept for a modular synth pedal that preserves the rich upper harmonies 
                  of the guitar. Unlike most synth pedals, it captures information about the guitar&apos;s sound besides just its 
                  fundamental frequency.
                </p>

                <p className="text-gray-600 mb-4">
                  At its core, The Real Boy uses a technique inspired by <a href="https://en.wikipedia.org/wiki/Bitcrusher" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer"><strong>bitcrushing</strong></a>, a method of digital signal 
                  approximation that generalizes square wave approximation. A typical bitcrusher reduces the resolution of a signal 
                  by dividing the amplitude range into discrete steps—then rounding the actual signal to the nearest step. It&apos;s 
                  essentially &quot;pixellation&quot; of a sound wave.
                </p>

                <div className="my-8">
                  <Image 
                    src="/graphs/bitcrusher-ex.png" 
                    alt="Bitcrusher signal approximation"
                    width={800}
                    height={400}
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    A bitcrusher approximates a signal by quantizing it into discrete steps
                  </p>
                </div>

                <p className="text-gray-600 mb-4">
                  We take this a step further. Instead of fixed steps, The Real Boy can dynamically adjust the approximation based 
                  on the incoming waveform. One way to do this is by starting with a square wave approximation, then calculating 
                  the difference (error) between the original and the approximation, and repeating the process. This iterative 
                  refinement captures more of the waveform&apos;s complexity—producing something between a classic bitcrusher and a 
                  smarter signal encoder.
                </p>

                <div className="my-8">
                  <Image 
                    src="/graphs/bircrusher-vs-iter.png" 
                    alt="Iterative signal approximation comparison"
                    width={800}
                    height={400}
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    The Real Boy&apos;s iterative approximation (right) captures more detail than a standard bitcrusher (left)
                  </p>
                </div>

                <p className="text-gray-600 mb-4">
                  Why do this? Well, firstly, the approximation can be used as a standalone synth fuzz pedal (see demo above). 
                  But more importantly, it gives us <strong>discrete but detailed</strong> data about the guitar&apos;s waveform. That 
                  data can then be used to <strong>resynthesize</strong> the signal using modular synth techniques—with far more 
                  fidelity than typical pitch/frequency detectors.
                </p>

                <p className="text-gray-600 mb-4">
                  We can be a bit more clever, and use a different algorithm—approximating the wave as a square wave, then adding 
                  the error to that square wave, and so on to create a signal that&apos;s similar to the bitcrusher but where the 
                  <strong>buckets are dynamically</strong> sized.
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-3">Modular Synths Don&apos;t Normally Work On Guitars</h3>
                <p className="text-gray-600 mb-4">
                  Most modular synths expect clean, mathematically defined waveforms—like sine, square, or saw waves. These 
                  waveforms are easy to modulate, because we know their exact formulas.
                </p>

                <p className="text-gray-600 mb-4">
                  This is unfortunate, because when you play guitar you don&apos;t know the exact function that produced its output—only 
                  that it&apos;s full of harmonic richness, string resonance, amplifier coloration, and environmental noise. Even if you 
                  know the fundamental (say, 110 Hz on the A string), you have no idea what the actual waveform looks like in detail. 
                  That waveform is shaped by your fingers, your gear, your strings, your pickups, even the humidity.
                </p>

                <p className="text-gray-600 mb-4">
                  So most guitar synths cheat. They extract a few key features—like pitch and amplitude—and use those to generate 
                  a clean synthetic waveform. Then they apply modular synthesis to <strong>that</strong> generated signal.
                </p>

                <p className="text-gray-600 mb-4">
                  This works, but at a cost: you lose nearly all the complexity that makes a guitar sound like a guitar. The upper 
                  harmonics, subtle dynamics, and expressiveness vanish. It&apos;s no longer your guitar—it&apos;s just a sine wave with a 
                  pitch tracker.
                </p>

                <p className="text-gray-600 mb-4">
                  <strong>The Real Boy</strong> improves on this situation by allowing for modular synthesis on a much richer input signal.
                </p>

                <h3 className="text-xl font-semibold mt-8 mb-3">Modular Synthesis</h3>
                <p className="text-gray-600 mb-4">
                  A synth pedal is a special kind of guitar pedal that creates its sound via <strong>modular synthesis</strong>. 
                  This means that a signal is <strong>synthesized</strong> (i.e., made from scratch) by a generator and then 
                  modulated to give it character. A common way to do this is through <strong>frequency modulation</strong>—modulating 
                  the frequency of one wave using another wave. (Why use waves instead of other functions? Because waves are 
                  computationally cheap and easy to implement in analog circuits!)
                </p>

                <p className="text-gray-600 mb-4">
                  So if you start out by generating a sine wave at 440 hz (this is called the <strong>carrier</strong> signal), 
                  the waveform is:
                </p>

                <div className="my-4">
                  <Math
                    math="x(t) = Asin(2 \pi \cdot 440 \cdot t)"
                    block={true}
                  />
                </div>

                <p className="text-gray-600 mb-4">
                  Here&apos;s what the waveform would look like if we added a modulator whose frequency is also 440. We say that 
                  this modulator has a <strong>harmonic ratio</strong> of 1 (integer harmonic ratios tend to sound much better).
                </p>

                <div className="my-4">
                  <Math
                    math="x(t) = A \sin\left(2\pi \cdot 440 \cdot t + \underbrace{\vphantom{2\pi \cdot 440 \cdot t} I \sin(2\pi \cdot 440 \cdot t)}_{\text{modulator term}}\right)"
                    block={true}
                  />
                </div>

                <p className="text-gray-600 mb-4">
                  Modulation is a really cool effect. You can get very cool sounds like the{' '}
                  <a href="https://www.youtube.com/watch?v=dzBhGheAIYo" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    Yamaha DX-7
                  </a>.
                  You can try it out below. 
                </p>

                <div className="mt-4">
                  <FMSynthDemo />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
