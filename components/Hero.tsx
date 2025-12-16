/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { DocumentTextIcon, CalculatorIcon, PuzzlePieceIcon, ClipboardDocumentCheckIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { CursorArrowRaysIcon, ChartBarIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { DrawingTransformation } from './hero/DrawingTransformation';

export const Hero: React.FC = () => {
  return (
    <>
      {/* Background Transformation Elements - Fixed to Viewport */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Top Left: Patent -> Validated */}
        <div className="hidden lg:block">
            <DrawingTransformation 
            initialIcon={ClipboardDocumentCheckIcon} 
            finalIcon={SparklesIcon} 
            label="PATENT"
            delay={0} 
            x="4%" 
            y="8%"
            rotation={-3} 
            />
        </div>

        {/* Bottom Right: Board Game -> Playable */}
        <div className="hidden md:block">
            <DrawingTransformation 
            initialIcon={PuzzlePieceIcon} 
            finalIcon={CursorArrowRaysIcon} 
            label="GAME"
            delay={3000} 
            x="88%" 
            y="75%"
            rotation={2} 
            />
        </div>

        {/* Top Right: Data/Paper -> Dashboard */}
        <div className="hidden lg:block">
            <DrawingTransformation 
            initialIcon={NewspaperIcon} 
            finalIcon={ChartBarIcon} 
            label="DATA"
            delay={6000} 
            x="88%" 
            y="12%"
            rotation={1} 
            />
        </div>

        {/* Bottom Left: Sketch -> App */}
        <div className="hidden md:block">
            <DrawingTransformation 
            initialIcon={DocumentTextIcon} 
            finalIcon={CalculatorIcon} 
            label="APP"
            delay={4500} 
            x="5%" 
            y="72%"
            rotation={-2} 
            />
        </div>
      </div>

      {/* Hero Text Content */}
      <div className="text-center relative z-10 max-w-6xl mx-auto px-4 pt-8">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-6 leading-[1.1]">
          Bring anything <br/>
          to <span className="underline decoration-4 decoration-blue-500 underline-offset-4 md:underline-offset-8 text-white">life</span>.
        </h1>
        <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light">
          Gemini sees the code in everything. Drop in an old map, a floor plan, a diagram, or a doodle, and watch it turn into a working interactive experience instantly.
        </p>
      </div>
    </>
  );
};