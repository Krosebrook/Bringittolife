
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
  <div className="flex items-center justify-end space-x-1 w-auto min-w-[8rem]">
    <div className="flex items-center space-x-1" aria-label="Export options">
      <Tooltip content="Export React Component" side="bottom">
        <button onClick={onExportReact} aria-label="Export as React" className="text-zinc-500 hover:text-blue-400 transition-colors p-1.5 rounded-md hover:bg-zinc-800">
          <CommandLineIcon className="w-4 h-4" />
        </button>
      </Tooltip>

      <Tooltip content="Export HTML File" side="bottom">
        <button onClick={onExportHtml} aria-label="Download HTML" className="text-zinc-500 hover:text-blue-400 transition-colors p-1.5 rounded-md hover:bg-zinc-800">
          <ArrowDownOnSquareIcon className="w-4 h-4" />
        </button>
      </Tooltip>

      <Tooltip content="Save as PDF" side="bottom">
        <button onClick={onExportPdf} aria-label="Print to PDF" className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-md hover:bg-zinc-800">
          <PrinterIcon className="w-4 h-4" />
        </button>
      </Tooltip>

      <Tooltip content="Copy Code" side="bottom">
        <button onClick={onCopyCode} aria-label="Copy code to clipboard" className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-md hover:bg-zinc-800">
          {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
        </button>
      </Tooltip>
    </div>

    <Tooltip content="New Manifestation" side="bottom">
      <button 
        onClick={onNewManifestation}
        className="ml-2 flex items-center space-x-1 text-xs font-bold bg-white text-black hover:bg-zinc-200 px-3 py-1.5 rounded-md transition-all active:scale-95"
      >
        <PlusIcon className="w-3 h-3" />
        <span className="hidden sm:inline">New</span>
      </button>
    </Tooltip>
  </div>
);
