/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useRef } from 'react';
import { Hero } from './components/Hero';
import { InputArea } from './components/InputArea';
import { LivePreview } from './components/LivePreview';
import { CreationHistory } from './components/CreationHistory';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { useHistory } from './hooks/useHistory';
import { Creation } from './types';
import { Tooltip } from './components/ui/Tooltip';
import { useCreation } from './hooks/useCreation';

const App: React.FC = () => {
  const { history, addCreation } = useHistory();
  const { 
    activeCreation, 
    isGenerating, 
    generateFromPrompt, 
    generateFromText, 
    reset, 
    setActiveCreation 
  } = useCreation(addCreation);
  
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = event.target?.result as string;
            const parsed = JSON.parse(json);
            
            // Basic validation
            if (parsed.html && parsed.name) {
                const importedCreation: Creation = {
                    ...parsed,
                    timestamp: new Date(parsed.timestamp || Date.now()),
                    id: parsed.id || crypto.randomUUID()
                };
                
                addCreation(importedCreation);
                setActiveCreation(importedCreation);
            } else {
                alert("Invalid creation file format.");
            }
        } catch (err) {
            console.error("Import error", err);
            alert("Failed to import creation.");
        }
        // Reset input
        if (importInputRef.current) importInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const isFocused = !!activeCreation || isGenerating;

  return (
    <div className="h-[100dvh] bg-zinc-950 bg-dot-grid text-zinc-50 selection:bg-blue-500/30 overflow-y-auto overflow-x-hidden relative flex flex-col">
      
      {/* Centered Content Container */}
      <div 
        className={`
          min-h-full flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10 
          transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)
          ${isFocused 
            ? 'opacity-0 scale-95 blur-sm pointer-events-none h-[100dvh] overflow-hidden' 
            : 'opacity-100 scale-100 blur-0'
          }
        `}
      >
        {/* Main Vertical Centering Wrapper */}
        <div className="flex-1 flex flex-col justify-center items-center w-full py-12 md:py-20">
          
          {/* 1. Hero Section */}
          <div className="w-full mb-8 md:mb-16">
              <Hero />
          </div>

          {/* 2. Input Section */}
          <div className="w-full flex justify-center mb-8">
              <InputArea 
                onGenerate={generateFromPrompt} 
                onTextToImage={generateFromText}
                isGenerating={isGenerating} 
                disabled={isFocused} 
              />
          </div>

        </div>
        
        {/* 3. History Section & Footer - Stays at bottom */}
        <div className="flex-shrink-0 pb-6 w-full mt-auto flex flex-col items-center gap-6">
            <div className="w-full px-2 md:px-0">
                <CreationHistory history={history} onSelect={setActiveCreation} />
            </div>
            
            <a 
              href="https://x.com/ammaar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-400 text-xs font-mono transition-colors pb-2"
            >
              Created by @ammaar
            </a>
        </div>
      </div>

      {/* Live Preview - Always mounted for smooth transition */}
      <LivePreview
        creation={activeCreation}
        isLoading={isGenerating}
        isFocused={isFocused}
        onReset={reset}
      />

      {/* Subtle Import Button (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-50 group">
        <Tooltip content="Import Artifact" side="top">
            <button 
                onClick={handleImportClick}
                className="flex items-center space-x-2 p-2 text-zinc-500 hover:text-zinc-300 transition-colors opacity-60 hover:opacity-100"
            >
                <span className="text-xs font-medium uppercase tracking-wider hidden sm:inline">Upload previous artifact</span>
                <ArrowUpTrayIcon className="w-5 h-5" />
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
    </div>
  );
};

export default App;