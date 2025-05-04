'use client';

import { useEffect, useRef } from 'react';
import * as Plot from '@observablehq/plot';

type WavePlotProps = {
  alpha?: number;
  width?: number;
  height?: number;
}

export function WavePlot({ alpha = 2, width = 640, height = 400 }: WavePlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate data points
    const points = Array.from({ length: 200 }, (_, i) => {
      const x = (i - 100) / 25;
      return {
        x,
        y: Math.tanh(alpha * x)
      };
    });

    // Create the plot
    const plot = Plot.plot({
      width,
      height,
      x: { domain: [-4, 4], label: "Input Signal" },
      y: { domain: [-1.2, 1.2], label: "Output Signal" },
      grid: true,
      style: {
        background: "transparent",
      },
      margin: 40,
      marks: [
        Plot.ruleY([0], { stroke: "#ccc" }),
        Plot.ruleX([0], { stroke: "#ccc" }),
        Plot.line(points, {
          x: "x",
          y: "y",
          stroke: "#2563eb", // Tailwind blue-600
          strokeWidth: 2
        })
      ]
    });

    // Render the plot
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(plot);
    }

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [alpha, width, height]);

  return <div ref={containerRef} className="my-4 flex justify-center" />;
} 