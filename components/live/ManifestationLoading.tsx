
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { LoadingStep } from '../ui/LoadingStep';

export const ManifestationLoading: React.FC<{ step: number }> = ({ step }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 w-full animate-in fade-in duration-500 bg-[#09090b]">
    <div className="w-full max-w-md space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 mb-6 text-blue-500 animate-spin-slow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-zinc-100 font-mono text-lg tracking-tight">Synthesizing Digital Reality</h3>
      </div>
      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 animate-[loading_3s_ease-in-out_infinite] w-1/3"></div>
      </div>
      <div className="border border-zinc-800 bg-black/50 rounded-lg p-4 space-y-3 font-mono text-sm shadow-inner">
        <LoadingStep text="Analyzing input signals" active={step === 0} completed={step > 0} />
        <LoadingStep text="Inverting viewport logic" active={step === 1} completed={step > 1} />
        <LoadingStep text="Compiling interactive gates" active={step === 2} completed={step > 2} />
        <LoadingStep text="Manifesting artifact" active={step === 3} completed={step > 3} />
      </div>
    </div>
  </div>
);
