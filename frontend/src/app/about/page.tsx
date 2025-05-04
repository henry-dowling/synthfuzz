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
            About
          </h1>
          <div className="flex justify-center space-x-4 text-sm">
            <Link href="/" className="text-blue-600 hover:underline">Home</Link>
            <a href="https://github.com/henry-dowling/synthfuzz" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Code</a>
          </div>
        </header>

        {/* Content */}
        <div className="prose max-w-none">
          <div className="flex justify-center mb-12">
            <Image
              src="/henry-chris.jpg"
              alt="Henry and Chris"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>

          <div className="space-y-6">
            <p>
              Real Boy was created by{" "}
              <a href="https://github.com/abcdchop" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Chris</a>
              {" "}and{" "}
              <a href="https://github.com/henry-dowling" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Henry</a> in NYC. 
              You can find us on{" "}
              <a href="https://github.com/henry-dowling/synthfuzz" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Github</a>
              {" "} and{" "}
              <a href="https://open.spotify.com/artist/4KteP8o6Au9QpDXO14xtWu?si=zg4FfkZuT_GYgIYuhJdqlg" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Spotify</a>
              .
            </p>

            <div className="flex justify-center my-12">
              <Image
                src="/icon.png"
                alt="Real Boy Synth Icon"
                width={120}
                height={120}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 