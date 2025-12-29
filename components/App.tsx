
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useRef, useMemo } from 'react';
import { Hero } from './Hero';
import { InputArea } from './InputArea';
import { LivePreview } from './LivePreview';
import { CreationHistory } from './CreationHistory';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { useHistory } from '../hooks/useHistory';
import { Creation } from '../types';
import { Tooltip } from './ui/Tooltip';
import { useCreation } from '../hooks/useCreation';
import { PWAInstaller } from './ui/PWAInstaller';

/**
 * THE MANIFESTATION LAB - MAIN RUNTIME
 */
const App: React.FC = () => {
  const { history, addCreation } = useHistory();
  
  const { 
    activeCreation, 
    isGenerating, 
    generationError,
    generateFromPrompt, 
    generateFromText, 
    reset, 
    setActiveCreation 
  } = useCreation(addCreation);
  
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
                addCreation(imported);
                setActiveCreation(imported);
            }
        } catch (err) {
            console.error("[Recovery] Validation Error:", err);
            alert("Invalid artifact structure. Migration failed.");
        }
    };
    reader.readAsText(file);
    if (importInputRef.current) importInputRef.current.value = '';
  };

  const isFocused = useMemo(() => !!activeCreation || isGenerating, [activeCreation, isGenerating]);

  return (
    <div className="h-[100dvh] bg-[#050507] text-zinc-50 selection:bg-blue-500/30 overflow-hidden flex flex-col relative">
      {/* SPATIAL BACKGROUND */}
      <div className="fixed inset-0 bg-dot-grid pointer-events-none opacity-40"></div>
      <div className="fixed inset-0 bg-noise pointer-events-none"></div>
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/5 via-transparent to-transparent pointer-events-none"></div>

      {/* MAIN VIEWPORT */}
      <main 
        className={`
          flex-1 flex flex-col w-full max-w-7xl mx-auto px-8 relative z-10 overflow-y-auto overflow-x-hidden custom-scrollbar
          transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)
          ${isFocused 
            ? 'opacity-0 scale-[0.98] blur-2xl pointer-events-none translate-y-12' 
            : 'opacity-100 scale-100 blur-0 translate-y-0'
          }
        `}
      >
        <div className="flex-1 flex flex-col justify-center items-center w-full py-24">
          <section className="w-full mb-20">
              <Hero />
          </section>

          <section className="w-full flex justify-center">
              <InputArea 
                onGenerate={generateFromPrompt} 
                onTextToImage={generateFromText}
                isGenerating={isGenerating} 
                error={generationError}
                disabled={isFocused} 
              />
          </section>
        </div>
        
        <footer className="mt-auto pb-16 flex flex-col items-center gap-16">
            <CreationHistory history={history} onSelect={setActiveCreation} />
            
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center space-x-3 text-zinc-800">
                 <div className="h-px w-8 bg-zinc-900" />
                 <span className="text-[10px] font-mono tracking-[0.5em] uppercase font-bold">Protocol v3.0-Display</span>
                 <div className="h-px w-8 bg-zinc-900" />
              </div>
              <a href="https://x.com/ammaar" target="_blank" rel="noopener noreferrer" className="text-zinc-700 hover:text-blue-500 text-[11px] font-mono transition-all duration-300 tracking-wider">ammaar.ai</a>
            </div>
        </footer>
      </main>

      {/* MODAL RUNTIME */}
      <LivePreview
        creation={activeCreation}
        isLoading={isGenerating}
        isFocused={isFocused}
        onReset={reset}
      />

      {/* PWA INSTALLER BANNER */}
      <PWAInstaller />

      {/* RECOVERY BUTTON */}
      {!isFocused && (
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
      )}
    </div>
  );
};

export default App;
