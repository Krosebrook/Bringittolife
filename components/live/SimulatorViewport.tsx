
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { DeviceMode } from '../PreviewToolbar';

/**
 * SUB-COMPONENT: EnvironmentOverlay
 * Provides a status layer above the artifact but below simulated hardware frames.
 */
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

/**
 * SUB-COMPONENT: IframeRenderer
 * Provides the actual sandboxed rendering surface.
 */
const IframeRenderer = React.forwardRef<HTMLIFrameElement, { srcDoc: string, onLoad: () => void }>(
  ({ srcDoc, onLoad }, ref) => (
    <iframe
      ref={ref}
      title="Manifestation Surface"
      aria-label="Interactive interactive artifact"
      srcDoc={srcDoc}
      className="w-full h-full bg-white"
      sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
      onLoad={onLoad}
    />
  )
);

/**
 * ROOT COMPONENT: SimulatorViewport
 * Manages the layout, device emulation frames, and pan/zoom transform logic.
 */
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
  
  /**
   * Helper: Hardware Emulation Sizing
   * Returns Tailwind classes for standardized device breakpoints.
   */
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
      {/* Transformation Container: Handles Pan & Zoom */}
      <div 
        className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out origin-center"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
      >
        {/* Device Environment Shell */}
        <div className={`
          relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] bg-white transition-all duration-500
          ${getDeviceSizing()}
          ${deviceMode !== 'desktop' ? 'rounded-[3rem] border-[12px] border-zinc-900 ring-1 ring-zinc-800' : ''}
        `}>
          {/* Status Overlays */}
          <EnvironmentOverlay isVisible={isPanMode} />
          
          {/* Interaction Guard: Intercepts clicks during pan/drag operations */}
          {isPanMode && <div className="absolute inset-0 z-50 cursor-inherit bg-transparent" />}
          
          {/* The Content Renderer */}
          <IframeRenderer 
            ref={iframeRef} 
            srcDoc={srcDoc} 
            onLoad={onIframeLoad} 
          />
        </div>
      </div>
    </div>
  );
};
