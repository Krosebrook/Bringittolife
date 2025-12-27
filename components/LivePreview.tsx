
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Creation, DeviceMode } from '../types';
import { usePanZoom } from '../hooks/usePanZoom';
import { PreviewToolbar } from './PreviewToolbar';
import { downloadArtifact, downloadFile } from '../utils/fileHelpers';
import { convertToReactComponent } from '../utils/reactConverter';
import { ManifestationLoading } from './live/ManifestationLoading';
import { ReferencePanel } from './live/ReferencePanel';
import { SimulatorViewport } from './live/SimulatorViewport';
import { useIframeContent } from '../hooks/useIframeContent';
import { CssEditorPanel } from './live/CssEditorPanel';
import { ChatPanel } from './live/ChatPanel';
import { useCreation } from '../hooks/useCreation';

interface LivePreviewProps {
  creation: Creation | null;
  isLoading: boolean;
  isFocused: boolean;
  onReset: () => void;
}

export type SidePanelType = 'reference' | 'css' | 'chat';

export const LivePreview: React.FC<LivePreviewProps> = ({ 
  creation: propCreation, 
  isLoading: propIsLoading, 
  isFocused, 
  onReset 
}) => {
    const [showSplitView, setShowSplitView] = useState(false);
    const [activeSidePanel, setActiveSidePanel] = useState<SidePanelType>('chat');
    const [customCss, setCustomCss] = useState<string>("");
    const [isCopied, setIsCopied] = useState(false);
    const [isDragMode, setIsDragMode] = useState(false);
    const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
    const [isLandscape, setIsLandscape] = useState(false);

    const { 
      activeCreation: internalCreation, 
      isGenerating: internalIsLoading, 
      isListening,
      persona,
      refine,
      toggleVoiceMode,
      updateTheme,
      changePersona
    } = useCreation(() => {});

    const creation = internalCreation || propCreation;
    const isLoading = internalIsLoading || propIsLoading;

    const { 
        scale, pan, isPanMode, isDragging, setIsPanMode, 
        zoomIn, zoomOut, resetView, panHandlers 
    } = usePanZoom();
    
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const srcDoc = useIframeContent(creation);

    /**
     * INITIALIZATION: Design Extraction
     * When a new artifact is manifested, we extract its model-generated CSS
     * into the editor state. We wrap these in @layer utilities to ensure they
     * override standard framework defaults while remaining editable by the user.
     */
    useEffect(() => {
        if (creation) {
            const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
            let extractedCss = "";
            let match;
            while ((match = styleRegex.exec(creation.html)) !== null) {
                extractedCss += `/* Refined Artifact Styles */\n@layer utilities {\n${match[1].trim()}\n}\n\n`;
            }
            
            // Only set if we actually found new styles, to avoid unnecessary re-renders
            if (extractedCss) {
                setCustomCss(extractedCss.trim());
            } else if (!customCss) {
                // If no styles found and we don't have existing ones, set a helpful starting comment
                setCustomCss("/* Add custom CSS or Tailwind @apply rules here */\n");
            }
            
            // Automated layout optimization based on image presence
            if (creation.originalImage && !showSplitView && !internalCreation) {
              setShowSplitView(true);
              setActiveSidePanel('reference');
            }
        }
    }, [creation?.id]);

    /**
     * HOT-RELOAD: High Precedence CSS
     * Dispatches the local state CSS to the iframe's override layer.
     * We use a tiny debounce to ensure smooth performance during active typing.
     */
    useEffect(() => {
      const syncStyles = () => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({ type: 'update-css', css: customCss }, '*');
        }
      };
      
      const timer = setTimeout(syncStyles, 16); // 16ms = 60fps target
      return () => clearTimeout(timer);
    }, [customCss]);

    /**
     * HOT-RELOAD: Dynamic Brand Identity
     */
    useEffect(() => {
      if (creation?.theme && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ 
          type: 'update-theme', 
          ...creation.theme 
        }, '*');
      }
    }, [creation?.theme, creation?.id]);

    const handleIframeLoad = useCallback(() => {
        if (iframeRef.current?.contentWindow) {
            // Re-sync all design states on fresh iframe mounting
            iframeRef.current.contentWindow.postMessage({ command: isDragMode ? 'enable-drag' : 'disable-drag' }, '*');
            iframeRef.current.contentWindow.postMessage({ type: 'update-css', css: customCss }, '*');
            if (creation?.theme) {
              iframeRef.current.contentWindow.postMessage({ type: 'update-theme', ...creation.theme }, '*');
            }
        }
    }, [isDragMode, customCss, creation?.theme]);

    const handleCopyCode = async () => {
        if (!creation?.html) return;
        try {
            // Consolidate design layers for external use
            const styledHtml = creation.html.replace(/<\/head>/i, `<style type="text/tailwindcss">${customCss}</style>\n</head>`);
            await navigator.clipboard.writeText(styledHtml);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) { console.error("[Manifest] Copy Fail:", err); }
    };

    return (
      <div className={`
        fixed z-40 flex flex-col rounded-xl overflow-hidden border border-zinc-800 bg-[#0E0E10] shadow-2xl
        transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1)
        ${isFocused ? 'inset-2 md:inset-4 opacity-100 scale-100' : 'top-1/2 left-1/2 w-0 h-0 opacity-0 scale-90 pointer-events-none'}
      `}>
        <PreviewToolbar
          creation={creation}
          isLoading={isLoading}
          scale={scale}
          isPanMode={isPanMode}
          deviceMode={deviceMode}
          isLandscape={isLandscape}
          isDragMode={isDragMode}
          showSplitView={showSplitView}
          activeSidePanel={activeSidePanel}
          isCopied={isCopied}
          onReset={onReset}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetView={resetView}
          onTogglePanMode={() => { setIsPanMode(!isPanMode); setIsDragMode(false); }}
          onChangeDeviceMode={setDeviceMode}
          onToggleOrientation={() => setIsLandscape(!isLandscape)}
          onToggleSplitView={() => setShowSplitView(!showSplitView)}
          onToggleSidePanel={(type) => {
              if (activeSidePanel === type && showSplitView) setShowSplitView(false);
              else { setActiveSidePanel(type); setShowSplitView(true); }
          }}
          onToggleDragMode={() => {
              const nextMode = !isDragMode;
              setIsDragMode(nextMode);
              setIsPanMode(false);
              if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage({ command: nextMode ? 'enable-drag' : 'disable-drag' }, '*');
          }}
          onExportPdf={() => iframeRef.current?.contentWindow?.print()}
          onExportJson={() => creation && downloadArtifact(creation, `artifact_${creation.id}.json`)}
          onExportReact={() => creation && downloadFile(convertToReactComponent(creation.html, creation.name, customCss), `${creation.name}.tsx`)}
          onExportHtml={() => creation && downloadFile(creation.html.replace(/<\/head>/i, `<style type="text/tailwindcss">${customCss}</style>\n</head>`), `${creation.name}.html`, 'text/html')}
          onCopyCode={handleCopyCode}
        />

        <div className="relative w-full flex-1 bg-[#09090b] flex overflow-hidden">
          {isLoading && !creation ? (
            <ManifestationLoading step={0} />
          ) : creation ? (
            <>
              {showSplitView && (
                  activeSidePanel === 'reference' && creation.originalImage ? (
                    <ReferencePanel image={creation.originalImage} />
                  ) : activeSidePanel === 'css' ? (
                    <CssEditorPanel 
                      css={customCss} 
                      theme={creation.theme}
                      onChange={setCustomCss} 
                      onThemeChange={updateTheme}
                    />
                  ) : activeSidePanel === 'chat' ? (
                    <ChatPanel 
                      history={creation.chatHistory || []} 
                      onSendMessage={(text) => refine(text)} 
                      isLoading={isLoading} 
                      isListening={isListening}
                      onToggleVoice={toggleVoiceMode}
                      persona={creation.persona || persona}
                      onPersonaChange={changePersona}
                    />
                  ) : null
              )}
              <SimulatorViewport 
                srcDoc={srcDoc}
                deviceMode={deviceMode}
                isLandscape={isLandscape}
                scale={scale}
                pan={pan}
                isPanMode={isPanMode}
                isDragging={isDragging}
                panHandlers={panHandlers}
                iframeRef={iframeRef}
                onIframeLoad={handleIframeLoad}
              />
            </>
          ) : null}
        </div>
      </div>
    );
};
