/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { 
  RocketLaunchIcon, 
  BeakerIcon, 
  CommandLineIcon, 
  CheckCircleIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { PipelineStep } from '../../types';

interface CiCdPanelProps {
  pipeline?: PipelineStep[];
  onSuggest: () => void;
  isLoading: boolean;
}

export const CiCdPanel: React.FC<CiCdPanelProps> = ({ pipeline = [], onSuggest, isLoading }) => {
  const [activeStage, setActiveStage] = useState<string | null>(null);

  const defaultPipeline: PipelineStep[] = pipeline.length > 0 ? pipeline : [
    { id: '1', name: 'Lint (ESLint)', type: 'lint', status: 'success' },
    { id: '2', name: 'UI Tests (Jest)', type: 'test', status: 'active' },
    { id: '3', name: 'Build Artifact', type: 'build', status: 'pending' },
    { id: '4', name: 'Deploy to Vercel', type: 'deploy', status: 'pending' },
  ];

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-left duration-500 overflow-hidden">
      <header className="px-5 py-4 border-b border-zinc-800 bg-[#121214] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
             <RocketLaunchIcon className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Pipeline Engine</span>
            <span className="text-xs font-bold text-white tracking-tight">CI/CD Visualization</span>
          </div>
        </div>
        <button 
          onClick={onSuggest}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95 shadow-lg disabled:opacity-50"
        >
          {isLoading ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <SparklesIcon className="w-3.5 h-3.5" />}
          <span>AI SUGGEST</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-[#0c0c0e]">
        <div className="relative space-y-4">
          <div className="absolute left-[21px] top-6 bottom-6 w-px bg-zinc-800"></div>
          
          {defaultPipeline.map((step, idx) => (
            <div 
              key={step.id} 
              className={`relative flex items-center gap-6 p-4 rounded-2xl border transition-all cursor-pointer group ${
                step.status === 'active' ? 'bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20' : 
                step.status === 'success' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-950 border-zinc-900 opacity-50'
              }`}
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2 z-10 ${
                step.status === 'success' ? 'bg-zinc-900 border-green-500/50 text-green-500' : 
                step.status === 'active' ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse' : 
                'bg-zinc-950 border-zinc-800 text-zinc-700'
              }`}>
                {step.type === 'lint' && <CommandLineIcon className="w-5 h-5" />}
                {step.type === 'test' && <BeakerIcon className="w-5 h-5" />}
                {step.type === 'build' && <ArrowPathIcon className="w-5 h-5" />}
                {step.type === 'deploy' && <RocketLaunchIcon className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">{step.name}</h4>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                    step.status === 'success' ? 'bg-green-500/10 text-green-500' : 
                    step.status === 'active' ? 'bg-blue-500/10 text-blue-400' : 
                    'bg-zinc-800 text-zinc-600'
                  }`}>
                    {step.status}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">Stage {idx + 1} &bull; {step.type}</p>
              </div>

              {step.status === 'success' && (
                <CheckCircleIcon className="w-5 h-5 text-green-500 absolute top-4 right-4" />
              )}
            </div>
          ))}
        </div>

        <div className="bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800 border-dashed text-center space-y-3">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Pipeline Integration</p>
          <p className="text-xs text-zinc-400 leading-relaxed px-4">
            Connect your repository to enable automated deployments. Manifest AI will automatically tune your build environment based on artifact complexity.
          </p>
          <button className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:text-blue-400 transition-colors">
            Connect Git Repository &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
