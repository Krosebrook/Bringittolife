
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { LoadingStep } from '../ui/LoadingStep';

export const ManifestationLoading: React.FC<{ step?: number }> = ({ step: initialStep = 0 }) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Convincing simulation of manifesting stages if real progress isn't streamed
  useEffect(() => {
    const intervals = [
      setTimeout(() => setCurrentStep(1), 1200),
      setTimeout(() => setCurrentStep(2), 2400),
      setTimeout(() => setCurrentStep(3), 3600),
    ];
    return () => intervals.forEach(clearTimeout);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 w-full animate-in fade-in duration-500 bg-[#09090b] z-50">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-16 h-16 mb-8">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-zinc-100 font-mono text-lg tracking-tight mb-2">Synthesizing Digital Reality</h3>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Manifest Engine v2.1</p>
        </div>

        <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-1000 ease-in-out" 
            style={{ width: `${(currentStep + 1) * 25}%` }}
          ></div>
        </div>

        <div className="border border-zinc-800 bg-black/40 backdrop-blur-md rounded-xl p-6 space-y-4 font-mono text-sm shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          <LoadingStep text="Analyzing input signals" active={currentStep === 0} completed={currentStep > 0} />
          <LoadingStep text="Inverting viewport logic" active={currentStep === 1} completed={currentStep > 1} />
          <LoadingStep text="Compiling interactive gates" active={currentStep === 2} completed={currentStep > 2} />
          <LoadingStep text="Manifesting artifact" active={currentStep === 3} completed={currentStep > 3} />
        </div>
      </div>
    </div>
  );
};
