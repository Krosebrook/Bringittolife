
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

interface LivePreviewProps {
  creation: Creation | null;
  isLoading: boolean;
  isFocused: boolean;
  onReset: () => void;
}

export type SidePanelType = 'reference' | 'css';

export const LivePreview: React.FC<LivePreviewProps> = ({ creation, isLoading, isFocused, onReset }) => {
    const [loadingStep, setLoadingStep] = useState(0);
    const [showSplitView, setShowSplitView] = useState(false);
    const [activeSidePanel, setActiveSidePanel] = useState<SidePanelType>('reference');
    const [customCss, setCustomCss] = useState<string>("");
    const [isCopied, setIsCopied] = useState(false);
    const [isDragMode, setIsDragMode] = useState(false);
    const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
    const [isLandscape, setIsLandscape] = useState(false);
    
    const { 
        scale, pan, isPanMode, isDragging, setIsPanMode, 
        zoomIn, zoomOut, resetView, panHandlers 
    } = usePanZoom();
    
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const srcDoc = useIframeContent(creation);

    // Sync state for CSS updates
    const syncCssToIframe = useCallback((css: string) => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'update-css', css }, '*');
      }
    }, []);

    // Initial CSS Extraction
    useEffect(() => {
        if (creation?.html) {
            const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
            let initialCss = "";
            let match;
            while ((match = styleRegex.exec(creation.html)) !== null) {
                initialCss += match[1].trim() + "\n\n";
            }
            setCustomCss(initialCss.trim());
        } else {
            setCustomCss("");
        }
    }, [creation?.id]);

    // Live Synchronizer (Throttled via React effect)
    useEffect(() => {
        syncCssToIframe(customCss);
    }, [customCss, syncCssToIframe]);

    // Cleanup and environment reset
    useEffect(() => {
        if (creation?.originalImage) {
            setShowSplitView(true);
            setActiveSidePanel('reference');
        }
        setIsDragMode(false);
        setDeviceMode('desktop');
        setIsLandscape(false);
        resetView();
        setIsPanMode(false);
    }, [creation?.id, resetView, setIsPanMode]);

    const handleIframeLoad = () => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(isDragMode ? 'enable-drag' : 'disable-drag', '*');
            syncCssToIframe(customCss);
        }
    };

    const handleCopyCode = async () => {
        if (!creation?.html) return;
        try {
            await navigator.clipboard.writeText(creation.html);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Clipboard copy failed:', err);
        }
    };

    return (
      <div className={`
        fixed z-40 flex flex-col rounded-lg overflow-hidden border border-zinc-800 bg-[#0E0E10] shadow-2xl
        transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1)
        ${isFocused ? 'inset-2 md:inset-4 opacity-100 scale-100' : 'top-1/2 left-1/2 w-[90%] h-[60%] -translate-x-1/2 -translate-y-1/2 opacity-0 scale-95 pointer-events-none'}
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
              if (activeSidePanel === type && showSplitView) {
                  setShowSplitView(false);
              } else {
                  setActiveSidePanel(type);
                  setShowSplitView(true);
              }
          }}
          onToggleDragMode={() => { setIsDragMode(!isDragMode); setIsPanMode(false); }}
          onExportPdf={() => iframeRef.current?.contentWindow?.print()}
          onExportJson={() => creation && downloadArtifact(creation, `artifact_${creation.id}.json`)}
          onExportReact={() => creation && downloadFile(convertToReactComponent(creation.html, creation.name), `${creation.name}.tsx`)}
          onExportHtml={() => creation && downloadFile(creation.html, `${creation.name}.html`, 'text/html')}
          onCopyCode={handleCopyCode}
        />

        <div className="relative w-full flex-1 bg-[#09090b] flex overflow-hidden">
          {isLoading ? (
            <ManifestationLoading step={loadingStep} />
          ) : creation ? (
            <>
              {showSplitView && (
                  activeSidePanel === 'reference' && creation.originalImage ? (
                    <ReferencePanel image={creation.originalImage} />
                  ) : activeSidePanel === 'css' ? (
                    <CssEditorPanel css={customCss} onChange={setCustomCss} />
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
