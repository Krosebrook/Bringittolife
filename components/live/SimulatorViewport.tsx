
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { DeviceMode } from '../../types';

const EnvironmentOverlay: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="absolute inset-0 z-40 pointer-events-none border-2 border-blue-500/20 rounded-[inherit] overflow-hidden">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-[10px] font-bold font-mono rounded-full opacity-80 animate-pulse">
        PAN MODE ACTIVE
      </div>
    </div>
  );
};

const IframeRenderer = React.forwardRef<HTMLIFrameElement, { srcDoc: string, onLoad: () => void }>(
  ({ srcDoc, onLoad }, ref) => (
    <iframe
      ref={ref}
      title="Manifestation Surface"
      srcDoc={srcDoc}
      className="w-full h-full bg-white transition-opacity duration-300"
      sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
      onLoad={onLoad}
    />
  )
);

export const SimulatorViewport: React.FC<{
  srcDoc: string;
  deviceMode: DeviceMode;
  isLandscape: boolean;
  scale: number;
  pan: { x: number, y: number };
  isPanMode: boolean;
  isDragging: boolean;
  panHandlers: any;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onIframeLoad: () => void;
}> = ({
  srcDoc,
  deviceMode,
  isLandscape,
  scale,
  pan,
  isPanMode,
  isDragging,
  panHandlers,
  iframeRef,
  onIframeLoad
}) => {
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'iframe-error') {
        setErrors(prev => [...prev, e.data.msg].slice(-5));
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const getDeviceSizing = () => {
    switch (deviceMode) {
      case 'mobile': return isLandscape ? 'w-[812px] h-[375px]' : 'w-[375px] h-[812px]';
      case 'tablet': return isLandscape ? 'w-[1024px] h-[768px]' : 'w-[768px] h-[1024px]';
      default: return 'w-full h-full';
    }
  };

  return (
    <div 
      className="relative flex-1 h-full overflow-hidden bg-[#18181b] select-none"
      onMouseDown={panHandlers.onMouseDown}
      onMouseMove={panHandlers.onMouseMove}
      onMouseUp={panHandlers.onMouseUp}
      onMouseLeave={panHandlers.onMouseLeave}
      style={{ cursor: isPanMode ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out origin-center"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
      >
        <div className={`
          relative overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.7)] bg-white transition-all duration-500
          ${getDeviceSizing()}
          ${deviceMode !== 'desktop' ? 'rounded-[3rem] border-[12px] border-zinc-900 ring-4 ring-zinc-800/30' : ''}
        `}>
          <EnvironmentOverlay isVisible={isPanMode} />
          {isPanMode && <div className="absolute inset-0 z-50 cursor-inherit bg-transparent" />}
          
          <IframeRenderer 
            ref={iframeRef} 
            srcDoc={srcDoc} 
            onLoad={onIframeLoad} 
          />

          {errors.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 z-50 pointer-events-none">
              <div className="bg-red-950/90 backdrop-blur-md border border-red-500/30 rounded-lg p-2 max-h-24 overflow-y-auto">
                {errors.map((err, i) => (
                  <p key={i} className="text-[10px] font-mono text-red-200 opacity-80 mb-1 leading-tight">⚠ {err}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
