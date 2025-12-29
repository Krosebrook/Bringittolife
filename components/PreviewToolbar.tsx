
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { 
  SwatchIcon, 
  PhotoIcon, 
  ChatBubbleLeftRightIcon, 
  ShieldCheckIcon,
  DocumentTextIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { Creation, DeviceMode } from '../types';
import { WindowControls } from './live/toolbar/WindowControls';
import { ViewportControls } from './live/toolbar/ViewportControls';
import { DeviceControls } from './live/toolbar/DeviceControls';
import { ActionControls } from './live/toolbar/ActionControls';
import { Tooltip } from './ui/Tooltip';
import { SidePanelType } from './LivePreview';

interface PreviewToolbarProps {
    creation: Creation | null;
    isLoading: boolean;
    scale: number;
    isPanMode: boolean;
    deviceMode: DeviceMode;
    isLandscape: boolean;
    isDragMode: boolean;
    showSplitView: boolean;
    activeSidePanel?: SidePanelType;
    isCopied: boolean;
    accessibilityCount?: number;
    onReset: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetView: () => void;
    onTogglePanMode: () => void;
    onChangeDeviceMode: (mode: DeviceMode) => void;
    onToggleOrientation: () => void;
    onToggleSplitView: () => void;
    onToggleSidePanel?: (type: SidePanelType) => void;
    onToggleDragMode: () => void;
    onExportPdf: () => void;
    onExportJson: () => void;
    onExportReact: () => void;
    onExportHtml: () => void;
    onCopyCode: () => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
    creation,
    isLoading,
    scale,
    isPanMode,
    deviceMode,
    isLandscape,
    isDragMode,
    showSplitView,
    activeSidePanel,
    isCopied,
    accessibilityCount = 0,
    onReset,
    onZoomIn,
    onZoomOut,
    onResetView,
    onTogglePanMode,
    onChangeDeviceMode,
    onToggleOrientation,
    onToggleSidePanel,
    onToggleDragMode,
    onExportPdf,
    onExportReact,
    onExportHtml,
    onCopyCode
}) => {
    return (
        <nav 
          aria-label="Editor command bar"
          className="bg-[#0c0c0e] px-5 py-3 flex items-center justify-between border-b border-zinc-800 shrink-0 z-50 relative h-20 shadow-2xl"
        >
            <WindowControls onClose={onReset} projectName={creation?.name} />
            
            <div className="flex items-center space-x-3">
                {!isLoading && creation && (
                    <>
                        <div className="flex items-center bg-zinc-900/40 rounded-xl p-1 border border-zinc-800/60" role="group" aria-label="Tool panels">
                            <Tooltip content="Refinement (AI)" side="bottom">
                                <button 
                                    onClick={() => onToggleSidePanel?.('chat')}
                                    className={`p-2.5 rounded-lg transition-all ${showSplitView && activeSidePanel === 'chat' ? 'bg-zinc-700 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
                                >
                                    <ChatBubbleLeftRightIcon className="w-4.5 h-4.5" />
                                </button>
                            </Tooltip>
                            <Tooltip content="Manifesto (Docs)" side="bottom">
                                <button 
                                    onClick={() => onToggleSidePanel?.('docs')}
                                    className={`p-2.5 rounded-lg transition-all ${showSplitView && activeSidePanel === 'docs' ? 'bg-zinc-700 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
                                >
                                    <DocumentTextIcon className="w-4.5 h-4.5" />
                                </button>
                            </Tooltip>
                            <Tooltip content="Accessibility Audit" side="bottom">
                                <button 
                                    onClick={() => onToggleSidePanel?.('accessibility')}
                                    className={`relative p-2.5 rounded-lg transition-all ${showSplitView && activeSidePanel === 'accessibility' ? 'bg-zinc-700 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
                                >
                                    <ShieldCheckIcon className="w-4.5 h-4.5" />
                                    {accessibilityCount > 0 && (
                                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-zinc-950 text-[9px] font-black flex items-center justify-center rounded-full ring-2 ring-[#0c0c0e]">
                                        {accessibilityCount}
                                      </span>
                                    )}
                                </button>
                            </Tooltip>
                            <Tooltip content="Pipeline (CI/CD)" side="bottom">
                                <button 
                                    onClick={() => onToggleSidePanel?.('cicd')}
                                    className={`p-2.5 rounded-lg transition-all ${showSplitView && activeSidePanel === 'cicd' ? 'bg-zinc-700 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
                                >
                                    <RocketLaunchIcon className="w-4.5 h-4.5" />
                                </button>
                            </Tooltip>
                            <Tooltip content="Styling (CSS)" side="bottom">
                                <button 
                                    onClick={() => onToggleSidePanel?.('css')}
                                    className={`p-2.5 rounded-lg transition-all ${showSplitView && activeSidePanel === 'css' ? 'bg-zinc-700 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
                                >
                                    <SwatchIcon className="w-4.5 h-4.5" />
                                </button>
                            </Tooltip>
                        </div>

                        <div className="h-6 w-px bg-zinc-800 mx-1" aria-hidden="true" />

                        <ViewportControls 
                            scale={scale}
                            isPanMode={isPanMode}
                            isDragMode={isDragMode}
                            onZoomIn={onZoomIn}
                            onZoomOut={onZoomOut}
                            onResetView={onResetView}
                            onTogglePanMode={onTogglePanMode}
                            onToggleDragMode={onToggleDragMode}
                        />

                        <DeviceControls 
                            deviceMode={deviceMode}
                            isLandscape={isLandscape}
                            onChangeDeviceMode={onChangeDeviceMode}
                            onToggleOrientation={onToggleOrientation}
                        />

                        <ActionControls 
                            isCopied={isCopied}
                            onExportReact={onExportReact}
                            onExportHtml={onExportHtml}
                            onExportPdf={onExportPdf}
                            onCopyCode={onCopyCode}
                            onNewManifestation={onReset}
                        />
                    </>
                )}
            </div>
        </nav>
    );
};
