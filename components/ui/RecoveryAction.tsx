
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useRef } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { Tooltip } from './Tooltip';
import { Creation } from '../../types';

interface RecoveryActionProps {
  onImport: (creation: Creation) => void;
  isVisible: boolean;
}

export const RecoveryAction: React.FC<RecoveryActionProps> = ({ onImport, isVisible }) => {
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.html && parsed.name) {
          const imported: Creation = {
            ...parsed,
            timestamp: new Date(parsed.timestamp || Date.now()),
            id: parsed.id || crypto.randomUUID()
          };
          onImport(imported);
        }
      } catch (err) {
        console.error("[Recovery] Validation Error:", err);
        alert("Invalid artifact structure. Migration failed.");
      }
    };
    reader.readAsText(file);
    if (importInputRef.current) importInputRef.current.value = '';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-10 right-10 z-50 animate-in fade-in zoom-in duration-1000">
      <Tooltip content="Restore Fragment (.json)" side="top">
        <button 
          onClick={() => importInputRef.current?.click()}
          className="group flex items-center justify-center w-14 h-14 bg-zinc-900 border border-white/10 rounded-full text-zinc-500 hover:text-white transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] active:scale-90"
        >
          <ArrowUpTrayIcon className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </Tooltip>
      <input 
        type="file" 
        ref={importInputRef} 
        onChange={handleImportFile} 
        accept=".json" 
        className="hidden" 
      />
    </div>
  );
};
