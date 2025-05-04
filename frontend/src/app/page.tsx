"use client";

import { useState } from "react";
import Image from "next/image";
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
  const [isFMDemoOpen, setIsFMDemoOpen] = useState(false);

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
            Real Boy: High-Fidelity Fuzz Pedal for Synth
          </h1>
          <div className="mb-8">
          </div>
          <div className="flex justify-center space-x-4 text-sm">
            <a href="#" className="text-blue-600 hover:underline">About</a>
            <a href="https://github.com/henry-dowling/synthfuzz" className="text-blue-600 hover:underline">Code</a>
            <a href="#" className="text-blue-600 hover:underline">Purchase</a>
          </div>
        </header>

        {/* Demo Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Select an Audio Example</h2>
          
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
              {isProcessing && (
                <p className="mt-4 text-sm text-gray-600">This usually takes about 60 seconds</p>
              )}

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
                      <h3 className="text-lg font-medium mb-4">Zoomed-in Signal Analysis</h3>
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
                  At its core, The Real Boy uses a technique inspired by <strong>bitcrushing</strong>, a method of digital signal 
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
                  You can try it out below. Modulation is a really cool effect. You can get very cool sounds like the{' '}
                  <a href="https://www.youtube.com/watch?v=dzBhGheAIYo" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    Yamaha DX-7
                  </a>.
                </p>

                <div className="mb-6">
                  <button
                    onClick={() => setIsFMDemoOpen(!isFMDemoOpen)}
                    className="w-full text-left flex justify-between items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-blue-900 mb-1">Interactive: FM Synthesis Explorer</h3>
                      <p className="text-sm text-blue-700">
                        Experiment with frequency modulation synthesis to understand how complex timbres are created
                      </p>
                    </div>
                    <svg
                      className={`w-6 h-6 transform transition-transform ${isFMDemoOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isFMDemoOpen && (
                    <div className="mt-4">
                      <p className="text-gray-600 mb-6">
                        Experience the magic of modular synthesis right in your browser! Below is an interactive demonstration 
                        of frequency modulation (FM) synthesis - one of the core techniques that gives the Real Boy pedal its unique character.
                      </p>
                      
                      <FMSynthDemo />
                      
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold">Understanding FM Synthesis</h4>
                        <p className="text-gray-600">
                          In FM synthesis, we use one oscillator (the modulator) to change the frequency of another oscillator 
                          (the carrier). The carrier frequency determines the base pitch, while the modulator frequency affects 
                          the timbre. The modulation index controls how dramatic this effect is - higher values create more 
                          complex, rich sounds. Try adjusting the controls above to create your own unique sounds!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
