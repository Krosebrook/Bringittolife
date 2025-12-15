/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState, useRef } from 'react';
import { Creation } from '../types';
import { PdfRenderer } from './PdfRenderer';
import { INTERACTIVE_STYLES, DRAG_SCRIPT } from '../utils/injection';
import { usePanZoom } from '../hooks/usePanZoom';
import { PreviewToolbar, DeviceMode } from './PreviewToolbar';
import { downloadArtifact, downloadFile } from '../utils/fileHelpers';
import { convertToReactComponent } from '../utils/reactConverter';

interface LivePreviewProps {
  creation: Creation | null;
  isLoading: boolean;
  isFocused: boolean;
  onReset: () => void;
}

const LoadingStep = ({ text, active, completed }: { text: string, active: boolean, completed: boolean }) => (
    <div className={`flex items-center space-x-3 transition-all duration-500 ${active || completed ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}>
        <div className={`w-4 h-4 flex items-center justify-center ${completed ? 'text-green-400' : active ? 'text-blue-400' : 'text-zinc-700'}`}>
            {completed ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : active ? (
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            ) : (
                <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div>
            )}
        </div>
        <span className={`font-mono text-xs tracking-wide uppercase ${active ? 'text-zinc-200' : completed ? 'text-zinc-400 line-through' : 'text-zinc-600'}`}>{text}</span>
    </div>
);

export const LivePreview: React.FC<LivePreviewProps> = ({ creation, isLoading, isFocused, onReset }) => {
    const [loadingStep, setLoadingStep] = useState(0);
    const [showSplitView, setShowSplitView] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isDragMode, setIsDragMode] = useState(false); // For dragging ELEMENTS inside the app
    const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
    const [isLandscape, setIsLandscape] = useState(false);
    
    // Use the custom hook for pan/zoom logic
    const { 
        scale, 
        pan, 
        isPanMode, 
        isDragging, 
        setIsPanMode, 
        zoomIn, 
        zoomOut, 
        resetView, 
        panHandlers 
    } = usePanZoom();
    
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Handle loading animation steps
    useEffect(() => {
        if (isLoading) {
            setLoadingStep(0);
            const interval = setInterval(() => {
                setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
            }, 2000); 
            return () => clearInterval(interval);
        } else {
            setLoadingStep(0);
        }
    }, [isLoading]);

    // Reset view state when creation changes
    useEffect(() => {
        if (creation?.originalImage) {
            setShowSplitView(true);
        } else {
            setShowSplitView(false);
        }
        setIsDragMode(false);
        setDeviceMode('desktop');
        setIsLandscape(false);
        resetView();
        setIsPanMode(false);
    }, [creation]);

    // Handle Drag Mode toggling (internal element dragging)
    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(isDragMode ? 'enable-drag' : 'disable-drag', '*');
        }
    }, [isDragMode]);

    const handleExportJson = () => {
        if (!creation) return;
        const filename = `${creation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_artifact.json`;
        downloadArtifact(creation, filename);
    };

    const handleExportReact = () => {
        if (!creation) return;
        const componentName = creation.name.split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'GeneratedComponent';
        const reactCode = convertToReactComponent(creation.html, componentName);
        const filename = `${componentName}.tsx`;
        downloadFile(reactCode, filename, "text/typescript");
    };

    const handleExportHtml = () => {
        if (!creation) return;
        const filename = `${creation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
        downloadFile(creation.html, filename, "text/html");
    };

    const handleExportPdf = () => {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }
    };

    const handleCopyCode = async () => {
        if (!creation?.html) return;
        try {
            await navigator.clipboard.writeText(creation.html);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    const handleIframeLoad = () => {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow && isDragMode) {
            iframe.contentWindow.postMessage('enable-drag', '*');
        }
    };

  return (
    <div
      className={`
        fixed z-40 flex flex-col
        rounded-lg overflow-hidden border border-zinc-800 bg-[#0E0E10] shadow-2xl
        transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1)
        ${isFocused
          ? 'inset-2 md:inset-4 opacity-100 scale-100'
          : 'top-1/2 left-1/2 w-[90%] h-[60%] -translate-x-1/2 -translate-y-1/2 opacity-0 scale-95 pointer-events-none'
        }
      `}
    >
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
        onChangeDeviceMode={(mode) => { setDeviceMode(mode); setIsLandscape(false); }}
        onToggleOrientation={() => setIsLandscape(!isLandscape)}
        onToggleSplitView={() => setShowSplitView(!showSplitView)}
        onToggleDragMode={() => { setIsDragMode(!isDragMode); setIsPanMode(false); }}
        onExportPdf={handleExportPdf}
        onExportJson={handleExportJson}
        onExportReact={handleExportReact}
        onExportHtml={handleExportHtml}
        onCopyCode={handleCopyCode}
      />

      {/* Main Content Area */}
      <div className="relative w-full flex-1 bg-[#09090b] flex overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 w-full">
             <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-6 text-blue-500 animate-spin-slow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-zinc-100 font-mono text-lg tracking-tight">Constructing Environment</h3>
                    <p className="text-zinc-500 text-sm mt-2">Interpreting visual data...</p>
                </div>

                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-[loading_3s_ease-in-out_infinite] w-1/3"></div>
                </div>

                 <div className="border border-zinc-800 bg-black/50 rounded-lg p-4 space-y-3 font-mono text-sm">
                     <LoadingStep text="Analyzing visual inputs" active={loadingStep === 0} completed={loadingStep > 0} />
                     <LoadingStep text="Identifying UI patterns" active={loadingStep === 1} completed={loadingStep > 1} />
                     <LoadingStep text="Generating functional logic" active={loadingStep === 2} completed={loadingStep > 2} />
                     <LoadingStep text="Compiling preview" active={loadingStep === 3} completed={loadingStep > 3} />
                 </div>
             </div>
          </div>
        ) : creation?.html ? (
          <>
            {/* Split View: Left Panel (Original Image) */}
            {showSplitView && creation.originalImage && (
                <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0c0c0e] relative flex flex-col shrink-0">
                    <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur text-zinc-400 text-[10px] font-mono uppercase px-2 py-1 rounded border border-zinc-800">
                        Input Source
                    </div>
                    <div className="w-full h-full p-6 flex items-center justify-center overflow-hidden">
                        {creation.originalImage.startsWith('data:application/pdf') ? (
                            <PdfRenderer dataUrl={creation.originalImage} />
                        ) : (
                            <img 
                                src={creation.originalImage} 
                                alt="Original Input" 
                                className="max-w-full max-h-full object-contain shadow-xl border border-zinc-800/50 rounded"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* App Preview Panel */}
            <div 
                className={`
                    relative h-full overflow-hidden
                    ${showSplitView && creation.originalImage ? 'w-full md:w-1/2 h-1/2 md:h-full' : 'w-full'}
                    bg-[#18181b]
                `}
                onMouseDown={panHandlers.onMouseDown}
                onMouseMove={panHandlers.onMouseMove}
                onMouseUp={panHandlers.onMouseUp}
                onMouseLeave={panHandlers.onMouseLeave}
                style={{ cursor: isPanMode ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
                 <div className="absolute inset-0 opacity-20 pointer-events-none" 
                      style={{backgroundImage: 'radial-gradient(circle, #52525b 1px, transparent 1px)', backgroundSize: '24px 24px'}}>
                 </div>

                 {/* Transformation Wrapper */}
                 <div 
                    className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out origin-center will-change-transform"
                    style={{ 
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` 
                    }}
                 >
                     {/* Device Simulation Container */}
                     <div 
                        className={`
                            transition-all duration-500 ease-in-out overflow-hidden shadow-2xl relative bg-white
                            ${deviceMode === 'mobile' 
                                ? (isLandscape 
                                    ? 'w-[812px] h-[375px] rounded-[3rem] border-[12px] border-zinc-900 ring-1 ring-zinc-800' 
                                    : 'w-[375px] h-[812px] rounded-[3rem] border-[12px] border-zinc-900 ring-1 ring-zinc-800')
                                : deviceMode === 'tablet' 
                                    ? (isLandscape
                                        ? 'w-[1024px] h-[768px] rounded-[2rem] border-[12px] border-zinc-900 ring-1 ring-zinc-800'
                                        : 'w-[768px] h-[1024px] rounded-[2rem] border-[12px] border-zinc-900 ring-1 ring-zinc-800')
                                    : 'w-full h-full rounded-none border-none'
                            }
                        `}
                     >
                         {/* Pan Mode Overlay: Blocks interactions with iframe when panning */}
                         {isPanMode && (
                             <div className="absolute inset-0 z-50 bg-transparent"></div>
                         )}

                         <iframe
                            ref={iframeRef}
                            title="Gemini Live Preview"
                            aria-label="Interactive application preview"
                            srcDoc={creation.html + INTERACTIVE_STYLES + DRAG_SCRIPT}
                            className="w-full h-full"
                            sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
                            onLoad={handleIframeLoad}
                        />
                     </div>
                 </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
