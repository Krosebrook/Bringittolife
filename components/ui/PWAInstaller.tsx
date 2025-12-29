
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { SparklesIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 1. Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Use relative path to support subpath deployments and preview environments
        navigator.serviceWorker.register('./sw.js')
          .then(registration => {
            console.debug('[Manifest SW] Registered:', registration.scope);
          })
          .catch(error => {
            // Downgrade to warning as SW might be blocked in sandboxed previews
            console.warn('[Manifest SW] Service Worker registration skipped:', error.message);
          });
      });
    }
  }, []);

  // 2. Install Prompt Handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                         || (window.navigator as any).standalone 
                         || document.referrer.includes('android-app://');
      
      if (!isStandalone) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4 animate-in slide-in-from-bottom-8 duration-700">
      <div className="glass bg-zinc-950/80 border border-white/10 rounded-2xl p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center justify-between gap-6 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        
        <div className="flex items-center gap-4 relative">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Manifest Lab</h4>
            <p className="text-[11px] text-zinc-400 font-medium">Install app for local synthesis & offline access.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative">
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2.5 text-zinc-500 hover:text-white transition-colors"
            aria-label="Dismiss install prompt"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={handleInstall}
            className="bg-white text-black hover:bg-zinc-200 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-xl"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Install</span>
          </button>
        </div>
      </div>
    </div>
  );
};
