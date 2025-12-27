
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { ChevronLeftIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '../../ui/Tooltip';

interface WindowControlsProps {
  onClose: () => void;
  projectName?: string;
}

export const WindowControls: React.FC<WindowControlsProps> = ({ onClose, projectName = "Project" }) => (
  <div className="flex items-center space-x-4 min-w-[200px]">
    <Tooltip content="Exit to Dashboard" side="bottom">
      <button 
        onClick={onClose}
        aria-label="Back to dashboard"
        className="group flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white"
      >
        <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-xs font-bold tracking-tight">Exit Lab</span>
      </button>
    </Tooltip>

    <div className="h-4 w-px bg-zinc-800" />

    <div className="flex items-center space-x-2 text-zinc-600">
      <HomeIcon className="w-3.5 h-3.5" />
      <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">Dashboard</span>
      <span className="text-[10px] font-mono">/</span>
      <span className="text-[11px] font-bold text-zinc-400 truncate max-w-[120px]">{projectName}</span>
    </div>
  </div>
);
