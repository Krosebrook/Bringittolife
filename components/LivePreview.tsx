
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
import { THEME_VARIABLES } from '../utils/injection';

interface LivePreviewProps {
  creation: Creation | null;
  isLoading: boolean;
  isFocused: boolean;
  onReset: () => void;
}

export type SidePanelType = 'reference' | 'css';

export const LivePreview: React.FC<LivePreviewProps> = ({ creation, isLoading, isFocused, onReset }) => {
    const [showSplitView, setShowSplitView] = useState(false);
    const [activeSidePanel, setActiveSidePanel] = useState<SidePanelType>('reference');
    const [customCss, setCustomCss] = useState<string>("");
    const [isCopied, setIsCopied] = useState(false);
    const [isDragMode, setIsDragMode] = useState(true);
    const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
    const [isLandscape, setIsLandscape] = useState(false);
    
    const { 
        scale, pan, isPanMode, isDragging, setIsPanMode, 
        zoomIn, zoomOut, resetView, panHandlers 
    } = usePanZoom();
    
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const srcDoc = useIframeContent(creation);

    // Initial state setup on new creation
    useEffect(() => {
        if (creation) {
            // 1. Extract Artifact-specific CSS
            const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
            let extractedCss = "";
            let match;
            while ((match = styleRegex.exec(creation.html)) !== null) {
                extractedCss += match[1].trim() + "\n\n";
            }
            
            // Set user-editable CSS area (The "Artifact Layer")
            setCustomCss(extractedCss.trim());

            // 2. Viewport & UI State Reset
            if (creation.originalImage) {
              setShowSplitView(true);
              setActiveSidePanel('reference');
            } else {
              setShowSplitView(false);
            }

            setIsDragMode(true);
            setDeviceMode('desktop');
            setIsLandscape(false);
            resetView();
            setIsPanMode(false);
        }
    }, [creation?.id, resetView, setIsPanMode]);

    // Push CSS changes to the "Artifact Layer" in the iframe for real-time morphing
    useEffect(() => {
      const timeout = setTimeout(() => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({ type: 'update-css', css: customCss }, '*');
        }
      }, 50);
      return () => clearTimeout(timeout);
    }, [customCss]);

    const handleIframeLoad = useCallback(() => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(isDragMode ? 'enable-drag' : 'disable-drag', '*');
            iframeRef.current.contentWindow.postMessage({ type: 'update-css', css: customCss }, '*');
        }
    }, [isDragMode, customCss]);

    const handleCopyCode = async () => {
        if (!creation?.html) return;
        try {
            const styledHtml = creation.html.replace(/<\/head>/i, `<style>${customCss}</style>\n</head>`);
            await navigator.clipboard.writeText(styledHtml);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const handleExportHtml = () => {
      if (!creation) return;
      const styledHtml = creation.html.replace(/<\/head>/i, `<style>${customCss}</style>\n</head>`);
      downloadFile(styledHtml, `${creation.name}.html`, 'text/html');
    };

    const handleExportReact = () => {
      if (!creation) return;
      const reactCode = convertToReactComponent(creation.html, creation.name, customCss);
      downloadFile(reactCode, `${creation.name}.tsx`);
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
              if (activeSidePanel === type && showSplitView) {
                  setShowSplitView(false);
              } else {
                  setActiveSidePanel(type);
                  setShowSplitView(true);
              }
          }}
          onToggleDragMode={() => {
              const nextMode = !isDragMode;
              setIsDragMode(nextMode);
              setIsPanMode(false);
              if (iframeRef.current?.contentWindow) {
                  iframeRef.current.contentWindow.postMessage(nextMode ? 'enable-drag' : 'disable-drag', '*');
              }
          }}
          onExportPdf={() => iframeRef.current?.contentWindow?.print()}
          onExportJson={() => creation && downloadArtifact(creation, `artifact_${creation.id}.json`)}
          onExportReact={handleExportReact}
          onExportHtml={handleExportHtml}
          onCopyCode={handleCopyCode}
        />

        <div className="relative w-full flex-1 bg-[#09090b] flex overflow-hidden">
          {isLoading ? (
            <ManifestationLoading step={0} />
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
