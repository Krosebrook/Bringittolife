
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { 
  MagnifyingGlassMinusIcon, 
  MagnifyingGlassPlusIcon, 
  ArrowsPointingOutIcon 
} from '@heroicons/react/24/outline';
import { Tooltip } from '../../ui/Tooltip';

interface ViewportControlsProps {
  scale: number;
  isPanMode: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onTogglePanMode: () => void;
}

export const ViewportControls: React.FC<ViewportControlsProps> = ({
  scale,
  isPanMode,
  onZoomIn,
  onZoomOut,
  onResetView,
  onTogglePanMode
}) => (
  <nav className="flex items-center bg-zinc-900/50 rounded-md p-0.5 mr-2 border border-zinc-800/50" aria-label="Zoom and pan">
    <Tooltip content="Zoom Out" side="bottom">
      <button onClick={onZoomOut} aria-label="Zoom out" className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-all">
        <MagnifyingGlassMinusIcon className="w-4 h-4" />
      </button>
    </Tooltip>
    
    <Tooltip content="Reset View" side="bottom">
      <button onClick={onResetView} aria-label="Reset zoom to 100%" className="px-2 py-1 min-w-[3rem] text-[10px] font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-all">
        {Math.round(scale * 100)}%
      </button>
    </Tooltip>

    <Tooltip content="Zoom In" side="bottom">
      <button onClick={onZoomIn} aria-label="Zoom in" className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-all">
        <MagnifyingGlassPlusIcon className="w-4 h-4" />
      </button>
    </Tooltip>

    <div className="w-px h-3 bg-zinc-800 mx-1" aria-hidden="true"></div>

    <Tooltip content={isPanMode ? "Exit Pan Mode" : "Pan Tool (Hold Space)"} side="bottom">
      <button 
        onClick={onTogglePanMode}
        aria-pressed={isPanMode}
        className={`p-1.5 rounded transition-all ${isPanMode ? 'bg-blue-900/30 text-blue-400 ring-1 ring-blue-500/50' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
      >
        <ArrowsPointingOutIcon className="w-4 h-4" />
      </button>
    </Tooltip>
  </nav>
);
