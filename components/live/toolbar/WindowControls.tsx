
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { ChevronLeftIcon, HomeIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '../../ui/Tooltip';

interface WindowControlsProps {
  onClose: () => void;
  projectName?: string;
}

export const WindowControls: React.FC<WindowControlsProps> = ({ onClose, projectName = "Untitled Artifact" }) => (
  <div className="flex items-center space-x-5 min-w-[240px]">
    <Tooltip content="Return to Dashboard" side="bottom">
      <button 
        onClick={onClose}
        aria-label="Back to dashboard"
        className="group flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 transition-all duration-300 shadow-lg shadow-white/5 active:scale-95"
      >
        <ChevronLeftIcon className="w-4 h-4 stroke-[3px] group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-xs font-black uppercase tracking-wider">Back</span>
      </button>
    </Tooltip>

    <div className="h-6 w-px bg-zinc-800" aria-hidden="true" />

    <div className="flex items-center space-x-3 text-zinc-500 overflow-hidden">
      <div className="flex items-center space-x-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-default">
        <HomeIcon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Lab</span>
      </div>
      <span className="text-zinc-800 font-mono text-[10px]">/</span>
      <div className="flex items-center space-x-1.5 truncate">
        <BeakerIcon className="w-3.5 h-3.5 text-blue-500/50" />
        <span className="text-[11px] font-bold text-zinc-300 truncate max-w-[140px] tracking-tight">{projectName}</span>
      </div>
    </div>
  </div>
);
