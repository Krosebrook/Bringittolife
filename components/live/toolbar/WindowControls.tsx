
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '../../ui/Tooltip';

interface WindowControlsProps {
  onClose: () => void;
}

export const WindowControls: React.FC<WindowControlsProps> = ({ onClose }) => (
  <div className="flex items-center space-x-3 w-32">
    <div className="flex space-x-2 group/controls">
      <Tooltip content="Close Preview" side="bottom">
        <button 
          onClick={onClose}
          aria-label="Close preview and return to home"
          className="w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-red-500 hover:!bg-red-600 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#121214]"
        >
          <XMarkIcon className="w-2 h-2 text-black opacity-0 group-hover/controls:opacity-100" aria-hidden="true" />
        </button>
      </Tooltip>
      <div className="w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-yellow-500 transition-colors" aria-hidden="true"></div>
      <div className="w-3 h-3 rounded-full bg-zinc-700 group-hover/controls:bg-green-500 transition-colors" aria-hidden="true"></div>
    </div>
  </div>
);
