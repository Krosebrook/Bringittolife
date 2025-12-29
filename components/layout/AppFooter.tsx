
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { CreationHistory } from '../CreationHistory';
import { Creation } from '../../types';

interface AppFooterProps {
  history: Creation[];
  onSelect: (creation: Creation) => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({ history, onSelect }) => (
  <footer className="mt-auto pb-16 flex flex-col items-center gap-16">
    <CreationHistory history={history} onSelect={onSelect} />
    
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center space-x-3 text-zinc-800">
        <div className="h-px w-8 bg-zinc-900" />
        <span className="text-[10px] font-mono tracking-[0.5em] uppercase font-bold">Protocol v3.0-Display</span>
        <div className="h-px w-8 bg-zinc-900" />
      </div>
      <a 
        href="https://x.com/ammaar" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-zinc-700 hover:text-blue-500 text-[11px] font-mono transition-all duration-300 tracking-wider"
      >
        ammaar.ai
      </a>
    </div>
  </footer>
);
