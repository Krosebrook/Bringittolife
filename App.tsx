
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useRef, useMemo } from 'react';
import { Hero } from './components/Hero';
import { InputArea } from './components/InputArea';
import { LivePreview } from './components/LivePreview';
import { CreationHistory } from './components/CreationHistory';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { useHistory } from './hooks/useHistory';
import { Creation } from './types';
import { Tooltip } from './components/ui/Tooltip';
import { useCreation } from './hooks/useCreation';

/**
 * THE MANIFESTATION LAB - MAIN RUNTIME
 * Decouples logic into hooks for maximum clarity and performance.
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

  /**
   * RECOVERY PROTOCOL
   * Restores an artifact from a valid JSON export.
   */
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
    <div className="h-[100dvh] bg-zinc-950 bg-dot-grid text-zinc-50 selection:bg-blue-500/30 overflow-y-auto overflow-x-hidden flex flex-col relative">
      {/* BACKGROUND SCENE */}
      <main 
        className={`
          flex-1 flex flex-col w-full max-w-7xl mx-auto px-6 relative z-10 
          transition-all duration-1000 cubic-bezier(0.23, 1, 0.32, 1)
          ${isFocused 
            ? 'opacity-0 scale-95 blur-3xl pointer-events-none h-[100dvh] overflow-hidden translate-y-8' 
            : 'opacity-100 scale-100 blur-0 translate-y-0'
          }
        `}
      >
        <div className="flex-1 flex flex-col justify-center items-center w-full py-16">
          <section className="w-full mb-16">
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
        
        <footer className="mt-auto pb-12 flex flex-col items-center gap-12">
            <CreationHistory history={history} onSelect={setActiveCreation} />
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-zinc-800 font-mono tracking-[0.3em] uppercase">Engine Build v2.5.0-Preview</span>
              <a href="https://x.com/ammaar" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-white text-xs font-mono transition-colors">@ammaar</a>
            </div>
        </footer>
      </main>

      {/* OVERLAY RUNTIME */}
      <LivePreview
        creation={activeCreation}
        isLoading={isGenerating}
        isFocused={isFocused}
        onReset={reset}
      />

      {/* RECOVERY ACTION */}
      {!isFocused && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Tooltip content="Restore Artifact (.json)" side="top">
              <button 
                  onClick={() => importInputRef.current?.click()}
                  className="flex items-center space-x-2 bg-zinc-900/40 backdrop-blur-lg border border-zinc-800 p-3.5 rounded-full text-zinc-500 hover:text-white transition-all hover:border-zinc-600 hover:shadow-2xl active:scale-90"
              >
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
      )}
    </div>
  );
};

export default App;
