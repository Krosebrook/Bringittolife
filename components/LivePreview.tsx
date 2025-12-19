
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState, useRef } from 'react';
import { Creation } from '../types';
import { usePanZoom } from '../hooks/usePanZoom';
import { PreviewToolbar, DeviceMode } from './PreviewToolbar';
import { downloadArtifact, downloadFile } from '../utils/fileHelpers';
import { convertToReactComponent } from '../utils/reactConverter';
import { ManifestationLoading } from './live/ManifestationLoading';
import { ReferencePanel } from './live/ReferencePanel';
import { SimulatorViewport } from './live/SimulatorViewport';
import { useIframeContent } from '../hooks/useIframeContent';

interface LivePreviewProps {
  creation: Creation | null;
  isLoading: boolean;
  isFocused: boolean;
  onReset: () => void;
}

/**
 * ROOT COMPONENT: LivePreview
 * Orchestrates the entire manifestation preview interface.
 */
export const LivePreview: React.FC<LivePreviewProps> = ({ creation, isLoading, isFocused, onReset }) => {
    const [loadingStep, setLoadingStep] = useState(0);
    const [showSplitView, setShowSplitView] = useState(false);
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

    // Progress animation loop for generation state
    useEffect(() => {
        if (isLoading) {
            setLoadingStep(0);
            const interval = setInterval(() => {
                setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
            }, 1800); 
            return () => clearInterval(interval);
        }
    }, [isLoading]);

    // Cleanup and environment reset on creation context switch
    useEffect(() => {
        if (creation?.originalImage) setShowSplitView(true);
        setIsDragMode(false);
        setDeviceMode('desktop');
        setIsLandscape(false);
        resetView();
        setIsPanMode(false);
    }, [creation, resetView, setIsPanMode]);

    // Handle cross-context message passing for drag-and-drop state
    useEffect(() => {
        const timer = setTimeout(() => {
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage(isDragMode ? 'enable-drag' : 'disable-drag', '*');
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [isDragMode, creation]);

    const handleCopyCode = async () => {
        if (!creation?.html) return;
        try {
            await navigator.clipboard.writeText(creation.html);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Clipboard fault:', err);
        }
    };

    const handleIframeLoad = () => {
        if (isDragMode && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage('enable-drag', '*');
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
          isCopied={isCopied}
          onReset={onReset}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetView={resetView}
          onTogglePanMode={() => { setIsPanMode(!isPanMode); setIsDragMode(false); }}
          onChangeDeviceMode={setDeviceMode}
          onToggleOrientation={() => setIsLandscape(!isLandscape)}
          onToggleSplitView={() => setShowSplitView(!showSplitView)}
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
              {showSplitView && creation.originalImage && (
                <ReferencePanel image={creation.originalImage} />
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
