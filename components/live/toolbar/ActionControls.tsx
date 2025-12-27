
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { 
  CommandLineIcon, 
  ArrowDownOnSquareIcon, 
  PrinterIcon, 
  CheckIcon, 
  ClipboardDocumentIcon, 
  PlusIcon 
} from '@heroicons/react/24/outline';
import { Tooltip } from '../../ui/Tooltip';

interface ActionControlsProps {
  isCopied: boolean;
  onExportReact: () => void;
  onExportHtml: () => void;
  onExportPdf: () => void;
  onCopyCode: () => void;
  onNewManifestation: () => void;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  isCopied,
  onExportReact,
  onExportHtml,
  onExportPdf,
  onCopyCode,
  onNewManifestation
}) => (
  <div className="flex items-center justify-end space-x-1 w-auto">
    <div className="flex items-center space-x-0.5 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800/50" role="group" aria-label="Export tools">
      <Tooltip content="Export as React Component" side="bottom">
        <button 
          onClick={onExportReact} 
          aria-label="Export React"
          className="text-zinc-500 hover:text-blue-400 transition-all p-2 rounded-md hover:bg-zinc-800 active:scale-90"
        >
          <CommandLineIcon className="w-4.5 h-4.5" />
        </button>
      </Tooltip>

      <Tooltip content="Download HTML File" side="bottom">
        <button 
          onClick={onExportHtml} 
          aria-label="Download HTML"
          className="text-zinc-500 hover:text-blue-400 transition-all p-2 rounded-md hover:bg-zinc-800 active:scale-90"
        >
          <ArrowDownOnSquareIcon className="w-4.5 h-4.5" />
        </button>
      </Tooltip>

      <Tooltip content="Print to PDF" side="bottom">
        <button 
          onClick={onExportPdf} 
          aria-label="Export PDF"
          className="text-zinc-500 hover:text-zinc-200 transition-all p-2 rounded-md hover:bg-zinc-800 active:scale-90"
        >
          <PrinterIcon className="w-4.5 h-4.5" />
        </button>
      </Tooltip>

      <Tooltip content="Copy Full Code" side="bottom">
        <button 
          onClick={onCopyCode} 
          aria-label="Copy to clipboard"
          className="text-zinc-500 hover:text-zinc-200 transition-all p-2 rounded-md hover:bg-zinc-800 active:scale-90"
        >
          {isCopied ? <CheckIcon className="w-4.5 h-4.5 text-green-500" /> : <ClipboardDocumentIcon className="w-4.5 h-4.5" />}
        </button>
      </Tooltip>
    </div>

    <div className="w-px h-6 bg-zinc-800 mx-2 hidden sm:block" />

    <Tooltip content="Start New Manifestation" side="bottom">
      <button 
        onClick={onNewManifestation}
        className="flex items-center space-x-1.5 text-[11px] font-bold bg-white text-black hover:bg-zinc-200 px-3 py-2 rounded-lg transition-all active:scale-95 shadow-lg"
      >
        <PlusIcon className="w-3.5 h-3.5 stroke-[3px]" />
        <span className="hidden lg:inline uppercase tracking-wider">New Project</span>
      </button>
    </Tooltip>
  </div>
);
