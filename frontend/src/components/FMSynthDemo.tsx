import React, { useEffect, useRef, useState } from 'react';

interface FMSynthDemoProps {
  width?: number;
  height?: number;
}

interface Preset {
  name: string;
  carrierFreq: number;
  modulatorFreq: number;
  modulationIndex: number;
}

const PRESETS: Preset[] = [
  {
    name: "Bell",
    carrierFreq: 440,
    modulatorFreq: 280,
    modulationIndex: 5
  },
  {
    name: "Rich Bass",
    carrierFreq: 110,
    modulatorFreq: 220,
    modulationIndex: 3
  },
  {
    name: "Metallic",
    carrierFreq: 440,
    modulatorFreq: 1760, // 4x carrier
    modulationIndex: 2
  }
];

export const FMSynthDemo: React.FC<FMSynthDemoProps> = ({ 
  width = 600, 
  height = 300 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [carrierFreq, setCarrierFreq] = useState(440);
  const [modulatorFreq, setModulatorFreq] = useState(280);
  const [modulationIndex, setModulationIndex] = useState(2);
  const [harmonicRatio, setHarmonicRatio] = useState(1);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const modulatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw static waveform
    const drawWaveform = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid
      ctx.strokeStyle = '#eee';
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw center line
      ctx.strokeStyle = '#ccc';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw FM waveform
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Draw exactly one cycle of the waveform
      const numPoints = width;
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints; // Time from 0 to 1 (one cycle)
        
        // FM synthesis equation
        const modulation = Math.sin(2 * Math.PI * harmonicRatio * t);
        const signal = Math.sin(2 * Math.PI * t + modulationIndex * modulation);
        
        const x = i * (width / numPoints);
        const y = ((1 - signal) / 2) * height; // Flip and scale to fit canvas
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
    };

    drawWaveform();
  }, [width, height, carrierFreq, modulatorFreq, modulationIndex, harmonicRatio]);

  const toggleSound = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (!isPlaying) {
      const ctx = audioContextRef.current;
      
      // Create carrier oscillator
      const carrier = ctx.createOscillator();
      carrier.frequency.value = carrierFreq;
      
      // Create modulator oscillator
      const modulator = ctx.createOscillator();
      modulator.frequency.value = modulatorFreq;
      
      // Create gain node for modulation index
      const modulationGain = ctx.createGain();
      // Scale the modulation index to affect the frequency in Hz
      // We multiply by the carrier frequency to get proper FM depth
      modulationGain.gain.value = modulationIndex * carrierFreq;
      
      // Connect modulator to carrier frequency
      modulator.connect(modulationGain);
      modulationGain.connect(carrier.frequency);
      
      // Connect carrier to output
      carrier.connect(ctx.destination);
      
      carrier.start();
      modulator.start();
      
      oscillatorRef.current = carrier;
      modulatorRef.current = modulator;
      gainRef.current = modulationGain;
    } else {
      oscillatorRef.current?.stop();
      modulatorRef.current?.stop();
      oscillatorRef.current = null;
      modulatorRef.current = null;
      gainRef.current = null;
    }
    
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (gainRef.current && oscillatorRef.current) {
      // Update the modulation depth when index changes
      gainRef.current.gain.value = modulationIndex * carrierFreq;
    }
  }, [modulationIndex, carrierFreq]);

  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.value = carrierFreq;
    }
  }, [carrierFreq]);

  useEffect(() => {
    if (modulatorRef.current) {
      modulatorRef.current.frequency.value = modulatorFreq;
    }
  }, [modulatorFreq]);

  const applyPreset = (preset: Preset) => {
    setCarrierFreq(preset.carrierFreq);
    setModulatorFreq(preset.modulatorFreq);
    setModulationIndex(preset.modulationIndex);
    setHarmonicRatio(preset.modulatorFreq / preset.carrierFreq);
  };

  // Update modulator frequency when harmonic ratio changes
  useEffect(() => {
    const newModFreq = carrierFreq * harmonicRatio;
    setModulatorFreq(newModFreq);
  }, [carrierFreq, harmonicRatio]);

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <div className="mb-6">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="bg-white rounded-lg shadow-inner border border-gray-200"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Carrier Frequency: {Math.round(carrierFreq)}Hz (base pitch)
          </label>
          <input
            type="range"
            min="20"
            max="1000"
            value={carrierFreq}
            onChange={(e) => setCarrierFreq(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Harmonic Ratio: {harmonicRatio.toFixed(2)}x ({Math.round(modulatorFreq)}Hz)
          </label>
          <input
            type="range"
            min="0.5"
            max="8"
            step="0.5"
            value={harmonicRatio}
            onChange={(e) => setHarmonicRatio(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modulation Index: {modulationIndex.toFixed(1)} (timbre brightness)
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={modulationIndex}
            onChange={(e) => setModulationIndex(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={toggleSound}
          className={`px-6 py-2 rounded font-medium transition-all ${
            isPlaying
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isPlaying ? 'Stop Sound' : 'Play Sound'}
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p className="text-gray-600">
          <strong>How it works:</strong> Instead of using low frequencies (like in tremolo), FM synthesis typically uses audio-rate 
          modulation frequencies that are related to the carrier frequency by simple ratios. For example, when the modulator 
          is 2x the carrier frequency, you get odd harmonics. When it&apos;s 1x, you get a different spectrum of harmonics. 
          The modulation index controls how many sidebands (additional frequencies) are produced.</p>
      </div>
    </div>
  );
}; 