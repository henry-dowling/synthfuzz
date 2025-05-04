"use client";

import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6">
            About Real Boy
          </h1>
          <div className="flex justify-center space-x-4 text-sm">
            <Link href="/" className="text-blue-600 hover:underline">Home</Link>
            <a href="https://github.com/henry-dowling/synthfuzz" className="text-blue-600 hover:underline">Code</a>
            <a href="#" className="text-blue-600 hover:underline">Purchase</a>
          </div>
        </header>

        {/* Content */}
        <div className="prose max-w-none">
          <div className="flex justify-center mb-12">
            <Image
              src="/icon.png"
              alt="Real Boy Synth Icon"
              width={120}
              height={120}
            />
          </div>

          <div className="space-y-6">
            <p>
              Real Boy is an experimental guitar synth pedal that preserves the rich harmonic content 
              of your guitar's sound. Unlike traditional synth pedals that reduce your guitar's 
              complex waveform to simple parameters, Real Boy captures and synthesizes the subtle 
              nuances that make your instrument unique.
            </p>

            <p>
              Using advanced signal processing techniques inspired by bitcrushing and iterative 
              approximation, Real Boy creates a high-fidelity digital representation of your 
              guitar's sound that can be manipulated using modular synthesis techniques.
            </p>

            <p>
              The result is a synth pedal that doesn't just track your playing—it understands 
              and preserves the character of your instrument while opening up new sonic possibilities.
            </p>

            <div className="mt-12 text-sm text-gray-600">
              <p>
                Created by Henry Dowling
              </p>
              <p>
                For inquiries: <a href="mailto:contact@example.com" className="text-blue-600 hover:underline">contact@example.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 