
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="hidden lg:block">
            <DrawingTransformation 
              initialIcon={ClipboardDocumentCheckIcon} 
              finalIcon={SparklesIcon} 
              label="PATENT"
              delay={0} 
              x="8%" 
              y="12%"
              rotation={-2} 
            />
        </div>

        <div className="hidden md:block">
            <DrawingTransformation 
              initialIcon={PuzzlePieceIcon} 
              finalIcon={CursorArrowRaysIcon} 
              label="GAME"
              delay={3000} 
              x="85%" 
              y="70%"
              rotation={3} 
            />
        </div>

        <div className="hidden lg:block">
            <DrawingTransformation 
              initialIcon={NewspaperIcon} 
              finalIcon={ChartBarIcon} 
              label="DATA"
              delay={6000} 
              x="82%" 
              y="15%"
              rotation={1} 
            />
        </div>

        <div className="hidden md:block">
            <DrawingTransformation 
              initialIcon={DocumentTextIcon} 
              finalIcon={CalculatorIcon} 
              label="APP"
              delay={4500} 
              x="10%" 
              y="68%"
              rotation={-4} 
            />
        </div>
      </div>

      <div className="text-center relative z-10 max-w-5xl mx-auto px-4 pt-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <SparklesIcon className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-blue-400 uppercase">Neural Synthesis Engine v3.0</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white mb-8 leading-[0.95] text-balance">
          Bring anything <br/>
          to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">life</span>.
        </h1>
        
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light tracking-tight opacity-80">
          Drop any visual fragment—a doodle, a blueprint, or a screenshot—and watch as it’s transfigured into a high-fidelity interactive experience.
        </p>
      </div>
    </>
  );
};
