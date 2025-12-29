
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo } from 'react';
import { Hero } from './components/Hero';
import { InputArea } from './components/InputArea';
import { LivePreview } from './components/LivePreview';
import { RecoveryAction } from './components/ui/RecoveryAction';
import { AppFooter } from './components/layout/AppFooter';
import { useHistory } from './hooks/useHistory';
import { useCreation } from './hooks/useCreation';
import { PWAInstaller } from './components/ui/PWAInstaller';

/**
 * THE MANIFESTATION LAB - MAIN RUNTIME
 * Refactored for maximum clarity and modularity.
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
        
        <AppFooter 
          history={history} 
          onSelect={setActiveCreation} 
        />
      </main>

      {/* MODAL RUNTIME */}
      <LivePreview
        creation={activeCreation}
        isLoading={isGenerating}
        isFocused={isFocused}
        onReset={reset}
      />

      {/* PWA INSTALLER & SERVICE WORKER */}
      <PWAInstaller />

      {/* RECOVERY ACTION */}
      <RecoveryAction 
        isVisible={!isFocused} 
        onImport={(imported) => {
          addCreation(imported);
          setActiveCreation(imported);
        }} 
      />
    </div>
  );
};

export default App;
