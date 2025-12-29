
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { LoadingStep } from '../ui/LoadingStep';

export const ManifestationLoading: React.FC<{ step?: number }> = ({ step: initialStep = 0 }) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  useEffect(() => {
    const intervals = [
      setTimeout(() => setCurrentStep(1), 1500),
      setTimeout(() => setCurrentStep(2), 3000),
      setTimeout(() => setCurrentStep(3), 4500),
    ];
    return () => intervals.forEach(clearTimeout);
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 w-full animate-in fade-in duration-700 bg-[#050507] z-50 overflow-hidden">
      {/* Background Spatial Grid Animation */}
      <div className="absolute inset-0 bg-dot-grid opacity-20 animate-spatial"></div>
      <div className="absolute inset-0 bg-noise opacity-[0.05]"></div>
      
      <div className="w-full max-w-lg relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="relative w-24 h-24 mb-10">
            <div className="absolute inset-0 border-[3px] border-blue-500/10 rounded-[2rem] rotate-45 animate-[spin_8s_linear_infinite]"></div>
            <div className="absolute inset-0 border-[3px] border-white/5 rounded-[2rem] -rotate-45 animate-[spin_12s_linear_infinite]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.4)]"></div>
            </div>
            
            <div className="absolute -top-4 -right-4">
               <div className="px-2 py-0.5 bg-blue-500 text-white text-[8px] font-black uppercase tracking-tighter rounded-sm animate-bounce">Live Synthesis</div>
            </div>
          </div>
          
          <h3 className="text-white font-bold text-2xl tracking-tighter mb-2">Manifesting Fragment</h3>
          <div className="flex items-center space-x-2">
            <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
            <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.4em] font-black">Neural Interface v3.0</p>
            <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
          </div>
        </div>

        <div className="relative px-8 py-10 glass rounded-[2.5rem] shadow-2xl border-white/5 space-y-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
          
          <div className="space-y-5 relative">
            <LoadingStep text="Deconstructing visual logic" active={currentStep === 0} completed={currentStep > 0} />
            <LoadingStep text="Synthesizing structural mesh" active={currentStep === 1} completed={currentStep > 1} />
            <LoadingStep text="Inverting semantic hierarchies" active={currentStep === 2} completed={currentStep > 2} />
            <LoadingStep text="Finalizing physical layer" active={currentStep === 3} completed={currentStep > 3} />
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
             <div className="flex space-x-1.5">
               {[0,1,2].map(i => (
                 <div key={i} className={`w-1 h-1 rounded-full ${currentStep >= i ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-zinc-800'}`} />
               ))}
             </div>
             <span className="text-[9px] font-mono text-zinc-600 font-bold uppercase tracking-widest">
               Phase {currentStep + 1} / 4
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};
