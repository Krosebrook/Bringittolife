
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { 
  MagnifyingGlassMinusIcon, 
  MagnifyingGlassPlusIcon, 
  ArrowsPointingOutIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import { Tooltip } from '../../ui/Tooltip';

interface ViewportControlsProps {
  scale: number;
  isPanMode: boolean;
  isDragMode?: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onTogglePanMode: () => void;
  onToggleDragMode?: () => void;
}

export const ViewportControls: React.FC<ViewportControlsProps> = ({
  scale,
  isPanMode,
  isDragMode,
  onZoomIn,
  onZoomOut,
  onResetView,
  onTogglePanMode,
  onToggleDragMode
}) => (
  <nav className="flex items-center bg-zinc-900/60 rounded-xl p-1 mr-3 border border-zinc-800/60" aria-label="Viewport controls">
    <Tooltip content="Zoom Out" side="bottom">
      <button 
        onClick={onZoomOut} 
        aria-label="Zoom out" 
        className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
      >
        <MagnifyingGlassMinusIcon className="w-4.5 h-4.5" />
      </button>
    </Tooltip>
    
    <Tooltip content="Fit to Canvas" side="bottom">
      <button 
        onClick={onResetView} 
        aria-label="Reset zoom" 
        className="px-3 py-1.5 min-w-[3.5rem] text-[10px] font-black font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
      >
        {Math.round(scale * 100)}%
      </button>
    </Tooltip>

    <Tooltip content="Zoom In" side="bottom">
      <button 
        onClick={onZoomIn} 
        aria-label="Zoom in" 
        className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
      >
        <MagnifyingGlassPlusIcon className="w-4.5 h-4.5" />
      </button>
    </Tooltip>

    <div className="w-px h-4 bg-zinc-800 mx-1.5" aria-hidden="true" />

    <Tooltip content={isPanMode ? "Release Pan" : "Spatial Pan"} side="bottom">
      <button 
        onClick={onTogglePanMode}
        aria-pressed={isPanMode}
        className={`p-2 rounded-lg transition-all ${isPanMode ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}
      >
        <ArrowsPointingOutIcon className="w-4.5 h-4.5" />
      </button>
    </Tooltip>

    <Tooltip content={isDragMode ? "Freeze Components" : "Element Drag"} side="bottom">
      <button 
        onClick={onToggleDragMode}
        aria-pressed={isDragMode}
        className={`p-2 rounded-lg transition-all ${isDragMode ? 'bg-amber-500 text-black shadow-lg font-bold' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}
      >
        <HandRaisedIcon className="w-4.5 h-4.5" />
      </button>
    </Tooltip>
  </nav>
);
