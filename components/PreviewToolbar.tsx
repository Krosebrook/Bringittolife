
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { SwatchIcon, PhotoIcon, ChatBubbleLeftRightIcon, ActivityLogIcon } from '@heroicons/react/24/outline';
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
            
            <div className="hidden xl:flex items-center space-x-3 px-4 py-2 bg-zinc-950/60 rounded-full border border-zinc-800/40">
                <div className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLoading ? 'bg-amber-400' : 'bg-green-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLoading ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                </div>
                <span className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-[0.2em]">
                    {isLoading ? 'Synthesizing...' : 'Sync Active'}
                </span>
            </div>

            <div className="flex items-center space-x-3">
                {!isLoading && creation && (
                    <>
                        <div className="flex items-center bg-zinc-900/40 rounded-xl p-1 border border-zinc-800/60" role="group" aria-label="Tool panels">
                            <Tooltip content="Refinement (AI)" side="bottom">
                                <button 
                                    onClick={() => onToggleSidePanel?.('chat')}
                                    aria-label="Toggle AI Chat"
                                    aria-pressed={showSplitView && activeSidePanel === 'chat'}
                                    className={`p-2.5 rounded-lg transition-all ${showSplitView && activeSidePanel === 'chat' ? 'bg-zinc-700 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
                                >
                                    <ChatBubbleLeftRightIcon className="w-4.5 h-4.5" />
                                </button>
                            </Tooltip>
                            {creation.originalImage && (
                                <Tooltip content="Reference" side="bottom">
                                    <button 
                                        onClick={() => onToggleSidePanel?.('reference')}
                                        aria-label="Toggle Reference View"
                                        aria-pressed={showSplitView && activeSidePanel === 'reference'}
                                        className={`p-2.5 rounded-lg transition-all ${showSplitView && activeSidePanel === 'reference' ? 'bg-zinc-700 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
                                    >
                                        <PhotoIcon className="w-4.5 h-4.5" />
                                    </button>
                                </Tooltip>
                            )}
                            <Tooltip content="Styling (CSS)" side="bottom">
                                <button 
                                    onClick={() => onToggleSidePanel?.('css')}
                                    aria-label="Toggle CSS Editor"
                                    aria-pressed={showSplitView && activeSidePanel === 'css'}
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
