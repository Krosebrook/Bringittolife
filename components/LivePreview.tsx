
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Creation, DeviceMode, AccessibilityIssue } from '../types';
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
import { AccessibilityPanel } from './live/AccessibilityPanel';
import { DocumentationPanel } from './live/DocumentationPanel';
import { CiCdPanel } from './live/CiCdPanel';
import { useCreation } from '../hooks/useCreation';
import { docsService } from '../services/docsService';
import { geminiService } from '../services/gemini';

interface LivePreviewProps {
  creation: Creation | null;
  isLoading: boolean;
  isFocused: boolean;
  onReset: () => void;
}

export type SidePanelType = 'reference' | 'css' | 'chat' | 'accessibility' | 'docs' | 'cicd';

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
    const [accessibilityIssues, setAccessibilityIssues] = useState<AccessibilityIssue[]>([]);
    const [isSyncingDocs, setIsSyncingDocs] = useState(false);
    const [isSyncingPipeline, setIsSyncingPipeline] = useState(false);

    const { 
      activeCreation: internalCreation, 
      isGenerating: internalIsLoading, 
      isListening,
      persona,
      refine,
      toggleVoiceMode,
      updateTheme,
      changePersona,
      setActiveCreation
    } = useCreation(() => {});

    const creation = internalCreation || propCreation;
    const isLoading = internalIsLoading || propIsLoading;

    const { 
        scale, pan, isPanMode, isDragging, setIsPanMode, 
        zoomIn, zoomOut, resetView, panHandlers 
    } = usePanZoom();
    
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const srcDoc = useIframeContent(creation);

    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'accessibility-audit') {
          setAccessibilityIssues(event.data.issues || []);
        }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, []);

    // REFACTORED: CSS Extraction Logic
    // Prioritizes extracted styles without restrictive @layer wrapping to ensure overrides work.
    useEffect(() => {
        if (creation) {
            const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
            let extractedCss = "";
            let match;
            while ((match = styleRegex.exec(creation.html)) !== null) {
                const styleContent = match[1].trim();
                if (styleContent) {
                  extractedCss += `/* Synthesized from Component Source */\n${styleContent}\n\n`;
                }
            }
            if (extractedCss) {
                setCustomCss(extractedCss.trim());
            } else if (!customCss) {
                setCustomCss("/* Add custom CSS or Tailwind @apply rules here */\n");
            }
        }
    }, [creation?.id]);

    useEffect(() => {
      const syncStyles = () => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({ type: 'update-css', css: customCss }, '*');
        }
      };
      // Immediate sync for responsiveness
      const timer = setTimeout(syncStyles, 0);
      return () => clearTimeout(timer);
    }, [customCss]);

    const handleIframeLoad = useCallback(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ command: isDragMode ? 'enable-drag' : 'disable-drag' }, '*');
            iframeRef.current.contentWindow.postMessage({ type: 'update-css', css: customCss }, '*');
            if (creation?.theme) {
              iframeRef.current.contentWindow.postMessage({ 
                type: 'update-theme', 
                h: creation.theme.h, 
                s: creation.theme.s, 
                l: creation.theme.l 
              }, '*');
            }
        }
    }, [isDragMode, customCss, creation?.theme]);

    const handleRefreshDocs = async () => {
      if (!creation) return;
      setIsSyncingDocs(true);
      try {
        const doc = await docsService.generateDocumentation(creation.name, creation.html);
        setActiveCreation({ ...creation, documentation: doc });
      } catch (err) {
        console.error("Doc Sync Failed", err);
      } finally {
        setIsSyncingDocs(false);
      }
    };

    const handleSuggestPipeline = async () => {
       if (!creation) return;
       setIsSyncingPipeline(true);
       try {
          const pipeline = await geminiService.suggestPipeline(creation.html);
          setActiveCreation({ ...creation, pipeline });
       } catch (err) {
          console.error("Pipeline Sync Failed", err);
       } finally {
          setIsSyncingPipeline(false);
       }
    };

    const handleCopyCode = async () => {
        if (!creation?.html) return;
        try {
            const styledHtml = creation.html.replace(/<\/head>/i, `<style type="text/tailwindcss">${customCss}</style>\n</head>`);
            await navigator.clipboard.writeText(styledHtml);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) { console.error("[Manifest] Copy Fail:", err); }
    };

    const handleExportReact = useCallback(() => {
      if (!creation) return;
      const componentName = creation.name.replace(/[^a-zA-Z0-9]/g, '');
      const reactCode = convertToReactComponent(creation.html, componentName, customCss, creation.theme);
      downloadFile(reactCode, `${componentName || 'ManifestedApp'}.tsx`);
    }, [creation, customCss]);

    return (
      <div 
        role="dialog"
        aria-modal="true"
        aria-label={creation ? `Editing ${creation.name}` : "Manifestation Preview"}
        className={`
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
          onExportReact={handleExportReact}
          onExportHtml={() => creation && downloadFile(creation.html.replace(/<\/head>/i, `<style type="text/tailwindcss">${customCss}</style>\n</head>`), `${creation.name}.html`, 'text/html')}
          onCopyCode={handleCopyCode}
          accessibilityCount={accessibilityIssues.length}
        />

        <div className="relative w-full flex-1 bg-[#09090b] flex flex-col md:flex-row overflow-hidden">
          {isLoading && !creation ? (
            <ManifestationLoading step={0} />
          ) : creation ? (
            <>
              {showSplitView && (
                <aside 
                  className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0c0c0e] flex flex-col shrink-0 overflow-hidden z-20"
                  aria-label="Refinement sidebar"
                >
                  {activeSidePanel === 'reference' && creation.originalImage ? (
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
                  ) : activeSidePanel === 'accessibility' ? (
                    <AccessibilityPanel 
                      issues={accessibilityIssues} 
                      onSendMessage={(text) => refine(text)} 
                    />
                  ) : activeSidePanel === 'docs' ? (
                    <DocumentationPanel 
                      doc={creation.documentation} 
                      onRefresh={handleRefreshDocs} 
                      isLoading={isSyncingDocs} 
                    />
                  ) : activeSidePanel === 'cicd' ? (
                    <CiCdPanel 
                      pipeline={creation.pipeline} 
                      onSuggest={handleSuggestPipeline} 
                      isLoading={isLoading || isSyncingPipeline} 
                    />
                  ) : null}
                </aside>
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
